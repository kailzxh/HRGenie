'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { Clock, Calendar, TrendingUp, CheckCircle, MapPin, Users, AlertTriangle } from 'lucide-react'
import AttendanceSummaryWidget from '../widgets/AttendanceSummaryWidget'
import AttendanceCalendar from '@/components/widgets/AttendanceCalendar'
import RegularizationForm from '../widgets/RegularizationForm'
import RegularizationHistory from '../widgets/RegularizationHistory'
import { useAuth } from '@/hooks/useAuth'

export default function AttendancePage() {
  const { user } = useAuth()
  const [showRegularizeForm, setShowRegularizeForm] = useState(false)
  const [selectedDate, setSelectedDate] = useState<Date | null>(null)
  const [view, setView] = useState<'employee' | 'manager' | 'admin'>(
    user?.role === 'hr' ? 'admin' : (user?.role as 'employee' | 'manager' | 'admin') || 'employee'
  )

  const handleRegularize = (date: Date) => {
    setSelectedDate(date)
    setShowRegularizeForm(true)
  }

  return (
    <div className="space-y-6">
      {/* Header with Role Selector for Demo */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            Attendance Management
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            {view === 'employee'
              ? 'Track and manage your attendance'
              : view === 'manager'
              ? 'Monitor team attendance'
              : 'Company-wide attendance oversight'}
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
              <Clock className="w-4 h-4" />
              <span>Clock In/Out</span>
            </button>
          )}
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {view === 'employee' ? (
          <>
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="card p-6">
              <div className="flex items-center">
                <div className="w-12 h-12 bg-green-100 dark:bg-green-900/20 rounded-lg flex items-center justify-center">
                  <CheckCircle className="w-6 h-6 text-green-600 dark:text-green-400" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Present Days</p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">22</p>
                </div>
              </div>
            </motion.div>

            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="card p-6">
              <div className="flex items-center">
                <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/20 rounded-lg flex items-center justify-center">
                  <Clock className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Today's Hours</p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">6.5</p>
                </div>
              </div>
            </motion.div>

            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="card p-6">
              <div className="flex items-center">
                <div className="w-12 h-12 bg-yellow-100 dark:bg-yellow-900/20 rounded-lg flex items-center justify-center">
                  <AlertTriangle className="w-6 h-6 text-yellow-600 dark:text-yellow-400" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Pending Regularizations</p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">2</p>
                </div>
              </div>
            </motion.div>

            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="card p-6">
              <div className="flex items-center">
                <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900/20 rounded-lg flex items-center justify-center">
                  <MapPin className="w-6 h-6 text-purple-600 dark:text-purple-400" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Work Location</p>
                  <p className="text-sm font-bold text-gray-900 dark:text-white">Office</p>
                </div>
              </div>
            </motion.div>
          </>
        ) : (
          <>
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="card p-6">
              <div className="flex items-center">
                <div className="w-12 h-12 bg-green-100 dark:bg-green-900/20 rounded-lg flex items-center justify-center">
                  <Users className="w-6 h-6 text-green-600 dark:text-green-400" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Present Today</p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">45/50</p>
                </div>
              </div>
            </motion.div>

            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="card p-6">
              <div className="flex items-center">
                <div className="w-12 h-12 bg-yellow-100 dark:bg-yellow-900/20 rounded-lg flex items-center justify-center">
                  <Clock className="w-6 h-6 text-yellow-600 dark:text-yellow-400" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Late Today</p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">3</p>
                </div>
              </div>
            </motion.div>

            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="card p-6">
              <div className="flex items-center">
                <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/20 rounded-lg flex items-center justify-center">
                  <AlertTriangle className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Pending Requests</p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">5</p>
                </div>
              </div>
            </motion.div>

            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="card p-6">
              <div className="flex items-center">
                <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900/20 rounded-lg flex items-center justify-center">
                  <TrendingUp className="w-6 h-6 text-purple-600 dark:text-purple-400" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Avg Attendance</p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">92%</p>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column */}
        <div className="lg:col-span-2 space-y-6">
          <AttendanceCalendar onRegularize={handleRegularize} view={view} />
          {view === 'employee' && (
            <RegularizationHistory />
          )}
          {view === 'manager' && (
            <div className="card p-6">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Team Insights</h2>
              <div className="space-y-4">
                <div className="p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
                  <p className="text-green-700 dark:text-green-400">Team's average on-time arrival has improved by 12% this month</p>
                </div>
                <div className="p-4 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg">
                  <p className="text-yellow-700 dark:text-yellow-400">3 team members have been consistently late this week</p>
                </div>
              </div>
            </div>
          )}
          {view === 'admin' && (
            <div className="card p-6">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">System Alerts</h2>
              <div className="space-y-4">
                <div className="p-4 bg-red-50 dark:bg-red-900/20 rounded-lg">
                  <p className="text-red-700 dark:text-red-400">Potential proxy attendance detected in Bangalore office</p>
                </div>
                <div className="p-4 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg">
                  <p className="text-yellow-700 dark:text-yellow-400">Biometric device in Floor 2 needs maintenance</p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Right Column */}
        <div className="space-y-6">
          <AttendanceSummaryWidget />
          {showRegularizeForm && selectedDate && (
            <RegularizationForm
              date={selectedDate}
              onClose={() => setShowRegularizeForm(false)}
              onSubmit={(data) => {
                console.log('Regularization submitted:', data)
                setShowRegularizeForm(false)
              }}
            />
          )}
          {view === 'manager' && (
            <div className="card p-6">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Pending Approvals</h2>
              <div className="space-y-4">
                {/* Sample pending requests */}
                <div className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg">
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="font-medium">John Doe</p>
                      <p className="text-sm text-gray-600 dark:text-gray-400">Regularization for Oct 2</p>
                      <p className="text-xs text-gray-500">Reason: Client meeting ran late</p>
                    </div>
                    <div className="space-x-2">
                      <button className="px-3 py-1 bg-green-500 text-white rounded-md text-sm">
                        Approve
                      </button>
                      <button className="px-3 py-1 bg-red-500 text-white rounded-md text-sm">
                        Reject
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
          {view === 'admin' && (
            <div className="card p-6">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Quick Settings</h2>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm">Auto-approve regularizations</span>
                  <button className="w-10 h-6 bg-gray-200 rounded-full relative">
                    <div className="w-4 h-4 bg-white rounded-full absolute left-1 top-1"></div>
                  </button>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">Geo-fencing active</span>
                  <button className="w-10 h-6 bg-primary-500 rounded-full relative">
                    <div className="w-4 h-4 bg-white rounded-full absolute right-1 top-1"></div>
                  </button>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">Anomaly detection</span>
                  <button className="w-10 h-6 bg-primary-500 rounded-full relative">
                    <div className="w-4 h-4 bg-white rounded-full absolute right-1 top-1"></div>
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
