<<<<<<< HEAD
import express, { Response } from 'express';
import { body, validationResult } from 'express-validator';
import { supabase, supabaseAdmin } from '../config/supabase';
import { verifySupabaseToken, authorize, AuthRequest } from '../middleware/auth';

const router = express.Router();

// GET ALL EMPLOYEES
router.get(
  '/',
  verifySupabaseToken,
  authorize(['admin', 'hr']),
  async (req: AuthRequest, res: Response) => {
    try {
      const { data, error } = await supabase
        .from('employees')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      res.json(data);
    } catch (error: any) {
      console.error('Error fetching employees:', error);
      res.status(500).json({ error: error.message || 'Failed to fetch employees' });
    }
  }
);

// GET SINGLE EMPLOYEE
router.get('/:id', verifySupabaseToken, async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { data, error } = await supabase
      .from('employees')
      .select('*')
      .eq('id', id)
      .single();

    if (error) throw error;

    // Only admin/HR or the employee themselves
    if (
      req.user!.role !== 'admin' &&
      req.user!.role !== 'hr' &&
      req.user!.id !== data.uid
    ) {
      return res.status(403).json({ error: 'Access denied' });
    }

    res.json(data);
  } catch (error: any) {
    console.error('Error fetching employee:', error);
    res.status(500).json({ error: error.message || 'Failed to fetch employee' });
  }
});

// CREATE EMPLOYEE
router.post(
  '/',
  verifySupabaseToken,
  authorize(['admin', 'hr']),
  [
    body('name').trim().notEmpty(),
    body('email').isEmail().normalizeEmail(),
    body('department').trim().notEmpty(),
    body('position').trim().notEmpty(),
    body('role').trim().notEmpty(),
  ],
  async (req: AuthRequest, res: Response) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

      const { name, email, department, position, role, location, status } = req.body;
      const creatorRole = req.user!.role;

      // HR cannot create admin
      if (creatorRole === 'hr' && role === 'admin') {
        return res.status(403).json({ error: 'HR cannot create admin accounts.' });
      }

      const tempPassword = `${department}@123`;

      // Create Supabase Auth user using service_role key
      const { data: userData, error: authError } = await supabaseAdmin.auth.admin.createUser({
        email,
        password: tempPassword,
        email_confirm: true,
        user_metadata: { role },
      });

      if (authError) throw authError;
      if (!userData.user || !userData.user.id) {
        throw new Error('Failed to create Supabase user.');
      }

      // Insert into employees table using uid
      const { data: employeeData, error } = await supabase
        .from('employees')
        .insert([
          {
            uid: userData.user.id, // <-- store in uid column
            name,
            email,
            department,
            position,
            role,
            location: location || null,
            status: status || 'pending',
            created_at: new Date(),
          },
        ])
        .select()
        .single();

      if (error) throw error;

      res.status(201).json({ message: 'Employee created successfully', employee: employeeData });
    } catch (error: any) {
      console.error('Error creating employee:', error);
      res.status(500).json({ error: error.message || 'Failed to create employee' });
    }
  }
);

// UPDATE EMPLOYEE
router.put(
  '/:id',
  verifySupabaseToken,
  authorize(['admin', 'hr']),
  async (req: AuthRequest, res: Response) => {
    try {
      const { id } = req.params;
      const { name, email, department, position, role, status, location } = req.body;

      const { data: employee, error } = await supabase
        .from('employees')
        .select('*')
        .eq('id', id)
        .single();
      if (error) throw error;

      // HR cannot update admin
      if (req.user!.role === 'hr' && employee.role === 'admin') {
        return res.status(403).json({ error: 'HR cannot modify admin accounts.' });
      }

      // Update role in Supabase Auth if role changes
      if (role && role !== employee.role) {
        await supabaseAdmin.auth.admin.updateUserById(employee.uid, {
          user_metadata: { role },
        });
      }

      const { data: updatedEmployee, error: updateError } = await supabase
        .from('employees')
        .update({ name, email, department, position, role, status, location, updated_at: new Date() })
        .eq('id', id)
        .select()
        .single();

      if (updateError) throw updateError;
      res.json({ message: 'Employee updated successfully', employee: updatedEmployee });
    } catch (error: any) {
      console.error('Error updating employee:', error);
      res.status(500).json({ error: error.message || 'Failed to update employee' });
    }
  }
);

// DELETE EMPLOYEE
router.delete(
  '/:id',
  verifySupabaseToken,
  authorize(['admin']),
  async (req: AuthRequest, res: Response) => {
    try {
      const { id } = req.params;

      const { data: employee, error } = await supabase
        .from('employees')
        .select('*')
        .eq('id', id)
        .single();
      if (error) throw error;

      if (req.user!.id === employee.uid) {
        return res.status(403).json({ error: 'You cannot delete your own account.' });
      }

      // Delete Supabase Auth user using service_role key
      await supabaseAdmin.auth.admin.deleteUser(employee.uid);

      // Delete from employees table
      await supabase.from('employees').delete().eq('id', id);

      res.json({ message: 'Employee deleted successfully' });
    } catch (error: any) {
      console.error('Error deleting employee:', error);
      res.status(500).json({ error: error.message || 'Failed to delete employee' });
    }
  }
);

export default router;
=======
import express, { Response } from 'express';
import { body, validationResult } from 'express-validator';
import { supabase, supabaseAdmin } from '../config/supabase';
import { verifySupabaseToken, authorize, AuthRequest } from '../middleware/auth';

const router = express.Router();

// GET ALL EMPLOYEES
router.get(
  '/',
  verifySupabaseToken,
  authorize(['admin', 'hr']),
  async (req: AuthRequest, res: Response) => {
    try {
      const { data, error } = await supabase
        .from('employees')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      res.json(data);
    } catch (error: any) {
      console.error('Error fetching employees:', error);
      res.status(500).json({ error: error.message || 'Failed to fetch employees' });
    }
  }
);

// GET SINGLE EMPLOYEE
router.get('/:id', verifySupabaseToken, async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { data, error } = await supabase
      .from('employees')
      .select('*')
      .eq('id', id)
      .single();

    if (error) throw error;

    // Only admin/HR or the employee themselves
    if (
      req.user!.role !== 'admin' &&
      req.user!.role !== 'hr' &&
      req.user!.id !== data.uid
    ) {
      return res.status(403).json({ error: 'Access denied' });
    }

    res.json(data);
  } catch (error: any) {
    console.error('Error fetching employee:', error);
    res.status(500).json({ error: error.message || 'Failed to fetch employee' });
  }
});

// CREATE EMPLOYEE
router.post(
  '/',
  verifySupabaseToken,
  authorize(['admin', 'hr']),
  [
    body('name').trim().notEmpty(),
    body('email').isEmail().normalizeEmail(),
    body('department').trim().notEmpty(),
    body('position').trim().notEmpty(),
    body('role').trim().notEmpty(),
  ],
  async (req: AuthRequest, res: Response) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

      const { name, email, department, position, role, location, status } = req.body;
      const creatorRole = req.user!.role;

      // HR cannot create admin
      if (creatorRole === 'hr' && role === 'admin') {
        return res.status(403).json({ error: 'HR cannot create admin accounts.' });
      }

      const tempPassword = `${department}@123`;

      // Create Supabase Auth user using service_role key
      const { data: userData, error: authError } = await supabaseAdmin.auth.admin.createUser({
        email,
        password: tempPassword,
        email_confirm: true,
        user_metadata: { role },
      });

      if (authError) throw authError;
      if (!userData.user || !userData.user.id) {
        throw new Error('Failed to create Supabase user.');
      }

      // Insert into employees table using uid
      const { data: employeeData, error } = await supabase
        .from('employees')
        .insert([
          {
            uid: userData.user.id, // <-- store in uid column
            name,
            email,
            department,
            position,
            role,
            location: location || null,
            status: status || 'pending',
            created_at: new Date(),
          },
        ])
        .select()
        .single();

      if (error) throw error;

      res.status(201).json({ message: 'Employee created successfully', employee: employeeData });
    } catch (error: any) {
      console.error('Error creating employee:', error);
      res.status(500).json({ error: error.message || 'Failed to create employee' });
    }
  }
);

// UPDATE EMPLOYEE
router.put(
  '/:id',
  verifySupabaseToken,
  authorize(['admin', 'hr']),
  async (req: AuthRequest, res: Response) => {
    try {
      const { id } = req.params;
      const { name, email, department, position, role, status, location } = req.body;

      const { data: employee, error } = await supabase
        .from('employees')
        .select('*')
        .eq('id', id)
        .single();
      if (error) throw error;

      // HR cannot update admin
      if (req.user!.role === 'hr' && employee.role === 'admin') {
        return res.status(403).json({ error: 'HR cannot modify admin accounts.' });
      }

      // Update role in Supabase Auth if role changes
      if (role && role !== employee.role) {
        await supabaseAdmin.auth.admin.updateUserById(employee.uid, {
          user_metadata: { role },
        });
      }

      const { data: updatedEmployee, error: updateError } = await supabase
        .from('employees')
        .update({ name, email, department, position, role, status, location, updated_at: new Date() })
        .eq('id', id)
        .select()
        .single();

      if (updateError) throw updateError;
      res.json({ message: 'Employee updated successfully', employee: updatedEmployee });
    } catch (error: any) {
      console.error('Error updating employee:', error);
      res.status(500).json({ error: error.message || 'Failed to update employee' });
    }
  }
);

// DELETE EMPLOYEE
router.delete(
  '/:id',
  verifySupabaseToken,
  authorize(['admin']),
  async (req: AuthRequest, res: Response) => {
    try {
      const { id } = req.params;

      const { data: employee, error } = await supabase
        .from('employees')
        .select('*')
        .eq('id', id)
        .single();
      if (error) throw error;

      if (req.user!.id === employee.uid) {
        return res.status(403).json({ error: 'You cannot delete your own account.' });
      }

      // Delete Supabase Auth user using service_role key
      await supabaseAdmin.auth.admin.deleteUser(employee.uid);

      // Delete from employees table
      await supabase.from('employees').delete().eq('id', id);

      res.json({ message: 'Employee deleted successfully' });
    } catch (error: any) {
      console.error('Error deleting employee:', error);
      res.status(500).json({ error: error.message || 'Failed to delete employee' });
    }
  }
);

export default router;
>>>>>>> 225ed5384cf9eebf7cee947b068a57b523c6c838
