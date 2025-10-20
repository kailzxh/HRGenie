const { validationResult } = require('express-validator');
const db = require('../config/db');

const getEmployees = async (req, res) => {
  try {
    const { department, location, status } = req.query;
    let query = 'SELECT id, name, email, department, position, location, join_date, status, avatar FROM employees';
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
    if (req.user.role !== 'admin' && req.user.role !== 'hr' && req.user.id !== parseInt(id)) {
      return res.status(403).json({ error: 'Access denied' });
    }

    const result = await db.query(
      'SELECT id, name, email, department, position, location, join_date, status, avatar FROM employees WHERE id = $1',
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
      status = 'active'
    } = req.body;

    const result = await db.query(
      `INSERT INTO employees (
        name, email, department, position, location, status, join_date
      ) VALUES ($1, $2, $3, $4, $5, $6, CURRENT_DATE) RETURNING *`,
      [name, email, department, position, location, status]
    );

    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error('Error creating employee:', error);
    if (error.code === '23505') { // unique_violation
      return res.status(400).json({ error: 'Email already exists' });
    }
    res.status(500).json({ error: 'Server error' });
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
      status
    } = req.body;

    // Users can only update their own profile unless they are HR or Admin
    if (req.user.role !== 'admin' && req.user.role !== 'hr' && req.user.id !== parseInt(id)) {
      return res.status(403).json({ error: 'Access denied' });
    }

    // Build update query dynamically based on provided fields
    const updates = [];
    const values = [];
    let paramCount = 1;

    if (name) {
      updates.push(`name = $${paramCount}`);
      values.push(name);
      paramCount++;
    }
    if (email) {
      updates.push(`email = $${paramCount}`);
      values.push(email);
      paramCount++;
    }
    if (department) {
      updates.push(`department = $${paramCount}`);
      values.push(department);
      paramCount++;
    }
    if (position) {
      updates.push(`position = $${paramCount}`);
      values.push(position);
      paramCount++;
    }
    if (location) {
      updates.push(`location = $${paramCount}`);
      values.push(location);
      paramCount++;
    }
    if (status) {
      updates.push(`status = $${paramCount}`);
      values.push(status);
      paramCount++;
    }

    values.push(id);
    const query = `
      UPDATE employees 
      SET ${updates.join(', ')}, 
          updated_at = CURRENT_TIMESTAMP 
      WHERE id = $${paramCount} 
      RETURNING *
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
      'SELECT * FROM employees WHERE email = $1',
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

    const result = await db.query(
      'DELETE FROM employees WHERE id = $1 RETURNING *',
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Employee not found' });
    }

    res.json({ message: 'Employee deleted successfully' });
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