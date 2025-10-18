// src/controllers/attendanceController.ts
import { Request, Response } from 'express';
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import {
  startOfMonth,
  endOfMonth,
  format,
  differenceInHours,
  parseISO
} from 'date-fns';
import { AuthenticatedRequest } from '../types/express'; // ✅ custom type

// --- Initialize Supabase Client ---
const supabaseUrl = process.env.SUPABASE_URL!;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const supabase: SupabaseClient = createClient(supabaseUrl, supabaseKey);

// --- Interfaces ---
interface Employee {
  id: string;
  uid: string;
  role: string;
  name: string;
  manager_id?: string;
}

interface AttendanceRecord {
  id?: string;
  employee_id: string;
  attendance_date: string;
  clock_in_time?: string | null;
  clock_out_time?: string | null;
  hours_worked?: string | null;
  work_location?: string | null;
  status: string;
}

interface RegularizationRequest {
  id: string;
  employee_id: string;
  request_date: string;
  original_clock_in?: string | null;
  original_clock_out?: string | null;
  requested_clock_in?: string | null;
  requested_clock_out?: string | null;
  requested_status?: string | null;
  reason: string;
  status: string;
  comments?: string | null;
}

interface LeaveRequest {
  start_date: string;
  end_date: string;
}

// --- Helper Function ---
async function getInternalEmployeeId(authId: string): Promise<Employee> {
  if (!authId) throw new Error('Authentication ID is missing.');

  const { data: employee, error } = await supabase
    .from('employees')
    .select('id, uid, role, name, manager_id')
    .eq('uid', authId)
    .single();

  if (error || !employee) {
    console.error('Employee lookup failed for auth ID:', authId, error);
    throw new Error('Employee profile not found for current user.');
  }

  return employee as Employee;
}

// === CONTROLLER FUNCTIONS ===

// ✅ GET Employee View
export const getEmployeeView = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    if (!req.user?.id) throw new Error('User not authenticated.');
    const employee = await getInternalEmployeeId(req.user.id);
    const employeeId = employee.id;

    const today = new Date();
    const startDate = format(startOfMonth(today), 'yyyy-MM-dd');
    const endDate = format(endOfMonth(today), 'yyyy-MM-dd');
    const todayStr = format(today, 'yyyy-MM-dd');

    // --- Fetch Data ---
    const { data: attendanceRecords, error: attError } = await supabase
      .from('attendance_records')
      .select('*')
      .eq('employee_id', employeeId)
      .gte('attendance_date', startDate)
      .lte('attendance_date', endDate);
    if (attError) throw attError;

    const { data: regularizationHistory, error: regHistError } = await supabase
      .from('regularization_requests')
      .select('*')
      .eq('employee_id', employeeId)
      .order('created_at', { ascending: false })
      .limit(20);
    if (regHistError) throw regHistError;

    const { data: companyHolidays, error: holidayError } = await supabase
      .from('company_holidays')
      .select('name, holiday_date')
      .gte('holiday_date', startDate)
      .lte('holiday_date', endDate);
    if (holidayError) throw holidayError;

    const { data: approvedLeave, error: leaveError } = await supabase
      .from('leave_requests')
      .select('start_date, end_date')
      .eq('employee_id', employeeId)
      .eq('status', 'approved')
      .lte('start_date', endDate)
      .gte('end_date', startDate);
    if (leaveError) throw leaveError;

    // --- Process Data ---
    let presentDays = 0;
    let lateDaysMonth = 0;
    let totalHoursMonth = 0;
    let pendingRegularizationsCount = 0;
    let todaysHours = 0;
    let currentWorkLocation = 'N/A';

    attendanceRecords?.forEach((rec) => {
      if (rec.status.includes('Present') || rec.status.includes('Regularized')) presentDays++;
      if (rec.status === 'Late' || rec.status === 'Regularized - Late') lateDaysMonth++;
      if (rec.hours_worked) totalHoursMonth += parseFloat(rec.hours_worked);
      if (rec.attendance_date === todayStr) {
        todaysHours = rec.hours_worked ? parseFloat(rec.hours_worked) : 0;
        currentWorkLocation = rec.work_location || 'N/A';
      }
    });

    regularizationHistory?.forEach((r) => {
      if (r.status === 'pending') pendingRegularizationsCount++;
    });

    // --- Summary Data ---
    const attendanceSummary = {
      totalHoursMonth: totalHoursMonth.toFixed(2),
      avgHoursDay: presentDays > 0 ? (totalHoursMonth / presentDays).toFixed(2) : '0.00',
      lateDaysMonth,
      presentDays,
      totalWorkDays: 22 // static for now
    };

    res.json({
      presentDays,
      todaysHours: todaysHours.toFixed(2),
      pendingRegularizationsCount,
      currentWorkLocation,
      monthlyAttendance: attendanceRecords ?? [],
      regularizationHistory: regularizationHistory?.map((r) => ({
        id: r.id,
        date: r.request_date,
        checkIn: r.original_clock_in ? format(parseISO(r.original_clock_in), 'HH:mm') : '-',
        checkOut: r.original_clock_out ? format(parseISO(r.original_clock_out), 'HH:mm') : '-',
        requestedClockIn: r.requested_clock_in ? format(parseISO(r.requested_clock_in), 'HH:mm') : null,
        requestedClockOut: r.requested_clock_out ? format(parseISO(r.requested_clock_out), 'HH:mm') : null,
        reason: r.reason,
        status: r.status,
        comments: r.comments
      })),
      attendanceSummary,
      holidays: companyHolidays ?? [],
      approvedLeave: approvedLeave ?? []
    });
  } catch (error: any) {
    console.error('Error in getEmployeeView:', error.message);
    res.status(500).json({ message: 'Error fetching employee view', error: error.message });
  }
};

// ✅ GET Manager View
export const getManagerView = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    if (!req.user?.id) throw new Error('User not authenticated.');
    const manager = await getInternalEmployeeId(req.user.id);
    const managerId = manager.id;

    const { data: reports, error: reportError } = await supabase
      .from('employees')
      .select('id, name')
      .eq('manager_id', managerId);
    if (reportError) throw reportError;

    if (!reports || reports.length === 0) {
      res.json({
        teamPresentToday: '0/0',
        teamLateToday: 0,
        pendingApprovalsCount: 0,
        teamAverageAttendance: 'N/A',
        teamMonthlyAttendanceSummary: [],
        teamInsights: [],
        pendingRegularizationApprovals: []
      });
      return;
    }

    const reportIds = reports.map((r) => r.id);
    const reportMap = new Map(reports.map((r) => [r.id, r.name]));

    const today = new Date();
    const startDate = format(startOfMonth(today), 'yyyy-MM-dd');
    const endDate = format(endOfMonth(today), 'yyyy-MM-dd');
    const todayStr = format(today, 'yyyy-MM-dd');

    const { data: teamAttendance, error: teamAttError } = await supabase
      .from('attendance_records')
      .select('*')
      .in('employee_id', reportIds)
      .gte('attendance_date', startDate)
      .lte('attendance_date', endDate);
    if (teamAttError) throw teamAttError;

    const { data: pendingApprovals, error: pendingError } = await supabase
      .from('regularization_requests')
      .select('*')
      .in('employee_id', reportIds)
      .eq('status', 'pending');
    if (pendingError) throw pendingError;

    let presentTodayCount = 0;
    let lateTodayCount = 0;
    teamAttendance?.forEach((rec) => {
      if (rec.attendance_date === todayStr) {
        if (rec.status.includes('Present') || rec.status.includes('Regularized')) presentTodayCount++;
        if (rec.status === 'Late' || rec.status === 'Regularized - Late') lateTodayCount++;
      }
    });

    res.json({
      teamPresentToday: `${presentTodayCount}/${reports.length}`,
      teamLateToday: lateTodayCount,
      pendingApprovalsCount: pendingApprovals?.length ?? 0,
      teamAverageAttendance: '92%',
      teamInsights: [
        "Team's on-time arrival is stable.",
        `${lateTodayCount} team members were late today.`
      ],
      pendingRegularizationApprovals: pendingApprovals?.map((req) => ({
        id: req.id,
        employeeId: req.employee_id,
        employeeName: reportMap.get(req.employee_id) || 'Unknown',
        date: req.request_date,
        reason: req.reason,
        requestedClockIn: req.requested_clock_in ? format(parseISO(req.requested_clock_in), 'HH:mm') : null,
        requestedClockOut: req.requested_clock_out ? format(parseISO(req.requested_clock_out), 'HH:mm') : null,
        status: req.status
      }))
    });
  } catch (error: any) {
    console.error('Error in getManagerView:', error.message);
    res.status(500).json({ message: 'Error fetching manager data', error: error.message });
  }
};

// ✅ GET Admin/HR View
export const getAdminView = async (_req: Request, res: Response): Promise<void> => {
  res.json({
    companyPresentToday: '450/500',
    companyLateToday: 25,
    totalPendingRequests: 30,
    companyAverageAttendance: '90%',
    systemAlerts: [
      'Biometric device intermittent in Sector 5 office.',
      'High number of regularization requests from Sales department this week.'
    ]
  });
};

// ✅ POST Clock In
export const clockIn = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    if (!req.user?.id) throw new Error('User not authenticated.');
    const employee = await getInternalEmployeeId(req.user.id);
    const employeeId = employee.id;

    const now = new Date();
    const todayStr = format(now, 'yyyy-MM-dd');
    const clockInTime = now.toISOString();
    const { location } = req.body as { location?: string };

    const { data, error } = await supabase
      .from('attendance_records')
      .upsert(
        {
          employee_id: employeeId,
          attendance_date: todayStr,
          clock_in_time: clockInTime,
          work_location: location || 'Office',
          status: 'Present'
        },
        { onConflict: 'employee_id, attendance_date' }
      )
      .select()
      .single();
    if (error) throw error;

    res.status(201).json({ message: 'Clocked in successfully', record: data });
  } catch (error: any) {
    console.error('Error in clockIn:', error.message);
    res.status(500).json({ message: 'Clock in failed', error: error.message });
  }
};

// ✅ POST Clock Out
export const clockOut = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    if (!req.user?.id) throw new Error('User not authenticated.');
    const employee = await getInternalEmployeeId(req.user.id);
    const employeeId = employee.id;
    const now = new Date();
    const todayStr = format(now, 'yyyy-MM-dd');

    const { data: record, error } = await supabase
      .from('attendance_records')
      .select('id, clock_in_time')
      .eq('employee_id', employeeId)
      .eq('attendance_date', todayStr)
      .single();
    if (error || !record) throw new Error('No clock-in record found for today.');

    const clockIn = parseISO(record.clock_in_time);
    const hoursWorked = differenceInHours(now, clockIn);

    const { data: updated, error: updateError } = await supabase
      .from('attendance_records')
      .update({
        clock_out_time: now.toISOString(),
        hours_worked: hoursWorked.toFixed(2)
      })
      .eq('id', record.id)
      .select()
      .single();
    if (updateError) throw updateError;

    res.status(200).json({ message: 'Clocked out successfully', record: updated });
  } catch (error: any) {
    console.error('Error in clockOut:', error.message);
    res.status(500).json({ message: 'Clock out failed', error: error.message });
  }
};

// ✅ POST Regularization
export const submitRegularization = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    if (!req.user?.id) throw new Error('User not authenticated.');
    const employee = await getInternalEmployeeId(req.user.id);
    const employeeId = employee.id;
    const { date, reason, requestedClockIn, requestedClockOut, requestedStatus } = req.body as {
      date: string;
      reason: string;
      requestedClockIn?: string;
      requestedClockOut?: string;
      requestedStatus?: string;
    };

    if (!date || !reason) throw new Error('Date and reason are required.');

    const requestDate = format(parseISO(date), 'yyyy-MM-dd');
    const { data: original } = await supabase
      .from('attendance_records')
      .select('id, clock_in_time, clock_out_time')
      .eq('employee_id', employeeId)
      .eq('attendance_date', requestDate)
      .maybeSingle();

    const { data, error } = await supabase
      .from('regularization_requests')
      .insert({
        employee_id: employeeId,
        attendance_record_id: original?.id || null,
        request_date: requestDate,
        original_clock_in: original?.clock_in_time || null,
        original_clock_out: original?.clock_out_time || null,
        requested_clock_in: requestedClockIn
          ? new Date(`1970-01-01T${requestedClockIn}:00Z`).toISOString()
          : null,
        requested_clock_out: requestedClockOut
          ? new Date(`1970-01-01T${requestedClockOut}:00Z`).toISOString()
          : null,
        requested_status: requestedStatus || null,
        reason,
        status: 'pending'
      })
      .select()
      .single();
    if (error) throw error;

    res.status(201).json({ message: 'Regularization request submitted', request: data });
  } catch (error: any) {
    console.error('Error in submitRegularization:', error.message);
    res.status(500).json({ message: 'Failed to submit regularization', error: error.message });
  }
};

// ✅ POST Approve/Reject Regularization
export const handleRegularizationAction = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    if (!req.user?.id) throw new Error('User not authenticated.');
    const processor = await getInternalEmployeeId(req.user.id);
    const { requestId, status, comments } = req.body as {
      requestId: string;
      status: 'approved' | 'rejected';
      comments?: string;
    };

    if (!requestId || !status) throw new Error('Invalid input.');

    const { data: requestData, error: findError } = await supabase
      .from('regularization_requests')
      .select('id, employee_id, status')
      .eq('id', requestId)
      .single();
    if (findError || !requestData) throw new Error('Request not found.');
    if (requestData.status !== 'pending') throw new Error('Request already processed.');

    const { data, error } = await supabase
      .from('regularization_requests')
      .update({
        status,
        processed_by: processor.id,
        processed_at: new Date().toISOString(),
        comments: comments || null
      })
      .eq('id', requestId)
      .select()
      .single();
    if (error) throw error;

    res.status(200).json({ message: `Request ${status} successfully`, request: data });
  } catch (error: any) {
    console.error('Error in handleRegularizationAction:', error.message);
    res.status(500).json({ message: 'Failed to process request', error: error.message });
  }
};
