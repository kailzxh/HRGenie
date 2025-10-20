import express from 'express';
import { getDashboardData } from '../controllers/dashboardController';
import { verifySupabaseToken } from '../middleware/auth';

const router = express.Router();

// Temporary test route to verify the endpoint is working
router.get('/test', (req, res) => {
  res.json({ 
    success: true, 
    message: 'Dashboard endpoint is working',
    data: {
      userRole: 'admin',
      totalEmployees: 1247,
      activePayrollRuns: 3,
      departmentStats: {
        'Engineering': 45,
        'Marketing': 23,
        'Sales': 34,
        'HR': 12
      },
      recentEmployees: [
        {
          id: '1',
          name: 'John Doe',
          email: 'john@example.com',
          department: 'Engineering',
          position: 'Software Engineer',
          status: 'active'
        }
      ],
      attendanceSummary: {
        present: 1200,
        absent: 47,
        late: 23,
        total_hours: 19200
      }
    }
  });
});

// Main dashboard route with authentication
router.get('/', verifySupabaseToken, getDashboardData);

export default router;