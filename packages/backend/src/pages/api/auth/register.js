import { createClient } from '@supabase/supabase-js';

// Initialize Supabase client (server-side)
const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY // Use service role key (NOT anon key)
);

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { name, email, password, role } = req.body;
    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }

    // 1️⃣ Create user in Supabase Auth
    const { data: signUpData, error: signUpError } = await supabase.auth.admin.createUser({
      email,
      password,
      email_confirm: true, // immediately confirm email
      user_metadata: {
        name: name || email.split('@')[0],
        role: role || 'employee',
      },
    });

    if (signUpError) {
      console.error('Supabase signup error:', signUpError);
      return res.status(400).json({ error: signUpError.message });
    }

    const user = signUpData.user;

    // 2️⃣ Add to your custom "profiles" table
    const { error: profileError } = await supabase
      .from('profiles')
      .insert({
        id: user.id,
        name: name || user.email,
        role: role || 'employee',
      });

    if (profileError) {
      console.error('Profile creation error:', profileError);
      return res.status(500).json({ error: 'Error creating profile entry' });
    }

    // 3️⃣ Generate a session/token
    const { data: tokenData, error: tokenError } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (tokenError) {
      console.error('Token generation error:', tokenError);
      return res.status(500).json({ error: 'Could not log in newly registered user' });
    }

    // 4️⃣ Respond with user info + access token
    return res.status(201).json({
      message: 'User registered successfully',
      token: tokenData.session.access_token,
      user: {
        id: user.id,
        name: name || email,
        email,
        role: role || 'employee',
      },
    });
  } catch (error) {
    console.error('Registration error:', error);
    return res.status(500).json({ error: 'Registration failed' });
  }
}
