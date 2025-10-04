const express = require('express');
const { body } = require('express-validator');
const { login, googleLogin, register } = require('../controllers/authController');

const router = express.Router();

router.post('/login', [
  body('email').isEmail().normalizeEmail(),
  body('password').isLength({ min: 6 })
], login);

router.post('/google', googleLogin);

router.post('/register', [
  body('email').isEmail().normalizeEmail(),
  body('password').isLength({ min: 6 }),
  body('name').trim().notEmpty(),
  body('role').isIn(['admin', 'hr', 'manager', 'employee'])
], register);

module.exports = router;