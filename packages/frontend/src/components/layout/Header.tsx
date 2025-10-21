'use client'
export const dynamic = 'force-dynamic';
import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useAuth } from '@/hooks/useAuth'
import { useTheme } from '@/components/providers/ThemeProvider'
import { PageType } from './DashboardLayout'
import { 
  Menu,
  Search,
  Bell,
  Sun,
  Moon,
  Monitor,
  ChevronDown,
  User,
  LogOut,
  Mail,
  Phone,
  Save,
  X,
  Edit,
  Building,
  Briefcase
} from 'lucide-react'
import { supabase } from '@/config/supabase'

interface HeaderProps {
  onSidebarToggle: () => void
  currentPage: PageType
  onSearch?: (query: string) => void
}

interface Employee {
  id: string
  name: string
  email: string
  phone: string | null
  department: string | null
  position: string | null
  role: string
}

const pageLabels = {
  dashboard: 'Dashboard',
  employees: 'Employee Directory',
  recruitment: 'Recruitment',
  payroll: 'Payroll',
  leaves: 'Leave Management',
  attendance: 'Attendance',
  performance: 'Performance',
  reports: 'Reports',
 
}

export default function Header({ onSidebarToggle, currentPage, onSearch }: HeaderProps) {
  const { user, logout } = useAuth()
  const { theme, setTheme, resolvedTheme } = useTheme()
  const [searchQuery, setSearchQuery] = useState('')
  const [showProfileMenu, setShowProfileMenu] = useState(false)
  const [showThemeMenu, setShowThemeMenu] = useState(false)
  const [showProfileView, setShowProfileView] = useState(false)
  const [employee, setEmployee] = useState<Employee | null>(null)
  const [isEditing, setIsEditing] = useState(false)
  const [editForm, setEditForm] = useState({
    name: '',
    email: '',
    phone: '',
    department: '',
    position: ''
  })
  const [loading, setLoading] = useState(false)

  // // Mock notifications
  // const notifications: Array<{
  //   id: string
  //   title: string
  //   message: string
  //   time: string
  //   type: 'success' | 'info' | 'warning' | 'error'
  //   unread: boolean
  // }> = [
  //   {
  //     id: '1',
  //     title: 'Leave Request Approved',
  //     message: 'Your vacation leave for next week has been approved.',
  //     time: '2 min ago',
  //     type: 'success',
  //     unread: true
  //   },
  //   {
  //     id: '2',
  //     title: 'New Job Application',
  //     message: 'Sarah Johnson applied for Frontend Developer position.',
  //     time: '15 min ago',
  //     type: 'info',
  //     unread: true
  //   },
  //   {
  //     id: '3',
  //     title: 'Payroll Processed',
  //     message: 'Monthly payroll has been processed successfully.',
  //     time: '1 hour ago',
  //     type: 'success',
  //     unread: false
  //   }
  // ]

  // const unreadCount = notifications.filter(n => n.unread).length

  // Fetch employee data
  useEffect(() => {
    if (user?.email && showProfileView) {
      fetchEmployeeData()
    }
  }, [user?.email, showProfileView])

  const fetchEmployeeData = async () => {
    try {
      setLoading(true)
      const { data, error } = await supabase
        .from('employees')
        .select('id, name, email, phone, department, position, role')
        .eq('email', user?.email)
        .single()

      if (error) throw error

      if (data) {
        setEmployee(data)
        setEditForm({
          name: data.name,
          email: data.email,
          phone: data.phone || '',
          department: data.department || '',
          position: data.position || ''
        })
      }
    } catch (error) {
      console.error('Error fetching employee data:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSaveProfile = async () => {
    if (!employee) return

    try {
      setLoading(true)
      const { error } = await supabase
        .from('employees')
        .update({
          name: editForm.name,
          phone: editForm.phone,
          department: editForm.department,
          position: editForm.position,
          updated_at: new Date().toISOString()
        })
        .eq('id', employee.id)

      if (error) throw error

      setEmployee(prev => prev ? { ...prev, ...editForm } : null)
      setIsEditing(false)
    } catch (error) {
      console.error('Error updating profile:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleThemeChange = (newTheme: 'light' | 'dark' | 'system') => {
    setTheme(newTheme)
    setShowThemeMenu(false)
  }

  const handleLogout = () => {
    logout()
    setShowProfileMenu(false)
  }

  const handleSearch = (query: string) => {
    setSearchQuery(query)
    onSearch?.(query)
  }

  const getThemeIcon = () => {
    if (theme === 'system') return <Monitor className="w-4 h-4" />
    if (theme === 'dark') return <Moon className="w-4 h-4" />
    return <Sun className="w-4 h-4" />
  }

  return (
    <>
      <header className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-4 lg:px-6 py-4">
        <div className="flex items-center justify-between">
          {/* Left Side */}
          <div className="flex items-center space-x-4">
            {/* Mobile Menu Button */}
            <button
              onClick={onSidebarToggle}
              className="lg:hidden p-2 rounded-lg text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
            >
              <Menu className="w-5 h-5" />
            </button>

            {/* Page Title */}
            <div>
              <h1 className="text-xl lg:text-2xl font-bold text-gray-900 dark:text-white">
                {pageLabels[currentPage as keyof typeof pageLabels]}
              </h1>
              <p className="text-sm text-gray-500 dark:text-gray-400 hidden sm:block">
                Welcome back, {user?.name}!
              </p>
            </div>
          </div>

          {/* Center - Search */}
          <div className="hidden md:flex flex-1 max-w-md mx-8">
            <div className="relative w-full">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                type="text"
                placeholder="Search employees, documents..."
                value={searchQuery}
                onChange={(e) => handleSearch(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all"
              />
            </div>
          </div>

          {/* Right Side */}
          <div className="flex items-center space-x-2">
            {/* Theme Toggle */}
            <div className="relative">
              <button
                onClick={() => setShowThemeMenu(!showThemeMenu)}
                className="p-2 rounded-lg text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
              >
                {getThemeIcon()}
              </button>

              <AnimatePresence>
                {showThemeMenu && (
                  <>
                    <div 
                      className="fixed inset-0 z-10" 
                      onClick={() => setShowThemeMenu(false)}
                    />
                    <motion.div
                      initial={{ opacity: 0, scale: 0.95, y: -10 }}
                      animate={{ opacity: 1, scale: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.95, y: -10 }}
                      className="absolute right-0 top-full mt-2 w-48 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 py-2 z-20"
                    >
                      {[
                        { value: 'light', label: 'Light', icon: Sun },
                        { value: 'dark', label: 'Dark', icon: Moon },
                        { value: 'system', label: 'System', icon: Monitor }
                      ].map((option) => (
                        <button
                          key={option.value}
                          onClick={() => handleThemeChange(option.value as any)}
                          className={`w-full flex items-center px-4 py-2 text-sm hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors ${
                            theme === option.value ? 'text-primary-600 dark:text-primary-400' : 'text-gray-700 dark:text-gray-300'
                          }`}
                        >
                          <option.icon className="w-4 h-4 mr-3" />
                          {option.label}
                        </button>
                      ))}
                    </motion.div>
                  </>
                )}
              </AnimatePresence>
            </div>

            {/* Profile Menu */}
            <div className="relative">
              <button
                onClick={() => setShowProfileMenu(!showProfileMenu)}
                className="flex items-center space-x-2 p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
              >
                <img
                  src={user?.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(user?.name || 'User')}&background=14b8a6&color=fff`}
                  alt={user?.name}
                  className="w-8 h-8 rounded-full"
                />
                <div className="hidden sm:block text-left">
                  <p className="text-sm font-medium text-gray-900 dark:text-white">
                    {user?.name}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400 capitalize">
                    {user?.role === 'hr' ? 'HR' : user?.role}
                  </p>
                </div>
                <ChevronDown className="w-4 h-4 text-gray-500" />
              </button>

              <AnimatePresence>
                {showProfileMenu && (
                  <>
                    <div 
                      className="fixed inset-0 z-10" 
                      onClick={() => setShowProfileMenu(false)}
                    />
                    <motion.div
                      initial={{ opacity: 0, scale: 0.95, y: -10 }}
                      animate={{ opacity: 1, scale: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.95, y: -10 }}
                      className="absolute right-0 top-full mt-2 w-48 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 py-2 z-20"
                    >
                      <button 
                        onClick={() => {
                          setShowProfileView(true)
                          setShowProfileMenu(false)
                        }}
                        className="w-full flex items-center px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                      >
                        <User className="w-4 h-4 mr-3" />
                        My Profile
                      </button>
                      <hr className="my-2 border-gray-200 dark:border-gray-700" />
                      <button 
                        onClick={handleLogout}
                        className="w-full flex items-center px-4 py-2 text-sm text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                      >
                        <LogOut className="w-4 h-4 mr-3" />
                        Logout
                      </button>
                    </motion.div>
                  </>
                )}
              </AnimatePresence>
            </div>
          </div>
        </div>
      </header>

      {/* Profile View Side Panel */}
      <AnimatePresence>
        {showProfileView && (
          <>
            <div 
              className="fixed inset-0 bg-black bg-opacity-50 z-40"
              onClick={() => setShowProfileView(false)}
            />
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 30, stiffness: 300 }}
              className="fixed right-0 top-0 h-full w-96 bg-gradient-to-br from-white to-gray-50 dark:from-gray-800 dark:to-gray-900 shadow-2xl z-50 border-l border-gray-200 dark:border-gray-700"
            >
              <div className="flex flex-col h-full">
                {/* Header */}
                <div className="p-6 border-b border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800">
                  <div className="flex items-center justify-between">
                    <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                      My Profile
                    </h2>
                    <button
                      onClick={() => setShowProfileView(false)}
                      className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                    >
                      <X className="w-5 h-5 text-gray-500" />
                    </button>
                  </div>
                </div>

                {/* Content */}
                <div className="flex-1 overflow-y-auto p-6">
                  {loading ? (
                    <div className="flex items-center justify-center h-32">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-500"></div>
                    </div>
                  ) : employee ? (
                    <div className="space-y-6">
                      {/* Profile Header */}
                      <div className="text-center">
                        <div className="w-20 h-20 bg-gradient-to-r from-primary-500 to-primary-600 rounded-full flex items-center justify-center mx-auto mb-4">
                          <span className="text-2xl font-bold text-white">
                            {employee.name.split(' ').map(n => n[0]).join('')}
                          </span>
                        </div>
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-1">
                          {employee.name}
                        </h3>
                        <p className="text-sm text-gray-500 dark:text-gray-400 capitalize">
                          {employee.role}
                        </p>
                      </div>

                      {/* Edit/Save Buttons */}
                      <div className="flex justify-end">
                        {!isEditing ? (
                          <button
                            onClick={() => setIsEditing(true)}
                            className="flex items-center px-4 py-2 text-sm bg-primary-500 hover:bg-primary-600 text-white rounded-lg transition-colors"
                          >
                            <Edit className="w-4 h-4 mr-2" />
                            Edit Profile
                          </button>
                        ) : (
                          <div className="flex space-x-2">
                            <button
                              onClick={() => {
                                setIsEditing(false)
                                setEditForm({
                                  name: employee.name,
                                  email: employee.email,
                                  phone: employee.phone || '',
                                  department: employee.department || '',
                                  position: employee.position || ''
                                })
                              }}
                              className="flex items-center px-4 py-2 text-sm border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                            >
                              <X className="w-4 h-4 mr-2" />
                              Cancel
                            </button>
                            <button
                              onClick={handleSaveProfile}
                              disabled={loading}
                              className="flex items-center px-4 py-2 text-sm bg-primary-500 hover:bg-primary-600 text-white rounded-lg transition-colors disabled:opacity-50"
                            >
                              <Save className="w-4 h-4 mr-2" />
                              {loading ? 'Saving...' : 'Save Changes'}
                            </button>
                          </div>
                        )}
                      </div>

                      {/* Profile Information */}
                      <div className="space-y-4">
                        {/* Name */}
                        <div>
                          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                            Full Name
                          </label>
                          {isEditing ? (
                            <input
                              type="text"
                              value={editForm.name}
                              onChange={(e) => setEditForm(prev => ({ ...prev, name: e.target.value }))}
                              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                            />
                          ) : (
                            <p className="text-gray-900 dark:text-white">{employee.name}</p>
                          )}
                        </div>

                        {/* Email */}
                        <div>
                          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                            <Mail className="w-4 h-4 inline mr-2" />
                            Email Address
                          </label>
                          <p className="text-gray-900 dark:text-white">{employee.email}</p>
                        </div>

                        {/* Phone */}
                        <div>
                          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                            <Phone className="w-4 h-4 inline mr-2" />
                            Phone Number
                          </label>
                          {isEditing ? (
                            <input
                              type="tel"
                              value={editForm.phone}
                              onChange={(e) => setEditForm(prev => ({ ...prev, phone: e.target.value }))}
                              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                            />
                          ) : (
                            <p className="text-gray-900 dark:text-white">{employee.phone || 'Not provided'}</p>
                          )}
                        </div>

                        {/* Department */}
                        <div>
                          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                            <Building className="w-4 h-4 inline mr-2" />
                            Department
                          </label>
                          {isEditing ? (
                            <input
                              type="text"
                              value={editForm.department}
                              onChange={(e) => setEditForm(prev => ({ ...prev, department: e.target.value }))}
                              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                            />
                          ) : (
                            <p className="text-gray-900 dark:text-white">{employee.department || 'Not assigned'}</p>
                          )}
                        </div>

                        {/* Position */}
                        <div>
                          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                            <Briefcase className="w-4 h-4 inline mr-2" />
                            Position
                          </label>
                          {isEditing ? (
                            <input
                              type="text"
                              value={editForm.position}
                              onChange={(e) => setEditForm(prev => ({ ...prev, position: e.target.value }))}
                              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                            />
                          ) : (
                            <p className="text-gray-900 dark:text-white">{employee.position || 'Not assigned'}</p>
                          )}
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <p className="text-gray-500 dark:text-gray-400">Unable to load profile data</p>
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  )
}