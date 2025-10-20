// app/api/recruitment/applications/[id]/status/route.ts
import { NextResponse } from 'next/server';

const BASE_URL = `${process.env.NEXT_PUBLIC_BACKEND_URL}/recruitment`;

export async function POST(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    const body = await req.json();

    const res = await fetch(`${BASE_URL}/applications/${id}/status`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });

    const responseData = await res.json();
    
    if (!res.ok) {
      return NextResponse.json(
        { error: 'Failed to update application status', details: responseData },
        { status: res.status }
      );
    }
    
    return NextResponse.json(responseData);
  } catch (error) {
    console.error('POST /applications/[id]/status error:', error);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}