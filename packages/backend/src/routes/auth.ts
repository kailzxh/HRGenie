<<<<<<< HEAD
import { Router, Request, Response, NextFunction } from 'express';
import { createClient } from '@supabase/supabase-js';

const router = Router();

// Initialize Supabase client
const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_KEY! // Service key is required for admin actions
);

// Custom request type with user info
interface AuthRequest extends Request {
  user?: any;
}

// 🔹 Middleware to verify Supabase token
const verifyToken = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader?.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const token = authHeader.split('Bearer ')[1];

    // Verify Supabase token
    const {
      data: { user },
      error,
    } = await supabase.auth.getUser(token);

    if (error || !user) {
      return res.status(401).json({ error: 'Invalid or expired token' });
    }

    req.user = user;
    next();
  } catch (err) {
    res.status(401).json({ error: 'Invalid token' });
  }
};

// 🔹 Sign In — handled by Supabase client SDK (frontend)
// Just verify token and return profile
router.post('/signin', async (req: Request, res: Response) => {
  try {
    const { access_token } = req.body;

    if (!access_token) {
      return res.status(400).json({ error: 'Access token is required' });
    }

    const {
      data: { user },
      error,
    } = await supabase.auth.getUser(access_token);

    if (error || !user) {
      return res.status(401).json({ error: 'Invalid Supabase token' });
    }

    // Fetch profile info
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .single();

    if (profileError && profileError.code !== 'PGRST116') {
      throw profileError;
    }

    // Create profile if missing
    let finalProfile = profile;
    if (!profile) {
      const { data: newProfile, error: insertError } = await supabase
        .from('profiles')
        .insert([
          {
            id: user.id,
            email: user.email,
            name: user.user_metadata?.name || user.email?.split('@')[0],
            role: 'employee',
            created_at: new Date(),
          },
        ])
        .select()
        .single();

      if (insertError) throw insertError;
      finalProfile = newProfile;
    }

    return res.status(200).json({ user: { ...user, ...finalProfile } });
  } catch (error) {
    console.error('Sign-in error:', error);
    res.status(500).json({ error: 'Failed to sign in' });
  }
});

// 🔹 Reset Password
router.post('/reset-password', async (req: Request, res: Response) => {
  try {
    const { email } = req.body;
    if (!email) return res.status(400).json({ error: 'Email is required' });

    // Supabase reset password flow
    const { data, error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: 'http://localhost:3000/login',
    });

    if (error) throw error;

    res.status(200).json({ message: 'Password reset email sent successfully' });
  } catch (error: any) {
    console.error('Password reset error:', error);
    res.status(500).json({ error: error.message || 'Failed to send reset email' });
  }
});

// 🔹 Get user
router.get('/user', verifyToken, async (req: AuthRequest, res: Response) => {
  try {
    const user = req.user;
    const { data: profile, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .single();

    if (error && error.code !== 'PGRST116') throw error;

    if (!profile) {
      return res.status(404).json({ error: 'User profile not found' });
    }

    res.json(profile);
  } catch (error) {
    console.error('Fetch user error:', error);
    res.status(500).json({ error: 'Failed to fetch user' });
  }
});

// 🔹 Update user
router.put('/user', verifyToken, async (req: AuthRequest, res: Response) => {
  try {
    const user = req.user;
    const updates = req.body;

    delete updates.id;
    delete updates.role;

    const { error } = await supabase
      .from('profiles')
      .update(updates)
      .eq('id', user.id);

    if (error) throw error;

    res.json({ message: 'User updated successfully' });
  } catch (error) {
    console.error('Update user error:', error);
    res.status(500).json({ error: 'Failed to update user' });
  }
});

// 🔹 Admin — Create new user
router.post('/users', verifyToken, async (req: AuthRequest, res: Response) => {
  try {
    const requester = req.user;

    // Check role
    const { data: requesterProfile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', requester.id)
      .single();

    if (requesterProfile?.role !== 'admin') {
      return res.status(403).json({ error: 'Admin access required' });
    }

    const { email, password, name, role, department, position } = req.body;

    // Create user in Supabase Auth
    const { data: newUser, error: createError } = await supabase.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: { name },
    });

    if (createError) throw createError;

    // Insert profile
    const { error: insertError } = await supabase.from('profiles').insert([
      {
        id: newUser.user.id,
        email,
        name,
        role: role || 'employee',
        department,
        position,
        created_at: new Date(),
      },
    ]);

    if (insertError) throw insertError;

    res.status(201).json({
      message: 'User created successfully',
      user: newUser.user,
    });
  } catch (error: any) {
    console.error('Admin create user error:', error);
    res.status(400).json({ error: error.message || 'Failed to create user' });
  }
});

export default router;
=======
import { Router, Request, Response, NextFunction } from 'express';
import { createClient } from '@supabase/supabase-js';

const router = Router();

// Initialize Supabase client
const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_KEY! // Service key is required for admin actions
);

// Custom request type with user info
interface AuthRequest extends Request {
  user?: any;
}

// 🔹 Middleware to verify Supabase token
const verifyToken = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader?.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const token = authHeader.split('Bearer ')[1];

    // Verify Supabase token
    const {
      data: { user },
      error,
    } = await supabase.auth.getUser(token);

    if (error || !user) {
      return res.status(401).json({ error: 'Invalid or expired token' });
    }

    req.user = user;
    next();
  } catch (err) {
    res.status(401).json({ error: 'Invalid token' });
  }
};

// 🔹 Sign In — handled by Supabase client SDK (frontend)
// Just verify token and return profile
router.post('/signin', async (req: Request, res: Response) => {
  try {
    const { access_token } = req.body;

    if (!access_token) {
      return res.status(400).json({ error: 'Access token is required' });
    }

    const {
      data: { user },
      error,
    } = await supabase.auth.getUser(access_token);

    if (error || !user) {
      return res.status(401).json({ error: 'Invalid Supabase token' });
    }

    // Fetch profile info
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .single();

    if (profileError && profileError.code !== 'PGRST116') {
      throw profileError;
    }

    // Create profile if missing
    let finalProfile = profile;
    if (!profile) {
      const { data: newProfile, error: insertError } = await supabase
        .from('profiles')
        .insert([
          {
            id: user.id,
            email: user.email,
            name: user.user_metadata?.name || user.email?.split('@')[0],
            role: 'employee',
            created_at: new Date(),
          },
        ])
        .select()
        .single();

      if (insertError) throw insertError;
      finalProfile = newProfile;
    }

    return res.status(200).json({ user: { ...user, ...finalProfile } });
  } catch (error) {
    console.error('Sign-in error:', error);
    res.status(500).json({ error: 'Failed to sign in' });
  }
});

// 🔹 Reset Password
router.post('/reset-password', async (req: Request, res: Response) => {
  try {
    const { email } = req.body;
    if (!email) return res.status(400).json({ error: 'Email is required' });

    // Supabase reset password flow
    const { data, error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: 'http://localhost:3000/login',
    });

    if (error) throw error;

    res.status(200).json({ message: 'Password reset email sent successfully' });
  } catch (error: any) {
    console.error('Password reset error:', error);
    res.status(500).json({ error: error.message || 'Failed to send reset email' });
  }
});

// 🔹 Get user
router.get('/user', verifyToken, async (req: AuthRequest, res: Response) => {
  try {
    const user = req.user;
    const { data: profile, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .single();

    if (error && error.code !== 'PGRST116') throw error;

    if (!profile) {
      return res.status(404).json({ error: 'User profile not found' });
    }

    res.json(profile);
  } catch (error) {
    console.error('Fetch user error:', error);
    res.status(500).json({ error: 'Failed to fetch user' });
  }
});

// 🔹 Update user
router.put('/user', verifyToken, async (req: AuthRequest, res: Response) => {
  try {
    const user = req.user;
    const updates = req.body;

    delete updates.id;
    delete updates.role;

    const { error } = await supabase
      .from('profiles')
      .update(updates)
      .eq('id', user.id);

    if (error) throw error;

    res.json({ message: 'User updated successfully' });
  } catch (error) {
    console.error('Update user error:', error);
    res.status(500).json({ error: 'Failed to update user' });
  }
});

// 🔹 Admin — Create new user
router.post('/users', verifyToken, async (req: AuthRequest, res: Response) => {
  try {
    const requester = req.user;

    // Check role
    const { data: requesterProfile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', requester.id)
      .single();

    if (requesterProfile?.role !== 'admin') {
      return res.status(403).json({ error: 'Admin access required' });
    }

    const { email, password, name, role, department, position } = req.body;

    // Create user in Supabase Auth
    const { data: newUser, error: createError } = await supabase.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: { name },
    });

    if (createError) throw createError;

    // Insert profile
    const { error: insertError } = await supabase.from('profiles').insert([
      {
        id: newUser.user.id,
        email,
        name,
        role: role || 'employee',
        department,
        position,
        created_at: new Date(),
      },
    ]);

    if (insertError) throw insertError;

    res.status(201).json({
      message: 'User created successfully',
      user: newUser.user,
    });
  } catch (error: any) {
    console.error('Admin create user error:', error);
    res.status(400).json({ error: error.message || 'Failed to create user' });
  }
});

export default router;
>>>>>>> 225ed5384cf9eebf7cee947b068a57b523c6c838
