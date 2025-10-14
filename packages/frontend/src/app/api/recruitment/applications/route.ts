// app/api/recruitment/applications/route.ts
import { NextResponse } from 'next/server';

const BASE_URL = 'http://localhost:5000/api/recruitment';

// GET /api/recruitment/applications
export async function GET(req: Request) {
  try {
    const url = new URL(req.url);
    const searchParams = url.searchParams.toString();
    
    const res = await fetch(`${BASE_URL}/applications${searchParams ? '?' + searchParams : ''}`);

    if (!res.ok) {
      const errorText = await res.text();
      console.error('GET /applications failed:', errorText);
      return NextResponse.json({ error: 'Failed to fetch data', details: errorText }, { status: res.status });
    }

    const data = await res.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error('GET /applications error:', error);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}

// POST /api/recruitment/applications (for any base POST operations)
export async function POST(req: Request) {
  // Handle any base POST operations if needed
  return NextResponse.json({ error: 'Use specific endpoints for updates' }, { status: 400 });
}