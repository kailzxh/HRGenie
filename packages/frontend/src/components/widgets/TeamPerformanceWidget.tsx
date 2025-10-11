<<<<<<< HEAD
'use client'

import { motion } from 'framer-motion'
import { Target, Award, TrendingUp, Users } from 'lucide-react'

export default function TeamPerformanceWidget() {
  const performanceData = [
    {
      metric: 'Goals Completion',
      value: 85,
      target: 90,
      color: 'bg-blue-500',
      icon: Target
    },
    {
      metric: 'Quality Score',
      value: 92,
      target: 85,
      color: 'bg-green-500',
      icon: Award
    },
    {
      metric: 'Timeline Adherence',
      value: 78,
      target: 80,
      color: 'bg-yellow-500',
      icon: TrendingUp
    }
  ]

  const teamStats = {
    totalMembers: 24,
    topPerformers: 8,
    needsAttention: 3,
    averageScore: 8.5
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
              strokeDasharray={`${(teamStats.averageScore / 10) * 62.8} 62.8`}
              className="text-primary-500"
              strokeLinecap="round"
            />
          </svg>
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="text-xl font-bold text-gray-900 dark:text-white">
              {teamStats.averageScore}
            </span>
          </div>
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
                  {metric.value}%
                </span>
                <span className="text-xs text-gray-500">
                  / {metric.target}%
                </span>
              </div>
            </div>
            
            <div className="relative">
              <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${Math.min((metric.value / 100) * 100, 100)}%` }}
                  transition={{ duration: 1, delay: index * 0.2 }}
                  className={`h-2 rounded-full ${metric.color}`}
                />
              </div>
              {/* Target line */}
              <div 
                className="absolute top-0 w-0.5 h-2 bg-gray-400"
                style={{ left: `${metric.target}%` }}
              />
            </div>
          </motion.div>
        ))}
      </div>

      {/* Team Summary */}
      <div className="grid grid-cols-2 gap-4 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
        <div className="text-center">
          <div className="text-lg font-bold text-green-600 dark:text-green-400">
            {teamStats.topPerformers}
          </div>
          <div className="text-xs text-gray-600 dark:text-gray-400">
            Top Performers
          </div>
        </div>
        <div className="text-center">
          <div className="text-lg font-bold text-yellow-600 dark:text-yellow-400">
            {teamStats.needsAttention}
          </div>
          <div className="text-xs text-gray-600 dark:text-gray-400">
            Need Support
          </div>
        </div>
      </div>

      {/* Actions */}
      <div className="mt-4 space-y-2">
        <button className="w-full text-sm text-primary-600 dark:text-primary-400 hover:text-primary-700 dark:hover:text-primary-300 font-medium py-2 px-3 rounded-lg hover:bg-primary-50 dark:hover:bg-primary-900/20 transition-colors">
          View Detailed Report
        </button>
        <button className="w-full text-sm text-gray-600 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 font-medium py-2 px-3 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
          Schedule 1:1 Reviews
        </button>
      </div>
    </div>
  )
}
=======
'use client'

import { motion } from 'framer-motion'
import { Target, Award, TrendingUp, Users } from 'lucide-react'

export default function TeamPerformanceWidget() {
  const performanceData = [
    {
      metric: 'Goals Completion',
      value: 85,
      target: 90,
      color: 'bg-blue-500',
      icon: Target
    },
    {
      metric: 'Quality Score',
      value: 92,
      target: 85,
      color: 'bg-green-500',
      icon: Award
    },
    {
      metric: 'Timeline Adherence',
      value: 78,
      target: 80,
      color: 'bg-yellow-500',
      icon: TrendingUp
    }
  ]

  const teamStats = {
    totalMembers: 24,
    topPerformers: 8,
    needsAttention: 3,
    averageScore: 8.5
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
              strokeDasharray={`${(teamStats.averageScore / 10) * 62.8} 62.8`}
              className="text-primary-500"
              strokeLinecap="round"
            />
          </svg>
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="text-xl font-bold text-gray-900 dark:text-white">
              {teamStats.averageScore}
            </span>
          </div>
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
                  {metric.value}%
                </span>
                <span className="text-xs text-gray-500">
                  / {metric.target}%
                </span>
              </div>
            </div>
            
            <div className="relative">
              <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${Math.min((metric.value / 100) * 100, 100)}%` }}
                  transition={{ duration: 1, delay: index * 0.2 }}
                  className={`h-2 rounded-full ${metric.color}`}
                />
              </div>
              {/* Target line */}
              <div 
                className="absolute top-0 w-0.5 h-2 bg-gray-400"
                style={{ left: `${metric.target}%` }}
              />
            </div>
          </motion.div>
        ))}
      </div>

      {/* Team Summary */}
      <div className="grid grid-cols-2 gap-4 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
        <div className="text-center">
          <div className="text-lg font-bold text-green-600 dark:text-green-400">
            {teamStats.topPerformers}
          </div>
          <div className="text-xs text-gray-600 dark:text-gray-400">
            Top Performers
          </div>
        </div>
        <div className="text-center">
          <div className="text-lg font-bold text-yellow-600 dark:text-yellow-400">
            {teamStats.needsAttention}
          </div>
          <div className="text-xs text-gray-600 dark:text-gray-400">
            Need Support
          </div>
        </div>
      </div>

      {/* Actions */}
      <div className="mt-4 space-y-2">
        <button className="w-full text-sm text-primary-600 dark:text-primary-400 hover:text-primary-700 dark:hover:text-primary-300 font-medium py-2 px-3 rounded-lg hover:bg-primary-50 dark:hover:bg-primary-900/20 transition-colors">
          View Detailed Report
        </button>
        <button className="w-full text-sm text-gray-600 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 font-medium py-2 px-3 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
          Schedule 1:1 Reviews
        </button>
      </div>
    </div>
  )
}
>>>>>>> 225ed5384cf9eebf7cee947b068a57b523c6c838
