'use client'
export const dynamic = 'force-dynamic';
import { motion } from 'framer-motion'
import { useAuth } from '@/hooks/useAuth'
import { 
  Calendar, 
  FileText, 
  Clock, 
  Users, 
  Plus, 
  Download,
  Upload,
  Settings
} from 'lucide-react'

export default function QuickActionsWidget() {
  const { user } = useAuth()

  const getQuickActions = () => {
    switch (user?.role) {
      case 'admin':
        return [
          { icon: Plus, label: 'Add Employee', color: 'bg-blue-500', action: () => alert('Add Employee functionality') },
          { icon: FileText, label: 'Generate Report', color: 'bg-green-500', action: () => alert('Generate Report functionality') },
          { icon: Settings, label: 'System Settings', color: 'bg-purple-500', action: () => alert('System Settings functionality') },
          { icon: Download, label: 'Export Data', color: 'bg-orange-500', action: () => alert('Export Data functionality') }
        ]

      case 'hr':
        return [
          { icon: Plus, label: 'Post Job', color: 'bg-purple-500', action: () => alert('Post Job functionality') },
          { icon: Users, label: 'Review Applications', color: 'bg-blue-500', action: () => alert('Review Applications functionality') },
          { icon: Calendar, label: 'Schedule Interview', color: 'bg-green-500', action: () => alert('Schedule Interview functionality') },
          { icon: FileText, label: 'HR Reports', color: 'bg-orange-500', action: () => alert('HR Reports functionality') }
        ]

      case 'manager':
        return [
          { icon: Calendar, label: 'Approve Leaves', color: 'bg-green-500', action: () => alert('Approve Leaves functionality') },
          { icon: Users, label: 'Team Overview', color: 'bg-blue-500', action: () => alert('Team Overview functionality') },
          { icon: FileText, label: 'Performance Review', color: 'bg-purple-500', action: () => alert('Performance Review functionality') },
          { icon: Clock, label: 'Attendance Report', color: 'bg-orange-500', action: () => alert('Attendance Report functionality') }
        ]

      case 'employee':
      default:
        return [
          { icon: Calendar, label: 'Apply for Leave', color: 'bg-green-500', action: () => alert('Apply for Leave functionality') },
          { icon: FileText, label: 'View Payslip', color: 'bg-blue-500', action: () => alert('View Payslip functionality') },
          { icon: Clock, label: 'Mark Attendance', color: 'bg-purple-500', action: () => alert('Mark Attendance functionality') },
          { icon: Upload, label: 'Submit Document', color: 'bg-orange-500', action: () => alert('Submit Document functionality') }
        ]
    }
  }

  const quickActions = getQuickActions()

  return (
    <div className="card p-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
          Quick Actions
        </h3>
        <div className="w-2 h-2 bg-primary-500 rounded-full"></div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        {quickActions.map((action, index) => (
          <motion.button
            key={action.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={action.action}
            className="flex flex-col items-center p-4 rounded-lg border border-gray-200 dark:border-gray-700 hover:border-primary-300 dark:hover:border-primary-600 hover:bg-primary-50 dark:hover:bg-primary-900/10 transition-all group"
          >
            <div className={`
              w-12 h-12 ${action.color} rounded-lg flex items-center justify-center mb-3
              group-hover:scale-110 transition-transform
            `}>
              <action.icon className="w-6 h-6 text-white" />
            </div>
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300 text-center">
              {action.label}
            </span>
          </motion.button>
        ))}
      </div>

      <div className="mt-6 pt-4 border-t border-gray-200 dark:border-gray-700">
        <button className="w-full text-sm text-primary-600 dark:text-primary-400 hover:text-primary-700 dark:hover:text-primary-300 font-medium">
          View all actions →
        </button>
      </div>
    </div>
  )
}
