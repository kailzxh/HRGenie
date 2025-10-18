import express, { Request, Response, NextFunction } from 'express';
import { body } from 'express-validator';
import {
  supabaseRegister,
  supabaseLogin,
  supabaseGoogleLogin,
  getMyProfile,
} from '../controllers/authController'; // Corrected import path
import { verifySupabaseToken } from '../middleware/auth';
import { AuthenticatedRequest } from '../types/express';

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
    body('role').optional().isIn(['admin', 'hr', 'manager', 'employee']),
  ],
  (req: Request, res: Response, next: NextFunction) =>
    supabaseRegister(req, res).catch(next)
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
  (req: Request, res: Response, next: NextFunction) =>
    supabaseLogin(req, res).catch(next)
);

/**
 * @route POST /api/auth/google
 * @desc Log in via Google OAuth (Supabase)
 */
router.post(
  '/google',
  (req: Request, res: Response, next: NextFunction) =>
    supabaseGoogleLogin(req, res).catch(next)
);

/**
 * @route GET /api/auth/me
 * @desc Get the profile of the currently logged-in user
 */
router.get(
  '/me',
  verifySupabaseToken,
  (req: Request, res: Response, next: NextFunction) => // Changed type to Request
    getMyProfile(req, res).catch(next)
);

export default router;
