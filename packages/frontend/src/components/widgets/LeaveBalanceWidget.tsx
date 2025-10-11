'use client'

import { motion } from 'framer-motion'
import { Calendar, Coffee, Heart, Umbrella } from 'lucide-react'

export default function LeaveBalanceWidget() {
  const leaveData = [
    {
      type: 'Casual Leave',
      available: 12,
      total: 15,
      icon: Coffee,
      color: 'bg-blue-500',
      lightColor: 'bg-blue-50 dark:bg-blue-900/20',
      textColor: 'text-blue-600 dark:text-blue-400'
    },
    {
      type: 'Sick Leave',
      available: 8,
      total: 10,
      icon: Heart,
      color: 'bg-red-500',
      lightColor: 'bg-red-50 dark:bg-red-900/20',
      textColor: 'text-red-600 dark:text-red-400'
    },
    {
      type: 'Vacation Leave',
      available: 15,
      total: 20,
      icon: Umbrella,
      color: 'bg-green-500',
      lightColor: 'bg-green-50 dark:bg-green-900/20',
      textColor: 'text-green-600 dark:text-green-400'
    }
  ]

  return (
    <div className="card p-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
          Leave Balance
        </h3>
        <Calendar className="w-5 h-5 text-gray-400" />
      </div>

      <div className="space-y-4">
        {leaveData.map((leave, index) => {
          const percentage = (leave.available / leave.total) * 100
          
          return (
            <motion.div
              key={leave.type}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 }}
              className={`${leave.lightColor} rounded-lg p-4`}
            >
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center space-x-3">
                  <div className={`w-8 h-8 ${leave.color} rounded-lg flex items-center justify-center`}>
                    <leave.icon className="w-4 h-4 text-white" />
                  </div>
                  <div>
                    <p className="font-medium text-gray-900 dark:text-white text-sm">
                      {leave.type}
                    </p>
                    <p className="text-xs text-gray-600 dark:text-gray-400">
                      {leave.available} of {leave.total} days
                    </p>
                  </div>
                </div>
                <div className={`text-lg font-bold ${leave.textColor}`}>
                  {leave.available}
                </div>
              </div>

              {/* Progress Bar */}
              <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${percentage}%` }}
                  transition={{ duration: 1, delay: index * 0.2 }}
                  className={`h-2 rounded-full ${leave.color}`}
                />
              </div>
              
              <div className="flex justify-between mt-2 text-xs text-gray-600 dark:text-gray-400">
                <span>Used: {leave.total - leave.available}</span>
                <span>{Math.round(percentage)}% remaining</span>
              </div>
            </motion.div>
          )
        })}
      </div>

      {/* Action Button */}
      <motion.button
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        className="w-full mt-6 px-4 py-3 bg-primary-500 hover:bg-primary-600 text-white rounded-lg font-medium transition-colors"
        onClick={() => alert('Apply for Leave functionality')}
      >
        Apply for Leave
      </motion.button>

      {/* Upcoming Leaves */}
      <div className="mt-6 pt-4 border-t border-gray-200 dark:border-gray-700">
        <p className="text-sm font-medium text-gray-900 dark:text-white mb-2">
          Upcoming Leaves
        </p>
        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-600 dark:text-gray-400">
              Christmas Break
            </span>
            <span className="text-gray-900 dark:text-white font-medium">
              Dec 24-26
            </span>
          </div>
          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-600 dark:text-gray-400">
              New Year
            </span>
            <span className="text-gray-900 dark:text-white font-medium">
              Jan 1
            </span>
          </div>
        </div>
      </div>
    </div>
  )
}
