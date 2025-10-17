import { Response } from 'express';
import { supabase } from '../config/supabase';
import { AuthRequest } from '../middleware/auth'; // Import the custom AuthRequest type

// --- HELPER FUNCTION to calculate business days (unchanged) ---
async function calculateLeaveDays(startDate: string, endDate: string): Promise<number> {
    let count = 0;
    const curDate = new Date(startDate);
    const lastDate = new Date(endDate);
    
    const year = curDate.getFullYear();
    const { data: holidays } = await supabase.from('company_holidays').select('holiday_date').eq('year', year);
    const holidaySet = new Set(holidays?.map(h => h.holiday_date));

    while (curDate <= lastDate) {
        const dayOfWeek = curDate.getDay();
        if (dayOfWeek !== 0 && dayOfWeek !== 6) { // Exclude weekends
            const dateString = curDate.toISOString().split('T')[0];
            if (!holidaySet.has(dateString)) {
                count++;
            }
        }
        curDate.setDate(curDate.getDate() + 1);
    }
    return count;
}

// --- CONTROLLER FOR EMPLOYEE VIEW ---
export const getEmployeeViewData = async (req: AuthRequest, res: Response) => {
    // ✅ FIXED: Use the authenticated user's ID from the request object
    const userId = req.user?.id;
    if (!userId) {
        return res.status(401).json({ message: 'Authentication required.' });
    }

    try {
        const { data: balanceData, error: balanceError } = await supabase
            .from('leave_balances')
            .select(`days_taken, leave_policies (name, total_days, icon, color)`)
            .eq('employee_id', userId);
        if (balanceError) throw balanceError;

        const balances = (balanceData ?? []).map(b => ({
            type: (b.leave_policies as any)?.name || 'Unknown Policy',
            used: b.days_taken,
            total: (b.leave_policies as any)?.total_days || 0,
            icon: (b.leave_policies as any)?.icon || 'Calendar',
            color: (b.leave_policies as any)?.color || 'gray'
        }));

        const { data: historyData, error: historyError } = await supabase
            .from('leave_requests')
            .select(`*, leave_policies (name)`)
            .eq('employee_id', userId)
            .order('start_date', { ascending: false });
        if (historyError) throw historyError;
        
        const history = (historyData ?? []).map(h => ({
            id: h.id,
            type: (h.leave_policies as any)?.name || 'Unknown Policy',
            from: h.start_date, to: h.end_date, days: h.number_of_days,
            reason: h.reason, status: h.status
        }));
        
        const { data: companyHolidays } = await supabase.from('company_holidays').select('name, holiday_date as date');
        const { data: leavePoliciesData } = await supabase.from('leave_policies').select('name, description');
        const leavePolicies = Object.fromEntries((leavePoliciesData ?? []).map(p => [p.name, p.description]));

        res.status(200).json({ balances, history, companyHolidays, leavePolicies });
    } catch (error: any) {
        res.status(500).json({ message: 'Error fetching employee data', error: error.message });
    }
};

// --- CONTROLLER FOR MANAGER VIEW ---
export const getManagerViewData = async (req: AuthRequest, res: Response) => {
    // ✅ FIXED: Use the authenticated manager's ID from the request object
    const managerId = req.user?.id;
    if (!managerId) {
        return res.status(401).json({ message: 'Authentication required.' });
    }

    try {
        const { data: reports, error: reportsError } = await supabase.from('employees').select('id').eq('manager_id', managerId);
        if (reportsError) throw reportsError;
        const reportIds = reports.map(r => r.id);

        if (reportIds.length === 0) {
            return res.status(200).json({ pendingApprovals: [], teamBalances: [], aiConflictAdvisor: {} });
        }

        const { data: pendingRequests, error: requestsError } = await supabase
            .from('leave_requests')
            .select(`*, employees!inner(name), leave_policies!inner(name, total_days, id)`) // Added policy id
            .in('employee_id', reportIds)
            .eq('status', 'pending');
        if (requestsError) throw requestsError;

        const pendingApprovals = [];
        for (const p of pendingRequests) {
            const { data: balance, error: balanceError } = await supabase
                .from('leave_balances')
                .select('days_taken')
                .eq('employee_id', p.employee_id)
                .eq('policy_id', (p.leave_policies as any).id)
                .single();
            
            pendingApprovals.push({
                id: p.id,
                employee: (p.employees as any).name,
                type: (p.leave_policies as any).name,
                from: p.start_date, to: p.end_date, days: p.number_of_days, reason: p.reason,
                balance: `${balance?.days_taken ?? 0} / ${(p.leave_policies as any).total_days}`
            });
        }
        
        // ... (Logic for teamLeaveBalances would go here)

        res.status(200).json({ pendingApprovals, teamLeaveBalances: [], aiConflictAdvisor: {} });
    } catch (error: any) {
        res.status(500).json({ message: 'Error fetching manager data', error: error.message });
    }
};

// --- CONTROLLER FOR HR ADMIN VIEW ---
export const getHrAdminViewData = async (req: AuthRequest, res: Response) => {
    try {
        const { data: policies, error: policyError } = await supabase.from('leave_policies').select('*');
        if (policyError) throw policyError;

        const leavePolicyConfig = Object.fromEntries(policies.map(p => [p.name.replace(/\s+/g, ''), {
            accrual: p.accrual_frequency,
            carryForward: `${p.carry_forward_limit} days`,
            encashment: p.is_encashable ? 'Allowed' : 'None',
            approvalWorkflow: p.approval_workflow || 'Manager'
        }]));

        const { data: holidays, error: holidayError } = await supabase.from('company_holidays').select('name, holiday_date as date');
        if (holidayError) throw holidayError;

        const companyWideLeaveData = {
            consumptionByDepartment: { 'Engineering': '58%', 'Sales': '32%', 'Marketing': '45%' },
            trendsInLeaveTypes: { 'Sick Leave': 'Increased by 21%' },
            totalLeaveBalances: '1,320 days',
        };

        res.status(200).json({
            leavePolicyConfig,
            companyHolidays: holidays || [],
            companyWideLeaveData,
            aiAbsenteeismForecaster: ["Forecast: Expect high leave volume during the last two weeks of December."]
        });
    } catch (error: any) {
        res.status(500).json({ message: "Error fetching HR Admin data", error: error.message });
    }
};

// --- CONTROLLER FOR APPLYING FOR LEAVE ---
export const applyForLeave = async (req: AuthRequest, res: Response) => {
    const { leaveType, fromDate, toDate, reason, startSession, endSession } = req.body;
    // ✅ FIXED: Use the authenticated user's ID from the request object
    const userId = req.user?.id;
    if (!userId) {
        return res.status(401).json({ message: 'Authentication required.' });
    }

    try {
        const { data: policy, error: policyError } = await supabase
            .from('leave_policies')
            .select('id')
            .eq('name', leaveType)
            .single();
        if (policyError || !policy) throw new Error('Invalid leave type specified.');

        const numberOfDays = await calculateLeaveDays(fromDate, toDate);
        if (numberOfDays <= 0) throw new Error('Leave duration must be at least one business day.');

        const { error: insertError } = await supabase
            .from('leave_requests')
            .insert({
                employee_id: userId,
                policy_id: policy.id,
                start_date: fromDate,
                end_date: toDate,
                number_of_days: numberOfDays,
                reason,
                start_session: startSession,
                end_session: endSession,
                status: 'pending'
            });

        if (insertError) throw insertError;
        
        res.status(201).json({ message: 'Leave application submitted successfully!' });
    } catch (error: any) {
        res.status(500).json({ message: 'Error submitting application', error: error.message });
    }
};

// --- CONTROLLER FOR LEAVE ACTIONS (APPROVE/REJECT) ---
export const handleLeaveAction = async (req: AuthRequest, res: Response) => {
    const { requestId, status } = req.body;
    // ✅ FIXED: Use the authenticated user's ID from the request object
    const processorId = req.user?.id;
    if (!processorId) {
        return res.status(401).json({ message: 'Authentication required.' });
    }

    try {
        const { data: request, error: findError } = await supabase
            .from('leave_requests')
            .select('number_of_days, employee_id, policy_id, start_date')
            .eq('id', requestId)
            .single();
        if (findError || !request) throw new Error('Leave request not found.');

        // Here you could add a check to ensure the processorId is the actual manager of request.employee_id

        const { error: updateError } = await supabase
            .from('leave_requests')
            .update({ status: status, processed_by: processorId })
            .eq('id', requestId);
        if (updateError) throw updateError;

        if (status === 'approved') {
            const { error: rpcError } = await supabase.rpc('update_leave_balance', {
                p_employee_id: request.employee_id,
                p_policy_id: request.policy_id,
                p_days_to_add: request.number_of_days,
                p_year: new Date(request.start_date).getFullYear()
            });
            if (rpcError) throw rpcError;
        }

        res.status(200).json({ message: `Request successfully ${status}.` });
    } catch (error: any) {
        res.status(500).json({ message: 'Error processing leave action.', error: error.message });
    }
};

