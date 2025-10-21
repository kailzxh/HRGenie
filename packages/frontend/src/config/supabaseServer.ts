import { createClient } from '@supabase/supabase-js';

export const supabaseServer = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_SERVICE_KEY!
);

export const supabaseOnboarding = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_SERVICE_KEY!,
  {
    db: { schema: 'onboarding' },
  }
);
