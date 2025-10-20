import { Response } from 'express-serve-static-core';
import { supabase } from '../config/supabase';
import { AuthRequest } from '../middleware/auth';

// Payroll calculation helper functions
function calculateGrossSalary(employee: any): number {
  const base = Number(employee.salary) || 0;
  const allowances = Number(employee.allowances) || 0;
  const bonus = Number(employee.bonus) || 0;
  return base + allowances + bonus;
}

function calculateTax(employee: any): number {
  const gross = calculateGrossSalary(employee);
  return Math.round(gross * 0.12);
}

function calculatePF(employee: any): number {
  const base = Number(employee.salary) || 0;
  return Math.round(base * 0.12);
}

function calculateDeductions(employee: any): number {
  const tax = calculateTax(employee);
  const pf = calculatePF(employee);
  return tax + pf;
}

function calculateNetSalary(employee: any): number {
  const gross = calculateGrossSalary(employee);
  const deductions = calculateDeductions(employee);
  return gross - deductions;
}

// Get all employees
// Get all employees
export async function getEmployees(req: AuthRequest, res: Response) {
  try {
    const { department, status, minSalary, maxSalary, search, page = 1, limit = 50 } = req.query;
    const userRole = req.user?.role;
    const userEmail = req.user?.email; // Get the logged-in user's email

    const pageNum = Math.max(1, parseInt(page as string) || 1);
    const limitNum = Math.min(100, Math.max(1, parseInt(limit as string) || 50));
    const offset = (pageNum - 1) * limitNum;

    let query = supabase
      .from('employees')
      .select('*', { count: 'exact' });

    // Manager and Employee can only see themselves
    if (userRole === 'manager' || userRole === 'employee') {
      if (!userEmail) {
        return res.status(403).json({
          success: false,
          error: 'User email not found'
        });
      }

      // Find the employee record for this user by email
      const { data: userEmployee, error: userEmployeeError } = await supabase
        .from('employees')
        .select('id')
        .eq('email', userEmail)
        .single();

      if (userEmployeeError || !userEmployee) {
        console.error('Error finding employee record:', userEmployeeError);
        return res.status(403).json({
          success: false,
          error: 'Employee record not found for user email: ' + userEmail
        });
      }

      if (userEmployee) {
        query = query.eq('id', userEmployee.id); // Only show their own record
      }
    }

    // Existing filters (only applied for admin/hr)
    if ((userRole === 'admin' || userRole === 'hr') && department && department !== '') {
      query = query.eq('department', department as string);
    }
    
    if ((userRole === 'admin' || userRole === 'hr') && status && status !== '') {
      query = query.eq('status', status as string);
    }
    
    if (minSalary) {
      const min = parseFloat(minSalary as string);
      if (!isNaN(min)) {
        query = query.gte('salary', min);
      }
    }
    
    if (maxSalary) {
      const max = parseFloat(maxSalary as string);
      if (!isNaN(max)) {
        query = query.lte('salary', max);
      }
    }
    
    if (search && search !== '') {
      query = query.or(`name.ilike.%${search}%,email.ilike.%${search}%,department.ilike.%${search}%`);
    }

    query = query
      .range(offset, offset + limitNum - 1)
      .order('name', { ascending: true });

    const { data: employees, error, count } = await query;

    if (error) {
      console.error('Supabase error fetching employees:', error);
      return res.status(500).json({ 
        success: false,
        error: 'Database error occurred while fetching employees',
        details: error.message 
      });
    }

    const employeesWithPayroll = employees?.map(employee => ({
      ...employee,
      base_salary: Number(employee.salary) || 0,
      allowances: Number(employee.allowances) || 0,
      bonus: Number(employee.bonus) || 0,
      gross: calculateGrossSalary(employee),
      tax: calculateTax(employee),
      pf: calculatePF(employee),
      deductions: calculateDeductions(employee),
      net: calculateNetSalary(employee)
    })) || [];

    return res.status(200).json({
      success: true,
      data: employeesWithPayroll,
      pagination: {
        page: pageNum,
        limit: limitNum,
        total: count || 0,
        totalPages: Math.ceil((count || 0) / limitNum)
      },
      filters: {
        department: department || null,
        status: status || null,
        minSalary: minSalary || null,
        maxSalary: maxSalary || null,
        search: search || null
      },
      userContext: {
        role: userRole,
        restrictedView: (userRole === 'manager' || userRole === 'employee')
      }
    });

  } catch (err: any) {
    console.error('Unexpected error in getEmployees:', err);
    return res.status(500).json({
      success: false,
      error: 'Internal server error',
      message: 'Failed to fetch employees data'
    });
  }
}

// Get employee by ID
export async function getEmployeeById(req: AuthRequest, res: Response) {
  try {
    const { id } = req.params;

    if (!id) {
      return res.status(400).json({
        success: false,
        error: 'Employee ID is required'
      });
    }

    const { data: employee, error } = await supabase
      .from('employees')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return res.status(404).json({
          success: false,
          error: 'Employee not found'
        });
      }
      throw error;
    }

    if (!employee) {
      return res.status(404).json({
        success: false,
        error: 'Employee not found'
      });
    }

    const employeeWithPayroll = {
      ...employee,
      base_salary: Number(employee.salary) || 0,
      allowances: Number(employee.allowances) || 0,
      bonus: Number(employee.bonus) || 0,
      gross: calculateGrossSalary(employee),
      tax: calculateTax(employee),
      pf: calculatePF(employee),
      deductions: calculateDeductions(employee),
      net: calculateNetSalary(employee)
    };

    return res.status(200).json({
      success: true,
      data: employeeWithPayroll
    });

  } catch (err: any) {
    console.error('Error fetching employee by ID:', err);
    return res.status(500).json({
      success: false,
      error: 'Failed to fetch employee data'
    });
  }
}

// Update employee salary
export async function updateEmployeeSalary(req: AuthRequest, res: Response) {
  try {
    const { id } = req.params;
    const { base_salary } = req.body;

    if (!id) {
      return res.status(400).json({
        success: false,
        error: 'Employee ID is required'
      });
    }

    if (!base_salary || base_salary < 0) {
      return res.status(400).json({
        success: false,
        error: 'Valid base salary is required'
      });
    }

    const { data: updatedEmployee, error } = await supabase
      .from('employees')
      .update({ 
        salary: base_salary,
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('Error updating employee salary:', error);
      return res.status(500).json({
        success: false,
        error: 'Failed to update employee salary'
      });
    }

    if (!updatedEmployee) {
      return res.status(404).json({
        success: false,
        error: 'Employee not found'
      });
    }

    const employeeWithPayroll = {
      ...updatedEmployee,
      base_salary: Number(updatedEmployee.salary) || 0,
      allowances: Number(updatedEmployee.allowances) || 0,
      bonus: Number(updatedEmployee.bonus) || 0,
      gross: calculateGrossSalary(updatedEmployee),
      tax: calculateTax(updatedEmployee),
      pf: calculatePF(updatedEmployee),
      deductions: calculateDeductions(updatedEmployee),
      net: calculateNetSalary(updatedEmployee)
    };

    return res.status(200).json({
      success: true,
      message: 'Employee salary updated successfully',
      data: employeeWithPayroll
    });

  } catch (err: any) {
    console.error('Error updating employee salary:', err);
    return res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
}

// Get departments list
export async function getDepartments(req: AuthRequest, res: Response) {
  try {
    const { data: departments, error } = await supabase
      .from('employees')
      .select('department')
      .not('department', 'is', null);

    if (error) {
      console.error('Error fetching departments:', error);
      return res.status(500).json({
        success: false,
        error: 'Failed to fetch departments'
      });
    }

    const uniqueDepartments = [...new Set(departments?.map(d => d.department).filter(Boolean))];

    return res.status(200).json({
      success: true,
      data: uniqueDepartments
    });

  } catch (err: any) {
    console.error('Error fetching departments:', err);
    return res.status(500).json({
      success: false,
      error: 'Failed to fetch departments'
    });
  }
}

// Get all payroll runs
export async function getPayrollRuns(req: AuthRequest, res: Response) {
  try {
    const { page = 1, limit = 50, status } = req.query;
    const userRole = req.user?.role;
    const userEmail = req.user?.email;
    let userEmployee: any; // Declare userEmployee here
    
    const pageNum = Math.max(1, parseInt(page as string) || 1);
    const limitNum = Math.min(100, Math.max(1, parseInt(limit as string) || 50));
    const offset = (pageNum - 1) * limitNum;

    let query = supabase
      .from('payroll_runs')
      .select(`
        *,
        payroll_lines(*)
      `, { count: 'exact' })
      .order('created_at', { ascending: false });

    // Manager and Employee can only see payroll runs that include them
    if (userRole === 'manager' || userRole === 'employee') {
      if (!userEmail) {
        return res.status(403).json({
          success: false,
          error: 'User email not found'
        });
      }

      // Find the employee record for this user by email
      const { data: fetchedUserEmployee, error: userEmployeeError } = await supabase
        .from('employees')
        .select('id')
        .eq('email', userEmail)
        .single();

      if (userEmployeeError || !fetchedUserEmployee) {
        console.error('Error finding employee record:', userEmployeeError);
        return res.status(403).json({
          success: false,
          error: 'Employee record not found for user email: ' + userEmail
        });
      }
      userEmployee = fetchedUserEmployee; // Assign to the declared variable

      if (userEmployee) {
        // Only show payroll runs that have this employee in payroll_lines
        query = query.filter('payroll_lines.employee_id', 'eq', userEmployee.id);
      }
    }

    if (status && status !== 'all') {
      query = query.eq('status', status);
    }

    query = query.range(offset, offset + limitNum - 1);

    const { data: payrollRuns, error, count } = await query;

    if (error) {
      console.error('Error fetching payroll runs:', error);
      return res.status(500).json({
        success: false,
        error: 'Failed to fetch payroll runs'
      });
    }

    // Filter payroll lines to only show the user's own data for manager/employee
    const runsWithLines = payrollRuns?.map(run => {
      let filteredLines = run.payroll_lines || [];
      
      if (userRole === 'manager' || userRole === 'employee') {
        // Only show the user's own payroll line
        filteredLines = filteredLines.filter((line: any) => {
          return line.employee_id === userEmployee?.id;
        });
      }

      return {
        ...run,
        lines: Array.isArray(filteredLines) ? filteredLines : []
      }
    }) || [];

    return res.status(200).json({
      success: true,
      data: runsWithLines,
      pagination: {
        page: pageNum,
        limit: limitNum,
        total: count || 0,
        totalPages: Math.ceil((count || 0) / limitNum)
      }
    });

  } catch (err: any) {
    console.error('Error in getPayrollRuns:', err);
    return res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
}
// Create a new payroll run
// Create a new payroll run
export async function createPayrollRun(req: AuthRequest, res: Response) {
  try {
    const { month, year, employeeIds } = req.body;
    const createdBy = req.user?.id;

    if (!month || !year) {
      return res.status(400).json({
        success: false,
        error: 'Month and year are required'
      });
    }

    if (!createdBy) {
      return res.status(401).json({
        success: false,
        error: 'Authentication required'
      });
    }

    // Check if payroll run already exists for this month/year
    const { data: existingRun, error: checkError } = await supabase
      .from('payroll_runs')
      .select('id')
      .eq('month', month)
      .eq('year', year)
      .single();

    // If run exists, delete it and its lines before creating new one
    if (existingRun) {
      console.log(`Deleting existing payroll run for ${month}/${year} with ID: ${existingRun.id}`);
      
      // Delete payroll lines first (due to foreign key constraint)
      const { error: linesDeleteError } = await supabase
        .from('payroll_lines')
        .delete()
        .eq('payroll_run_id', existingRun.id);

      if (linesDeleteError) {
        console.error('Error deleting payroll lines:', linesDeleteError);
        throw linesDeleteError;
      }

      // Delete the payroll run
      const { error: runDeleteError } = await supabase
        .from('payroll_runs')
        .delete()
        .eq('id', existingRun.id);

      if (runDeleteError) {
        console.error('Error deleting payroll run:', runDeleteError);
        throw runDeleteError;
      }

      console.log(`Successfully deleted existing payroll run for ${month}/${year}`);
    }

    // Get employees for payroll run
    let employeeQuery = supabase
      .from('employees')
      .select('*')
      .eq('status', 'active');

    if (employeeIds && employeeIds.length > 0) {
      employeeQuery = employeeQuery.in('id', employeeIds);
    }

    const { data: employees, error: employeesError } = await employeeQuery;

    if (employeesError) {
      throw employeesError;
    }

    if (!employees || employees.length === 0) {
      return res.status(400).json({
        success: false,
        error: 'No employees found for payroll run'
      });
    }

    // Calculate totals
    const totalGross = employees.reduce((sum, emp) => sum + (Number(emp.salary) || 0) + (Number(emp.allowances) || 0) + (Number(emp.bonus) || 0), 0);
    const totalTax = employees.reduce((sum, emp) => sum + Math.round(((Number(emp.salary) || 0) + (Number(emp.allowances) || 0) + (Number(emp.bonus) || 0)) * 0.12), 0);
    const totalPf = employees.reduce((sum, emp) => sum + Math.round((Number(emp.salary) || 0) * 0.12), 0);
    const totalNet = totalGross - totalTax - totalPf - (employees.length * 200); // professional tax

    // Create payroll run
    const { data: payrollRun, error: runError } = await supabase
      .from('payroll_runs')
      .insert({
        month,
        year,
        status: 'draft',
        total_gross: totalGross,
        total_net: totalNet,
        total_tax: totalTax,
        total_pf: totalPf,
        employee_count: employees.length,
        created_by: createdBy
      })
      .select()
      .single();

    if (runError) {
      throw runError;
    }

    // Create payroll lines for each employee
    const payrollLines = employees.map(employee => {
      const baseSalary = Number(employee.salary) || 0;
      const allowances = Number(employee.allowances) || 0;
      const bonus = Number(employee.bonus) || 0;
      const grossSalary = baseSalary + allowances + bonus;
      const tax = Math.round(grossSalary * 0.12);
      const pf = Math.round(baseSalary * 0.12);
      const totalDeductions = tax + pf + 200; // + professional tax
      const netSalary = grossSalary - totalDeductions;

      return {
        payroll_run_id: payrollRun.id,
        employee_id: employee.id,
        employee_name: employee.name,
        base_salary: baseSalary,
        allowances: allowances,
        bonus: bonus,
        overtime: 0,
        gross_salary: grossSalary,
        income_tax: tax,
        professional_tax: 200,
        provident_fund: pf,
        other_deductions: 0,
        total_deductions: totalDeductions,
        net_salary: netSalary,
        bank_account: employee.bank_account_number,
        bank_name: employee.bank_name,
        ifsc_code: employee.ifsc_code,
        payslip_generated: false
      };
    });

    const { error: linesError } = await supabase
      .from('payroll_lines')
      .insert(payrollLines);

    if (linesError) {
      throw linesError;
    }

    // Get the complete payroll run with lines
    const { data: completeRun, error: fetchError } = await supabase
      .from('payroll_runs')
      .select(`
        *,
        payroll_lines(*)
      `)
      .eq('id', payrollRun.id)
      .single();

    if (fetchError) {
      throw fetchError;
    }

    return res.status(201).json({
      success: true,
      message: existingRun ? 'Payroll run recreated successfully' : 'Payroll run created successfully',
      data: {
        ...completeRun,
        lines: Array.isArray(completeRun.payroll_lines) ? completeRun.payroll_lines : []
      }
    });

  } catch (err: any) {
    console.error('Error creating payroll run:', err);
    return res.status(500).json({
      success: false,
      error: 'Failed to create payroll run'
    });
  }
}
// Get payroll run by ID
export async function getPayrollRunById(req: AuthRequest, res: Response) {
  try {
    const { id } = req.params;

    if (!id) {
      return res.status(400).json({
        success: false,
        error: 'Payroll run ID is required'
      });
    }

    const { data: payrollRun, error } = await supabase
      .from('payroll_runs')
      .select(`
        *,
        payroll_lines(*)
      `)
      .eq('id', id)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return res.status(404).json({
          success: false,
          error: 'Payroll run not found'
        });
      }
      throw error;
    }

    return res.status(200).json({
      success: true,
      data: {
        ...payrollRun,
        lines: Array.isArray(payrollRun.payroll_lines) ? payrollRun.payroll_lines : []
      }
    });

  } catch (err: any) {
    console.error('Error fetching payroll run:', err);
    return res.status(500).json({
      success: false,
      error: 'Failed to fetch payroll run'
    });
  }
}

// Process payroll run
export async function processPayrollRun(req: AuthRequest, res: Response) {
  try {
    const { id } = req.params;

    if (!id) {
      return res.status(400).json({
        success: false,
        error: 'Payroll run ID is required'
      });
    }

    // Update payroll run status to processing
    const { data: payrollRun, error: updateError } = await supabase
      .from('payroll_runs')
      .update({
        status: 'processing',
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .select()
      .single();

    if (updateError) {
      throw updateError;
    }

    // Simulate processing
    setTimeout(async () => {
      await supabase
        .from('payroll_runs')
        .update({
          status: 'completed',
          processed_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
        .eq('id', id);

      await supabase
        .from('payroll_lines')
        .update({
          payslip_generated: true,
          payslip_url: `/payslips/${id}/{employee_id}.pdf`
        })
        .eq('payroll_run_id', id);
    }, 3000);

    return res.status(200).json({
      success: true,
      message: 'Payroll run processing started',
      data: payrollRun
    });

  } catch (err: any) {
    console.error('Error processing payroll run:', err);
    return res.status(500).json({
      success: false,
      error: 'Failed to process payroll run'
    });
  }
}

// Delete payroll run
export async function deletePayrollRun(req: AuthRequest, res: Response) {
  try {
    const { id } = req.params;

    if (!id) {
      return res.status(400).json({
        success: false,
        error: 'Payroll run ID is required'
      });
    }

    const { error } = await supabase
      .from('payroll_runs')
      .delete()
      .eq('id', id);

    if (error) {
      throw error;
    }

    return res.status(200).json({
      success: true,
      message: 'Payroll run deleted successfully'
    });

  } catch (err: any) {
    console.error('Error deleting payroll run:', err);
    return res.status(500).json({
      success: false,
      error: 'Failed to delete payroll run'
    });
  }
}

// Update payroll line
export async function updatePayrollLine(req: AuthRequest, res: Response) {
  try {
    const { runId, lineId } = req.params;
    const updates = req.body;

    if (!runId || !lineId) {
      return res.status(400).json({
        success: false,
        error: 'Payroll run ID and line ID are required'
      });
    }

    // Recalculate if salary components are updated
    if (updates.base_salary !== undefined || updates.allowances !== undefined || updates.bonus !== undefined) {
      const baseSalary = updates.base_salary !== undefined ? updates.base_salary : 0;
      const allowances = updates.allowances !== undefined ? updates.allowances : 0;
      const bonus = updates.bonus !== undefined ? updates.bonus : 0;
      
      updates.gross_salary = baseSalary + allowances + bonus;
      updates.income_tax = Math.round(updates.gross_salary * 0.12);
      updates.provident_fund = Math.round(baseSalary * 0.12);
      updates.total_deductions = updates.income_tax + updates.provident_fund + 200;
      updates.net_salary = updates.gross_salary - updates.total_deductions;
    }

    const { data: updatedLine, error } = await supabase
      .from('payroll_lines')
      .update({
        ...updates,
        updated_at: new Date().toISOString()
      })
      .eq('id', lineId)
      .eq('payroll_run_id', runId)
      .select()
      .single();

    if (error) {
      throw error;
    }

    return res.status(200).json({
      success: true,
      message: 'Payroll line updated successfully',
      data: updatedLine
    });

  } catch (err: any) {
    console.error('Error updating payroll line:', err);
    return res.status(500).json({
      success: false,
      error: 'Failed to update payroll line'
    });
  }
}