import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'
 // optional if you have typed schema

export async function GET(req: Request) {
  const supabase = createRouteHandlerClient({ cookies })

  const { data: { session }, error } = await supabase.auth.getSession()
  
  if (error) {
    console.error(error)
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }

  if (!session) {
    return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })
  }

  return NextResponse.json({ user: session.user })
}
