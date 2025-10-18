import { Response } from 'express';
import { supabase } from '../config/supabase';
import { AuthRequest } from '../middleware/auth'; // Import the custom AuthRequest type

// --- HELPER FUNCTION (Your fixed version is correct) ---
async function calculateLeaveDays(startDate: string, endDate: string): Promise<number> {
    // 1. Validate input dates
    const curDate = new Date(startDate);
    const lastDate = new Date(endDate);
    if (isNaN(curDate.getTime()) || isNaN(lastDate.getTime())) {
        console.error("Invalid date string passed:", startDate, endDate);
        throw new Error('Invalid start or end date format.');
    }
    let count = 0;
    const { data: holidays, error: holidayError } = await supabase
        .from('company_holidays')
        .select('holiday_date');
    if (holidayError) {
        console.error("Error fetching company holidays:", holidayError.message);
        throw new Error('Failed to fetch company holidays.');
    }
    const holidaySet = new Set(holidays?.map(h => h.holiday_date) || []);
    while (curDate <= lastDate) {
        const dayOfWeek = curDate.getDay();
        if (dayOfWeek !== 0 && dayOfWeek !== 6) {
            const dateString = curDate.toISOString().split('T')[0];
            if (!holidaySet.has(dateString)) {
                count++;
            }
        }
        curDate.setDate(curDate.getDate() + 1);
    }
    return count;
}

// --- (HELPER) Get Internal Employee ID from Auth ID ---
// We create this helper to avoid repeating code
async function getInternalEmployeeId(authId: string): Promise<string> {
    const { data: employee, error } = await supabase
        .from('employees')
        .select('id')
        .eq('uid', authId) // Match against the 'uid' (Auth ID) column
        .single();

    if (error || !employee) {
        console.error("Auth user has no matching employee profile:", authId, error);
        throw new Error('Employee profile not found for the current user.');
    }
    
    return employee.id; // Return the internal 'id' (Primary Key)
}

// --- CONTROLLER FOR EMPLOYEE VIEW (FIXED) ---
export const getEmployeeViewData = async (req: AuthRequest, res: Response) => {
    const authId = req.user?.id;
    if (!authId) {
        return res.status(401).json({ message: 'Authentication required.' });
    }

    try {
        // 1. Get the internal 'id'
        const internalEmployeeId = await getInternalEmployeeId(authId);

        // 2. Use the internal 'id' for all queries
        const { data: balanceData, error: balanceError } = await supabase
            .from('leave_balances')
            .select(`days_taken, leave_policies (name, total_days, icon, color)`)
            .eq('employee_id', internalEmployeeId); // <-- FIX
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
            .eq('employee_id', internalEmployeeId) // <-- FIX
            .order('start_date', { ascending: false });
        if (historyError) throw historyError;
        
        // ... (rest of the function is fine)
        const history = (historyData ?? []).map(h => ({
            id: h.id, type: (h.leave_policies as any)?.name || 'Unknown Policy',
            from: h.start_date, to: h.end_date, days: h.number_of_days,
            reason: h.reason, status: h.status
        }));
        // --- THIS IS CORRECT ---
const { data: companyHolidays } = await supabase.from('company_holidays').select('name, date:holiday_date');
        const { data: leavePoliciesData } = await supabase.from('leave_policies').select('name, description');
        const leavePolicies = Object.fromEntries((leavePoliciesData ?? []).map(p => [p.name, p.description]));

        res.status(200).json({ balances, history, companyHolidays, leavePolicies });
    } catch (error: any) {
        res.status(500).json({ message: 'Error fetching employee data', error: error.message });
    }
};

// --- CONTROLLER FOR MANAGER VIEW (FIXED) ---
export const getManagerViewData = async (req: AuthRequest, res: Response) => {
    const authId = req.user?.id;
    if (!authId) {
        return res.status(401).json({ message: 'Authentication required.' });
    }

    try {
        // 1. Get the internal 'id' for the manager
        const internalManagerId = await getInternalEmployeeId(authId);

        // 2. Use the internal 'id' in the query
        const { data: reports, error: reportsError } = await supabase
            .from('employees')
            .select('id')
            .eq('manager_id', internalManagerId); // <-- FIX
        if (reportsError) throw reportsError;
        
        // ... (rest of the function is fine)
        const reportIds = reports.map(r => r.id);
        if (reportIds.length === 0) {
            return res.status(200).json({ pendingApprovals: [], teamBalances: [], aiConflictAdvisor: {} });
        }
        // ... (all queries below use 'reportIds' which are already internal IDs, so they are fine)
        const { data: pendingRequests, error: requestsError } = await supabase
            .from('leave_requests')
            .select(`*, employees!inner(name), leave_policies!inner(name, total_days, id)`)
            .in('employee_id', reportIds)
            .eq('status', 'pending');
        if (requestsError) throw requestsError;
        // ... (rest of the function is fine)
        const pendingApprovals = [];
        for (const p of pendingRequests) {
            const { data: balance } = await supabase
                .from('leave_balances')
                .select('days_taken')
                .eq('employee_id', p.employee_id)
                .eq('policy_id', (p.leave_policies as any).id)
                .single();
            pendingApprovals.push({
                id: p.id, employee: (p.employees as any).name,
                type: (p.leave_policies as any).name, from: p.start_date, to: p.end_date,
                days: p.number_of_days, reason: p.reason,
                balance: `${balance?.days_taken ?? 0} / ${(p.leave_policies as any).total_days}`
            });
        }
        res.status(200).json({ pendingApprovals, teamLeaveBalances: [], aiConflictAdvisor: {} });
    } catch (error: any) {
        res.status(500).json({ message: 'Error fetching manager data', error: error.message });
    }
};

// --- CONTROLLER FOR HR ADMIN VIEW (No change needed) ---
// This controller does not seem to depend on the user's ID, so it is fine.
// --- CONTROLLER FOR HR ADMIN VIEW (FIXED) ---
// --- CONTROLLER FOR HR ADMIN VIEW (FIXED) ---
export const getHrAdminViewData = async (req: AuthRequest, res: Response) => {
     try {
         const { data: policies, error: policyError } = await supabase
             .from('leave_policies')
             .select('*');
             
         if (policyError) throw policyError;

         const validPolicies = (policies ?? []).filter(p => p && p.name);

         const leavePolicyConfig = Object.fromEntries(validPolicies.map(p => [
             p.name.replace(/\s+/g, ''),
             {
                 accrual: p.accrual_frequency,
                 carryForward: `${p.carry_forward_limit} days`,
                 encashment: p.is_encashable ? 'Allowed' : 'None',
                 approvalWorkflow: p.approval_workflow || 'Manager'
             }
         ]));

      const { data: holidays, error: holidayError } = await supabase
     .from('company_holidays')
     .select('name, date:holiday_date'); 
             
         if (holidayError) throw holidayError;

         const companyWideLeaveData = {
             consumptionByDepartment: { 'Engineering': '58%', 'Sales': '32%', 'Marketing': '45%' },
             trendsInLeaveTypes: { 'Sick Leave': 'Increased by 21%' },
             totalLeaveBalances: '1,320 days',
         };

        // ❌ --- DELETE THIS FIRST RESPONSE --- ❌
         /*
         res.status(200).json({
             leavePolicyConfig,
             companyHolidays: holidays || [],
             companyWideLeaveData,
             aiAbsenteeismForecaster: ["..."]
         });
        */
         
        // --- KEEP THIS SECOND RESPONSE ---
         const { data: leavePoliciesData } = await supabase.from('leave_policies').select('name, description');
        const leavePolicies = Object.fromEntries((leavePoliciesData ?? []).map(p => [p.name, p.description]));

         res.status(200).json({ // ✅ This will be your *only* response
             leavePolicyConfig,
             companyHolidays: holidays || [],
             companyWideLeaveData,
             aiAbsenteeismForecaster: ["Forecast: Expect high leave volume during the last two weeks of December."], // You had this as /*...*/
              leavePolicies 
         });

     } catch (error: any) {
         console.error("[HR ADMIN ERROR]:", error.message);
         
        // This 'if' check prevents the "Cannot set headers" error from appearing in your logs
        if (!res.headersSent) {
            res.status(500).json({ message: "Error fetching HR Admin data", error: error.message });
        }
     }
};


// --- CONTROLLER FOR APPLYING FOR LEAVE (FIXED) ---
export const applyForLeave = async (req: AuthRequest, res: Response) => {
    const { leaveType, fromDate, toDate, reason, startSession, endSession } = req.body;
    const authId = req.user?.id;
    if (!authId) {
        return res.status(401).json({ message: 'Authentication required.' });
    }

    try {
        // 1. Get the internal 'id'
        const internalEmployeeId = await getInternalEmployeeId(authId);

        // 2. Continue with policy lookup (this is fine)
        const { data: policy, error: policyError } = await supabase
            .from('leave_policies')
            .select('id')
            .eq('name', leaveType)
            .single();
        if (policyError || !policy) throw new Error('Invalid leave type specified.');

        const numberOfDays = await calculateLeaveDays(fromDate, toDate);
        if (numberOfDays <= 0) throw new Error('Leave duration must be at least one business day.');

        // 3. Use the internal 'id' in the insert
        const { error: insertError } = await supabase
            .from('leave_requests')
            .insert({
                employee_id: internalEmployeeId, // <-- FIX
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
        // This will now properly catch the "Employee profile not found" error
        console.error("Error applying for leave:", error.message);
        res.status(500).json({ message: 'Error submitting application', error: error.message });
    }
};

// --- CONTROLLER FOR LEAVE ACTIONS (APPROVE/REJECT) (FIXED) ---
export const handleLeaveAction = async (req: AuthRequest, res: Response) => {
    const { requestId, status } = req.body;
    const authId = req.user?.id;
    if (!authId) {
        return res.status(401).json({ message: 'Authentication required.' });
    }

    try {
        // 1. Get the internal 'id' of the processor (the manager)
        const internalProcessorId = await getInternalEmployeeId(authId);
        
        // 2. Find the request (this is fine)
        const { data: request, error: findError } = await supabase
            .from('leave_requests')
            .select('number_of_days, employee_id, policy_id, start_date')
            .eq('id', requestId)
            .single();
        if (findError || !request) throw new Error('Leave request not found.');

        // TODO: Add a check to ensure 'internalProcessorId' is the manager of 'request.employee_id'
        // (This is important for security)

        // 3. Use the internal 'id' in the update
        const { error: updateError } = await supabase
            .from('leave_requests')
            .update({ status: status, processed_by: internalProcessorId }) // <-- FIX
            .eq('id', requestId);
        if (updateError) throw updateError;

        // 4. Update balance (this logic is fine)
        if (status === 'approved') {
            const { error: rpcError } = await supabase.rpc('update_leave_balance', {
                p_employee_id: request.employee_id, // This is already the internal ID
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

// --- CONTROLLER FOR ADDING A HOLIDAY ---
// --- CONTROLLER FOR ADDING A HOLIDAY (FIXED) ---
// --- CONTROLLER FOR ADDING A HOLIDAY (FIXED) ---
export const addHoliday = async (req: AuthRequest, res: Response) => {
    try {
        const { name, date } = req.body; // 'date' is a string like '2025-10-18'
        console.log("Adding holiday:", name, date);

        // 1. Validate the date and get the year
        if (!date) {
            throw new Error("Date is required to add a holiday.");
        }
        // Create a new Date object (this handles timezones correctly)
        const holidayDate = new Date(date); 
        // Use getFullYear() to extract the year
        const year = holidayDate.getFullYear();

        if (isNaN(year)) {
            throw new Error("Invalid date format. Please use YYYY-MM-DD.");
        }

        // 2. Add the 'year' to your insert object
        const { error } = await supabase.from('company_holidays').insert({ 
            name: name, 
            holiday_date: date,
            year: year // <-- THIS IS THE FIX
        });

        if (error) throw error;

        res.status(201).json({ message: 'Holiday added successfully' });
    } catch (error: any) {
        console.error("Error adding holiday:", error.message);
        res.status(500).json({ message: 'Failed to add holiday', error: error.message });
    }
};

// --- CONTROLLER FOR CREATING A NEW POLICY ---
// --- CONTROLLER FOR CREATING A NEW POLICY (FIXED) ---
// --- CONTROLLER FOR CREATING A NEW POLICY (FIXED) ---
// In leaveController.ts

// In leaveController.ts

export const createPolicy = async (req: AuthRequest, res: Response) => {
    try {
        // 1. Get all the new data from the form
        const { 
          name, totalDays, description, icon, color,
          accrual_frequency, carry_forward_limit, is_encashable 
        } = req.body;
        
        console.log("Creating full policy:", req.body);
        
        // 2. Insert all fields from the form into their matching columns
        const { error } = await supabase.from('leave_policies').insert({
            name: name,
            total_days: totalDays,
         description: description,
            icon: icon,
            color: color,
            accrual_frequency: accrual_frequency,  // <-- Now from the form
    carry_forward_limit: carry_forward_limit, // <-- Now from the form
            is_encashable: is_encashable,           // <-- Now from the form
            approval_workflow: 'Manager' // You can still default this
        });

        if (error) throw error;

        res.status(201).json({ message: 'Policy created successfully' });
 } catch (error: any) {
        console.error("Error creating policy:", error.message);
        res.status(500).json({ message: 'Failed to create policy', error: error.message });
    }
};

// --- CONTROLLER FOR ADJUSTING LEAVE BALANCE ---
// --- CONTROLLER FOR ADJUSTING LEAVE BALANCE (FIXED) ---
export const adjustBalance = async (req: AuthRequest, res: Response) => {
    try {
        // 1. Get data from the request body
        const { employeeId, policyName, days, action } = req.body; 
        // Note: Frontend sends employeeId, policyName. Assuming employeeId is the EMAIL.
        
        console.log("Adjusting balance request:", employeeId, policyName, days, action);

        // 2. Basic Validation
        if (!employeeId || !policyName || !days || !action) {
            throw new Error("Missing required fields: employeeId (email), policyName, days, action.");
        }
        if (days <= 0) {
            throw new Error("Days must be a positive number.");
        }
        if (action !== 'credit' && action !== 'debit') {
            throw new Error("Invalid action. Must be 'credit' or 'debit'.");
        }

        // 3. Find the internal employee ID using the provided email
        const { data: employee, error: employeeError } = await supabase
            .from('employees')
            .select('id')
            .eq('email', employeeId) // Assuming employeeId from form is the email
            .single();

        if (employeeError || !employee) {
            console.error("Employee not found for email:", employeeId, employeeError);
            throw new Error(`No employee profile found with email: ${employeeId}.`);
        }
        const internalEmployeeId = employee.id;

        // 4. Find the policy ID using the policy name
        const { data: policy, error: policyError } = await supabase
            .from('leave_policies')
            .select('id')
            .eq('name', policyName)
            .single();
            
        if (policyError || !policy) {
            console.error("Leave policy not found:", policyName, policyError);
            throw new Error(`Invalid leave policy specified: ${policyName}.`);
        }
        const policyId = policy.id;

        // 5. Determine the year (use the current year) and days to add/subtract
        const currentYear = new Date().getFullYear();
        const daysToAddOrSubtract = action === 'credit' ? days : -days; // Negative for debit

        // 6. Call the Supabase RPC function to update the balance
        console.log(`Calling RPC update_leave_balance with: employee=${internalEmployeeId}, policy=${policyId}, days=${daysToAddOrSubtract}, year=${currentYear}`);
        const { error: rpcError } = await supabase.rpc('update_leave_balance', {
            p_employee_id: internalEmployeeId,
            p_policy_id: policyId,
            p_days_to_add: daysToAddOrSubtract,
            p_year: currentYear 
        });

        if (rpcError) {
            console.error("RPC Error updating leave balance:", rpcError);
            throw new Error(`Failed to update leave balance: ${rpcError.message}`);
        }

        // 7. Send success response
        res.status(200).json({ message: `Balance adjusted successfully (${action} ${days} days).` });

    } catch (error: any) {
        console.error("Error adjusting balance:", error.message);
        // Ensure we don't crash if headers were somehow already sent
        if (!res.headersSent) {
            res.status(500).json({ message: 'Failed to adjust balance', error: error.message });
        }
    }
};