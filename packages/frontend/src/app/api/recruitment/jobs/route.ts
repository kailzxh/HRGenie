// frontend/src/app/api/recruitment/jobs/route.ts
import { NextResponse } from 'next/server';
// In your page.js file
export const dynamic = 'force-dynamic';
const BASE_URL = `${process.env.NEXT_PUBLIC_BACKEND_URL}/recruitment`;

// GET /api/recruitment/jobs
export async function GET(req: Request) {
  try {
    const url = new URL(req.url);
    const searchParams = url.searchParams.toString();
    const res = await fetch(`${BASE_URL}/jobs${searchParams ? '?' + searchParams : ''}`);

    if (!res.ok) {
      const errorText = await res.text();
      console.error('GET /jobs failed:', errorText);
      return NextResponse.json({ error: 'Failed to fetch jobs', details: errorText }, { status: res.status });
    }

    const data = await res.json();

    if (!Array.isArray(data)) {
      console.error('GET /jobs: Expected array but got:', data);
      return NextResponse.json({ error: 'Invalid response from server', details: data }, { status: 500 });
    }

    return NextResponse.json(data);
  } catch (error) {
    console.error('GET /jobs error:', error);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}

// POST /api/recruitment/jobs
export async function POST(req: Request) {
  try {
    const body = await req.json();
    const res = await fetch(`${BASE_URL}/jobs`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });

    if (!res.ok) {
      const errorData = await res.json().catch(() => ({}));
      return NextResponse.json({ error: 'Failed to create job', details: errorData }, { status: res.status });
    }

    const data = await res.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error('POST /jobs error:', error);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}

// PUT /api/recruitment/jobs?id=<jobId>
export async function PUT(req: Request) {
  try {
    const url = new URL(req.url);
    const id = url.searchParams.get('id');
    if (!id) return NextResponse.json({ error: 'Job ID is required' }, { status: 400 });

    const body = await req.json();
    const res = await fetch(`${BASE_URL}/jobs/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });

    if (!res.ok) {
      const errorData = await res.json().catch(() => ({}));
      return NextResponse.json({ error: 'Failed to update job', details: errorData }, { status: res.status });
    }

    const data = await res.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error('PUT /jobs error:', error);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}

// DELETE /api/recruitment/jobs?id=<jobId>
export async function DELETE(req: Request) {
  try {
    const url = new URL(req.url);
    const id = url.searchParams.get('id');
    if (!id) return NextResponse.json({ error: 'Job ID is required' }, { status: 400 });

    const res = await fetch(`${BASE_URL}/jobs/${id}`, {
      method: 'DELETE',
    });

    if (!res.ok) {
      const errorData = await res.json().catch(() => ({}));
      return NextResponse.json({ error: 'Failed to delete job', details: errorData }, { status: res.status });
    }

    const data = await res.json();
    return NextResponse.json({ message: 'Job deleted successfully', data });
  } catch (error) {
    console.error('DELETE /jobs error:', error);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
