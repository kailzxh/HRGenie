import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get('code');

  if (!code) {
    return NextResponse.redirect(new URL('/auth/login', requestUrl.origin));
  }

  const supabase = createRouteHandlerClient({ cookies });

  // Exchange OAuth code for a session
  const { data, error } = await supabase.auth.exchangeCodeForSession(code);

  if (error) {
    console.error('OAuth exchange error:', error.message);
    return NextResponse.redirect(new URL('/auth/login', requestUrl.origin));
  }

  if (data.session) {
    // Session cookie is set automatically by Supabase helper
    // Browser client can now pick up the session without refresh
    return NextResponse.redirect(new URL('/dashboard', requestUrl.origin));
  }

  // fallback
  return NextResponse.redirect(new URL('/auth/login', requestUrl.origin));
}
