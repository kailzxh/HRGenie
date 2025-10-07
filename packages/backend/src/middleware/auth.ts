import { Request, Response, NextFunction } from 'express';
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

// Extract environment variables and validate
const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_KEY;

if (!SUPABASE_URL || !SUPABASE_SERVICE_KEY) {
  console.error('Supabase URL or SERVICE_KEY missing in environment variables!');
  process.exit(1);
}

// Create Supabase client
export const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

// Custom AuthRequest type
export interface AuthRequest extends Request {
  user?: {
    id: string;          // normalized from uid
    email: string;
    name?: string;
    role: string;
    created_at?: string;
  };
  authType?: 'supabase';
}

/**
 * 🔐 Middleware: Verify Supabase Auth Token and attach user
 */
export const verifySupabaseToken = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader?.startsWith('Bearer ')) {
      res.status(401).json({ error: 'No token provided' });
      return;
    }

    const token = authHeader.split('Bearer ')[1];

    // Get user from Supabase token
    const { data, error } = await supabase.auth.getUser(token);
    if (error || !data?.user) {
      console.error('Supabase token error:', error);
      res.status(401).json({ error: 'Invalid or expired Supabase token' });
      return;
    }

    const supabaseUser = data.user;

    // Fetch user profile
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', supabaseUser.id)
      .single();

    if (profileError && profileError.code !== 'PGRST116') {
      console.error('Profile fetch error:', profileError);
      res.status(500).json({ error: 'Error fetching user profile' });
      return;
    }

    let userProfile = profile;

    // Create profile if not exists
    if (!userProfile) {
      const { data: newProfile, error: insertError } = await supabase
        .from('profiles')
        .insert({
          id: supabaseUser.id,
          name:
            supabaseUser.user_metadata?.name ??
            (typeof supabaseUser.email === 'string'
              ? supabaseUser.email.split('@')[0]
              : 'unknown'),
          role: supabaseUser.user_metadata?.role ?? 'employee',
          created_at: new Date().toISOString(),
        })
        .select()
        .single();

      if (insertError) {
        console.error('Profile creation error:', insertError);
        res.status(500).json({ error: 'Could not create user profile' });
        return;
      }

      userProfile = newProfile;
    }

    // Attach normalized user to request
    req.user = {
      id: supabaseUser.id, // normalized
      email: supabaseUser.email ?? 'unknown',
      name: userProfile.name ?? 'Unnamed',
      role: userProfile.role ?? 'employee',
      created_at: userProfile.created_at ?? new Date().toISOString(),
    };

    req.authType = 'supabase';
    next();
  } catch (err) {
    console.error('Auth error:', err);
    res.status(401).json({ error: 'Authentication failed' });
  }
};

/**
 * 🧍 Role-Based Access Middleware
 */
export const authorize = (roles: string[]) => {
  return (req: AuthRequest, res: Response, next: NextFunction): void => {
    if (!req.user) {
      res.status(401).json({ error: 'Authentication required' });
      return;
    }

    const userRole = req.user.role ?? 'employee';
    if (!roles.includes(userRole)) {
      res.status(403).json({ error: 'Access denied: insufficient permissions' });
      return;
    }

    next();
  };
};

/**
 * 🧯 Error Handler Middleware
 */
export const errorHandler = (err: any, req: Request, res: Response, next: NextFunction): void => {
  console.error('Error:', err);

  if (err.name === 'ValidationError') {
    res.status(400).json({ error: err.message });
    return;
  }

  if (err.message?.includes('token')) {
    res.status(401).json({ error: 'Invalid or expired token' });
    return;
  }

  res.status(500).json({ error: 'Internal server error' });
};
