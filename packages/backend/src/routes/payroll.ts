import express from 'express';
import { 
  getEmployees, 
  getEmployeeById, 
  updateEmployeeSalary, 
  getDepartments,
  getPayrollRuns,
  createPayrollRun,
  getPayrollRunById,
  processPayrollRun,
  deletePayrollRun,
  updatePayrollLine
} from '../controllers/payrollController';
import { verifySupabaseToken, authorize } from '../middleware/auth';

const router = express.Router();

// Employee routes
router.get('/employees', verifySupabaseToken, authorize(['admin', 'hr', 'manager']), getEmployees);
router.get('/employees/:id', verifySupabaseToken, authorize(['admin', 'hr', 'manager']), getEmployeeById);
router.put('/employees/:id/salary', verifySupabaseToken, authorize(['admin', 'hr']), updateEmployeeSalary);
router.get('/departments', verifySupabaseToken, authorize(['admin', 'hr', 'manager']), getDepartments);

// Payroll run routes
router.get('/runs', verifySupabaseToken, authorize(['admin', 'hr', 'manager']), getPayrollRuns);
router.post('/runs', verifySupabaseToken, authorize(['admin', 'hr']), createPayrollRun);
router.get('/runs/:id', verifySupabaseToken, authorize(['admin', 'hr', 'manager']), getPayrollRunById);
router.post('/runs/:id/process', verifySupabaseToken, authorize(['admin', 'hr']), processPayrollRun);
router.delete('/runs/:id', verifySupabaseToken, authorize(['admin', 'hr']), deletePayrollRun);

// Payroll line routes
router.put('/runs/:runId/lines/:lineId', verifySupabaseToken, authorize(['admin', 'hr']), updatePayrollLine);

export default router;