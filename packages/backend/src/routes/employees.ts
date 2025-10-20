import express, { Response } from 'express';
import { body, validationResult } from 'express-validator';
import { supabase, supabaseAdmin } from '../config/supabase';
import { verifySupabaseToken, authorize, AuthRequest } from '../middleware/auth';

const router = express.Router();

// GET ALL EMPLOYEES
router.get(
  '/',
  verifySupabaseToken,
  async (req: AuthRequest, res: Response) => {
    try {
      const userRole = req.user!.role;
      const userEmail = req.user!.email;

      let query = supabase
        .from('employees')
        .select('*')
        .order('created_at', { ascending: false });

      // Apply role-based filtering
      if (userRole === 'manager') {
        // First, get the manager's employee record
        const { data: managerEmployee, error: managerError } = await supabase
          .from('employees')
          .select('id')
          .eq('email', userEmail)
          .single();

        if (managerError || !managerEmployee) {
          return res.status(403).json({ error: 'Manager employee record not found' });
        }

        // Managers can only see employees under their management
        query = query.eq('manager_id', managerEmployee.id);
      } else if (userRole === 'employee') {
        // Employees can only see themselves
        const { data: employeeData, error: employeeError } = await supabase
          .from('employees')
          .select('id')
          .eq('email', userEmail)
          .single();

        if (employeeError || !employeeData) {
          return res.status(403).json({ error: 'Employee record not found' });
        }

        query = query.eq('id', employeeData.id);
      }
      // Admin and HR can see all employees (no additional filtering)

      const { data, error } = await query;

      if (error) throw error;
      res.json(data);
    } catch (error: any) {
      console.error('Error fetching employees:', error);
      res.status(500).json({ error: error.message || 'Failed to fetch employees' });
    }
  }
);

// GET EMPLOYEE BY EMAIL
router.get('/email/:email', verifySupabaseToken, async (req: AuthRequest, res: Response) => {
  try {
    const { email } = req.params;
    const userRole = req.user!.role;
    const userEmail = req.user!.email;

    // Users can only access their own email unless admin/hr
    if (userRole !== 'admin' && userRole !== 'hr' && email !== userEmail) {
      return res.status(403).json({ error: 'Access denied' });
    }

    const { data, error } = await supabase
      .from('employees')
      .select('*')
      .eq('email', email)
      .single();

    if (error) throw error;
    res.json(data);
  } catch (error: any) {
    console.error('Error fetching employee by email:', error);
    res.status(500).json({ error: error.message || 'Failed to fetch employee' });
  }
});

// GET SINGLE EMPLOYEE
router.get('/:id', verifySupabaseToken, async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const userRole = req.user!.role;
    const userEmail = req.user!.email;

    const { data, error } = await supabase
      .from('employees')
      .select('*')
      .eq('id', id)
      .single();

    if (error) throw error;

    // Role-based access control
    if (userRole === 'employee') {
      // Employees can only see themselves
      const { data: employeeData } = await supabase
        .from('employees')
        .select('id')
        .eq('email', userEmail)
        .single();

      if (employeeData?.id !== id) {
        return res.status(403).json({ error: 'Access denied' });
      }
    } else if (userRole === 'manager') {
      // Managers can only see employees under their management
      const { data: managerEmployee } = await supabase
        .from('employees')
        .select('id')
        .eq('email', userEmail)
        .single();

      if (data.manager_id !== managerEmployee?.id) {
        return res.status(403).json({ error: 'Access denied' });
      }
    }
    // Admin and HR can see any employee

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

      const { name, email, department, position, role, location, status, manager_id } = req.body;
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
            manager_id: manager_id || null,
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
  async (req: AuthRequest, res: Response) => {
    try {
      const { id } = req.params;
      const { name, email, department, position, role, status, location, manager_id } = req.body;
      const userRole = req.user!.role;
      const userEmail = req.user!.email;

      // Get the employee to update
      const { data: employee, error } = await supabase
        .from('employees')
        .select('*')
        .eq('id', id)
        .single();
      if (error) throw error;

      // Role-based access control for updates
      if (userRole === 'employee') {
        // Employees can only update themselves
        const { data: currentUserEmployee } = await supabase
          .from('employees')
          .select('id')
          .eq('email', userEmail)
          .single();

        if (currentUserEmployee?.id !== id) {
          return res.status(403).json({ error: 'Access denied' });
        }

        // Employees can only update certain fields
        const allowedFields = ['name', 'phone'];
        const updateData: any = {};
        allowedFields.forEach(field => {
          if (req.body[field] !== undefined) updateData[field] = req.body[field];
        });
        updateData.updated_at = new Date();

        const { data: updatedEmployee, error: updateError } = await supabase
          .from('employees')
          .update(updateData)
          .eq('id', id)
          .select()
          .single();

        if (updateError) throw updateError;
        return res.json({ message: 'Employee updated successfully', employee: updatedEmployee });

      } else if (userRole === 'manager') {
        // Managers can only update employees under their management
        const { data: managerEmployee } = await supabase
          .from('employees')
          .select('id')
          .eq('email', userEmail)
          .single();

        if (employee.manager_id !== managerEmployee?.id) {
          return res.status(403).json({ error: 'Access denied' });
        }

        // Managers can update limited fields for their team
        const allowedFields = ['name', 'department', 'position', 'location', 'status'];
        const updateData: any = {};
        allowedFields.forEach(field => {
          if (req.body[field] !== undefined) updateData[field] = req.body[field];
        });
        updateData.updated_at = new Date();

        const { data: updatedEmployee, error: updateError } = await supabase
          .from('employees')
          .update(updateData)
          .eq('id', id)
          .select()
          .single();

        if (updateError) throw updateError;
        return res.json({ message: 'Employee updated successfully', employee: updatedEmployee });

      } else if (userRole === 'hr') {
        // HR cannot update admin
        if (employee.role === 'admin') {
          return res.status(403).json({ error: 'HR cannot modify admin accounts.' });
        }

        // HR can update most fields except role to admin
        const updateData: any = { 
          name, email, department, position, location, status, manager_id,
          updated_at: new Date() 
        };
        
        if (role && role !== 'admin') {
          updateData.role = role;
        }

        const { data: updatedEmployee, error: updateError } = await supabase
          .from('employees')
          .update(updateData)
          .eq('id', id)
          .select()
          .single();

        if (updateError) throw updateError;

        // Update role in Supabase Auth if role changes
        if (role && role !== employee.role) {
          await supabaseAdmin.auth.admin.updateUserById(employee.uid, {
            user_metadata: { role },
          });
        }

        return res.json({ message: 'Employee updated successfully', employee: updatedEmployee });
      } else if (userRole === 'admin') {
        // Admin can update everything
        const updateData = { 
          name, email, department, position, role, status, location, manager_id,
          updated_at: new Date() 
        };

        const { data: updatedEmployee, error: updateError } = await supabase
          .from('employees')
          .update(updateData)
          .eq('id', id)
          .select()
          .single();

        if (updateError) throw updateError;

        // Update role in Supabase Auth if role changes
        if (role && role !== employee.role) {
          await supabaseAdmin.auth.admin.updateUserById(employee.uid, {
            user_metadata: { role },
          });
        }

        return res.json({ message: 'Employee updated successfully', employee: updatedEmployee });
      }

      res.status(403).json({ error: 'Access denied' });
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
  async (req: AuthRequest, res: Response) => {
    try {
      const { id } = req.params;
      const userRole = req.user!.role;

      const { data: employee, error } = await supabase
        .from('employees')
        .select('*')
        .eq('id', id)
        .single();
      if (error) throw error;

      // Only admin can delete employees
      if (userRole !== 'admin') {
        return res.status(403).json({ error: 'Access denied' });
      }

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