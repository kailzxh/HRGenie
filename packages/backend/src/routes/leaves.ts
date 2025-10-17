import { Router } from 'express';
// ✅ 1. Import your authentication middleware
import { verifySupabaseToken, authorize, AuthRequest } from '../middleware/auth';
import { Response } from 'express';
import { 
    getEmployeeViewData, 
    getManagerViewData, 
    getHrAdminViewData,
    applyForLeave,
    handleLeaveAction
} from '../controllers/leaveController';

const router = Router();

// ✅ 2. Add the 'verifySupabaseToken' middleware to each route that needs protection.
// The flow is now: Request -> verifySupabaseToken -> controller function

// This route is accessible by any authenticated user
router.get('/employee-view', verifySupabaseToken, async (req: AuthRequest, res: Response) => {
 try {
 await getEmployeeViewData(req, res);
 } catch (error) {
 res.status(500).json({ message: 'Error fetching employee view data', error });
 }
});

// This route is only accessible by users with the 'manager' role
router.get('/manager-view', verifySupabaseToken, authorize(['manager', 'hr']), async (req: AuthRequest, res: Response) => {
 try {
 await getManagerViewData(req, res);
 } catch (error) {
 res.status(500).json({ message: 'Error fetching manager view data', error });
 }
});

// This route is only accessible by users with the 'hr_admin' role
router.get('/hr-admin-view', verifySupabaseToken, authorize(['admin', 'hr']), async (req: AuthRequest, res: Response) => {
 try {
 await getHrAdminViewData(req, res);
 } catch (error) {
 res.status(500).json({ message: 'Error fetching HR admin view data', error });
 }
});

// These actions are accessible by any authenticated user (for applying) or a manager/hr for acting
router.post('/apply', verifySupabaseToken, async (req: AuthRequest, res: Response) => {
 await applyForLeave(req, res);
});
router.post('/action', verifySupabaseToken, authorize(['manager', 'hr']), async (req: AuthRequest, res: Response) => {
 await handleLeaveAction(req, res);
});

export default router;
