import express from 'express';
import { getEmployees } from '../controllers/payrollController';
import { verifySupabaseToken, authorize, AuthRequest } from '../middleware/auth';

const router = express.Router();

// GET /api/payroll/employees - only admin or HR
router.get(
  '/employees',
  verifySupabaseToken,
  authorize(['admin', 'hr']),
  async (req: AuthRequest, res) => {
    try {
      const employees = await getEmployees(req, res);
      res.json(employees);
    } catch (error: any) {
      console.error('Error fetching employees:', error);
      res.status(500).json({ error: error.message || 'Failed to fetch employees' });
    }
  }
);

export default router;
