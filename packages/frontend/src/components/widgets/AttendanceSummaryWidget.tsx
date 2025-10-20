'use client'

import { motion } from 'framer-motion'
import { Clock, CheckCircle, AlertCircle, TrendingUp, LucideProps } from 'lucide-react'
import { FC } from 'react'
import type { AttendanceSummaryData } from '@/types' // Ensure path is correct

interface AttendanceSummaryWidgetProps {
  summary: AttendanceSummaryData | null; // This type from /types matches your backend
}

// Small helper component for stat items
const StatItem: FC<{ icon: FC<LucideProps>; label: string; value: string | number; unit?: string }> = ({ icon: Icon, label, value, unit }) => (
  <div className="flex items-center justify-between py-3 border-b border-gray-100 dark:border-gray-700">
    <div className="flex items-center text-sm text-gray-600 dark:text-gray-300">
      <Icon className="w-4 h-4 mr-2" />
      <span>{label}</span>
    </div>
    <span className="text-sm font-semibold text-gray-800 dark:text-white">
      {value} {unit}
    </span>
  </div>
);

export const AttendanceSummaryWidget: FC<AttendanceSummaryWidgetProps> = ({ summary }) => {

  const stats = [
    { label: 'Present Days', value: summary?.present ?? 0, icon: CheckCircle },
    { label: 'Late Days', value: summary?.late ?? 0, icon: AlertCircle },
    { label: 'Total Hours', value: summary?.totalHoursMonth ?? '0.00', icon: Clock, unit: 'hrs' },
    { label: 'Avg. Daily Hours', value: summary?.avgHoursDay ?? '0.00', icon: TrendingUp, unit: 'hrs' }
  ];

  return (
    <div className="card p-6 rounded-xl shadow-sm bg-white dark:bg-gray-800">
      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
        Attendance Summary
      </h3>
      
      {!summary ? (
         <p className="text-sm text-gray-500 dark:text-gray-400 italic">No summary data available.</p>
      ) : (
        <div className="space-y-1">
          {stats.map((stat, index) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <StatItem 
                icon={stat.icon} 
                label={stat.label} 
                value={stat.value}
                unit={stat.unit}
              />
            </motion.div>
          ))}
        </div>
      )}
    </div>
  )
}