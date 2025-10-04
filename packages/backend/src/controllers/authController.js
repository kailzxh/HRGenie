const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { validationResult } = require('express-validator');
const db = require('../config/db');
const googleAuth = require('../config/googleAuth');

const generateToken = (user) => {
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

const login = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { email, password } = req.body;

    const result = await db.query(
      'SELECT * FROM employees WHERE email = $1',
      [email]
    );

    const user = result.rows[0];
    if (!user) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const isValidPassword = await bcrypt.compare(password, user.password);
    if (!isValidPassword) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const token = generateToken(user);
    res.json({ token, user: { 
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role
    }});
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

const googleLogin = async (req, res) => {
  try {
    const { token } = req.body;
    const ticket = await googleAuth.verifyIdToken({
      idToken: token,
      audience: process.env.GOOGLE_CLIENT_ID
    });

    const { email, name, picture } = ticket.getPayload();

    // Check if user exists
    let result = await db.query(
      'SELECT * FROM employees WHERE email = $1',
      [email]
    );

    let user = result.rows[0];

    // If user doesn't exist, create new user
    if (!user) {
      result = await db.query(
        'INSERT INTO employees (name, email, role, avatar) VALUES ($1, $2, $3, $4) RETURNING *',
        [name, email, 'employee', picture]
      );
      user = result.rows[0];
    }

    const jwtToken = generateToken(user);
    res.json({ token: jwtToken, user: {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      avatar: user.avatar
    }});
  } catch (error) {
    console.error('Google login error:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

const register = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { name, email, password, role } = req.body;

    // Check if user already exists
    const userExists = await db.query(
      'SELECT * FROM employees WHERE email = $1',
      [email]
    );

    if (userExists.rows.length > 0) {
      return res.status(400).json({ error: 'User already exists' });
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Create user
    const result = await db.query(
      'INSERT INTO employees (name, email, password, role) VALUES ($1, $2, $3, $4) RETURNING *',
      [name, email, hashedPassword, role]
    );

    const user = result.rows[0];
    const token = generateToken(user);

    res.status(201).json({ token, user: {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role
    }});
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

module.exports = {
  login,
  googleLogin,
  register
};