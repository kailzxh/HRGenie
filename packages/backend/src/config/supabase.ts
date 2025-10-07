import { createClient } from '@supabase/supabase-js'

const SUPABASE_URL = process.env.SUPABASE_URL!
const SUPABASE_ANON_KEY = process.env.SUPABASE_ANON_KEY!
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_KEY!

// Regular client for frontend-safe queries (limited permissions)
export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY)

// Admin client for backend operations (create/update/delete users)
export const supabaseAdmin = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY)
