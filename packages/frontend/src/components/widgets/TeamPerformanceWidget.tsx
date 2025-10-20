'use client'

import { supabase } from '@/config/supabase';
import { motion } from 'framer-motion'
import { Target, Award, TrendingUp, Users, Clock } from 'lucide-react'
import { useState, useEffect } from 'react'

interface TeamPerformanceWidgetProps {
  teamMembers?: Array<{
    id: string;
    name: string;
    position: string;
    department: string;
  }>;
}

interface PerformanceMetric {
  metric: string;
  value: number | string;
  target: number;
  color: string;
  icon: React.ElementType;
}

interface TeamStats {
  totalMembers: number;
  topPerformers: number | string;
  needsAttention: number | string;
  averageScore: number | string;
}

interface Employee {
  id: string;
  name: string;
  position: string;
  department: string;
  status?: string;
}

interface Review {
  employee_id: string;
  overall_rating: number;
  finalized_at: string;
}

interface Goal {
  employee_id: string;
  progress: number;
  status: string;
  target_metric?: string;
  due_date?: string;
}

export default function TeamPerformanceWidget({ teamMembers = [] }: TeamPerformanceWidgetProps) {
  const [performanceData, setPerformanceData] = useState<PerformanceMetric[]>([]);
  const [teamStats, setTeamStats] = useState<TeamStats>({
    totalMembers: 0,
    topPerformers: 'N/A',
    needsAttention: 'N/A',
    averageScore: 'N/A'
  });
  const [loading, setLoading] = useState(true);
  const [hasData, setHasData] = useState(false);
  const [isInitialLoad, setIsInitialLoad] = useState(true); 

  useEffect(() => {
    const fetchPerformanceData = async () => {
      try {
         if (!isInitialLoad) return; 
         setLoading(true);
      setHasData(false); // Reset at start

        let members: Employee[] = teamMembers;
        
        // If no team members provided, fetch all active employees
        if (!members || members.length === 0) {
          const { data: employees, error } = await supabase
            .from('employees')
            .select('id, name, position, department')
            .eq('status', 'active')
            .limit(50);

          if (error) {
            console.error('Error fetching employees:', error);
          }

          if (employees) {
            members = employees;
          }
        }

        if (!members || members.length === 0) {
          setTeamStats({
            totalMembers: 0,
            topPerformers: 'N/A',
            needsAttention: 'N/A',
            averageScore: 'N/A'
          });
          setPerformanceData([]);
          setHasData(false);
          return;
        }
        
        const memberIds = members.map(member => member.id);
        
        // Fetch performance reviews
        const { data: reviews, error: reviewsError } = await supabase
          .from('reviews')
          .select('employee_id, overall_rating, finalized_at')
          .in('employee_id', memberIds)
          .not('overall_rating', 'is', null)
          .order('finalized_at', { ascending: false });

        if (reviewsError) {
          console.error('Error fetching reviews:', reviewsError);
        }

        let avgScore: number | string = 'N/A';
        let topPerformers: number | string = 'N/A';
        let needsAttention: number | string = 'N/A';
        
        if (reviews && reviews.length > 0) {
          // Get latest review per employee
          const latestReviews = reviews.reduce((acc: Record<string, Review>, review: Review) => {
            if (!acc[review.employee_id] || new Date(review.finalized_at) > new Date(acc[review.employee_id].finalized_at)) {
              acc[review.employee_id] = review;
            }
            return acc;
          }, {} as Record<string, Review>);

          const reviewValues = Object.values(latestReviews);
          if (reviewValues.length > 0) {
            const totalScore = reviewValues.reduce((sum: number, review: Review) => sum + review.overall_rating, 0);
            avgScore = totalScore / reviewValues.length;
            topPerformers = reviewValues.filter((review: Review) => review.overall_rating >= 4).length;
            needsAttention = reviewValues.filter((review: Review) => review.overall_rating <= 2.5).length;
          }
        }

        // Fetch goals data
        const { data: goals, error: goalsError } = await supabase
          .from('goals')
          .select('employee_id, progress, status, target_metric, due_date')
          .in('employee_id', memberIds);
        
        if (goalsError) {
          console.error('Error fetching goals:', goalsError);
        }

        let goalsCompletion: number | string = 'N/A';
        let timelineAdherence: number | string = 'N/A';

        if (goals && goals.length > 0) {
          const completedGoals = goals.filter(goal => goal.status === 'completed').length;
          goalsCompletion = Math.round((completedGoals / goals.length) * 100);
          
          // Calculate timeline adherence based on due dates
          const currentDate = new Date();
          const goalsWithDueDates = goals.filter(goal => goal.due_date);
          
          if (goalsWithDueDates.length > 0) {
            const onTrackGoals = goalsWithDueDates.filter(goal => {
              const dueDate = new Date(goal.due_date as string);
              const progress: number = typeof goal.progress === 'number' ? goal.progress : 0;
              const daysUntilDue = Math.ceil((dueDate.getTime() - currentDate.getTime()) / (1000 * 60 * 60 * 24));
              const expectedProgress = Math.max(0, 100 - (daysUntilDue / 30) * 100);
              return progress >= expectedProgress;
            }).length;
            
            timelineAdherence = Math.round((onTrackGoals / goalsWithDueDates.length) * 100);
          }
        }

        const qualityScore = avgScore !== 'N/A' ? Math.round((avgScore as number) / 5 * 100) : 'N/A';

        setTeamStats({
          totalMembers: members.length,
          topPerformers,
          needsAttention,
          averageScore: avgScore !== 'N/A' ? Math.round((avgScore as number) * 10) / 10 : 'N/A'
        });
        
        const performanceMetrics: PerformanceMetric[] = [
          {
            metric: 'Goals Completion',
            value: goalsCompletion,
            target: 90,
            color: 'bg-blue-500',
            icon: Target
          },
          {
            metric: 'Quality Score',
            value: qualityScore,
            target: 85,
            color: 'bg-green-500',
            icon: Award
          },
          {
            metric: 'Timeline Adherence',
            value: timelineAdherence,
            target: 80,
            color: 'bg-yellow-500',
            icon: Clock
          }
        ];

        setPerformanceData(performanceMetrics);
      setHasData(performanceMetrics.some(metric => metric.value !== 'N/A'));
          setIsInitialLoad(false); 
      } catch (error) {
        console.error('Error in team performance widget:', error);
        setTeamStats({
          totalMembers: 0,
          topPerformers: 'N/A',
          needsAttention: 'N/A',
          averageScore: 'N/A'
        });
        setPerformanceData([]);
        setHasData(false);
         setIsInitialLoad(false);
      } finally {
        setLoading(false);
      }
    };

    fetchPerformanceData();
  }, [teamMembers, isInitialLoad]);

 if (loading && isInitialLoad) {
  return (
    <div className="card p-6">
      <div className="animate-pulse">
        <div className="h-6 bg-gray-200 rounded w-1/3 mb-6"></div>
        <div className="space-y-4">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="space-y-3">
              <div className="h-4 bg-gray-200 rounded w-3/4"></div>
              <div className="h-2 bg-gray-200 rounded"></div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

  if (!hasData) {
    return (
      <div className="card p-6">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            Team Performance
          </h3>
          <Users className="w-5 h-5 text-gray-400" />
        </div>
        <div className="text-center py-8">
          <Users className="w-12 h-12 text-gray-400 mx-auto mb-3" />
          <p className="text-gray-600 dark:text-gray-400">No performance data available</p>
        </div>
      </div>
    );
  }

  return (
    <div className="card p-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
          Team Performance
        </h3>
        <div className="flex items-center space-x-2 text-sm text-gray-500">
          <Users className="w-4 h-4" />
          <span>Q4 2024</span>
        </div>
      </div>

      {/* Overall Score */}
      <div className="text-center mb-6">
        <div className="relative w-20 h-20 mx-auto mb-3">
          {teamStats.averageScore !== 'N/A' ? (
            <>
              <svg className="w-20 h-20 transform -rotate-90" viewBox="0 0 24 24">
                <circle
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="2"
                  fill="none"
                  className="text-gray-200 dark:text-gray-700"
                />
                <circle
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="2"
                  fill="none"
                  strokeDasharray={`${((Number(teamStats.averageScore) / 5) * 62.8)} 62.8`}
                  className="text-primary-500"
                  strokeLinecap="round"
                />
              </svg>
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="text-xl font-bold text-gray-900 dark:text-white">
                  {teamStats.averageScore}
                </span>
              </div>
            </>
          ) : (
            <div className="w-20 h-20 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center">
              <span className="text-xl font-bold text-gray-500">N/A</span>
            </div>
          )}
        </div>
        <p className="text-sm text-gray-600 dark:text-gray-400">
          Average Team Score
        </p>
      </div>

      {/* Performance Metrics */}
      <div className="space-y-4 mb-6">
        {performanceData.map((metric, index) => (
          <motion.div
            key={metric.metric}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className="space-y-2"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <metric.icon className="w-4 h-4 text-gray-500" />
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  {metric.metric}
                </span>
              </div>
              <div className="flex items-center space-x-2">
                <span className="text-sm font-bold text-gray-900 dark:text-white">
                  {metric.value}{typeof metric.value === 'number' ? '%' : ''}
                </span> 
                <span className="text-xs text-gray-500">
                  / {metric.target}%
                </span>
              </div>
            </div>
            
            <div className="relative">
              <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                {typeof metric.value === 'number' ? (
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${Math.min(metric.value, 100)}%` }}
                    transition={{ duration: 1, delay: index * 0.2, type: "spring" }}
                    className={`h-2 rounded-full ${metric.color}`}
                  />
                ) : (
                  <div className="w-full h-2 bg-gray-300 dark:bg-gray-600 rounded-full flex items-center justify-center">
                    <span className="text-xs text-gray-500">N/A</span>
                  </div>
                )}
              </div>
              {/* Target line - only show if we have data */}
              {typeof metric.value === 'number' && (
                <div 
                  className="absolute top-0 w-0.5 h-2 bg-gray-400"
                  style={{ left: `${metric.target}%` }}
                />
              )}
            </div>
          </motion.div>
        ))}
      </div>

      {/* Team Summary */}
      <div className="grid grid-cols-2 gap-4 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
        <div className="text-center">
          <div className={`text-lg font-bold ${
            teamStats.topPerformers !== 'N/A' ? 'text-green-600 dark:text-green-400' : 'text-gray-500'
          }`}>
            {teamStats.topPerformers}
          </div>
          <div className="text-xs text-gray-600 dark:text-gray-400">
            Top Performers
          </div>
        </div>
        <div className="text-center">
          <div className={`text-lg font-bold ${
            teamStats.needsAttention !== 'N/A' ? 'text-yellow-600 dark:text-yellow-400' : 'text-gray-500'
          }`}>
            {teamStats.needsAttention}
          </div>
          <div className="text-xs text-gray-600 dark:text-gray-400">
            Need Support
          </div>
        </div>
      </div>
    </div>
  )
}