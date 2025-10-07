const express = require('express');
const { body } = require('express-validator');
const {
  supabaseRegister,
  supabaseLogin,
  supabaseGoogleLogin,
} = require('../controllers/authControllerSupabase');

const router = express.Router();

/**
 * @route POST /api/auth/register
 * @desc Register a new user (Supabase)
 */
router.post(
  '/register',
  [
    body('email').isEmail().normalizeEmail(),
    body('password').isLength({ min: 6 }),
    body('name').trim().notEmpty(),
    body('role').isIn(['admin', 'hr', 'manager', 'employee']),
  ],
  supabaseRegister
);

/**
 * @route POST /api/auth/login
 * @desc Log in a user (Supabase)
 */
router.post(
  '/login',
  [
    body('email').isEmail().normalizeEmail(),
    body('password').isLength({ min: 6 }),
  ],
  supabaseLogin
);

/**
 * @route POST /api/auth/google
 * @desc Log in via Google OAuth (Supabase)
 */
router.post('/google', supabaseGoogleLogin);

module.exports = router;
