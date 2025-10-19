// performanceRoutes.ts (FIXED VERSION)

import { Router } from 'express';
import { AuthenticatedRequest } from '../types/express';
import { 
    getPerformanceEmployeeView, 
    getPerformanceManagerView, 
    getPerformanceAdminView,
    createGoal,
    updateGoalProgress,
    giveFeedback,
    submitReviewParticipant,
    finalizeReview,
    createReviewCycle,
    updateReviewCycle,
    logBiasMitigationAction, // Added
    getPerformanceCalibrationData, // Added
    createManualBiasAlert
} from '../controllers/performanceController';
import { verifySupabaseToken, authorize } from '../middleware/auth';
import { Response } from 'express-serve-static-core';

const router = Router();

// =================================================================
// --- DATA FETCHING ROUTES ---
// =================================================================

// GET Employee View Data
router.get(
    '/employee-view', 
    verifySupabaseToken, 
    (req, res) => getPerformanceEmployeeView(req as unknown as AuthenticatedRequest, res)
);

// GET Manager View Data
router.get(
    '/manager-view', 
    verifySupabaseToken, 
    authorize(['manager', 'admin', 'hr']), 
    (req, res) => getPerformanceManagerView(req as unknown as AuthenticatedRequest, res)
);

// GET Admin/HR View Data
router.get(
    '/admin-view', 
    verifySupabaseToken, 
    authorize(['admin', 'hr']), 
    (req, res) => getPerformanceAdminView(req as unknown as AuthenticatedRequest, res)
);

// GET route for fetching calibration chart data
router.get(
    '/calibration', 
    verifySupabaseToken, 
    authorize(['admin', 'hr']), 
    (req, res) => getPerformanceCalibrationData(req as unknown as AuthenticatedRequest, res)
);


// =================================================================
// --- ACTION ROUTES ---
// =================================================================

// POST Create a new goal for the authenticated user
router.post(
    '/goals',
    verifySupabaseToken,
    (req, res) => createGoal(req as unknown as AuthenticatedRequest, res)
);

// PUT Update progress or status of a specific goal
router.put(
    '/goals/:goalId',
    verifySupabaseToken,
    (req, res) => updateGoalProgress(req as unknown as AuthenticatedRequest, res)
);

// POST Give feedback to another employee
router.post(
    '/feedback',
    verifySupabaseToken,
    (req, res) => giveFeedback(req as unknown as AuthenticatedRequest, res)
);

// PUT Submit a self, peer, or manager portion of a review
router.put(
    '/reviews/participant/:participantId',
    verifySupabaseToken,
    (req, res) => submitReviewParticipant(req as unknown as AuthenticatedRequest, res)
);

// PUT Manager finalizes a review with an overall score and summary
router.put(
    '/reviews/:reviewId/finalize',
    verifySupabaseToken,
    authorize(['manager', 'admin', 'hr']), 
    (req, res) => finalizeReview(req as unknown as AuthenticatedRequest, res)
);

// FIX: POST Log a bias mitigation action
router.post(
    '/admin/bias-log', // Route path to match frontend (assuming external mounting)
    verifySupabaseToken,
    authorize(['admin', 'hr']), 
    (req, res) => logBiasMitigationAction(req as unknown as AuthenticatedRequest, res) 
);

// FIX: POST Create a new review cycle
router.post(
    '/admin/cycles', // Route path to match frontend
    verifySupabaseToken,
    authorize(['admin', 'hr']), 
    (req, res) => createReviewCycle(req as unknown as AuthenticatedRequest, res)
);

// FIX: PUT Update an existing review cycle (e.g., status/dates)
router.put(
    '/admin/cycles/:cycleId', // Route path to match frontend
    verifySupabaseToken,
    authorize(['admin', 'hr']), 
    (req, res) => updateReviewCycle(req as unknown as AuthenticatedRequest, res)
);

router.post(
    '/admin/alerts', // NEW ROUTE
    verifySupabaseToken,
    authorize(['admin', 'hr']), 
    (req, res) => createManualBiasAlert(req as unknown as AuthenticatedRequest, res)
);


export default router;