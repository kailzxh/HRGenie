const { validationResult } = require('express-validator');
const db = require('../config/db');

const getEmployees = async (req, res) => {
  try {
    const { department, location, status } = req.query;
    let query = `SELECT 
      id, name, email, department, position, location, 
      joining_date, status, phone, role, manager_id,
      created_at, updated_at
    FROM employees`;
    const queryParams = [];
    
    // Build WHERE clause based on filters
    const conditions = [];
    if (department) {
      conditions.push(`department = $${queryParams.length + 1}`);
      queryParams.push(department);
    }
    if (location) {
      conditions.push(`location = $${queryParams.length + 1}`);
      queryParams.push(location);
    }
    if (status) {
      conditions.push(`status = $${queryParams.length + 1}`);
      queryParams.push(status);
    }

    if (conditions.length > 0) {
      query += ' WHERE ' + conditions.join(' AND ');
    }

    query += ' ORDER BY created_at DESC';

    const result = await db.query(query, queryParams);
    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching employees:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

const getEmployee = async (req, res) => {
  try {
    const { id } = req.params;
    
    // Users can only view their own profile unless they are HR or Admin
    if (req.user.role !== 'admin' && req.user.role !== 'hr' && req.user.id !== id) {
      return res.status(403).json({ error: 'Access denied' });
    }

    const result = await db.query(
      `SELECT 
        id, name, email, department, position, location, 
        joining_date, status, phone, role, manager_id,
        bank_account_number, bank_name, ifsc_code, pan_number, uan_number,
        payroll_active, created_at, updated_at
      FROM employees WHERE id = $1`,
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Employee not found' });
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error fetching employee:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

const createEmployee = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const {
      name,
      email,
      department,
      position,
      location,
      phone,
      role = 'employee',
      status = 'active',
      salary,
      manager_id,
      joining_date
    } = req.body;

    // Check if user has permission (admin or hr)
    if (req.user.role !== 'admin' && req.user.role !== 'hr') {
      return res.status(403).json({ error: 'Access denied. Only admin and HR can create employees.' });
    }

    const result = await db.query(
      `INSERT INTO employees (
        name, email, department, position, location, phone,
        role, status, salary, manager_id, joining_date
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11) 
      RETURNING id, name, email, department, position, location, phone, role, status, salary, manager_id, joining_date`,
      [name, email, department, position, location, phone, role, status, salary, manager_id, joining_date || new Date().toISOString().split('T')[0]]
    );

    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error('Error creating employee:', error);
    if (error.code === '23505') { // unique_violation
      return res.status(400).json({ error: 'Email already exists' });
    }
    res.status(500).json({ error: 'Server error: ' + error.message });
  }
};

const updateEmployee = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { id } = req.params;
    const {
      name,
      email,
      department,
      position,
      location,
      phone,
      status,
      salary,
      manager_id,
      bank_account_number,
      bank_name,
      ifsc_code,
      pan_number,
      uan_number,
      payroll_active
    } = req.body;

    // Users can only update their own profile unless they are HR or Admin
    if (req.user.role !== 'admin' && req.user.role !== 'hr' && req.user.id !== id) {
      return res.status(403).json({ error: 'Access denied' });
    }

    // Build update query dynamically based on provided fields
    const updates = [];
    const values = [];
    let paramCount = 1;

    if (name !== undefined) {
      updates.push(`name = $${paramCount}`);
      values.push(name);
      paramCount++;
    }
    if (email !== undefined) {
      updates.push(`email = $${paramCount}`);
      values.push(email);
      paramCount++;
    }
    if (department !== undefined) {
      updates.push(`department = $${paramCount}`);
      values.push(department);
      paramCount++;
    }
    if (position !== undefined) {
      updates.push(`position = $${paramCount}`);
      values.push(position);
      paramCount++;
    }
    if (location !== undefined) {
      updates.push(`location = $${paramCount}`);
      values.push(location);
      paramCount++;
    }
    if (phone !== undefined) {
      updates.push(`phone = $${paramCount}`);
      values.push(phone);
      paramCount++;
    }
    if (status !== undefined) {
      updates.push(`status = $${paramCount}`);
      values.push(status);
      paramCount++;
    }
    if (salary !== undefined) {
      updates.push(`salary = $${paramCount}`);
      values.push(salary);
      paramCount++;
    }
    if (manager_id !== undefined) {
      updates.push(`manager_id = $${paramCount}`);
      values.push(manager_id);
      paramCount++;
    }
    if (bank_account_number !== undefined) {
      updates.push(`bank_account_number = $${paramCount}`);
      values.push(bank_account_number);
      paramCount++;
    }
    if (bank_name !== undefined) {
      updates.push(`bank_name = $${paramCount}`);
      values.push(bank_name);
      paramCount++;
    }
    if (ifsc_code !== undefined) {
      updates.push(`ifsc_code = $${paramCount}`);
      values.push(ifsc_code);
      paramCount++;
    }
    if (pan_number !== undefined) {
      updates.push(`pan_number = $${paramCount}`);
      values.push(pan_number);
      paramCount++;
    }
    if (uan_number !== undefined) {
      updates.push(`uan_number = $${paramCount}`);
      values.push(uan_number);
      paramCount++;
    }
    if (payroll_active !== undefined) {
      updates.push(`payroll_active = $${paramCount}`);
      values.push(payroll_active);
      paramCount++;
    }

    if (updates.length === 0) {
      return res.status(400).json({ error: 'No fields to update' });
    }

    values.push(id);
    const query = `
      UPDATE employees 
      SET ${updates.join(', ')}, 
          updated_at = CURRENT_TIMESTAMP 
      WHERE id = $${paramCount} 
      RETURNING id, name, email, department, position, location, phone, role, status, salary, manager_id, joining_date, updated_at
    `;

    const result = await db.query(query, values);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Employee not found' });
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error updating employee:', error);
    if (error.code === '23505') { // unique_violation
      return res.status(400).json({ error: 'Email already exists' });
    }
    res.status(500).json({ error: 'Server error' });
  }
};

const getEmployeeByEmail = async (req, res) => {
  try {
    const { email } = req.params;
    
    const result = await db.query(
      `SELECT 
        id, name, email, department, position, location, 
        joining_date, status, phone, role, manager_id,
        created_at, updated_at
      FROM employees WHERE email = $1`,
      [email]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Employee not found' });
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error fetching employee by email:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

const deleteEmployee = async (req, res) => {
  try {
    const { id } = req.params;

    // Only admin and HR can delete employees
    if (req.user.role !== 'admin' && req.user.role !== 'hr') {
      return res.status(403).json({ error: 'Access denied' });
    }

    const result = await db.query(
      'DELETE FROM employees WHERE id = $1 RETURNING id, name, email',
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Employee not found' });
    }

    res.json({ message: 'Employee deleted successfully', deletedEmployee: result.rows[0] });
  } catch (error) {
    console.error('Error deleting employee:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

module.exports = {
  getEmployees,
  getEmployee,
  createEmployee,
  updateEmployee,
  deleteEmployee,
  getEmployeeByEmail
};