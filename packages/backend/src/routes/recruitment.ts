// backend/src/routes/recruitment.ts
import { Router } from 'express';
import { body } from 'express-validator';
import * as recruitmentController from '../controllers/recrutmentController';

const router = Router();

// =================== Jobs ===================
// Get all jobs
router.get('/jobs', recruitmentController.getJobs);

// Get a single job by ID
router.get('/jobs/:id', recruitmentController.getJob);

// Create a new job
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

// Update a job
router.put('/jobs/:id', recruitmentController.updateJob);

// Delete a job
router.delete('/jobs/:id', recruitmentController.deleteJob);

// // =================== Candidates ===================
// router.get('/candidates', recruitmentController.getCandidates);

// // =================== Interviews ===================
// router.get('/interviews', recruitmentController.getInterviews);

export default router;
