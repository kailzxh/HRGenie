'use client'

import { motion, AnimatePresence } from 'framer-motion'
import { useState, useEffect } from 'react'
import { useAuth } from '@/hooks/useAuth'
import { PageType } from './DashboardLayout'
import { 
  Building2,
  LayoutDashboard,
  Users,
  Briefcase,
  CreditCard,
  Calendar,
  Clock,
  TrendingUp,
  BarChart3,
  Settings,
  LogOut,
  ChevronLeft,
  ChevronRight
} from 'lucide-react'

interface SidebarProps {
  currentPage: PageType
  onPageChange: (page: PageType) => void
  isOpen: boolean
  onToggle: () => void
  isCollapsed: boolean
  onCollapsedChange: (collapsed: boolean) => void
}

const menuItems = [
  { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard, color: 'text-blue-500' },
  { id: 'employees', label: 'Employee Directory', icon: Users, color: 'text-green-500' },
  { id: 'recruitment', label: 'Recruitment', icon: Briefcase, color: 'text-purple-500' },
  { id: 'payroll', label: 'Payroll', icon: CreditCard, color: 'text-yellow-500' },
  { id: 'leaves', label: 'Leave Management', icon: Calendar, color: 'text-orange-500' },
  { id: 'attendance', label: 'Attendance', icon: Clock, color: 'text-teal-500' },
  { id: 'performance', label: 'Performance', icon: TrendingUp, color: 'text-pink-500' },
  { id: 'reports', label: 'Reports & Analytics', icon: BarChart3, color: 'text-indigo-500' },
] as const

export default function Sidebar({ currentPage, onPageChange, isOpen, onToggle, isCollapsed, onCollapsedChange }: SidebarProps) {
  const { user, logout } = useAuth()
  const [isHovered, setIsHovered] = useState(false)
  const [isMobileDevice, setIsMobileDevice] = useState(false)

  // Check if we're on a mobile device
  useEffect(() => {
    const checkMobile = () => {
      const isMobile = window.innerWidth < 1024 || /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)
      console.log('Mobile detection:', { 
        windowWidth: window.innerWidth, 
        userAgent: navigator.userAgent, 
        isMobile 
      })
      setIsMobileDevice(isMobile)
    }
    
    checkMobile()
    window.addEventListener('resize', checkMobile)
    return () => window.removeEventListener('resize', checkMobile)
  }, [])

  const handleLogout = () => {
    logout()
  }

  // Filter menu items based on user role
  const getFilteredMenuItems = () => {
    if (!user) return [...menuItems]

    const rolePermissions = {
      admin: [...menuItems],
      hr: menuItems.filter(item => ['dashboard', 'employees', 'recruitment', 'leaves', 'reports'].includes(item.id)),
      manager: menuItems.filter(item => ['dashboard', 'employees', 'leaves', 'attendance', 'performance', 'reports'].includes(item.id)),
      employee: menuItems.filter(item => ['dashboard', 'leaves', 'attendance', 'performance'].includes(item.id))
    }

    return rolePermissions[user.role] || [...menuItems]
  }

  const filteredMenuItems = getFilteredMenuItems()

  // Determine if we should show expanded content (either not collapsed or hovered)
  const showExpanded = !isCollapsed || isHovered

  return (
    <>
      {/* Desktop Sidebar - only visible on desktop */}
      {!isMobileDevice && (
        <motion.div 
          className="flex flex-col fixed inset-y-0 z-50 bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 overflow-x-hidden"
          animate={{ 
            width: showExpanded ? 256 : 80 
          }}
          transition={{ duration: 0.3, ease: "easeInOut" }}
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
        >
          <SidebarContent 
            currentPage={currentPage}
            onPageChange={onPageChange}
            menuItems={filteredMenuItems}
            user={user}
            onLogout={handleLogout}
            isCollapsed={isCollapsed}
            showExpanded={showExpanded}
            onToggleCollapse={() => onCollapsedChange(!isCollapsed)}
            isMobile={false}
          />
        </motion.div>
      )}

      {/* Mobile Sidebar - only visible on mobile and when isOpen is true */}
      {isMobileDevice && (
        <AnimatePresence>
          {isOpen && (
            <motion.div
              initial={{ x: -320 }}
              animate={{ x: 0 }}
              exit={{ x: -320 }}
              transition={{ type: 'spring', stiffness: 300, damping: 30 }}
              className="fixed inset-y-0 left-0 z-[60] w-64 bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700"
              style={{ touchAction: 'pan-y' }}
            >
              <SidebarContent 
                currentPage={currentPage}
                onPageChange={(page) => {
                  onPageChange(page)
                  onToggle()
                }}
                menuItems={filteredMenuItems}
                user={user}
                onLogout={handleLogout}
                isCollapsed={false}
                showExpanded={true}
                onToggleCollapse={() => {}}
                isMobile={true}
              />
            </motion.div>
          )}
        </AnimatePresence>
      )}
    </>
  )
}

interface SidebarContentProps {
  currentPage: PageType
  onPageChange: (page: PageType) => void
  menuItems: Array<{
    id: string
    label: string
    icon: any
    color: string
  }>
  user: any
  onLogout: () => void
  isCollapsed: boolean
  showExpanded: boolean
  onToggleCollapse: () => void
  isMobile: boolean
}

function SidebarContent({ currentPage, onPageChange, menuItems, user, onLogout, isCollapsed, showExpanded, onToggleCollapse, isMobile }: SidebarContentProps) {
  return (
    <div className="flex flex-col h-full overflow-x-hidden">
      {/* Logo and Toggle */}
      <div className="flex items-center justify-between h-16 px-4 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center space-x-2">
          <div className="w-8 h-8 bg-primary-500 rounded-lg flex items-center justify-center">
            <Building2 className="w-5 h-5 text-white" />
          </div>
          {showExpanded && (
            <motion.span 
              initial={{ opacity: 0, width: 0 }}
              animate={{ opacity: 1, width: "auto" }}
              exit={{ opacity: 0, width: 0 }}
              className="text-xl font-bold text-gray-900 dark:text-white whitespace-nowrap"
            >
              HRGenie
            </motion.span>
          )}
        </div>
        
        {/* Toggle Button - only show on desktop */}
        {!isMobile && (
          <motion.button
            onClick={onToggleCollapse}
            className="flex items-center justify-center w-8 h-8 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            {isCollapsed ? (
              <ChevronRight className="w-4 h-4 text-gray-500" />
            ) : (
              <ChevronLeft className="w-4 h-4 text-gray-500" />
            )}
          </motion.button>
        )}
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-4 py-4 space-y-2 overflow-y-auto overflow-x-hidden">
        {menuItems.map((item) => (
          <div key={item.id} className="relative group">
            <motion.button
              onClick={() => onPageChange(item.id as PageType)}
              whileHover={{ scale: isMobile ? 1 : 1.02 }}
              whileTap={{ scale: 0.98 }}
              className={`
                w-full flex items-center px-3 py-2.5 rounded-lg text-left transition-all
                ${isMobile ? 'min-h-[48px]' : ''} 
                ${currentPage === item.id
                  ? 'bg-primary-50 dark:bg-primary-900/20 text-primary-600 dark:text-primary-400 border-l-4 border-primary-500'
                  : 'text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700'
                }
                ${!showExpanded ? 'justify-center' : ''}
              `}
              style={{ touchAction: 'manipulation' }}
            >
              <item.icon className={`w-5 h-5 ${!showExpanded ? '' : 'mr-3'} ${currentPage === item.id ? 'text-primary-500' : item.color}`} />
              {showExpanded && (
                <motion.span 
                  initial={{ opacity: 0, width: 0 }}
                  animate={{ opacity: 1, width: "auto" }}
                  exit={{ opacity: 0, width: 0 }}
                  className="font-medium whitespace-nowrap"
                >
                  {item.label}
                </motion.span>
              )}
            </motion.button>
            
            {/* Tooltip for collapsed state - only on desktop */}
            {!showExpanded && !isMobile && (
              <motion.div
                initial={{ opacity: 0, x: -10, scale: 0.8 }}
                whileHover={{ opacity: 1, x: 0, scale: 1 }}
                className="absolute left-full top-1/2 transform -translate-y-1/2 ml-2 px-2 py-1 bg-gray-900 dark:bg-gray-100 text-white dark:text-gray-900 text-sm rounded-md whitespace-nowrap z-50 pointer-events-none opacity-0 group-hover:opacity-100 transition-all duration-200"
              >
                {item.label}
                <div className="absolute right-full top-1/2 transform -translate-y-1/2 border-4 border-transparent border-r-gray-900 dark:border-r-gray-100"></div>
              </motion.div>
            )}
          </div>
        ))}
      </nav>

      {/* User Profile & Logout */}
      <div className="p-4 border-t border-gray-200 dark:border-gray-700">
        {user && showExpanded && (
          <motion.div 
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="mb-4"
          >
            <div className="flex items-center space-x-3 p-3 rounded-lg bg-gray-50 dark:bg-gray-700">
              <img
                src={user.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(user.name)}&background=14b8a6&color=fff`}
                alt={user.name}
                className="w-10 h-10 rounded-full"
              />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                  {user.name}
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400 capitalize">
                  {user.role === 'hr' ? 'HR' : user.role}
                </p>
              </div>
            </div>
          </motion.div>
        )}

        {user && !showExpanded && (
          <div className="mb-4 flex justify-center">
            <img
              src={user.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(user.name)}&background=14b8a6&color=fff`}
              alt={user.name}
              className="w-10 h-10 rounded-full"
            />
          </div>
        )}

        <div className="space-y-2">
          <div className="relative group">
            <button className={`
              w-full flex items-center px-3 py-2 text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 rounded-lg transition-colors
              ${!showExpanded ? 'justify-center' : ''}
            `}>
              <Settings className={`w-5 h-5 ${!showExpanded ? '' : 'mr-3'}`} />
              {showExpanded && (
                <motion.span 
                  initial={{ opacity: 0, width: 0 }}
                  animate={{ opacity: 1, width: "auto" }}
                  exit={{ opacity: 0, width: 0 }}
                  className="font-medium whitespace-nowrap"
                >
                  Settings
                </motion.span>
              )}
            </button>
            
            {/* Tooltip for collapsed state - only on desktop */}
            {!showExpanded && !isMobile && (
              <motion.div
                initial={{ opacity: 0, x: -10, scale: 0.8 }}
                whileHover={{ opacity: 1, x: 0, scale: 1 }}
                className="absolute left-full top-1/2 transform -translate-y-1/2 ml-2 px-2 py-1 bg-gray-900 dark:bg-gray-100 text-white dark:text-gray-900 text-sm rounded-md whitespace-nowrap z-50 pointer-events-none opacity-0 group-hover:opacity-100 transition-all duration-200"
              >
                Settings
                <div className="absolute right-full top-1/2 transform -translate-y-1/2 border-4 border-transparent border-r-gray-900 dark:border-r-gray-100"></div>
              </motion.div>
            )}
          </div>
          
          <div className="relative group">
            <button 
              onClick={onLogout}
              className={`
                w-full flex items-center px-3 py-2 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors
                ${!showExpanded ? 'justify-center' : ''}
              `}
            >
              <LogOut className={`w-5 h-5 ${!showExpanded ? '' : 'mr-3'}`} />
              {showExpanded && (
                <motion.span 
                  initial={{ opacity: 0, width: 0 }}
                  animate={{ opacity: 1, width: "auto" }}
                  exit={{ opacity: 0, width: 0 }}
                  className="font-medium whitespace-nowrap"
                >
                  Logout
                </motion.span>
              )}
            </button>
            
            {/* Tooltip for collapsed state - only on desktop */}
            {!showExpanded && !isMobile && (
              <motion.div
                initial={{ opacity: 0, x: -10, scale: 0.8 }}
                whileHover={{ opacity: 1, x: 0, scale: 1 }}
                className="absolute left-full top-1/2 transform -translate-y-1/2 ml-2 px-2 py-1 bg-gray-900 dark:bg-gray-100 text-white dark:text-gray-900 text-sm rounded-md whitespace-nowrap z-50 pointer-events-none opacity-0 group-hover:opacity-100 transition-all duration-200"
              >
                Logout
                <div className="absolute right-full top-1/2 transform -translate-y-1/2 border-4 border-transparent border-r-gray-900 dark:border-r-gray-100"></div>
              </motion.div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
