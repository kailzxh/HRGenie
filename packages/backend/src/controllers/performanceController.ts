// performanceController.ts (FIXED VERSION)

import { Response } from 'express';
import { AuthenticatedRequest } from '../types/express'; // Custom request type with user object
import { supabase } from '../config/supabase'; // Your Supabase client instance
import { format, startOfYear, endOfYear } from 'date-fns';

/**
 * Helper function to retrieve the internal employee profile (UUID, role, etc.)
 * using the authentication user ID from the JWT.
 * @param authId - The user's UID from Supabase Auth.
 */
async function getEmployeeProfile(authId: string) {
    if (!authId) {
        throw new Error('User authentication ID not found.');
    }
    const { data, error } = await supabase
        .from('employees')
        .select('id, role, manager_id')
        .eq('uid', authId)
        .single();
        
    if (error || !data) {
        console.error('Supabase error fetching employee profile:', error?.message);
        throw new Error('Employee profile not found in database.');
    }
    return data;
}

// =================================================================
// --- DATA FETCHING CONTROLLERS (VIEWS) ---
// =================================================================
export const getPerformanceEmployeeView = async (req: AuthenticatedRequest, res: Response) => {
    try {
        const { id: employeeId } = await getEmployeeProfile(req.user!.id);

        // 1. Define the separate promise for pending tasks
        const pendingTasksPromise = supabase
            .from('review_participants')
            .select('id', { count: 'exact' })
            .eq('reviewer_id', employeeId)
            .eq('status', 'pending');

        // 2. Combine ALL database calls into a single Promise.all array for efficiency and correct declaration.
        // We use descriptive names in the destructuring for the results of the promises.
        const [
            goalsResult, 
            reviewsResult, 
            skillsResult, 
            feedbackResult, 
            pendingTasks
        ] = await Promise.all([
            supabase.from('goals').select('*').eq('employee_id', employeeId),
            supabase.from('reviews').select('id, status, overall_rating').eq('employee_id', employeeId).order('created_at', { ascending: false }),
            supabase.from('employee_skills').select('skills(name), proficiency_level, last_assessed_at').eq('employee_id', employeeId).order('last_assessed_at', { ascending: false }),
            supabase.from('feedback').select('id, content, type, is_anonymous, created_at, giver:employees!giver_id(name)').eq('receiver_id', employeeId).limit(10),
            pendingTasksPromise // The new promise for the count
        ]);

        // 3. Extract the data from the results
        const goals = goalsResult.data || [];
        const reviews = reviewsResult.data || [];
        const skills = skillsResult.data || [];
        const feedback = feedbackResult.data || [];

        // 4. Calculate Stats
        const completedGoals = goals.filter(g => g.status === 'completed').length;
        const goalsCompleted = goals.length > 0 ? `${Math.round((completedGoals / goals.length) * 100)}%` : 'N/A';
        
        // This is the new, important stat
        const pendingReviewTasks = pendingTasks.count || 0; 
        
        const latestReview = reviews[0];
        const performanceScore = latestReview?.overall_rating ? `${latestReview.overall_rating}/10` : 'N/A';
        const reviewStatus = latestReview?.status ? latestReview.status.replace(/_/g, ' ') : 'Not Started';
        
        let skillsGrowth = '0%';
        if (skills.length > 1) {
            // Note: This skills growth logic might need refinement for accurate calculations
            const latestAvg = skills.slice(0, skills.length / 2).reduce((acc, s) => acc + s.proficiency_level, 0) / (skills.length / 2);
            const previousAvg = skills.slice(skills.length / 2).reduce((acc, s) => acc + s.proficiency_level, 0) / (skills.length / 2);
            if(previousAvg > 0) {
                skillsGrowth = `${Math.round(((latestAvg - previousAvg) / previousAvg) * 100)}%`;
            }
        }

        // 5. Send Response
        res.json({
            stats: { goalsCompleted, performanceScore, skillsGrowth, reviewStatus, pendingReviewTasks }, 
            goals,
            feedback: feedback, // Used the extracted data
            skills: skills, // Used the extracted data
            reviews,
        });
    } catch (error: any) { 
        console.error("Error fetching employee performance data:", error.message);
        res.status(500).json({ message: "Failed to fetch employee performance data.", error: error.message }); 
    }
};

// performanceController.ts (MODIFIED getPerformanceManagerView)

export const getPerformanceManagerView = async (req: AuthenticatedRequest, res: Response) => {
    try {
        const { id: managerId } = await getEmployeeProfile(req.user!.id);
        const { data: team, error: teamError } = await supabase.from('employees').select('id, name, position').eq('manager_id', managerId);
        if (teamError) throw teamError;
        if (!team || team.length === 0) return res.json({ stats: {}, teamOverview: [], teamGoals: [], teamReviews: [], managerReviewTasks: [] });
        
        const teamIds = team.map(t => t.id);

        // NEW: Promise to fetch all pending review tasks where the manager is the reviewer (role='manager')
        const managerTasksPromise = supabase
            .from('review_participants')
            // Using a single-line select string for robustness
            .select('id, role, status, reviews(id, employee_id, review_cycles(end_date))') 
            .eq('reviewer_id', managerId)
            .eq('role', 'manager') // Only interested in their official manager review tasks
            .eq('status', 'pending');
        
        // Combined promise array
        const [teamGoalsResult, teamReviewsResult, managerTasksResult] = await Promise.all([
            supabase.from('goals').select('*').in('employee_id', teamIds),
            supabase.from('reviews').select('id, employee_id, status, overall_rating').in('employee_id', teamIds),
            managerTasksPromise
        ]);

        const teamGoals = teamGoalsResult.data || [];
        const teamReviews = teamReviewsResult.data || [];
        const managerReviewTasks = managerTasksResult.data || []; // Extracted tasks

        const teamCompletedGoals = teamGoals.filter(g => g.status === 'completed').length;
        const teamGoalsMet = teamGoals.length > 0 ? `${Math.round((teamCompletedGoals / teamGoals.length) * 100)}%` : 'N/A';
        
        // Update the 'reviewsDue' stat to include the number of tasks the manager must complete
        const reviewsDue = teamReviews.filter(r => r.status !== 'finalized').length + managerReviewTasks.length; 

        res.json({
            stats: {
                teamGoalsMet,
                reviewsDue: reviewsDue, // Updated stat
                highPerformers: teamReviews.filter(r => r.overall_rating && r.overall_rating >= 9).length,
                needSupport: teamReviews.filter(r => r.overall_rating && r.overall_rating < 7).length,
            },
            teamOverview: team.map(member => {
                const memberGoals = teamGoals.filter(g => g.employee_id === member.id);
                const completedMemberGoals = memberGoals.filter(g => g.status === 'completed').length;
                return { 
                    ...member, 
                    lastScore: teamReviews.find(r => r.employee_id === member.id)?.overall_rating || 'N/A', 
                    goalsMetPercent: memberGoals.length > 0 ? Math.round((completedMemberGoals / memberGoals.length) * 100) : 0 
                };
            }),
            teamGoals,
            teamReviews,
            // Format the pending tasks for the frontend
            managerReviewTasks: managerReviewTasks.map((task: any) => ({ 
                participantId: task.id, 
                revieweeId: task.reviews.employee_id, 
                reviewId: task.reviews.id,
                dueDate: task.reviews.review_cycles.end_date,
                reviewRole: task.role
            }))
        });
    } catch (error: any) { res.status(500).json({ message: "Failed to fetch manager performance data.", error: error.message }); }
};
export const getPerformanceAdminView = async (_req: AuthenticatedRequest, res: Response) => {
    try {
        // --- 1. Fetch all core data and simple alerts (AVOIDING FRAGILE NESTED JOINS) ---
        const [reviewsResult, biasAlertsResult, allGoalsResult, reviewCyclesResult, employeesResult] = await Promise.all([
            // Fetch reviews with only employee/manager IDs
            supabase.from('reviews').select('overall_rating, status, employee_id, manager_id'), 
            
            // FIX: Fetch ALERTS with simple join to reviews to get the reviewee's ID
            supabase.from('bias_alerts').select(`
                *, 
                review:reviews(employee_id) 
            `).eq('status', 'new'),
            
            supabase.from('goals').select('employee_id, status'),
            supabase.from('review_cycles').select('*').order('start_date', { ascending: false }),
            supabase.from('employees').select('id, name, position') // Fetch all employees for mapping
        ]);

        const alerts = biasAlertsResult.data || [];
        const employees = employeesResult.data || [];

        // --- 2. ASSEMBLE: Link Employee Names to Alerts on the server ---
        // Create a map: { 'employee_id': 'Employee Name' }
        const employeeMap = new Map(employees.map(emp => [emp.id, emp.name]));
        
        const assembledAlerts = alerts.map(alert => {
            const review = (alert).review;
            const revieweeId = review?.employee_id;
            // Use the map to get the name, defaulting to 'Reviewee N/A' if ID is missing
            const revieweeName = employeeMap.get(revieweeId) || 'Reviewee N/A';
            
            return {
                ...alert,
                // Add the resolved name back into the review object for the frontend
                review: {
                    ...review,
                    revieweeName: revieweeName 
                }
            };
        });
        
        // --- 3. Final Response Construction ---
        const allReviews = reviewsResult.data || [];
        const allRatings = allReviews.map(r => r.overall_rating).filter(Boolean);
        const avgScore = allRatings.length > 0 ? (allRatings.reduce((a, b) => a + b, 0) / allRatings.length).toFixed(1) : '0.0';
        const completedReviews = allReviews.filter(r => r.status === 'finalized').length;
        const reviewCompletion = allReviews.length > 0 ? `${Math.round((completedReviews / allReviews.length) * 100)}%` : '0%';
        const topPerformers = `${Math.round((allRatings.filter(r => r >= 9).length / allRatings.length || 0) * 100)}%`;

        res.json({
            stats: { overallScore: `${avgScore}/10`, reviewCompletion, biasAlerts: assembledAlerts.length || 0, topPerformers },
            reviewCycles: reviewCyclesResult.data || [],
            biasAlerts: assembledAlerts, // Send the reliably linked data
            allEmployees: employees
        });
    } catch (error: any) { 
        console.error("Admin View Fetch Error:", (error as Error).message);
        res.status(500).json({ message: "Failed to fetch admin performance data.", error: error.message }); 
    }
};
// performanceController.ts (Correction for reduce function and typing)

export const getPerformanceCalibrationData = async (_req: AuthenticatedRequest, res: Response) => {
    try {
        // FIX: Explicitly specify the foreign key relationship to join on the reviewee's ID (employee_id).
        const { data: reviewsData, error: reviewsError } = await supabase
            .from('reviews')
            .select(`
                employee_id, 
                overall_rating, 
                employee_name:employees!reviews_employee_id_fkey(name) 
            `); 
        
        // --- LOG 1: Reviews Fetch Status ---
        console.log("CALIBRATION LOG: Reviews Fetch Error:", reviewsError);
        
        // The error will no longer be thrown here if the explicit relationship is correct.
        if (reviewsError) throw reviewsError;

        const { data: allGoalsData, error: goalsError } = await supabase
            .from('goals')
            .select('employee_id, status');
            
        // --- LOG 2: Goals Fetch Status ---
        console.log("CALIBRATION LOG: Goals Fetch Error:", goalsError);
        
        if (goalsError) throw goalsError;

        // Define a strong type for the Goals data structure
        type GoalData = { employee_id: string; status: string }; 
        const allGoals: GoalData[] = (allGoalsData || []) as GoalData[];

        // Define the type for the accumulator (Goal Metrics Record)
        type GoalMetrics = Record<string, { total: number; completed: number }>;

        const goalsByEmployee: GoalMetrics = allGoals.reduce((acc: GoalMetrics, goal: GoalData) => {
            const empId = goal.employee_id; 

            if (!acc[empId]) {
                acc[empId] = { total: 0, completed: 0 };
            }

            acc[empId].total++;
            if (goal.status === 'completed') {
                acc[empId].completed++;
            }
            
            return acc;
        }, {} as GoalMetrics); 

        const reviews = reviewsData || [];
        
        // --- LOG 3: Raw Data Counts ---
        console.log(`CALIBRATION LOG: Reviews Count: ${reviews.length}, Goals Count: ${allGoals.length}`);

        const calibrationData = (reviews || [])
            .map(r => {
                const goals = goalsByEmployee[r.employee_id];
                
                // FIX: Access the aliased field 'employee_name' and handle the array/object structure
                const employeeName = (r as any).employee_name?.[0]?.name || (r as any).employee_name?.name || 'Unknown';

                const goalsMetPercent = goals ? Math.round((goals.completed / goals.total) * 100) : 0;
                
                // Only consider reviews that have an overall rating set
                const score = r.overall_rating !== null ? Number(r.overall_rating) : 0; 
                
                return { 
                    employeeName, 
                    score: score, 
                    goalsMetPercent 
                };
            })
            // Filter out employees with neither a score nor a goal completion percentage
            .filter(item => item.score > 0 || item.goalsMetPercent > 0);
            
        // --- LOG 4: Final Calibration Data Sent ---
        console.log("CALIBRATION LOG: Final Data Sent:", calibrationData);
        console.log(`CALIBRATION LOG: Final Data Count: ${calibrationData.length}`);

        res.json({ data: calibrationData });

    } catch (error: any) { 
        console.error('Calibration Data Fetch Error:', error);
        res.status(500).json({ message: "Failed to fetch calibration data.", error: error.message }); 
    }
};
// =================================================================
// --- ACTION CONTROLLERS (FIXED) ---
// =================================================================

export const createGoal = async (req: AuthenticatedRequest, res: Response) => {
    try {
        const { id: requesterId, role: requesterRole } = await getEmployeeProfile(req.user!.id);
        const { employee_id: assignedEmployeeId } = req.body;
        let finalEmployeeId = requesterId;

        if (assignedEmployeeId && assignedEmployeeId !== requesterId) {
            if (['manager', 'admin', 'hr'].includes(requesterRole)) {
                finalEmployeeId = assignedEmployeeId; // Allow assignment
            } else {
                return res.status(403).json({ message: "Forbidden: You can only create goals for yourself." });
            }
        }
        
        const { data, error } = await supabase.from('goals').insert({ ...req.body, employee_id: finalEmployeeId }).select().single();
        if (error) throw error;
        res.status(201).json(data);
    } catch (error: any) { res.status(500).json({ message: 'Failed to create goal.', error: error.message }); }
};

export const updateGoalProgress = async (req: AuthenticatedRequest, res: Response) => {
    try {
        const { goalId } = req.params;
        const { data, error } = await supabase.from('goals').update({ ...req.body, updated_at: new Date() }).eq('id', goalId).select().single();
        if (error) throw error;
        res.status(200).json(data);
    } catch (error: any) { res.status(500).json({ message: 'Failed to update goal.', error: error.message }); }
};

export const giveFeedback = async (req: AuthenticatedRequest, res: Response) => {
    try {
        // FIX: Validate required fields (assuming frontend uses recipient_id)
        const { recipient_id, content } = req.body; 
        if (!recipient_id || !content) {
             return res.status(400).json({ message: 'Recipient ID and content are required for feedback.' });
        }
        
        const { id: giverId } = await getEmployeeProfile(req.user!.id);
        
        // FIX: Map frontend's recipient_id to the database's receiver_id column.
        const feedbackData = {
            ...req.body,
            giver_id: giverId,
            receiver_id: recipient_id, // SCHEME FIX: maps frontend field to DB column
            recipient_id: undefined // Remove the conflicting field for insertion
        };

        const { data, error } = await supabase.from('feedback').insert(feedbackData).select().single();
        if (error) throw error;
        res.status(201).json(data);
    } catch (error: any) { 
        console.error("Error in giveFeedback:", error);
        res.status(500).json({ message: 'Failed to give feedback.', error: error.message }); 
    }
};

export const submitReviewParticipant = async (req: AuthenticatedRequest, res: Response) => {
    try {
        const { id: reviewerId } = await getEmployeeProfile(req.user!.id);
        const { participantId } = req.params;
        const { feedback, ratings } = req.body;

        const { data, error } = await supabase
            .from('review_participants')
            .update({ feedback, ratings, status: 'submitted', submitted_at: new Date() })
            .eq('id', participantId)
            .eq('reviewer_id', reviewerId)
            .select()
            .single();
        
        if (error) throw error;
        if (!data) return res.status(404).json({ message: "Review participation record not found or you're not authorized." });

        res.status(200).json(data);
    } catch (error: any) {
        res.status(500).json({ message: 'Failed to submit review.', error: error.message });
    }
};

export const finalizeReview = async (req: AuthenticatedRequest, res: Response) => {
    try {
        const { id: requesterId, role: requesterRole } = await getEmployeeProfile(req.user!.id);
        const { reviewId } = req.params;
        const { overall_rating, summary } = req.body;

        const { data: review, error: fetchError } = await supabase.from('reviews').select('manager_id').eq('id', reviewId).single();
        if (fetchError) throw fetchError;

        if (requesterId !== review.manager_id && !['admin', 'hr'].includes(requesterRole)) {
            return res.status(403).json({ message: "You are not authorized to finalize this review." });
        }

        const { data, error } = await supabase.from('reviews').update({ overall_rating, summary, status: 'finalized', finalized_at: new Date() }).eq('id', reviewId).select().single();
        if (error) throw error;
        res.status(200).json(data);
    } catch (error: any) { res.status(500).json({ message: 'Failed to finalize review.', error: error.message }); }
};

export const createReviewCycle = async (req: AuthenticatedRequest, res: Response) => {
    try {
        const { name, start_date, end_date } = req.body;
        const { data: cycle, error: cycleError } = await supabase.from('review_cycles').insert({ name, start_date, end_date, status: 'active' }).select().single();
        if (cycleError) throw cycleError;

        const { data: employees, error: empError } = await supabase.from('employees').select('id, manager_id').eq('status', 'active');
        if (empError) throw empError;

        const reviewsToCreate = employees!.map(emp => ({ cycle_id: cycle.id, employee_id: emp.id, manager_id: emp.manager_id }));
        const { data: newReviews, error: reviewsError } = await supabase.from('reviews').insert(reviewsToCreate).select();
        if (reviewsError) throw reviewsError;
        
        const participantsToCreate = newReviews!.flatMap(rev => ([
            { review_id: rev.id, reviewer_id: rev.employee_id, role: 'self' },
            ...(rev.manager_id ? [{ review_id: rev.id, reviewer_id: rev.manager_id, role: 'manager' }] : [])
        ]));
        const { error: participantsError } = await supabase.from('review_participants').insert(participantsToCreate);
        if (participantsError) throw participantsError;
        
        res.status(201).json({ message: 'Review cycle created successfully.', cycle });
    } catch(error: any) { res.status(500).json({ message: 'Failed to create review cycle.', error: error.message }); }
};

export const updateReviewCycle = async (req: AuthenticatedRequest, res: Response) => {
    try {
        const { cycleId } = req.params;
        const { data, error } = await supabase
            .from('review_cycles')
            .update({ ...req.body, updated_at: new Date() })
            .eq('id', cycleId)
            .select()
            .single();

        if (error) throw error;
        res.status(200).json({ message: 'Review cycle updated.', data });
    } catch (error: any) {
        res.status(500).json({ message: 'Failed to update review cycle.', error: error.message });
    }
};

// performanceController.ts (Inside logBiasMitigationAction)

// performanceController.ts (Inside logBiasMitigationAction)

// performanceController.ts (Inside logBiasMitigationAction)

export const logBiasMitigationAction = async (req: AuthenticatedRequest, res: Response) => {
    try {
        const { type: bias_type, action_taken, review_id: related_review_id } = req.body; 
        if (!action_taken) {
             return res.status(400).json({ message: 'Mitigation action details are required.' });
        }
        
        const { id: adminId } = await getEmployeeProfile(req.user!.id);
        
        // --- STEP 1: Log the Mitigation Action ---
        const { data: logData, error: logError } = await supabase
            .from('bias_mitigation_logs')
            .insert({ 
                related_review_id: related_review_id || null, 
                admin_id: adminId, 
                bias_type: bias_type || null, 
                action_taken: action_taken, 
                logged_at: new Date()
            })
            .select()
            .single();

        if (logError) {
            console.error("Supabase Log Insertion Error:", logError);
            throw new Error(logError.message);
        }

        // --- STEP 2: Automatically Resolve the Alert (if a review_id was provided) ---
        if (related_review_id) {
            // Find the NEWEST 'new' alert linked to this review and mark it 'reviewed'
            const { error: updateError } = await supabase.from('bias_alerts')
                .update({ status: 'reviewed' })
                .eq('review_id', related_review_id)
                .eq('status', 'new');
            
            if (updateError) {
                console.warn("Failed to automatically resolve bias alert:", updateError.message);
                // NOTE: We don't fail the primary request over a warning.
            }
        }
        
        res.status(201).json({ message: 'Bias mitigation action logged successfully.', data: logData });
    } catch (error: any) {
        // ... (Error handling remains the same)
    }
};

export const updateBiasAlertStatus = async (req: AuthenticatedRequest, res: Response) => {
    try {
        const { alertId } = req.params;
        const { status } = req.body; // 'reviewed' or 'dismissed'
        const { data, error } = await supabase.from('bias_alerts').update({ status }).eq('id', alertId).select().single();
        if (error) throw error;
        res.status(200).json(data);
    } catch (error: any) { res.status(500).json({ message: 'Failed to update bias alert.', error: error.message }); }
};


// performanceController.ts (Add this function)

export const createManualBiasAlert = async (req: AuthenticatedRequest, res: Response) => {
    try {
        // Requires review_id, bias_type, and details
        const { review_id, detected_bias_type, details } = req.body;
        
        if (!review_id || !detected_bias_type) {
            return res.status(400).json({ message: 'Review ID and bias type are required to manually create an alert.' });
        }

        const { data, error } = await supabase
            .from('bias_alerts')
            .insert({
                review_id,
                detected_bias_type,
                details: details || 'Manually logged by Admin.',
                status: 'new', // Always start as 'new'
                created_at: new Date()
            })
            .select()
            .single();
        
        if (error) throw error;

        res.status(201).json({ message: 'Bias alert created successfully.', data });
    } catch (error: any) {
        console.error("Manual Bias Alert Creation Error:", error);
        res.status(500).json({ message: 'Failed to manually create bias alert.', error: error.message });
    }
};

export const getAllEmployees = async (_req: AuthenticatedRequest, res: Response) => {
    try {
        const { data, error } = await supabase.from('employees').select('id, name').order('name');
        if (error) throw error;
        res.json(data);
    } catch (error: any) { res.status(500).json({ message: 'Failed to fetch employees.', error: error.message }); }
};

export const getAllSkills = async (_req: AuthenticatedRequest, res: Response) => {
    try {
        const { data, error } = await supabase.from('skills').select('id, name, category').order('name');
        if (error) throw error;
        res.json(data);
    } catch (error: any) { res.status(500).json({ message: 'Failed to fetch skills.', error: error.message }); }
};


// performanceController.ts (ADD THIS NEW FUNCTION)
// performanceController.ts (FIXED getPendingReviewTasks function)

export const getPendingReviewTasks = async (req: AuthenticatedRequest, res: Response) => {
    try {
        const { id: reviewerId } = await getEmployeeProfile(req.user!.id);

        // FIX: The select string must be a clean, single-line format (no comments or excessive newlines) 
        // for Supabase/TypeScript to correctly parse the nested structure.
        const { data: tasks, error } = await supabase
            .from('review_participants')
            .select(
                `id, role, status, reviews(reviewId:id, reviewee_details:employees!employee_id(name, position), cycle_details:review_cycles(name, end_date))`
            )
            .eq('reviewer_id', reviewerId)
            .eq('status', 'pending');

        if (error) throw error;
        
        // Reformat the data for cleaner consumption by the frontend
        const formattedTasks = (tasks || [])
            .filter(task => (task as any).reviews) // Use type assertion here if needed, or check if object is present
            .map(task => {
                const review = (task as any).reviews; 
                
                const employee = review?.reviewee_details; 
                const cycle = review?.cycle_details;

                // Handle Supabase's tendency to return single related objects as an array
                const revieweeData = Array.isArray(employee) ? employee[0] : employee;

                return {
                    participantId: (task as any).id,
                    reviewId: review?.reviewId,
                    
                    revieweeName: revieweeData?.name || 'N/A', 
                    revieweePosition: revieweeData?.position || 'N/A', 
                    
                    reviewRole: (task as any).role,
                    cycleName: cycle?.name,
                    dueDate: cycle?.end_date,
                    status: (task as any).status,
                };
            });

        res.json(formattedTasks);
    } catch (error: any) {
        console.error('Failed to fetch pending review tasks:', error.message);
        res.status(500).json({ message: "Failed to fetch pending review tasks.", error: error.message });
    }
};