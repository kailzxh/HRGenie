// app/api/recruitment/applications/export/route.ts
import { NextResponse } from 'next/server';
// In your page.js file
export const dynamic = 'force-dynamic';
const BASE_URL = `${process.env.NEXT_PUBLIC_BACKEND_URL}/recruitment`;

export async function GET(req: Request) {
  try {
    const url = new URL(req.url);
    const searchParams = url.searchParams.toString();
    
    const res = await fetch(`${BASE_URL}/applications/export${searchParams ? '?' + searchParams : ''}`);

    if (!res.ok) {
      const errorText = await res.text();
      console.error('GET /applications/export failed:', errorText);
      return NextResponse.json({ error: 'Failed to export data', details: errorText }, { status: res.status });
    }

    const blob = await res.blob();
    return new NextResponse(blob, {
      status: 200,
      headers: {
        'Content-Type': res.headers.get('Content-Type') || 'application/octet-stream',
        'Content-Disposition': res.headers.get('Content-Disposition') || 'attachment',
      },
    });
  } catch (error) {
    console.error('GET /applications/export error:', error);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}