import express, { Request, Response, NextFunction } from 'express';
import { body } from 'express-validator';
import {
  getEmployeeView, // Corrected import
  getManagerView, // Corrected import
  getAdminView, // Corrected import
  clockIn,
  clockOut,
  submitRegularization,
  handleRegularizationAction,
} from '../controllers/attendanceController';
import { verifySupabaseToken, authorize } from '../middleware/auth';

const router = express.Router();

// --- Data Fetching Routes ---

// GET Employee View Data
router.get(
  '/employee-view',
  verifySupabaseToken,
  getEmployeeView // Corrected usage
);

// GET Manager View Data
router.get(
  '/manager-view',
  verifySupabaseToken,
  authorize(['manager', 'admin', 'hr']),
  getManagerView // Corrected usage
);

// GET Admin/HR View Data
router.get(
  '/admin-view',
  verifySupabaseToken,
  authorize(['admin', 'hr']),
  getAdminView // Corrected usage
);

// --- Action Routes ---

// POST Clock In
router.post(
  '/clock-in',
  verifySupabaseToken,
  // Add validation if needed
  clockIn
);

// POST Clock Out
router.post(
  '/clock-out',
  verifySupabaseToken,
  clockOut
);

// POST Submit Regularization Request
router.post(
  '/regularize',
  verifySupabaseToken,
  // Example validation (uncomment if needed)
  // [
  //   body('date').isISO8601().toDate(),
  //   body('reason').notEmpty().withMessage('Reason is required')
  // ],
  submitRegularization
);

// POST Approve/Reject Regularization Request
router.post(
  '/regularize/action',
  verifySupabaseToken,
  authorize(['manager', 'admin', 'hr']),
  // Example validation (uncomment if needed)
  // [
  //   body('requestId').isUUID(),
  //   body('status').isIn(['approved', 'rejected'])
  // ],
  handleRegularizationAction
);

export default router;
