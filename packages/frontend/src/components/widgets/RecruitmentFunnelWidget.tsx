'use client'

import { motion } from 'framer-motion'
import { Users, Eye, MessageSquare, CheckCircle, LucideIcon } from 'lucide-react'
import { useState, useEffect } from 'react'
import { supabaseOnboarding } from '@/config/supabase'

interface RecruitmentFunnelWidgetProps {
  newApplicants?: number;
  openPositions?: number;
  recentEmployees?: number;
}

export default function RecruitmentFunnelWidget({ newApplicants, openPositions, recentEmployees }: RecruitmentFunnelWidgetProps) {
  const [funnelData, setFunnelData] = useState<Array<{
    stage: string;
    count: number;
    icon: LucideIcon;
    color: string;
    width: number;
  }>>([]);

  const [aiQueue, setAiQueue] = useState({ processing: 0, completed: 0, pending: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchRecruitmentData = async () => {
      try {
        setLoading(true);
        
        // Fetch applications for current month
        const startOfMonth = new Date(new Date().getFullYear(), new Date().getMonth(), 1);
        const { data: applications, error } = await supabaseOnboarding
          .from('applications')
          .select('id, status, created_at, resume_score, resume_analysis')
          .gte('created_at', startOfMonth.toISOString());

        if (error) {
          console.error('Error fetching applications:', error);
          return;
        }

        if (applications && applications.length > 0) {
          // Calculate funnel stages based on actual status values
          const applied = applications.length;
          const screened = applications.filter(app => 
            app.status === 'screened' || app.status === 'interview' || app.status === 'hired'
          ).length;
          const interview = applications.filter(app => 
            app.status === 'interview' || app.status === 'hired'
          ).length;
          const hired = applications.filter(app => app.status === 'hired').length;

          setFunnelData([
            { stage: 'Applied', count: applied, icon: Users, color: 'bg-blue-500', width: 100 },
            { stage: 'Screened', count: screened, icon: Eye, color: 'bg-purple-500', width: Math.round((screened/applied)*100) || 0 },
            { stage: 'Interview', count: interview, icon: MessageSquare, color: 'bg-yellow-500', width: Math.round((interview/applied)*100) || 0 },
            { stage: 'Hired', count: hired, icon: CheckCircle, color: 'bg-green-500', width: Math.round((hired/applied)*100) || 0 }
          ]);

          // AI queue based on resume_score and resume_analysis
          const processing = applications.filter(app => 
            app.status === 'submitted' && 
            (!app.resume_score || app.resume_score === 0) &&
            (!app.resume_analysis || Object.keys(app.resume_analysis).length === 0)
          ).length;
          
          const completed = applications.filter(app => 
            app.resume_score > 0 || 
            (app.resume_analysis && Object.keys(app.resume_analysis).length > 0)
          ).length;

          setAiQueue({ 
            processing, 
            completed, 
            pending: applications.length - processing - completed 
          });
        }

        // Fetch open positions if not provided
        if (!openPositions) {
          const { data: jobs, error: jobsError } = await supabaseOnboarding
            .from('jobs')
            .select('id')
            .eq('is_active', true);
          
          if (jobs) {
            // You can use this data if needed
          }
        }

      } catch (error) {
        console.error('Error in recruitment widget:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchRecruitmentData();
  }, [newApplicants, openPositions]);
  return (
    <div className="card p-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
          Recruitment Funnel
        </h3>
        <div className="flex items-center space-x-2 text-sm text-gray-500">
          <Users className="w-4 h-4" />
          <span>This Month</span>
        </div>
      </div>

      {/* Funnel Visualization */}
      <div className="space-y-4 mb-6">
        {funnelData.map((stage, index) => (
          <motion.div
            key={stage.stage}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.1 }}
            className="relative"
          >
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center space-x-2">
                <div className={`w-6 h-6 ${stage.color} rounded-full flex items-center justify-center`}>
                  <stage.icon className="w-3 h-3 text-white" />
                </div>
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  {stage.stage}
                </span>
              </div>
              <span className="text-lg font-bold text-gray-900 dark:text-white">
                {stage.count}
              </span>
            </div>
            
            {/* Funnel Bar */}
            <div className="relative">
              <div className="w-full h-8 bg-gray-100 dark:bg-gray-700 rounded-lg overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${stage.width}%` }}
                  transition={{ duration: 1, delay: index * 0.2 }}
                  className={`h-full ${stage.color} flex items-center justify-center`}
                >
                  <span className="text-white text-xs font-medium">
                    {stage.width}%
                  </span>
                </motion.div>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* AI Processing Status */}
      <div className="bg-gradient-to-r from-primary-50 to-primary-100 dark:from-primary-900/20 dark:to-primary-800/20 rounded-lg p-4">
        <div className="flex items-center justify-between mb-3">
          <h4 className="text-sm font-medium text-gray-900 dark:text-white">
            AI Screening Queue
          </h4>
          <div className="flex items-center space-x-1">
            <div className="w-2 h-2 bg-primary-500 rounded-full animate-pulse"></div>
            <span className="text-xs text-primary-600 dark:text-primary-400">
              Processing
            </span>
          </div>
        </div>
        
        <div className="grid grid-cols-3 gap-4 text-center">
          <div>
            <div className="text-lg font-bold text-primary-600 dark:text-primary-400">
              {aiQueue.processing}
            </div>
            <div className="text-xs text-gray-600 dark:text-gray-400">
              Processing
            </div>
          </div>
          <div>
            <div className="text-lg font-bold text-green-600 dark:text-green-400">
              {aiQueue.completed}
            </div>
            <div className="text-xs text-gray-600 dark:text-gray-400">
              Completed
            </div>
          </div>
          <div>
            <div className="text-lg font-bold text-yellow-600 dark:text-yellow-400">
              {aiQueue.pending}
            </div>
            <div className="text-xs text-gray-600 dark:text-gray-400">
              Pending
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}