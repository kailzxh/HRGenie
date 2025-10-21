// src/app/api/payroll/employees/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { supabaseServer } from '@/config/supabaseServer';

export async function GET(req: NextRequest) {
  try {
    const authHeader = req.headers.get('authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'No token provided' }, { status: 401 });
    }

    const token = authHeader.split('Bearer ')[1];
    const { data: userData, error: userError } = await supabaseServer.auth.getUser(token);

    if (userError || !userData.user) {
      return NextResponse.json({ error: 'Invalid or expired token' }, { status: 401 });
    }

    const employees = [
      { id: '1', name: 'Alice', base_salary: 50000, department: 'HR' },
      { id: '2', name: 'Bob', base_salary: 60000, department: 'Finance' },
    ];

    return NextResponse.json(employees);
  } catch (err: any) {
    console.error('Payroll API error:', err);
    return NextResponse.json(
      { error: 'Server error', details: err.message },
      { status: 500 }
    );
  }
}
