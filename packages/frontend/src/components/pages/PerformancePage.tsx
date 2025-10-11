'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { 
  Target, 
  TrendingUp, 
  Award, 
  Users, 
  ChevronRight, 
  MessageCircle, 
  FileText,
  Star,
  PieChart,
  Settings,
  BookOpen,
  AlertTriangle
} from 'lucide-react'
import { useAuth } from '@/hooks/useAuth'
import GoalsWidget from '../widgets/performance/GoalsWidget'
import FeedbackWidget from '../widgets/performance/FeedbackWidget'
import SkillsRadarChart from '../widgets/performance/SkillsRadarChart'
import ReviewsWidget from '../widgets/performance/ReviewsWidget'
import TeamOverview from '../widgets/performance/TeamOverview'
import PerformanceCalibration from '../widgets/performance/PerformanceCalibration'
import BiasDetectionAlert from '../widgets/performance/BiasDetectionAlert'

export default function PerformancePage() {
  const { user } = useAuth()
  const [view, setView] = useState<'employee' | 'manager' | 'admin'>(
    user?.role === 'hr' ? 'admin' : (user?.role as 'employee' | 'manager' | 'admin') || 'employee'
  )
  const [activeTab, setActiveTab] = useState('goals')

  const stats = {
    employee: [
      { label: 'Goals Completed', value: '85%', icon: Target, color: 'blue' },
      { label: 'Performance Score', value: '8.5/10', icon: Award, color: 'green' },
      { label: 'Skills Growth', value: '+15%', icon: TrendingUp, color: 'purple' },
      { label: 'Review Status', value: 'In Progress', icon: FileText, color: 'yellow' }
    ],
    manager: [
      { label: 'Team Goals Met', value: '78%', icon: Target, color: 'blue' },
      { label: 'Reviews Due', value: '5', icon: FileText, color: 'yellow' },
      { label: 'High Performers', value: '4', icon: Star, color: 'green' },
      { label: 'Need Support', value: '2', icon: AlertTriangle, color: 'red' }
    ],
    admin: [
      { label: 'Overall Score', value: '7.9/10', icon: Award, color: 'blue' },
      { label: 'Review Completion', value: '65%', icon: FileText, color: 'green' },
      { label: 'Bias Alerts', value: '3', icon: AlertTriangle, color: 'red' },
      { label: 'Top Performers', value: '12%', icon: Star, color: 'yellow' }
    ]
  }

  const tabs = {
    employee: [
      { id: 'goals', label: 'My Goals', icon: Target },
      { id: 'feedback', label: 'Feedback', icon: MessageCircle },
      { id: 'skills', label: 'Skills Profile', icon: BookOpen },
      { id: 'reviews', label: 'Reviews', icon: FileText }
    ],
    manager: [
      { id: 'team', label: 'Team Overview', icon: Users },
      { id: 'goals', label: 'Goals Management', icon: Target },
      { id: 'reviews', label: 'Reviews', icon: FileText },
      { id: 'analytics', label: 'Analytics', icon: PieChart }
    ],
    admin: [
      { id: 'overview', label: 'Organization Overview', icon: PieChart },
      { id: 'calibration', label: 'Calibration', icon: Target },
      { id: 'cycles', label: 'Review Cycles', icon: FileText },
      { id: 'settings', label: 'Settings', icon: Settings }
    ]
  }

  return (
    <div className="space-y-6">
      {/* Header with Role Selector */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Performance Management</h1>
          <p className="text-gray-600 dark:text-gray-400">
            {view === 'employee' 
              ? 'Track your growth and achievements'
              : view === 'manager'
              ? 'Manage team performance and development'
              : 'Organizational performance oversight'}
          </p>
        </div>
        <div className="flex items-center space-x-4">
          <select
            className="form-select"
            value={view}
            onChange={(e) => setView(e.target.value as 'employee' | 'manager' | 'admin')}
          >
            <option value="employee">Employee View</option>
            <option value="manager">Manager View</option>
            <option value="admin">Admin View</option>
          </select>
          {view === 'employee' && (
            <button className="flex items-center space-x-2 px-4 py-2 bg-primary-500 hover:bg-primary-600 text-white rounded-lg">
              <Target className="w-4 h-4" />
              <span>Set New Goal</span>
            </button>
          )}
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {stats[view].map((stat, index) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className="card p-6"
          >
            <div className="flex items-center">
              <div className={`w-12 h-12 bg-${stat.color}-100 dark:bg-${stat.color}-900/20 rounded-lg flex items-center justify-center`}>
                <stat.icon className={`w-6 h-6 text-${stat.color}-600 dark:text-${stat.color}-400`} />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">{stat.label}</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">{stat.value}</p>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Navigation Tabs */}
      <div className="border-b border-gray-200 dark:border-gray-700">
        <nav className="-mb-px flex space-x-8">
          {tabs[view].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`
                flex items-center px-1 py-4 border-b-2 font-medium text-sm
                ${activeTab === tab.id
                  ? 'border-primary-500 text-primary-600 dark:text-primary-400'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300'}
              `}
            >
              <tab.icon className="w-5 h-5 mr-2" />
              {tab.label}
            </button>
          ))}
        </nav>
      </div>

      {/* Main Content Area */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column - Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {view === 'employee' && (
            <>
              {activeTab === 'goals' && <GoalsWidget />}
              {activeTab === 'feedback' && <FeedbackWidget />}
              {activeTab === 'skills' && <SkillsRadarChart />}
              {activeTab === 'reviews' && <ReviewsWidget />}
            </>
          )}
          
          {view === 'manager' && (
            <>
              {activeTab === 'team' && <TeamOverview />}
              {activeTab === 'goals' && <GoalsWidget isManager />}
              {activeTab === 'reviews' && <ReviewsWidget isManager />}
              {activeTab === 'analytics' && (
                <div className="card p-6">
                  <h3 className="text-lg font-semibold mb-4">Team Analytics</h3>
                  <div className="text-center py-12 text-gray-500">
                    Team performance analytics coming soon...
                  </div>
                </div>
              )}
            </>
          )}
          
          {view === 'admin' && (
            <>
              {activeTab === 'overview' && (
                <div className="space-y-6">
                  <div className="card p-6">
                    <h3 className="text-lg font-semibold mb-4">Organization Performance</h3>
                    <div className="grid grid-cols-2 gap-4">
                      {/* Sample charts and metrics */}
                    </div>
                  </div>
                  <BiasDetectionAlert />
                </div>
              )}
              {activeTab === 'calibration' && <PerformanceCalibration />}
              {activeTab === 'cycles' && (
                <div className="card p-6">
                  <h3 className="text-lg font-semibold mb-4">Review Cycles</h3>
                  <div className="space-y-4">
                    {/* Review cycles management interface */}
                  </div>
                </div>
              )}
              {activeTab === 'settings' && (
                <div className="card p-6">
                  <h3 className="text-lg font-semibold mb-4">Performance Settings</h3>
                  <div className="space-y-4">
                    {/* Configuration options */}
                  </div>
                </div>
              )}
            </>
          )}
        </div>

        {/* Right Column - Supplementary Content */}
        <div className="space-y-6">
          {view === 'employee' && (
            <>
              <div className="card p-6">
                <h3 className="text-lg font-semibold mb-4">Quick Actions</h3>
                <div className="space-y-2">
                  <button className="w-full text-left px-4 py-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 flex items-center">
                    <MessageCircle className="w-5 h-5 mr-2" />
                    Request Feedback
                  </button>
                  <button className="w-full text-left px-4 py-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 flex items-center">
                    <Target className="w-5 h-5 mr-2" />
                    Update Goal Progress
                  </button>
                  <button className="w-full text-left px-4 py-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 flex items-center">
                    <FileText className="w-5 h-5 mr-2" />
                    View Last Review
                  </button>
                </div>
              </div>
              <div className="card p-6">
                <h3 className="text-lg font-semibold mb-4">Development Tips</h3>
                <div className="space-y-4 text-sm">
                  <p className="text-gray-600 dark:text-gray-400">
                    💡 Based on your current goals, consider focusing on leadership skills
                  </p>
                  <p className="text-gray-600 dark:text-gray-400">
                    📈 Your technical skills show strong growth. Keep it up!
                  </p>
                </div>
              </div>
            </>
          )}

          {view === 'manager' && (
            <>
              <div className="card p-6">
                <h3 className="text-lg font-semibold mb-4">Action Items</h3>
                <div className="space-y-4">
                  <div className="p-4 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg">
                    <p className="text-yellow-700 dark:text-yellow-400">
                      5 performance reviews pending
                    </p>
                  </div>
                  <div className="p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
                    <p className="text-green-700 dark:text-green-400">
                      Team achieving 78% of Q4 goals
                    </p>
                  </div>
                </div>
              </div>
              <div className="card p-6">
                <h3 className="text-lg font-semibold mb-4">AI Insights</h3>
                <div className="space-y-4 text-sm">
                  <p className="text-gray-600 dark:text-gray-400">
                    🎯 3 team members might need help with their current goals
                  </p>
                  <p className="text-gray-600 dark:text-gray-400">
                    ⭐ Consider nominating Sarah for the quarterly award
                  </p>
                </div>
              </div>
            </>
          )}

          {view === 'admin' && (
            <>
              <div className="card p-6">
                <h3 className="text-lg font-semibold mb-4">System Health</h3>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Review Cycle Progress</span>
                    <div className="w-32 h-2 bg-gray-200 rounded-full overflow-hidden">
                      <div className="w-2/3 h-full bg-primary-500"></div>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Data Quality</span>
                    <div className="w-32 h-2 bg-gray-200 rounded-full overflow-hidden">
                      <div className="w-4/5 h-full bg-green-500"></div>
                    </div>
                  </div>
                </div>
              </div>
              <div className="card p-6">
                <h3 className="text-lg font-semibold mb-4">AI Reports</h3>
                <div className="space-y-4 text-sm">
                  <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                    <p className="text-blue-700 dark:text-blue-400">
                      Performance distribution shows healthy bell curve
                    </p>
                  </div>
                  <div className="p-4 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
                    <p className="text-purple-700 dark:text-purple-400">
                      Skills gap analysis complete for Q4
                    </p>
                  </div>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
