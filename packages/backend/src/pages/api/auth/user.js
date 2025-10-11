import { createClient } from '@supabase/supabase-js';

// Initialize Supabase client (server-side)
const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY // use service key to verify tokens securely
);

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const token = req.headers.authorization?.replace('Bearer ', '');

    if (!token) {
      return res.status(401).json({ error: 'No token provided' });
    }

    // 1️⃣ Verify the token using Supabase Auth
    const {
      data: { user },
      error: verifyError,
    } = await supabase.auth.getUser(token);

    if (verifyError || !user) {
      console.error('Token verification failed:', verifyError);
      return res.status(401).json({ error: 'Invalid or expired token' });
    }

    // 2️⃣ Fetch user profile from your "profiles" table
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('id, name, email, role, created_at')
      .eq('id', user.id)
      .single();

    if (profileError || !profile) {
      console.error('Profile not found:', profileError);
      return res.status(404).json({ error: 'User not found' });
    }

    // 3️⃣ Return user info
    return res.status(200).json({
      id: profile.id,
      name: profile.name,
      email: profile.email || user.email,
      role: profile.role,
      created_at: profile.created_at,
    });
  } catch (error) {
    console.error('User data error:', error);
    res.status(500).json({ error: 'Failed to get user data' });
  }
}
