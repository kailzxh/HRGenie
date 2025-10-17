// pages/api/payroll/employees.ts
import type { NextApiRequest, NextApiResponse } from 'next'
import { supabaseServer } from '@/config/supabase'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  try {
    const authHeader = req.headers.authorization;
    if (!authHeader?.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'No token provided' });
    }

    const token = authHeader.split('Bearer ')[1];
    const { data: userData, error: userError } = await supabaseServer.auth.getUser(token);

    if (userError || !userData.user) {
      return res.status(401).json({ error: 'Invalid or expired token' });
    }

    const employees = [
      { id: '1', name: 'Alice', base_salary: 50000, department: 'HR' },
      { id: '2', name: 'Bob', base_salary: 60000, department: 'Finance' },
    ];

    res.status(200).json(employees);
  } catch (err: any) {
    console.error('Payroll API error:', err);
    res.status(500).json({ error: 'Server error', details: err.message });
  }
}
