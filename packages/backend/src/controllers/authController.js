const { createClient } = require('@supabase/supabase-js');
const jwt = require('jsonwebtoken');

// Initialize Supabase client with service role key
const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY // full-access server-side key
);

// Generate JWT (optional, if you still want your own app token)
const generateAppToken = (user) => {
  return jwt.sign(
    {
      id: user.id,
      email: user.email,
      role: user.role
    },
    process.env.JWT_SECRET,
    { expiresIn: '24h' }
  );
};

// 🧩 Register (Sign Up)
const register = async (req, res) => {
  try {
    const { email, password, name, role } = req.body;

    // 1️⃣ Create user in Supabase Auth
    const { data, error: signupError } = await supabase.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: { name, role }
    });

    if (signupError) throw signupError;

    // 2️⃣ Update role in auth.users table
    await supabase
      .from('users')
      .update({ role: role || 'employee' })
      .eq('id', data.user.id);

    const appToken = generateAppToken({
      id: data.user.id,
      email,
      role
    });

    res.status(201).json({
      message: 'User registered successfully',
      token: appToken,
      user: {
        id: data.user.id,
        email,
        name,
        role
      }
    });
  } catch (error) {
    console.error('Supabase Register Error:', error);
    res.status(500).json({ error: error.message || 'Server error' });
  }
};

// 🔐 Login (Email + Password)
const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password
    });

    if (error) return res.status(401).json({ error: error.message });

    const user = data.user;

    // Fetch role from auth.users (or metadata)
    const { data: userData } = await supabase
      .from('users')
      .select('role')
      .eq('id', user.id)
      .single();

    const appToken = generateAppToken({
      id: user.id,
      email: user.email,
      role: userData?.role || user.user_metadata?.role || 'employee'
    });

    res.json({
      message: 'Login successful',
      token: appToken,
      user: {
        id: user.id,
        email: user.email,
        role: userData?.role || user.user_metadata?.role || 'employee'
      }
    });
  } catch (error) {
    console.error('Supabase Login Error:', error);
    res.status(500).json({ error: error.message || 'Server error' });
  }
};

// 🧠 Google Login
const googleLogin = async (req, res) => {
  try {
    const { provider_token } = req.body;

    const { data, error } = await supabase.auth.signInWithIdToken({
      provider: 'google',
      token: provider_token
    });

    if (error) return res.status(400).json({ error: error.message });

    const user = data.user;

    // Fetch role
    const { data: userData } = await supabase
      .from('users')
      .select('role')
      .eq('id', user.id)
      .single();

    const appToken = generateAppToken({
      id: user.id,
      email: user.email,
      role: userData?.role || user.user_metadata?.role || 'employee'
    });

    res.json({
      message: 'Google login successful',
      token: appToken,
      user: {
        id: user.id,
        email: user.email,
        role: userData?.role || user.user_metadata?.role || 'employee'
      }
    });
  } catch (error) {
    console.error('Google Login Error:', error);
    res.status(500).json({ error: error.message || 'Server error' });
  }
};

module.exports = { register, login, googleLogin };
