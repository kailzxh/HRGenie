// client-side Supabase (browser)
import { createClient } from '@supabase/supabase-js';

export const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

// server-side Supabase (API routes, server functions)
export const supabaseServer = createClient(
  process.env.SUPABASE_URL!,         // non-public URL
  process.env.SUPABASE_SERVICE_KEY!  // server-only key
);

// server-side Supabase for onboarding schema
export const supabaseOnboarding = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_KEY!,
  {
    db: { schema: 'onboarding' }
  }
);
