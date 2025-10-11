'use client'

import { motion } from 'framer-motion'
import { 
  TrendingUp, 
  TrendingDown, 
  Users, 
  UserPlus, 
  Briefcase, 
  Clock, 
  Calendar,
  CalendarCheck,
  Star,
  Target,
  Zap
} from 'lucide-react'

interface KPIWidgetProps {
  title: string
  value: string
  change: string
  trend: 'up' | 'down'
  icon: string
  color: 'blue' | 'green' | 'yellow' | 'purple' | 'red' | 'orange' | 'teal'
}

const iconMap = {
  users: Users,
  'user-plus': UserPlus,
  briefcase: Briefcase,
  clock: Clock,
  calendar: Calendar,
  'calendar-check': CalendarCheck,
  star: Star,
  target: Target,
  handshake: Zap,
  'trending-up': TrendingUp,
  'trending-down': TrendingDown,
}

const colorMap = {
  blue: {
    bg: 'bg-blue-50 dark:bg-blue-900/20',
    icon: 'text-blue-500',
    value: 'text-blue-600 dark:text-blue-400',
    border: 'border-blue-200 dark:border-blue-800'
  },
  green: {
    bg: 'bg-green-50 dark:bg-green-900/20',
    icon: 'text-green-500',
    value: 'text-green-600 dark:text-green-400',
    border: 'border-green-200 dark:border-green-800'
  },
  yellow: {
    bg: 'bg-yellow-50 dark:bg-yellow-900/20',
    icon: 'text-yellow-500',
    value: 'text-yellow-600 dark:text-yellow-400',
    border: 'border-yellow-200 dark:border-yellow-800'
  },
  purple: {
    bg: 'bg-purple-50 dark:bg-purple-900/20',
    icon: 'text-purple-500',
    value: 'text-purple-600 dark:text-purple-400',
    border: 'border-purple-200 dark:border-purple-800'
  },
  red: {
    bg: 'bg-red-50 dark:bg-red-900/20',
    icon: 'text-red-500',
    value: 'text-red-600 dark:text-red-400',
    border: 'border-red-200 dark:border-red-800'
  },
  orange: {
    bg: 'bg-orange-50 dark:bg-orange-900/20',
    icon: 'text-orange-500',
    value: 'text-orange-600 dark:text-orange-400',
    border: 'border-orange-200 dark:border-orange-800'
  },
  teal: {
    bg: 'bg-teal-50 dark:bg-teal-900/20',
    icon: 'text-teal-500',
    value: 'text-teal-600 dark:text-teal-400',
    border: 'border-teal-200 dark:border-teal-800'
  }
}

export default function KPIWidget({ title, value, change, trend, icon, color }: KPIWidgetProps) {
  const IconComponent = iconMap[icon as keyof typeof iconMap] || Users
  const colors = colorMap[color]
  const isPositive = trend === 'up'

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -5, transition: { duration: 0.2 } }}
      className={`
        card card-hover p-6 ${colors.bg} ${colors.border}
        relative overflow-hidden
      `}
    >
      {/* Background Pattern */}
      <div className="absolute top-0 right-0 w-32 h-32 opacity-5">
        <div className={`w-full h-full ${colors.icon} transform rotate-12 scale-150`}>
          <IconComponent className="w-full h-full" />
        </div>
      </div>

      <div className="relative z-10">
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <div className={`p-3 rounded-lg ${colors.bg} border ${colors.border}`}>
            <IconComponent className={`w-6 h-6 ${colors.icon}`} />
          </div>
          <div className={`flex items-center text-sm font-medium ${isPositive ? 'text-green-600' : 'text-red-600'}`}>
            {isPositive ? (
              <TrendingUp className="w-4 h-4 mr-1" />
            ) : (
              <TrendingDown className="w-4 h-4 mr-1" />
            )}
            {change}
          </div>
        </div>

        {/* Content */}
        <div>
          <p className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">
            {title}
          </p>
          <p className={`text-2xl font-bold ${colors.value}`}>
            {value}
          </p>
        </div>

        {/* Progress Indicator */}
        <div className="mt-4">
          <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-1">
            <div 
              className={`h-1 rounded-full ${colors.icon.replace('text-', 'bg-')} transition-all duration-1000`}
              style={{ width: `${Math.min(Math.abs(parseFloat(change)), 100)}%` }}
            />
          </div>
        </div>
      </div>
    </motion.div>
  )
}
