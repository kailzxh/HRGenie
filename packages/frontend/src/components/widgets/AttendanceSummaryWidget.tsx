'use client'

import { motion } from 'framer-motion'
import { Clock, CheckCircle, XCircle, AlertCircle, Home, LucideProps } from 'lucide-react'
import { FC } from 'react'
import type { AttendanceSummaryData } from '@/types' // Ensure path is correct

interface AttendanceSummaryWidgetProps {
  summary: AttendanceSummaryData | null; // Accept summary data as a prop
}

export const AttendanceSummaryWidget: FC<AttendanceSummaryWidgetProps> = ({ summary }) => {

  // Use prop data, provide defaults if null/undefined
  const attendanceData = summary ?? {
    present: 0, absent: 0, late: 0, workFromHome: 0, totalDays: 0,
    todayStatus: null, todayClockIn: null
  };

  // Calculate percentage safely
  const percentage = attendanceData.totalDays > 0
    ? Math.min(100, Math.max(0, (attendanceData.present / attendanceData.totalDays) * 100))
    : 0;

  // Calculate circumference for SVG circle
  const radius = 16;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (percentage / 100) * circumference;

  const stats = [
     { label: 'Present', value: attendanceData.present, icon: CheckCircle, color: 'text-green-500', bg: 'bg-green-50 dark:bg-green-900/20' },
     { label: 'Absent', value: attendanceData.absent, icon: XCircle, color: 'text-red-500', bg: 'bg-red-50 dark:bg-red-900/20' },
     { label: 'Late', value: attendanceData.late, icon: AlertCircle, color: 'text-yellow-500', bg: 'bg-yellow-50 dark:bg-yellow-900/20' },
     { label: 'WFH', value: attendanceData.workFromHome, icon: Home, color: 'text-blue-500', bg: 'bg-blue-50 dark:bg-blue-900/20' }
  ];

  // Helper to display today's status
  const getTodayStatusDisplay = () => {
      // (Implementation remains the same as previous response)
      if (!attendanceData.todayStatus) return { text: 'N/A', color: 'text-gray-500 dark:text-gray-400', dot: 'bg-gray-500' };
      switch (attendanceData.todayStatus) {
          case 'Present': case 'Regularized - Present': return { text: 'Present', color: 'text-green-600 dark:text-green-400', dot: 'bg-green-500' };
          case 'Late': case 'Regularized - Late': return { text: 'Late', color: 'text-yellow-600 dark:text-yellow-400', dot: 'bg-yellow-500' };
          case 'Absent': case 'Missing Punch': return { text: attendanceData.todayStatus === 'Missing Punch' ? 'Missing Punch' : 'Absent', color: 'text-red-600 dark:text-red-400', dot: 'bg-red-500' };
          case 'Leave': return { text: 'On Leave', color: 'text-purple-600 dark:text-purple-400', dot: 'bg-purple-500' };
          case 'Holiday': return { text: 'Holiday', color: 'text-blue-600 dark:text-blue-400', dot: 'bg-blue-500' };
          case 'Weekend': return { text: 'Weekend', color: 'text-gray-500 dark:text-gray-400', dot: 'bg-gray-500' };
          default: return { text: 'N/A', color: 'text-gray-500 dark:text-gray-400', dot: 'bg-gray-500' };
      }
  };
  const todayStatusDisplay = getTodayStatusDisplay();

  return (
    <div className="card p-6 rounded-xl shadow-sm"> {/* Added styling */}
       {/* Title */}
       <div className="flex items-center justify-between mb-6">
         <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
           Attendance Summary
         </h3>
         <div className="flex items-center space-x-2 text-sm text-gray-500 dark:text-gray-400">
           <Clock className="w-4 h-4" />
           <span>This Month</span>
         </div>
       </div>

      {/* Percentage Circle */}
      <div className="text-center mb-6">
           <div className="relative w-24 h-24 mx-auto mb-3">
             <svg className="w-full h-full transform -rotate-90" viewBox="0 0 36 36">
               <circle cx="18" cy="18" r={radius} stroke="currentColor" strokeWidth="2.5" fill="none" className="text-gray-200 dark:text-gray-700"/>
               <motion.circle
                 cx="18" cy="18" r={radius} stroke="currentColor" strokeWidth="2.5" fill="none"
                 strokeDasharray={`${circumference} ${circumference}`}
                 strokeDashoffset={strokeDashoffset}
                 className="text-primary-500" strokeLinecap="round"
                 initial={{ strokeDashoffset: circumference }}
                 animate={{ strokeDashoffset }}
                 transition={{ duration: 0.8, ease: "easeOut" }}
               />
             </svg>
             <div className="absolute inset-0 flex items-center justify-center">
               <span className="text-2xl font-bold text-gray-800 dark:text-white">
                 {Math.round(percentage)}%
               </span>
             </div>
           </div>
         <p className="text-sm text-gray-500 dark:text-gray-400">Overall Attendance</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 gap-3 sm:gap-4">
        {stats.map((stat, index) => {
           const Icon = stat.icon;
           return (
              <motion.div
                key={stat.label}
                 initial={{ opacity: 0, scale: 0.9 }}
                 animate={{ opacity: 1, scale: 1 }}
                 transition={{ delay: index * 0.05 + 0.1 }} // Faster delay
                className={`${stat.bg} rounded-lg p-3 text-center shadow-sm`}
              >
                 <div className="flex items-center justify-center mb-1">
                     <Icon className={`w-5 h-5 ${stat.color}`} />
                 </div>
                 <div className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white mb-0.5">
                     {stat.value}
                 </div>
                 <div className="text-xs text-gray-600 dark:text-gray-400 truncate"> {/* Added truncate */}
                     {stat.label}
                 </div>
              </motion.div>
            );
        })}
      </div>

      {/* Today's Status */}
      <div className="mt-6 pt-4 border-t border-gray-200 dark:border-gray-700">
        <div className="flex items-center justify-between">
           <div>
               <p className="text-sm font-medium text-gray-800 dark:text-white">Today's Status</p>
               {attendanceData.todayClockIn && (
                 <p className="text-xs text-gray-500 dark:text-gray-400">
                   Clocked In: {attendanceData.todayClockIn}
                 </p>
               )}
           </div>
           <div className="flex items-center space-x-2">
                <div className={`w-2.5 h-2.5 ${todayStatusDisplay.dot} rounded-full`}></div>
                <span className={`text-sm ${todayStatusDisplay.color} font-medium`}>
                    {todayStatusDisplay.text}
                </span>
           </div>
        </div>
      </div>
    </div>
  )
}