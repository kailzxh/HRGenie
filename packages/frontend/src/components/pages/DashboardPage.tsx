'use client'

import { useAuth } from '@/hooks/useAuth'
import { motion } from 'framer-motion'
import KPIWidget from '@/components/widgets/KPIWidget'
import QuickActionsWidget from '@/components/widgets/QuickActionsWidget'
import AttendanceSummaryWidget from '@/components/widgets/AttendanceSummaryWidget'
import LeaveBalanceWidget from '@/components/widgets/LeaveBalanceWidget'
import RecruitmentFunnelWidget from '@/components/widgets/RecruitmentFunnelWidget'
import TeamPerformanceWidget from '@/components/widgets/TeamPerformanceWidget'
import AnnouncementsWidget from '@/components/widgets/AnnouncementsWidget'
import PayrollOverviewWidget from '@/components/widgets/PayrollOverviewWidget'

export default function DashboardPage() {
  const { user } = useAuth()

  if (!user) return null

  const renderWidgets = () => {
    switch (user.role) {
      case 'admin':
        return (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              <KPIWidget
                title="Total Employees"
                value="1,247"
                change="+8.5%"
                trend="up"
                icon="users"
                color="blue"
              />
              <KPIWidget
                title="New Hires"
                value="23"
                change="+12%"
                trend="up"
                icon="user-plus"
                color="green"
              />
              <KPIWidget
                title="Attrition Rate"
                value="8.5%"
                change="-2.1%"
                trend="down"
                icon="trending-down"
                color="red"
              />
              <KPIWidget
                title="Open Positions"
                value="15"
                change="+3"
                trend="up"
                icon="briefcase"
                color="purple"
              />
            </div>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
              <PayrollOverviewWidget />
              <RecruitmentFunnelWidget />
              <TeamPerformanceWidget />
              <AttendanceSummaryWidget />
              <AnnouncementsWidget />
              <QuickActionsWidget />
            </div>
          </>
        )

      case 'hr':
        return (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              <KPIWidget
                title="Open Positions"
                value="15"
                change="+12%"
                trend="up"
                icon="briefcase"
                color="purple"
              />
              <KPIWidget
                title="New Applicants"
                value="135"
                change="+8%"
                trend="up"
                icon="users"
                color="blue"
              />
              <KPIWidget
                title="Interviews Scheduled"
                value="24"
                change="+6"
                trend="up"
                icon="calendar"
                color="green"
              />
              <KPIWidget
                title="Offers Extended"
                value="8"
                change="+2"
                trend="up"
                icon="handshake"
                color="yellow"
              />
            </div>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <RecruitmentFunnelWidget />
              <AttendanceSummaryWidget />
              <AnnouncementsWidget />
              <QuickActionsWidget />
            </div>
          </>
        )

      case 'manager':
        return (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              <KPIWidget
                title="Team Size"
                value="24"
                change="+2"
                trend="up"
                icon="users"
                color="blue"
              />
              <KPIWidget
                title="Team Performance"
                value="92%"
                change="+5%"
                trend="up"
                icon="trending-up"
                color="green"
              />
              <KPIWidget
                title="Pending Approvals"
                value="8"
                change="-3"
                trend="down"
                icon="clock"
                color="orange"
              />
              <KPIWidget
                title="Team Attendance"
                value="96%"
                change="+1%"
                trend="up"
                icon="calendar-check"
                color="teal"
              />
            </div>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <TeamPerformanceWidget />
              <AttendanceSummaryWidget />
              <LeaveBalanceWidget />
              <QuickActionsWidget />
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
                value="168"
                change="+5%"
                trend="up"
                icon="clock"
                color="blue"
              />
              <KPIWidget
                title="Leave Balance"
                value="18 days"
                change="-2"
                trend="down"
                icon="calendar"
                color="green"
              />
              <KPIWidget
                title="Performance Score"
                value="8.5/10"
                change="+0.3"
                trend="up"
                icon="star"
                color="yellow"
              />
              <KPIWidget
                title="Goals Completed"
                value="85%"
                change="+10%"
                trend="up"
                icon="target"
                color="purple"
              />
            </div>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <QuickActionsWidget />
              <AttendanceSummaryWidget />
              <LeaveBalanceWidget />
              <AnnouncementsWidget />
            </div>
          </>
        )
    }
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
              Welcome back, {user.name}! 👋
            </h2>
            <p className="text-primary-100">
              Here's what's happening at your company today.
            </p>
          </div>
          <div className="hidden md:block">
            <div className="w-24 h-24 bg-white/10 rounded-full flex items-center justify-center">
              <img
                src={user.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(user.name)}&background=ffffff&color=14b8a6`}
                alt={user.name}
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
