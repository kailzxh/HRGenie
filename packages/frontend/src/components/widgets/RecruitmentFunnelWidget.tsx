'use client'

import { motion } from 'framer-motion'
import { Users, Eye, MessageSquare, CheckCircle } from 'lucide-react'

export default function RecruitmentFunnelWidget() {
  const funnelData = [
    {
      stage: 'Applied',
      count: 156,
      icon: Users,
      color: 'bg-blue-500',
      width: 100
    },
    {
      stage: 'Screened',
      count: 89,
      icon: Eye,
      color: 'bg-purple-500',
      width: 75
    },
    {
      stage: 'Interview',
      count: 34,
      icon: MessageSquare,
      color: 'bg-yellow-500',
      width: 50
    },
    {
      stage: 'Hired',
      count: 12,
      icon: CheckCircle,
      color: 'bg-green-500',
      width: 25
    }
  ]

  const aiQueue = {
    processing: 15,
    completed: 24,
    pending: 8
  }

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
                    {Math.round((stage.count / funnelData[0].count) * 100)}%
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

        {/* Progress Bar */}
        <div className="mt-3">
          <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
            <div 
              className="bg-primary-500 h-2 rounded-full transition-all duration-1000"
              style={{ width: `${(aiQueue.completed / (aiQueue.processing + aiQueue.completed + aiQueue.pending)) * 100}%` }}
            />
          </div>
          <p className="text-xs text-gray-600 dark:text-gray-400 mt-1 text-center">
            AI matching progress: {Math.round((aiQueue.completed / (aiQueue.processing + aiQueue.completed + aiQueue.pending)) * 100)}%
          </p>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
        <p className="text-sm font-medium text-gray-900 dark:text-white mb-2">
          Recent Activity
        </p>
        <div className="space-y-2 text-sm">
          <div className="flex justify-between items-center">
            <span className="text-gray-600 dark:text-gray-400">
              New applications
            </span>
            <span className="text-green-600 dark:text-green-400 font-medium">
              +8 today
            </span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-gray-600 dark:text-gray-400">
              Interviews scheduled
            </span>
            <span className="text-blue-600 dark:text-blue-400 font-medium">
              5 this week
            </span>
          </div>
        </div>
      </div>
    </div>
  )
}
