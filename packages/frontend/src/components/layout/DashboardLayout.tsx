'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import Sidebar from './Sidebar'
import Header from './Header'
import DashboardPage from '@/components/pages/DashboardPage'
import EmployeesPage from '@/components/pages/EmployeesPage'
import RecruitmentPage from '@/components/pages/RecruitmentPage'
import PayrollPage from '@/components/pages/PayrollPage'
import LeavesPage from '@/components/pages/LeavesPage'
import AttendancePage from '@/components/pages/AttendancePage'
import PerformancePage from '@/components/pages/PerformancePage'
// import ReportsPage from '@/components/pages/ReportsPage'
import PremiumBackground from '@/components/three/PremiumBackground'

export type PageType = 
  | 'dashboard' 
  | 'employees' 
  | 'recruitment' 
  | 'payroll' 
  | 'leaves' 
  | 'attendance' 
  | 'performance' 
  | 'reports'

export default function DashboardLayout() {
  const [currentPage, setCurrentPage] = useState<PageType>('dashboard')
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)
  const [isMobileDevice, setIsMobileDevice] = useState(false)

  // Check if we're on a mobile device
  useEffect(() => {
    const checkMobile = () => {
      const isMobile = window.innerWidth < 1024 || /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)
      setIsMobileDevice(isMobile)
    }
    
    checkMobile()
    window.addEventListener('resize', checkMobile)
    return () => window.removeEventListener('resize', checkMobile)
  }, [])

  const renderPage = () => {
    const pageComponents = {
      dashboard: DashboardPage,
      employees: EmployeesPage,
      recruitment: RecruitmentPage,
      payroll: PayrollPage,
      leaves: LeavesPage,
      attendance: AttendancePage,
      performance: PerformancePage,
      // reports: ReportsPage,
    }
    // Type assertion to tell TypeScript that currentPage will be a valid key
    const PageComponent = pageComponents[currentPage as keyof typeof pageComponents]
    return <PageComponent />
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex">
      {/* Sidebar */}
      <Sidebar 
        currentPage={currentPage}
        onPageChange={setCurrentPage}
        isOpen={sidebarOpen}
        onToggle={() => setSidebarOpen(!sidebarOpen)}
        isCollapsed={sidebarCollapsed}
        onCollapsedChange={setSidebarCollapsed}
      />

      {/* Mobile Overlay */}
      <AnimatePresence>
        {sidebarOpen && isMobileDevice && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 z-[50]"
            onClick={() => setSidebarOpen(false)}
            onTouchStart={() => setSidebarOpen(false)}
          />
        )}
      </AnimatePresence>

      {/* Main Content */}
      <div 
        className="flex-1 flex flex-col min-w-0 transition-all duration-300 ease-in-out relative"
        style={{
          marginLeft: !isMobileDevice ? (sidebarCollapsed ? '80px' : '256px') : '0'
        }}
      >
        {/* 3D Background */}
        <PremiumBackground />
        {/* Header */}
        <Header 
          onSidebarToggle={() => setSidebarOpen(!sidebarOpen)}
          currentPage={currentPage}
        />

        {/* Page Content */}
        <main className="flex-1 overflow-auto">
          <div className="container mx-auto px-4 py-6 max-w-7xl">
            <AnimatePresence mode="wait">
              <motion.div
                key={currentPage}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.3 }}
              >
                {renderPage()}
              </motion.div>
            </AnimatePresence>
          </div>
        </main>
      </div>
    </div>
  )
}
