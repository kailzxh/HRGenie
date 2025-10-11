import { createBrowserClient } from '@supabase/ssr';

/**
 * IMPORTANT: This module creates a SINGLETON instance of the Supabase client
 * for use in browser-based components. This is crucial to prevent multiple
 * instances and listeners from being created during Next.js's Fast Refresh
 * in development, which leads to state corruption.
 *
 * This client is configured to use the 'onboarding' schema.
 */
export const supabase = createBrowserClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  {
    // This is where you configure the database options, including the custom schema.
    db: {
      schema: 'onboarding',
    },
  }
);

