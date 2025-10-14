import { Router } from 'express';
import { body } from 'express-validator';
import * as recruitmentController from '../controllers/recrutmentController';

const router = Router();

// =================== Jobs ===================
// Public routes
router.get('/jobs', recruitmentController.getJobs);
router.get('/jobs/:id', recruitmentController.getJob);

router.post(
  '/jobs',
  [
    body('title').notEmpty().withMessage('Title is required'),
    body('department').notEmpty().withMessage('Department is required'),
    body('location').notEmpty().withMessage('Location is required'),
    body('employment_type').notEmpty().withMessage('Employment type is required'),
  ],
  recruitmentController.createJob
);

router.put('/jobs/:id', recruitmentController.updateJob);
router.delete('/jobs/:id', recruitmentController.deleteJob);

// =================== Applications ===================
// Important: order matters! Static routes before dynamic ones.

// ✅ Export applications (must come before :id)
router.get('/applications/export', recruitmentController.exportApplications);

// ✅ Get all applications
router.get('/applications', recruitmentController.getApplications);

// ✅ Bulk update applications
router.post('/applications/bulk-update', recruitmentController.bulkUpdateApplications);

// ✅ Update a single application's status
router.post('/applications/:id/status', recruitmentController.updateApplicationStatus);

// ✅ Get a single application by ID (keep last)
router.get('/applications/:id', recruitmentController.getApplication);

export default router;
