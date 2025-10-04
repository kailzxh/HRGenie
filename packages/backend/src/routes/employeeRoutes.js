const express = require('express');
const { body } = require('express-validator');
const { auth, checkRole } = require('../middleware/auth');
const {
  getEmployees,
  getEmployee,
  createEmployee,
  updateEmployee,
  deleteEmployee
} = require('../controllers/employeeController');

const router = express.Router();

// Get all employees (HR and Admin only)
router.get('/', auth, checkRole(['admin', 'hr']), getEmployees);

// Get specific employee (Self or HR/Admin)
router.get('/:id', auth, getEmployee);

// Create new employee (HR and Admin only)
router.post('/', [
  auth,
  checkRole(['admin', 'hr']),
  body('name').trim().notEmpty(),
  body('email').isEmail().normalizeEmail(),
  body('department').trim().notEmpty(),
  body('position').trim().notEmpty(),
  body('location').trim().notEmpty()
], createEmployee);

// Update employee (Self or HR/Admin)
router.put('/:id', [
  auth,
  body('name').optional().trim().notEmpty(),
  body('email').optional().isEmail().normalizeEmail(),
  body('department').optional().trim().notEmpty(),
  body('position').optional().trim().notEmpty(),
  body('location').optional().trim().notEmpty()
], updateEmployee);

// Delete employee (Admin only)
router.delete('/:id', auth, checkRole(['admin']), deleteEmployee);

module.exports = router;