'use client'

import { useAuth } from '@/hooks/useAuth'
import { motion } from 'framer-motion'
import { useState, useEffect } from 'react'
import { supabase } from '@/config/supabase'
import KPIWidget from '@/components/widgets/KPIWidget'
import { AttendanceSummaryWidget } from '@/components/widgets/AttendanceSummaryWidget'
import LeaveBalanceWidget from '@/components/widgets/LeaveBalanceWidget'
import RecruitmentFunnelWidget from '@/components/widgets/RecruitmentFunnelWidget'
import TeamPerformanceWidget from '@/components/widgets/TeamPerformanceWidget'
import PayrollOverviewWidget from '@/components/widgets/PayrollOverviewWidget'

// Define the exact data structure from your backend
interface DashboardData {
  userRole: string;
  totalEmployees?: number;
  activePayrollRuns?: number;
  departmentStats?: { [key: string]: number };
  recentEmployees?: Array<{
    id: string;
    name: string;
    email: string;
    department: string;
    position: string;
    status: string;
  }>;
  payrollRuns?: Array<{
    id: string;
    status: string;
    total_gross: number;
    total_net: number;
    employee_count: number;
    created_at: string; // Added created_at to match PayrollOverviewWidget's expected type
  }>;
  teamMembersCount?: number;
  teamMembers?: Array<{
    id: string;
    name: string;
    position: string;
    department: string;
  }>;
  recentPayrollRuns?: Array<{
    id: string;
    generated_at: string;
    payroll_lines?: {
      employee_name: string;
      net_salary: number;
    };
  }>;
  managerInfo?: {
    id: string;
    name: string;
    department: string;
    position: string;
  };
  employeeInfo?: {
    id: string;
    name: string;
    position: string;
    department: string;
  };
  recentPayslips?: Array<{
    id: string;
    generated_at: string;
    payroll_lines?: {
      employee_name: string;
      net_salary: number;
    };
  }>;
  leaveBalance?: {
    sick: number;
    casual: number;
    earned: number;
  };
  attendanceSummary?: {
    present: number;
    absent: number;
    late: number;
    total_hours: number;
  };
  performanceMetrics?: {
    team_performance?: number;
    goals_completed?: number;
    overall_score?: number;
  };
  newApplicants?: number;
  openPositions?: number;
  pendingApprovals?: number;
}

interface DashboardPageProps {
  initialData?: DashboardData;
}
const API_BASE_URL = process.env.NEXT_PUBLIC_BACKEND_URL;

export default function DashboardPage({ initialData }: DashboardPageProps) {
  const { user } = useAuth()
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(initialData || null)
  const [loading, setLoading] = useState(!initialData)
  const [error, setError] = useState<string | null>(null)

  // Fetch dashboard data from your backend server using Bearer token
  useEffect(() => {
    const fetchDashboardData = async () => {
      if (initialData) {
        setLoading(false)
        return
      }

      try {
        setLoading(true)
        setError(null)
        
        const { data: { session }, error: sessionError } = await supabase.auth.getSession();
        
        if (sessionError || !session) {
          throw new Error('No active session found. Please log in.')
        }

        const token = session.access_token;

        const response = await fetch(`${API_BASE_URL}/dashboard`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          }
        })

        if (!response.ok) {
          if (response.status === 401) {
            throw new Error('Authentication failed. Please log in again.')
          }
          throw new Error(`Failed to fetch dashboard data: ${response.status} ${response.statusText}`)
        }

        const result = await response.json()
        
        if (result.success) {
          setDashboardData(result.data)
        } else {
          throw new Error(result.error || 'Failed to load dashboard data')
        }
      } catch (err) {
        console.error('Error fetching dashboard data:', err)
        setError(err instanceof Error ? err.message : 'An error occurred while fetching data')
      } finally {
        setLoading(false)
      }
    }

    if (user) {
      fetchDashboardData()
    } else {
      setLoading(false)
    }
  }, [initialData, user])

  const currentUserRole = dashboardData?.userRole || user?.role
  const currentUserData = dashboardData?.employeeInfo || dashboardData?.managerInfo

  // Show loading state
  if (loading) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="space-y-6"
      >
        <div className="bg-gradient-to-r from-primary-500 to-primary-600 rounded-xl p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold mb-2">Loading your dashboard...</h2>
              <p className="text-primary-100">Please wait while we fetch your data</p>
            </div>
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white"></div>
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow animate-pulse">
              <div className="h-4 bg-gray-300 rounded w-1/2 mb-2"></div>
              <div className="h-8 bg-gray-300 rounded w-3/4"></div>
            </div>
          ))}
        </div>
      </motion.div>
    )
  }

  // Show error state
  if (error) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="space-y-6"
      >
        <div className="bg-gradient-to-r from-red-500 to-red-600 rounded-xl p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold mb-2">Error Loading Dashboard</h2>
              <p className="text-red-100">{error}</p>
            </div>
            <button 
              onClick={() => window.location.reload()}
              className="px-4 py-2 bg-white text-red-600 rounded-lg font-semibold hover:bg-red-50"
            >
              Retry
            </button>
          </div>
        </div>
      </motion.div>
    )
  }

  if (!user && !dashboardData) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <p className="text-lg text-gray-600">Please log in to view your dashboard</p>
        </div>
      </div>
    )
  }

  const renderWidgets = () => {
    switch (currentUserRole) {
      case 'admin':
        return (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              <KPIWidget
                title="Total Employees"
                value={dashboardData?.totalEmployees?.toString() || "0"}
                change="+8.5%"
                trend="up"
                icon="users"
                color="blue"
              />
              <KPIWidget
                title="Active Payroll"
                value={dashboardData?.activePayrollRuns?.toString() || "0"}
                change="+12%"
                trend="up"
                icon="dollar-sign"
                color="green"
              />
              <KPIWidget
                title="Departments"
                value={Object.keys(dashboardData?.departmentStats || {}).length.toString()}
                change="+1"
                trend="up"
                icon="building"
                color="purple"
              />
              <KPIWidget
                title="New Applicants"
                value={dashboardData?.newApplicants?.toString() || "0"}
                change="+15%"
                trend="up"
                icon="user-plus"
                color="orange"
              />
            </div>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
              <PayrollOverviewWidget payrollRuns={dashboardData?.payrollRuns} />
              <RecruitmentFunnelWidget 
                // recentEmployees={dashboardData?.recentEmployees} // Removed as it's not a number
                newApplicants={dashboardData?.newApplicants}
                openPositions={dashboardData?.openPositions}
              />
              <TeamPerformanceWidget teamMembers={dashboardData?.teamMembers} /> 
              {/* <AttendanceSummaryWidget summary={dashboardData?.attendanceSummary ?? null} /> */}



            </div>
          </>
        )

      case 'hr':
        return (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              <KPIWidget
                title="Total Employees"
                value={dashboardData?.totalEmployees?.toString() || "0"}
                change="+8.5%"
                trend="up"
                icon="users"
                color="blue"
              />
              <KPIWidget
                title="New Applicants"
                value={dashboardData?.newApplicants?.toString() || "0"}
                change="+15%"
                trend="up"
                icon="user-plus"
                color="green"
              />
              <KPIWidget
                title="Open Positions"
                value={dashboardData?.openPositions?.toString() || "0"}
                change="+2"
                trend="up"
                icon="briefcase"
                color="purple"
              />
              <KPIWidget
                title="Active Payroll"
                value={dashboardData?.activePayrollRuns?.toString() || "0"}
                change="+3"
                trend="up"
                icon="dollar-sign"
                color="yellow"
              />
            </div>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <RecruitmentFunnelWidget 
                // recentEmployees={dashboardData?.recentEmployees}
                newApplicants={dashboardData?.newApplicants}
                openPositions={dashboardData?.openPositions}
              />
              {/* <AttendanceSummaryWidget summary={dashboardData?.attendanceSummary} /> */}
              <PayrollOverviewWidget payrollRuns={dashboardData?.payrollRuns} />
            </div>
          </>
        )

      case 'manager':
        return (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              <KPIWidget
                title="Team Size"
                value={dashboardData?.teamMembersCount?.toString() || "0"}
                change="+2"
                trend="up"
                icon="users"
                color="blue"
              />
              <KPIWidget
                title="Team Performance"
                value={`${dashboardData?.performanceMetrics?.team_performance || 0}%`}
                change="+5%"
                trend="up"
                icon="trending-up"
                color="green"
              />
              <KPIWidget
                title="Pending Approvals"
                value={dashboardData?.pendingApprovals?.toString() || "0"}
                change="-3"
                trend="down"
                icon="clock"
                color="orange"
              />
              <KPIWidget
                title="Team Attendance"
                value={`${dashboardData?.attendanceSummary ? Math.round((dashboardData.attendanceSummary.present / (dashboardData.attendanceSummary.present + dashboardData.attendanceSummary.absent)) * 100) : 96}%`}
                change="+1%"
                trend="up"
                icon="calendar-check"
                color="teal"
              />
            </div>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <TeamPerformanceWidget teamMembers={dashboardData?.teamMembers} />
              {/* <AttendanceSummaryWidget summary={dashboardData?.attendanceSummary} /> */}
              <LeaveBalanceWidget 
  leaveBalance={dashboardData?.leaveBalance}
  employeeId={dashboardData?.managerInfo?.id}
/>
            </div>
          </>
        )

      case 'employee':
      default:
        return (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              <KPIWidget
                title="Hours This Month"
                value={dashboardData?.attendanceSummary?.total_hours?.toString() || "0"}
                change="+5%"
                trend="up"
                icon="clock"
                color="blue"
              />
              <KPIWidget
                title="Leave Balance"
                value={`${dashboardData?.leaveBalance ? 
                  (dashboardData.leaveBalance.sick + dashboardData.leaveBalance.casual + dashboardData.leaveBalance.earned) 
                  : 18} days`}
                change="-2"
                trend="down"
                icon="calendar"
                color="green"
              />
              <KPIWidget
                title="Performance Score"
                value={`${dashboardData?.performanceMetrics?.overall_score || 8.5}/10`}
                change="+0.3"
                trend="up"
                icon="star"
                color="yellow"
              />
              <KPIWidget
                title="Goals Completed"
                value={`${dashboardData?.performanceMetrics?.goals_completed || 85}%`}
                change="+10%"
                trend="up"
                icon="target"
                color="purple"
              />
            </div>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* <AttendanceSummaryWidget summary={dashboardData?.attendanceSummary} /> */}
             <LeaveBalanceWidget 
  leaveBalance={dashboardData?.leaveBalance}
  employeeId={dashboardData?.managerInfo?.id}
/>
            </div>
          </>
        )
    }
  }

  const getUserName = () => {
    if (currentUserData) {
      return currentUserData.name
    }
    return user?.name || 'User'
  }

  const getUserAvatar = () => {
    return user?.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(getUserName())}&background=14b8a6&color=fff`
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="space-y-6"
    >
      {/* Welcome Section */}
      <div className="bg-gradient-to-r from-primary-500 to-primary-600 rounded-xl p-6 text-white">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold mb-2">
              Welcome back, {getUserName()}! 👋
            </h2>
            <p className="text-primary-100">
              {currentUserRole === 'admin' && 'Here is your complete organizational overview.'}
              {currentUserRole === 'hr' && 'Manage your HR operations efficiently.'}
              {currentUserRole === 'manager' && 'Track your team performance and activities.'}
              {currentUserRole === 'employee' && 'Stay updated with your work summary and activities.'}
            </p>
          </div>
          <div className="hidden md:block">
            <div className="w-24 h-24 bg-white/10 rounded-full flex items-center justify-center">
              <img
                src={getUserAvatar()}
                alt={getUserName()}
                className="w-16 h-16 rounded-full"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Role-specific Widgets */}
      {renderWidgets()}
    </motion.div>
  )
}