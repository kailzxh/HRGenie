import { Request, Response } from 'express';
import { supabase, supabaseOnboarding } from '../config/supabase';
import { AuthRequest } from '../middleware/auth';

// Types based on your exact schema
interface Employee {
  id: string;
  uid?: string;
  name: string;
  email: string;
  phone?: string;
  department: string;
  position: string;
  location?: string;
  role: string;
  salary?: number;
  joining_date?: string;
  status: string;
  manager_id?: string;
  created_at: string;
  updated_at: string;
}

interface PayrollRun {
  id: string;
  month: number;
  year: number;
  status: 'draft' | 'processing' | 'completed' | 'failed' | 'cancelled';
  total_gross: number;
  total_net: number;
  employee_count: number;
  created_at: string;
}

interface Payslip {
  id: string;
  payroll_line_id: string;
  employee_id: string;
  payroll_run_id: string;
  generated_at: string;
  payroll_lines?: {
    employee_name: string;
    net_salary: number;
  };
}

interface AttendanceSummary {
  present: number;
  absent: number;
  late: number;
  total_hours: number;
}

interface PerformanceMetrics {
  team_performance?: number;
  goals_completed?: number;
  overall_score?: number;
}

interface LeaveBalance {
  sick: number;
  casual: number;
  earned: number;
}

// Fix: Add proper interfaces for leave data
interface LeavePolicy {
  name: string;
  total_days: number;
}

interface LeaveBalanceRecord {
  days_taken: number;
  leave_policies: LeavePolicy;
}

interface DashboardData {
  userRole: string;
  totalEmployees?: number;
  activePayrollRuns?: number;
  departmentStats?: { [key: string]: number };
  recentEmployees?: Employee[];
  payrollRuns?: PayrollRun[];
  teamMembersCount?: number;
  teamMembers?: Employee[];
  recentPayrollRuns?: Payslip[];
  managerInfo?: Employee;
  employeeInfo?: Employee;
  recentPayslips?: Payslip[];
  leaveBalance?: LeaveBalance;
  attendanceSummary?: AttendanceSummary;
  performanceMetrics?: PerformanceMetrics;
  newApplicants?: number;
  openPositions?: number;
  pendingApprovals?: number; // Add this property
}

// Helper function to get employee by email
async function getEmployeeByEmail(email: string): Promise<{ data: Employee | null; error: any }> {
  const { data, error } = await supabase
    .from('employees')
    .select('*')
    .eq('email', email)
    .single();
  return { data, error };
}

// Helper function to get attendance summary
async function getAttendanceSummary(employeeId?: string, teamIds?: string[]): Promise<AttendanceSummary> {
  let query = supabase
    .from('attendance_records')
    .select('status, hours_worked, attendance_date')
    .gte('attendance_date', new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]); // Last 30 days

  if (employeeId) {
    query = query.eq('employee_id', employeeId);
  } else if (teamIds) {
    query = query.in('employee_id', teamIds);
  }

  const { data: attendanceRecords, error } = await query;

  if (error || !attendanceRecords) {
    return { present: 0, absent: 0, late: 0, total_hours: 0 };
  }

  const present = attendanceRecords.filter(record => 
    record.status === 'Present' || record.status === 'Regularized - Present'
  ).length;
  
  const absent = attendanceRecords.filter(record => 
    record.status === 'Absent'
  ).length;
  
  const late = attendanceRecords.filter(record => 
    record.status === 'Late' || record.status === 'Regularized - Late'
  ).length;
  
  const total_hours = attendanceRecords.reduce((sum, record) => sum + (record.hours_worked || 0), 0);

  return { present, absent, late, total_hours };
}

// Helper function to get performance metrics
async function getPerformanceMetrics(employeeId?: string, teamIds?: string[]): Promise<PerformanceMetrics> {
  if (employeeId) {
    // Get individual employee performance from reviews table
    const { data: performance, error } = await supabase
      .from('reviews')
      .select('overall_rating')
      .eq('employee_id', employeeId)
      .order('finalized_at', { ascending: false })
      .limit(1)
      .single();

    // Get goals progress
    const { data: goals, error: goalsError } = await supabase
      .from('goals')
      .select('progress, status')
      .eq('employee_id', employeeId);

    if (goals && goals.length > 0) {
      const completedGoals = goals.filter(goal => goal.status === 'completed').length;
      const goals_completed = Math.round((completedGoals / goals.length) * 100);
      
      return {
        overall_score: performance?.overall_rating || 8.5,
        goals_completed: goals_completed || 0
      };
    }

    return {
      overall_score: performance?.overall_rating || 8.5,
      goals_completed: 85
    };
  } else if (teamIds) {
    // Get team performance average from reviews
    const { data: teamPerformance, error } = await supabase
      .from('reviews')
      .select('overall_rating')
      .in('employee_id', teamIds)
      .not('overall_rating', 'is', null);

    if (teamPerformance && teamPerformance.length > 0) {
      const averagePerformance = teamPerformance.reduce((sum, review) => sum + review.overall_rating, 0) / teamPerformance.length;
      return {
        team_performance: Math.round(averagePerformance * 10), // Convert to percentage
        goals_completed: 85
      };
    }
  }

  return {
    team_performance: 85,
    goals_completed: 85,
    overall_score: 8.5
  };
}

// Helper function to get leave balance from leave_balances and leave_policies
async function getLeaveBalance(employeeId: string): Promise<LeaveBalance> {
  // Get leave balances with policy details - FIXED: Proper type casting
  const { data: leaveData, error } = await supabase
    .from('leave_balances')
    .select(`
      days_taken,
      leave_policies!inner(
        name,
        total_days
      )
    `)
    .eq('employee_id', employeeId)
    .eq('year', new Date().getFullYear());

  // FIX: Cast to the correct type
  const leaveRecords = leaveData as unknown as LeaveBalanceRecord[];

  if (leaveRecords && leaveRecords.length > 0) {
    const balance: LeaveBalance = { sick: 12, casual: 18, earned: 30 };
    
    leaveRecords.forEach(record => {
      const remainingDays = record.leave_policies.total_days - record.days_taken;
      switch (record.leave_policies.name.toLowerCase()) {
        case 'sick leave':
          balance.sick = Math.max(0, remainingDays);
          break;
        case 'casual leave':
          balance.casual = Math.max(0, remainingDays);
          break;
        case 'earned leave':
          balance.earned = Math.max(0, remainingDays);
          break;
      }
    });

    return balance;
  }

  // Default values if no record found
  return { sick: 12, casual: 18, earned: 30 };
}

// Helper function to get recruitment stats from onboarding schema
async function getRecruitmentStats() {
  const { data: applications, error } = await supabaseOnboarding
    .from('applications')
    .select('status')
    .eq('status', 'submitted');

  const { data: jobs, error: jobsError } = await supabaseOnboarding
    .from('jobs')
    .select('id')
    .eq('is_active', true);

  return {
    newApplicants: applications?.length || 0,
    openPositions: jobs?.length || 0
  };
}

// Admin/HR Dashboard Data
async function getAdminDashboardData(): Promise<DashboardData> {
  // Get total employees count
  const { count: totalEmployees, error: employeesError } = await supabase
    .from('employees')
    .select('*', { count: 'exact', head: true })
    .eq('status', 'active');

  // Get active payroll runs
  const { data: payrollRuns, error: payrollError } = await supabase
    .from('payroll_runs')
    .select('*')
    .in('status', ['draft', 'processing'])
    .order('created_at', { ascending: false })
    .limit(5);

  // Get department statistics
  const { data: departmentStats, error: deptError } = await supabase
    .from('employees')
    .select('department')
    .eq('status', 'active');

  const departmentCount: { [key: string]: number } = {};
  departmentStats?.forEach(emp => {
    departmentCount[emp.department] = (departmentCount[emp.department] || 0) + 1;
  });

  // Get recent employees
  const { data: recentEmployees, error: recentError } = await supabase
    .from('employees')
    .select('*')
    .eq('status', 'active')
    .order('created_at', { ascending: false })
    .limit(5);

  // Get attendance summary for organization
  const attendanceSummary = await getAttendanceSummary();

  // Get recruitment stats from onboarding schema
  const recruitmentStats = await getRecruitmentStats();

  return {
    userRole: 'admin',
    totalEmployees: totalEmployees || 0,
    activePayrollRuns: payrollRuns?.length || 0,
    departmentStats: departmentCount,
    recentEmployees: recentEmployees || [],
    payrollRuns: payrollRuns || [],
    attendanceSummary,
    ...recruitmentStats
  };
}

// Manager Dashboard Data
// Manager Dashboard Data
async function getManagerDashboardData(userEmail: string): Promise<DashboardData> {
  // Get manager's employee record
  const { data: manager, error: managerError } = await getEmployeeByEmail(userEmail);
  if (managerError || !manager) {
    throw new Error('Manager record not found');
  }

  // Get team members
  const { data: teamMembers, error: teamError } = await supabase
    .from('employees')
    .select('*')
    .eq('manager_id', manager.id)
    .eq('status', 'active');

  // Get team payroll data (payslips)
  const { data: recentPayrollRuns, error: payrollError } = await supabase
    .from('payslips')
    .select(`
      *,
      payroll_lines!inner(
        employee_name,
        net_salary
      )
    `)
    .eq('employee_id', manager.id) // Manager's own payroll for demo
    .order('generated_at', { ascending: false })
    .limit(3);

  // Get team performance metrics
  const teamIds = teamMembers?.map(member => member.id) || [];
  const performanceMetrics = await getPerformanceMetrics(undefined, teamIds);
  
  // Get team attendance summary
  const attendanceSummary = await getAttendanceSummary(undefined, teamIds);

  // Get pending leave approvals
  const { data: pendingLeaves, error: leavesError } = await supabase
    .from('leave_requests')
    .select('id')
    .eq('status', 'pending')
    .in('employee_id', teamIds);

  // FIX: Get manager's own leave balance
  const leaveBalance = await getLeaveBalance(manager.id);

  return {
    userRole: 'manager',
    teamMembersCount: teamMembers?.length || 0,
    teamMembers: teamMembers || [],
    recentPayrollRuns: recentPayrollRuns || [],
    managerInfo: manager,
    performanceMetrics,
    attendanceSummary,
    pendingApprovals: pendingLeaves?.length || 0,
    leaveBalance // ADD THIS LINE - manager's own leave balance
  } as DashboardData;
}
// Employee Dashboard Data
async function getEmployeeDashboardData(userEmail: string): Promise<DashboardData> {
  // Get employee record
  const { data: employee, error: employeeError } = await getEmployeeByEmail(userEmail);
  if (employeeError || !employee) {
    throw new Error('Employee record not found');
  }

  // Get employee's recent payslips
  const { data: recentPayslips, error: payrollError } = await supabase
    .from('payslips')
    .select(`
      *,
      payroll_lines!inner(
        employee_name,
        net_salary
      )
    `)
    .eq('employee_id', employee.id)
    .order('generated_at', { ascending: false })
    .limit(5);

  // Get leave balance
  const leaveBalance = await getLeaveBalance(employee.id);

  // Get performance metrics
  const performanceMetrics = await getPerformanceMetrics(employee.id);

  // Get attendance summary
  const attendanceSummary = await getAttendanceSummary(employee.id);

  // Get current month hours
  const currentMonth = new Date().getMonth() + 1;
  const currentYear = new Date().getFullYear();
  
  const { data: currentMonthAttendance, error: attendanceError } = await supabase
    .from('attendance_records')
    .select('hours_worked')
    .eq('employee_id', employee.id)
    .gte('attendance_date', `${currentYear}-${currentMonth.toString().padStart(2, '0')}-01`)
    .lte('attendance_date', `${currentYear}-${currentMonth.toString().padStart(2, '0')}-31`);

  const monthlyHours = currentMonthAttendance?.reduce((sum, record) => sum + (record.hours_worked || 0), 0) || 0;

  return {
    userRole: 'employee',
    employeeInfo: employee,
    recentPayslips: recentPayslips || [],
    leaveBalance,
    performanceMetrics,
    attendanceSummary: {
      ...attendanceSummary,
      total_hours: monthlyHours
    }
  };
}

// Main Dashboard Controller
export async function getDashboardData(req: AuthRequest, res: Response): Promise<Response> {
  try {
    const userRole = req.user?.role;
    const userEmail = req.user?.email;

    if (!userRole || !userEmail) {
      return res.status(401).json({
        success: false,
        error: 'User authentication required'
      });
    }

    let dashboardData: DashboardData;

    if (userRole === 'admin' || userRole === 'hr') {
      dashboardData = await getAdminDashboardData();
    } else if (userRole === 'manager') {
      dashboardData = await getManagerDashboardData(userEmail);
    } else if (userRole === 'employee') {
      dashboardData = await getEmployeeDashboardData(userEmail);
    } else {
      return res.status(403).json({
        success: false,
        error: 'Access denied'
      });
    }

    return res.status(200).json({
      success: true,
      data: dashboardData
    });

  } catch (err: any) {
    console.error('Error fetching dashboard data:', err);
    return res.status(500).json({
      success: false,
      error: 'Failed to fetch dashboard data'
    });
  }
}

