'use client'

import { motion } from 'framer-motion'
import { Megaphone, Calendar, Gift, AlertCircle, Info } from 'lucide-react'

export default function AnnouncementsWidget() {
  const announcements = [
    {
      id: '1',
      title: 'Q4 Performance Reviews',
      message: 'Performance review cycle for Q4 2024 starts next week. Please prepare your self-assessments.',
      type: 'info' as const,
      date: 'Oct 15',
      priority: 'high' as const,
      icon: Calendar
    },
    {
      id: '2',
      title: 'Holiday Party - Dec 20',
      message: 'Join us for our annual holiday celebration at the downtown office. Food, drinks, and prizes!',
      type: 'success' as const,
      date: 'Dec 20',
      priority: 'medium' as const,
      icon: Gift
    },
    {
      id: '3',
      title: 'New Health Benefits',
      message: 'Enhanced health insurance plans are now available. Check your employee portal for details.',
      type: 'warning' as const,
      date: 'Nov 1',
      priority: 'high' as const,
      icon: AlertCircle
    },
    {
      id: '4',
      title: 'Office Maintenance',
      message: 'Building maintenance scheduled for this weekend. Remote work recommended.',
      type: 'info' as const,
      date: 'Oct 28',
      priority: 'low' as const,
      icon: Info
    }
  ]

  const getTypeStyles = (type: string) => {
    const styles = {
      info: {
        bg: 'bg-blue-50 dark:bg-blue-900/20',
        border: 'border-blue-200 dark:border-blue-800',
        text: 'text-blue-800 dark:text-blue-300',
        icon: 'text-blue-500'
      },
      success: {
        bg: 'bg-green-50 dark:bg-green-900/20',
        border: 'border-green-200 dark:border-green-800',
        text: 'text-green-800 dark:text-green-300',
        icon: 'text-green-500'
      },
      warning: {
        bg: 'bg-yellow-50 dark:bg-yellow-900/20',
        border: 'border-yellow-200 dark:border-yellow-800',
        text: 'text-yellow-800 dark:text-yellow-300',
        icon: 'text-yellow-500'
      },
      error: {
        bg: 'bg-red-50 dark:bg-red-900/20',
        border: 'border-red-200 dark:border-red-800',
        text: 'text-red-800 dark:text-red-300',
        icon: 'text-red-500'
      }
    }
    return styles[type as keyof typeof styles] || styles.info
  }

  const getPriorityIndicator = (priority: string) => {
    const colors = {
      high: 'bg-red-500',
      medium: 'bg-yellow-500',
      low: 'bg-green-500'
    }
    return colors[priority as keyof typeof colors] || colors.low
  }

  return (
    <div className="card p-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
          Company Announcements
        </h3>
        <Megaphone className="w-5 h-5 text-gray-400" />
      </div>

      <div className="space-y-4">
        {announcements.map((announcement, index) => {
          const styles = getTypeStyles(announcement.type)
          
          return (
            <motion.div
              key={announcement.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className={`
                ${styles.bg} ${styles.border} border rounded-lg p-4
                hover:shadow-md transition-all cursor-pointer
              `}
            >
              <div className="flex items-start space-x-3">
                {/* Icon */}
                <div className={`mt-0.5 ${styles.icon}`}>
                  <announcement.icon className="w-4 h-4" />
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-1">
                    <h4 className={`font-medium text-sm ${styles.text}`}>
                      {announcement.title}
                    </h4>
                    <div className="flex items-center space-x-2">
                      <div className={`w-2 h-2 rounded-full ${getPriorityIndicator(announcement.priority)}`} />
                      <span className="text-xs text-gray-500">
                        {announcement.date}
                      </span>
                    </div>
                  </div>
                  
                  <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">
                    {announcement.message}
                  </p>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="mt-3 flex items-center justify-end space-x-2">
                <button className="text-xs text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 transition-colors">
                  Dismiss
                </button>
                <button className={`text-xs font-medium ${styles.text} hover:underline`}>
                  Read More
                </button>
              </div>
            </motion.div>
          )
        })}
      </div>

      {/* View All Link */}
      <div className="mt-6 pt-4 border-t border-gray-200 dark:border-gray-700 text-center">
        <button className="text-sm text-primary-600 dark:text-primary-400 hover:text-primary-700 dark:hover:text-primary-300 font-medium">
          View All Announcements →
        </button>
      </div>

      {/* Quick Stats */}
      <div className="mt-4 grid grid-cols-3 gap-4 text-center text-xs">
        <div>
          <div className="font-semibold text-gray-900 dark:text-white">4</div>
          <div className="text-gray-500">Active</div>
        </div>
        <div>
          <div className="font-semibold text-gray-900 dark:text-white">2</div>
          <div className="text-gray-500">High Priority</div>
        </div>
        <div>
          <div className="font-semibold text-gray-900 dark:text-white">12</div>
          <div className="text-gray-500">This Month</div>
        </div>
      </div>
    </div>
  )
}
