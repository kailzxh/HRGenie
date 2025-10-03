'use client'

import { useState } from 'react'
import { Calendar as CalendarIcon, ChevronLeft, ChevronRight } from 'lucide-react'

interface AttendanceCalendarProps {
  onRegularize: (date: Date) => void
  view: 'employee' | 'manager' | 'admin'
}

export default function AttendanceCalendar({ onRegularize, view }: AttendanceCalendarProps) {
  const [currentDate, setCurrentDate] = useState(new Date())
  const [selectedDate, setSelectedDate] = useState<Date | null>(null)

  // Sample attendance data
  const attendanceData = {
    '2025-10-01': { status: 'present', checkIn: '09:00', checkOut: '17:30' },
    '2025-10-02': { status: 'late', checkIn: '09:45', checkOut: '17:30' },
    '2025-10-03': { status: 'absent', checkIn: null, checkOut: null },
    '2025-10-04': { status: 'holiday', reason: 'Company Holiday' },
    '2025-10-05': { status: 'leave', type: 'Vacation' },
  }

  const getMonthDays = (date: Date) => {
    const year = date.getFullYear()
    const month = date.getMonth()
    const firstDay = new Date(year, month, 1)
    const lastDay = new Date(year, month + 1, 0)
    
    const days = []
    const startPadding = firstDay.getDay()
    
    // Add padding for the start of the month
    for (let i = 0; i < startPadding; i++) {
      const paddingDate = new Date(year, month, -startPadding + i + 1)
      days.push({ date: paddingDate, isPadding: true })
    }
    
    // Add all days of the month
    for (let i = 1; i <= lastDay.getDate(); i++) {
      days.push({ date: new Date(year, month, i), isPadding: false })
    }
    
    // Add padding for the end of the month
    const endPadding = 42 - days.length // 42 = 6 rows * 7 days
    for (let i = 1; i <= endPadding; i++) {
      const paddingDate = new Date(year, month + 1, i)
      days.push({ date: paddingDate, isPadding: true })
    }
    
    return days
  }

  const getStatusColor = (date: Date) => {
    const dateStr = date.toISOString().split('T')[0]
    const attendance = attendanceData[dateStr]
    
    if (!attendance) return 'bg-gray-100 dark:bg-gray-800'
    
    switch (attendance.status) {
      case 'present':
        return 'bg-green-100 dark:bg-green-900/20 text-green-600 dark:text-green-400'
      case 'late':
        return 'bg-yellow-100 dark:bg-yellow-900/20 text-yellow-600 dark:text-yellow-400'
      case 'absent':
        return 'bg-red-100 dark:bg-red-900/20 text-red-600 dark:text-red-400'
      case 'holiday':
        return 'bg-blue-100 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400'
      case 'leave':
        return 'bg-purple-100 dark:bg-purple-900/20 text-purple-600 dark:text-purple-400'
      default:
        return 'bg-gray-100 dark:bg-gray-800'
    }
  }

  const getDayDetails = (date: Date) => {
    const dateStr = date.toISOString().split('T')[0]
    const attendance = attendanceData[dateStr]
    
    if (!attendance) return null
    
    switch (attendance.status) {
      case 'present':
        return `Present (${attendance.checkIn} - ${attendance.checkOut})`
      case 'late':
        return `Late (${attendance.checkIn} - ${attendance.checkOut})`
      case 'absent':
        return 'Absent'
      case 'holiday':
        return `Holiday: ${attendance.reason}`
      case 'leave':
        return `Leave: ${attendance.type}`
      default:
        return null
    }
  }

  return (
    <div className="card p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
          {view === 'employee' ? 'My Attendance Calendar' : 'Team Attendance Calendar'}
        </h2>
        <div className="flex items-center space-x-4">
          <button
            onClick={() => setCurrentDate(new Date(currentDate.setMonth(currentDate.getMonth() - 1)))}
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <span className="text-sm font-medium">
            {currentDate.toLocaleString('default', { month: 'long', year: 'numeric' })}
          </span>
          <button
            onClick={() => setCurrentDate(new Date(currentDate.setMonth(currentDate.getMonth() + 1)))}
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>
      </div>

      <div className="grid grid-cols-7 gap-px bg-gray-200 dark:bg-gray-700 rounded-lg overflow-hidden">
        {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
          <div
            key={day}
            className="p-2 text-center text-sm font-medium bg-gray-50 dark:bg-gray-800"
          >
            {day}
          </div>
        ))}
        
        {getMonthDays(currentDate).map(({ date, isPadding }, index) => (
          <div
            key={index}
            className={`min-h-[80px] p-2 ${
              isPadding
                ? 'bg-gray-50 dark:bg-gray-800/50 text-gray-400'
                : getStatusColor(date)
            }`}
            onClick={() => {
              if (!isPadding) {
                setSelectedDate(date)
                const details = getDayDetails(date)
                if (details?.includes('Late') || details?.includes('Absent')) {
                  onRegularize(date)
                }
              }
            }}
          >
            <div className="flex justify-between items-start">
              <span className="text-sm">{date.getDate()}</span>
              {!isPadding && getDayDetails(date) && (
                <div className="text-xs">{getDayDetails(date)}</div>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Legend */}
      <div className="mt-4 flex flex-wrap gap-4">
        <div className="flex items-center space-x-2">
          <div className="w-3 h-3 bg-green-100 dark:bg-green-900/20 rounded"></div>
          <span className="text-xs">Present</span>
        </div>
        <div className="flex items-center space-x-2">
          <div className="w-3 h-3 bg-yellow-100 dark:bg-yellow-900/20 rounded"></div>
          <span className="text-xs">Late</span>
        </div>
        <div className="flex items-center space-x-2">
          <div className="w-3 h-3 bg-red-100 dark:bg-red-900/20 rounded"></div>
          <span className="text-xs">Absent</span>
        </div>
        <div className="flex items-center space-x-2">
          <div className="w-3 h-3 bg-blue-100 dark:bg-blue-900/20 rounded"></div>
          <span className="text-xs">Holiday</span>
        </div>
        <div className="flex items-center space-x-2">
          <div className="w-3 h-3 bg-purple-100 dark:bg-purple-900/20 rounded"></div>
          <span className="text-xs">Leave</span>
        </div>
      </div>
    </div>
  )
}