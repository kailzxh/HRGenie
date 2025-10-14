// app/api/recruitment/applications/bulk-update/route.ts
import { NextResponse } from 'next/server';

const BASE_URL = 'http://localhost:5000/api/recruitment';

export async function POST(req: Request) {
  try {
    const body = await req.json();

    const res = await fetch(`${BASE_URL}/applications/bulk-update`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    }); 

    const responseData = await res.json();
    
    if (!res.ok) {
      return NextResponse.json(
        { error: 'Failed to perform bulk update', details: responseData },
        { status: res.status }
      );
    }
    
    return NextResponse.json(responseData);
  } catch (error) {
    console.error('POST /applications/bulk-update error:', error);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}