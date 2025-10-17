import { Response } from 'express-serve-static-core';
import { supabase } from '../config/supabase';
import { AuthRequest } from '../middleware/auth';

export async function getEmployees(req: AuthRequest, res: Response<any, Record<string, any>, number>) {
  try {
    const { department, status, minSalary, maxSalary, search } = req.query;

    let query = supabase.from('employees').select('*');

    if (department) query = query.eq('department', department);
    if (status) query = query.eq('status', status);
    if (minSalary) query = query.gte('salary', Number(minSalary));
    if (maxSalary) query = query.lte('salary', Number(maxSalary));
    if (search)
      query = query.or(`name.ilike.%${search}%,email.ilike.%${search}%`);

    const { data, error } = await query;
    if (error) throw error;

    return data;
  } catch (err: any) {
    console.error('Error fetching employees:', err.message);
    throw new Error(err.message || 'Failed to fetch employees');
  }
}
