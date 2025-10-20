'use client'

import { motion } from 'framer-motion'
import { Calendar, Coffee, Heart, Umbrella, LucideIcon } from 'lucide-react'
import { useState, useEffect } from 'react'
import { supabase } from '@/config/supabase'

interface LeaveBalanceWidgetProps {
  leaveBalance?: {
    sick: number;
    casual: number;
    earned: number;
  };
  employeeId?: string;
}

interface LeaveTypeData {
  type: string;
  available: number;
  total: number;
  icon: LucideIcon;
  color: string;
  lightColor: string;
  textColor: string;
}

interface UpcomingLeave {
  name: string;
  startDate: string;
  endDate: string;
}

interface LeaveBalanceRecord {
  days_taken: number;
  leave_policies: {
    name: string;
    total_days: number;
    icon: string | null;
    color: string | null;
  };
}

interface LeaveRequestRecord {
  start_date: string;
  end_date: string;
  policy_id: string;
  leave_policies: {
    name: string;
  }[] | null;
}

export default function LeaveBalanceWidget({ leaveBalance, employeeId }: LeaveBalanceWidgetProps) {
  const [leaveData, setLeaveData] = useState<LeaveTypeData[]>([])
  const [upcomingLeaves, setUpcomingLeaves] = useState<UpcomingLeave[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchLeaveData = async () => {
      try {
        setLoading(true)
        
        // If leaveBalance is provided from dashboard data, use it
        if (leaveBalance) {
          const leaveTypes: LeaveTypeData[] = [
            {
              type: 'Casual Leave',
              available: leaveBalance.casual,
              total: 18,
              icon: Coffee,
              color: 'bg-blue-500',
              lightColor: 'bg-blue-50 dark:bg-blue-900/20',
              textColor: 'text-blue-600 dark:text-blue-400'
            },
            {
              type: 'Sick Leave',
              available: leaveBalance.sick,
              total: 12,
              icon: Heart,
              color: 'bg-red-500',
              lightColor: 'bg-red-50 dark:bg-red-900/20',
              textColor: 'text-red-600 dark:text-red-400'
            },
            {
              type: 'Earned Leave',
              available: leaveBalance.earned,
              total: 30,
              icon: Umbrella,
              color: 'bg-green-500',
              lightColor: 'bg-green-50 dark:bg-green-900/20',
              textColor: 'text-green-600 dark:text-green-400'
            }
          ]
          setLeaveData(leaveTypes)
        } else if (employeeId) {
          // Fetch leave balances from leave_balances table
          const { data: leaveBalances, error } = await supabase
            .from('leave_balances')
            .select(`
              days_taken,
              leave_policies!inner( 
                name,
                total_days,
                icon,
                color
              )
            `)
            .eq('employee_id', employeeId)
            .eq('year', new Date().getFullYear())

          if (error) {
            console.error('Error fetching leave balances:', error)
          }

          if (leaveBalances && leaveBalances.length > 0) {
            const formattedLeaveData: LeaveTypeData[] = leaveBalances.map((balance: any) => {
              const available = balance.leave_policies.total_days - balance.days_taken
              const iconMap: Record<string, LucideIcon> = {
                'coffee': Coffee,
                'heart': Heart,
                'umbrella': Umbrella
              }
              
              const iconName = balance.leave_policies.icon || 'calendar'
              const icon = iconMap[iconName] || Calendar
              
              const colorName = balance.leave_policies.color || 'gray'
              const color = `bg-${colorName}-500`
              const lightColor = `bg-${colorName}-50 dark:bg-${colorName}-900/20`
              const textColor = `text-${colorName}-600 dark:text-${colorName}-400`
              
              return {
                type: balance.leave_policies.name || 'Leave',
                available: Math.max(0, available),
                total: balance.leave_policies.total_days || 0,
                icon,
                color,
                lightColor,
                textColor
              }
            })
            setLeaveData(formattedLeaveData)
          }
        }

        // Fetch upcoming approved leaves
        const { data: upcomingLeaveRequests, error: leavesError } = await supabase
          .from('leave_requests')
          .select('start_date, end_date, policy_id, leave_policies!inner(name)')
          .eq('status', 'approved')
          .gte('start_date', new Date().toISOString().split('T')[0])
          .order('start_date', { ascending: true })
          .limit(3)

        if (leavesError) {
          console.error('Error fetching upcoming leaves:', leavesError)
        }

        if (upcomingLeaveRequests) {
          const formattedUpcomingLeaves: UpcomingLeave[] = upcomingLeaveRequests.map((request) => ({
            name: request.leave_policies?.[0]?.name || 'Unknown Leave Type', // Access 'name' property safely
            startDate: new Date(request.start_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }), // Corrected property access
            endDate: new Date(request.end_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
          }))
          setUpcomingLeaves(formattedUpcomingLeaves)
        }

      } catch (error) {
        console.error('Error fetching leave data:', error)
        setLeaveData([])
        setUpcomingLeaves([])
      } finally {
        setLoading(false)
      }
    }

    fetchLeaveData()
  }, [leaveBalance, employeeId])

  if (loading) {
    return (
      <div className="card p-6">
        <div className="animate-pulse">
          <div className="h-6 bg-gray-200 rounded w-1/3 mb-6"></div>
          <div className="space-y-4">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="space-y-3">
                <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                <div className="h-2 bg-gray-200 rounded"></div>
              </div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="card p-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
          Leave Balance
        </h3>
        <Calendar className="w-5 h-5 text-gray-400" />
      </div>

      {leaveData.length === 0 ? (
        <div className="text-center py-8">
          <Calendar className="w-12 h-12 text-gray-400 mx-auto mb-3" />
          <p className="text-gray-600 dark:text-gray-400">No leave data available</p>
        </div>
      ) : (
        <>
          <div className="space-y-4">
            {leaveData.map((leave, index) => {
              const percentage = leave.total > 0 ? (leave.available / leave.total) * 100 : 0
              
              return (
                <motion.div
                  key={leave.type}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className={`${leave.lightColor} rounded-lg p-4`}
                >
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center space-x-3">
                      <div className={`w-8 h-8 ${leave.color} rounded-lg flex items-center justify-center`}>
                        <leave.icon className="w-4 h-4 text-white" />
                      </div>
                      <div>
                        <p className="font-medium text-gray-900 dark:text-white text-sm">
                          {leave.type}
                        </p>
                        <p className="text-xs text-gray-600 dark:text-gray-400">
                          {leave.available} of {leave.total} days
                        </p>
                      </div>
                    </div>
                    <div className={`text-lg font-bold ${leave.textColor}`}>
                      {leave.available}
                    </div>
                  </div>

                  {/* Progress Bar - Only show if total is available */}
                  {leave.total > 0 && (
                    <>
                      <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{ width: `${percentage}%` }}
                          transition={{ duration: 1, delay: index * 0.2 }}
                          className={`h-2 rounded-full ${leave.color}`}
                        />
                      </div>
                      
                      <div className="flex justify-between mt-2 text-xs text-gray-600 dark:text-gray-400">
                        <span>Used: {leave.total - leave.available}</span>
                        <span>{Math.round(percentage)}% remaining</span>
                      </div>
                    </>
                  )}
                </motion.div>
              )
            })}
          </div>

          {/* Action Button */}
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="w-full mt-6 px-4 py-3 bg-primary-500 hover:bg-primary-600 text-white rounded-lg font-medium transition-colors"
            onClick={() => alert('Apply for Leave functionality')}
          >
            Apply for Leave
          </motion.button>
        </>
      )}

      {/* Upcoming Leaves */}
      {upcomingLeaves.length > 0 && (
        <div className="mt-6 pt-4 border-t border-gray-200 dark:border-gray-700">
          <p className="text-sm font-medium text-gray-900 dark:text-white mb-2">
            Upcoming Leaves
          </p>
          <div className="space-y-2">
            {upcomingLeaves.map((leave, index) => (
              <div key={index} className="flex items-center justify-between text-sm">
                <span className="text-gray-600 dark:text-gray-400">
                  {leave.name}
                </span>
                <span className="text-gray-900 dark:text-white font-medium">
                  {leave.startDate === leave.endDate ? leave.startDate : `${leave.startDate} - ${leave.endDate}`}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}