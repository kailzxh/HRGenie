import { Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import { createClient, User } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

// --- Initialize Supabase client ---
const SUPABASE_URL = process.env.SUPABASE_URL!;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const JWT_SECRET = process.env.JWT_SECRET!;

export const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

// --- Custom types ---
interface UserPayload {
  id: string;
  email: string;
  role: string;
  name?: string;
}

interface AuthRequest extends Request {
  user?: {
    id: string; // This should be the Supabase Auth ID
    email: string;
    name?: string;
    role: string; // This is the role from our profiles table
  };
}

// --- Utility: Generate JWT ---
const generateAppToken = (user: UserPayload): string => {
  return jwt.sign(
    { id: user.id, email: user.email, role: user.role },
    JWT_SECRET,
    { expiresIn: '24h' }
  );
};

// 🧩 Register (Sign Up)
export const supabaseRegister = async (req: Request, res: Response) => {
  try {
    const { email, password, name, role } = req.body;

    // 1️⃣ Create user in Supabase Auth
    const { data, error: signupError } = await supabase.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: { name, role },
    });

    if (signupError || !data?.user) throw signupError;

    // 2️⃣ Update role in users table
    await supabase
      .from('users')
      .update({ role: role || 'employee' })
      .eq('id', data.user.id);

    const appToken = generateAppToken({
      id: data.user.id,
      email,
      role: role || 'employee',
      name,
    });

    res.status(201).json({
      message: 'User registered successfully',
      token: appToken,
      user: {
        uid: data.user.id, // Fix: Ensure 'id' property exists
        email,
        name,
        role,
      },
    });
  } catch (error: any) {
    console.error('Supabase Register Error:', error);
    res.status(500).json({ error: error.message || 'Server error' });
  }
};

// 🔐 Login (Email + Password)
export const supabaseLogin = async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;

    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error || !data?.user)
      return res.status(401).json({ error: error?.message || 'Invalid credentials' });

    const user = data.user;

    // Fetch role from users table
    const { data: userData } = await supabase
      .from('users')
      .select('role')
      .eq('id', user.id)
      .single();

    const appToken = generateAppToken({
      id: user.id,
      email: user.email ?? 'unknown',
      role: userData?.role || user.user_metadata?.role || 'employee',
    });

    res.json({
      message: 'Login successful',
      token: appToken,
      user: {
        id: user.id,
        email: user.email,
        role: userData?.role || user.user_metadata?.role || 'employee',
      },
    });
  } catch (error: any) {
    console.error('Supabase Login Error:', error);
    res.status(500).json({ error: error.message || 'Server error' });
  }
};

// 🧠 Google Login
export const supabaseGoogleLogin = async (req: Request, res: Response) => {
  try {
    const { provider_token } = req.body;

    const { data, error } = await supabase.auth.signInWithIdToken({
      provider: 'google',
      token: provider_token,
    });

    if (error || !data?.user)
      return res.status(400).json({ error: error?.message || 'Google login failed' });

    const user = data.user;

    // Fetch role from users table
    const { data: userData } = await supabase
      .from('users')
      .select('role')
      .eq('id', user.id)
      .single();

    const appToken = generateAppToken({
      id: user.id,
      email: user.email ?? 'unknown',
      role: userData?.role || user.user_metadata?.role || 'employee',
    });

    res.json({
      message: 'Google login successful',
      token: appToken,
      user: {
        id: user.id,
        email: user.email,
        role: userData?.role || user.user_metadata?.role || 'employee',
      },
    });
  } catch (error: any) {
    console.error('Google Login Error:', error);
    res.status(500).json({ error: error.message || 'Server error' });
  }
};

// 👤 Get Current User Profile (AuthRequest, Response)
export const getMyProfile = async (req: AuthRequest, res: Response) => {
  const authId = req.user?.id;
  if (!authId) {
    return res.status(401).json({ message: 'Authentication required.' });
  }

  try {
    const { data: employee, error } = await supabase
      .from('employees') // Make sure this table exists
      .select('id, name, email, role')
      .eq('uid', authId)
      .single();

    if (error || !employee) {
      console.error('No employee profile found for auth ID:', authId, error);
      return res.status(404).json({ message: 'Employee profile not found.' });
    }

    res.status(200).json(employee);
  } catch (error: any) {
    console.error('Error fetching user profile:', error.message);
    res.status(500).json({
      message: 'Error fetching user profile',
      error: error.message,
    });
  }
};
