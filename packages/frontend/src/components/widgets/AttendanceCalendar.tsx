'use client'

import { useState, useMemo, FC } from 'react'
import { Calendar as CalendarIcon, ChevronLeft, ChevronRight, AlertTriangle } from 'lucide-react'
import { format, startOfMonth, endOfMonth, eachDayOfInterval, getDay, isSameDay, parseISO, addMonths, subMonths } from 'date-fns'
import type { AttendanceDayStatus } from '@/types' // Import types

// Define the type for Manager/Admin summary data expected in the prop
type CalendarSummaryData = {
     date: string; // YYYY-MM-DD
     presentCount?: number;
     absentCount?: number;
     lateCount?: number;
     onLeaveCount?: number;
} | AttendanceDayStatus; // Union type to handle both structures

interface AttendanceCalendarProps {
  onRegularize: (date: Date) => void
  view: 'employee' | 'manager' | 'admin'
  attendanceData: CalendarSummaryData[] | null; // Accept array from API or null
}

export const AttendanceCalendar: FC<AttendanceCalendarProps> = ({ onRegularize, view, attendanceData }) => {
  const [currentDate, setCurrentDate] = useState(new Date())
  const [selectedDateInfo, setSelectedDateInfo] = useState<CalendarSummaryData | null>(null);

  // Process attendanceData into a Map for quick lookup
  const attendanceMap = useMemo(() => {
    const map = new Map<string, CalendarSummaryData>();
    if (attendanceData) {
        attendanceData.forEach(day => {
            try {
               const dateKey = format(parseISO(day.date), 'yyyy-MM-dd'); // Ensure key matches format
               map.set(dateKey, day);
            } catch (e) { console.error("Invalid date in attendanceData:", day.date, e); }
        });
    }
    return map;
  }, [attendanceData]);

  // Get Days for the Calendar Grid (ensure 42 days for 6 rows)
  const getMonthDays = (date: Date): { date: Date; isPadding: boolean; isCurrentMonth: boolean }[] => {
    const monthStart = startOfMonth(date);
    const monthEnd = endOfMonth(date);
    const daysInMonth = eachDayOfInterval({ start: monthStart, end: monthEnd });
    const allDays = [];
    const firstDayOfMonthWeekday = getDay(monthStart);

    // Previous month padding
    for (let i = 0; i < firstDayOfMonthWeekday; i++) {
        const paddingDate = new Date(monthStart);
        paddingDate.setDate(paddingDate.getDate() - (firstDayOfMonthWeekday - i));
        allDays.push({ date: paddingDate, isPadding: true, isCurrentMonth: false });
    }
    // Current month days
    daysInMonth.forEach(day => {
        allDays.push({ date: day, isPadding: false, isCurrentMonth: true });
    });
    // Next month padding
    const cellsToAdd = 42 - allDays.length; // Ensure exactly 42 cells
    for (let i = 1; i <= cellsToAdd; i++) {
        const paddingDate = new Date(monthEnd);
        paddingDate.setDate(paddingDate.getDate() + i);
        allDays.push({ date: paddingDate, isPadding: true, isCurrentMonth: false });
    }
    return allDays;
  }

  // Styling based on Fetched Data
  const getStatusStyle = (date: Date): string => {
      const dateStr = format(date, 'yyyy-MM-dd');
      const dayData = attendanceMap.get(dateStr);
      const dayOfWeek = getDay(date);

      if (!dayData) {
          if (dayOfWeek === 0 || dayOfWeek === 6) return 'bg-gray-100 dark:bg-gray-800/60 text-gray-500'; // Weekend
          return 'bg-white dark:bg-gray-900'; // Default empty day
      }

      if ('status' in dayData) { // Employee View
          const attendance = dayData as AttendanceDayStatus;
           switch (attendance.status) {
              case 'Present': case 'Regularized - Present': return 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 border border-green-200 dark:border-green-800';
              case 'Late': case 'Regularized - Late': return 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400 border border-yellow-200 dark:border-yellow-800';
              case 'Absent': case 'Missing Punch': return 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400 border border-red-200 dark:border-red-800';
              case 'Half Day - First Half': case 'Half Day - Second Half': return 'bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-400 border border-orange-200 dark:border-orange-800';
              case 'Holiday': return 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 border border-blue-200 dark:border-blue-800';
              case 'Leave': return 'bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-400 border border-purple-200 dark:border-purple-800';
              case 'Weekend': return 'bg-gray-100 dark:bg-gray-800/60 text-gray-500'; // If backend sends Weekend status
              default: return 'bg-white dark:bg-gray-900';
          }
      }
      // Manager/Admin Summary Styles (optional indicators)
      else {
          const summary = dayData as { absentCount?: number; lateCount?: number };
          if (summary.absentCount && summary.absentCount > 0) return 'bg-red-50 dark:bg-red-900/10 ring-1 ring-inset ring-red-500/20';
          if (summary.lateCount && summary.lateCount > 0) return 'bg-yellow-50 dark:bg-yellow-900/10 ring-1 ring-inset ring-yellow-500/20';
          return 'bg-gray-50 dark:bg-gray-800/50'; // Default summary day
      }
  }

  // Get Text Details for display
  const getDayDetailsText = (date: Date): string | React.ReactNode | null => {
      // (Implementation remains the same as previous response, using attendanceMap)
      const dateStr = format(date, 'yyyy-MM-dd');
      const dayData = attendanceMap.get(dateStr);
      if (!dayData) {
           const dayOfWeek = getDay(date);
           if (dayOfWeek === 0 || dayOfWeek === 6) return <span className="text-gray-400 dark:text-gray-500 text-[9px] font-medium opacity-80">Weekend</span>;
           return null;
      }
      if ('status' in dayData) {
           const att = dayData as AttendanceDayStatus;
           switch (att.status) {
              case 'Present': case 'Regularized - Present': return `✅ ${att.clockIn || '?'} - ${att.clockOut || '?'}`;
              case 'Late': case 'Regularized - Late': return `⚠️ ${att.clockIn || '?'} - ${att.clockOut || '?'}`;
              case 'Absent': return '❌ Absent';
              case 'Missing Punch': return `❓ Missing ${att.clockIn ? 'Out' : 'In'}`;
              case 'Half Day - First Half': return `½ 1st Half`;
              case 'Half Day - Second Half': return `½ 2nd Half`;
              case 'Holiday': return `🎉 ${att.holidayName || 'Holiday'}`;
              case 'Leave': return `✈️ ${att.leaveType || 'Leave'}`;
              case 'Weekend': return <span className="text-gray-400 dark:text-gray-500 text-[9px] font-medium opacity-80">Weekend</span>;
              default: return null;
          }
      } else { // Manager/Admin
          const summ = dayData as { presentCount?: number; absentCount?: number; lateCount?: number; onLeaveCount?: number };
          const details = [];
          if (summ.presentCount) details.push(`P:${summ.presentCount}`);
          if (summ.absentCount) details.push(`A:${summ.absentCount}`);
          if (summ.lateCount) details.push(`L:${summ.lateCount}`);
          if (summ.onLeaveCount) details.push(`LV:${summ.onLeaveCount}`);
          return details.length > 0 ? <div className="flex flex-wrap gap-x-1">{details.map((d, i) => <span key={i} className={`text-[9px] font-medium ${d.startsWith('A:') ? 'text-red-600 dark:text-red-400' : d.startsWith('L:') ? 'text-yellow-600 dark:text-yellow-500' : 'text-gray-500 dark:text-gray-400'}`}>{d}</span>)}</div> : null;
      }
  }

  // Handle Day Click
  const handleDayClick = (date: Date, isPadding: boolean, isCurrentMonth: boolean) => {
      // (Implementation remains the same as previous response)
        if (isPadding || !isCurrentMonth) return;
        const dateStr = format(date, 'yyyy-MM-dd');
        const dayData = attendanceMap.get(dateStr);
        if (view === 'employee') {
            const needsReg = dayData && 'needsRegularization' in dayData && dayData.needsRegularization;
            if (needsReg) onRegularize(date);
            else setSelectedDateInfo(dayData || { date: dateStr, status: 'Absent' }); // Provide minimal info
        } else {
            setSelectedDateInfo(dayData || { date: dateStr });
        }
  };


  return (
    <div className="card p-4 sm:p-6 rounded-xl shadow-sm">
      {/* Header with Month Navigation */}
       <div className="flex items-center justify-between mb-4 sm:mb-6">
         <h2 className="text-base sm:text-lg font-semibold text-gray-900 dark:text-white">
           {view === 'employee' ? 'My Attendance' : view === 'manager' ? 'Team Attendance' : 'Company Attendance'}
         </h2>
         <div className="flex items-center space-x-2 sm:space-x-3">
            <button onClick={() => setCurrentDate(subMonths(currentDate, 1))} className="p-1.5 text-gray-500 hover:text-gray-800 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full transition-colors" aria-label="Previous month"> <ChevronLeft className="w-4 h-4 sm:w-5 sm:h-5" /> </button>
            <span className="text-sm sm:text-base font-medium text-gray-700 dark:text-gray-300 w-28 text-center tabular-nums"> {format(currentDate, 'MMMM yyyy')} </span>
            <button onClick={() => setCurrentDate(addMonths(currentDate, 1))} className="p-1.5 text-gray-500 hover:text-gray-800 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full transition-colors" aria-label="Next month"> <ChevronRight className="w-4 h-4 sm:w-5 sm:h-5" /> </button>
         </div>
       </div>

      {/* Calendar Grid */}
      <div className="grid grid-cols-7 gap-px bg-gray-200 dark:bg-gray-700 rounded-lg overflow-hidden border border-gray-200 dark:border-gray-700">
        {/* Day Headers */}
        {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
          <div key={day} className="py-2 text-center text-xs font-semibold bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-400 uppercase tracking-wide"> {day} </div>
        ))}
        {/* Calendar Days */}
        {getMonthDays(currentDate).map(({ date, isPadding, isCurrentMonth }, index) => {
          const dayDetails = getDayDetailsText(date);
          // Check needsRegularization safely
          const dayData = attendanceMap.get(format(date, 'yyyy-MM-dd'));
          const needsReg = view === 'employee' && dayData && 'needsRegularization' in dayData && dayData.needsRegularization;
          const isSelectable = !isPadding && isCurrentMonth;
          const isToday = isSameDay(date, new Date());

          return (
            <div
              key={index}
              className={`min-h-[70px] sm:min-h-[90px] p-1.5 flex flex-col justify-start relative group transition-colors duration-150 focus:outline-none ${isPadding ? 'bg-gray-50 dark:bg-gray-800/30' : getStatusStyle(date)} ${isSelectable ? 'cursor-pointer focus:ring-2 focus:ring-primary-400 focus:z-10' : 'cursor-default opacity-60'}`}
              onClick={() => handleDayClick(date, isPadding, isCurrentMonth)}
              onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') handleDayClick(date, isPadding, isCurrentMonth); }} // Accessibility
              tabIndex={isSelectable ? 0 : -1} // Accessibility
              aria-label={isSelectable ? format(date, 'MMMM do, yyyy') + (dayDetails ? `: ${dayDetails}` : '') : undefined}
            >
              {/* Day Number */}
              <span className={`text-xs sm:text-sm font-semibold mb-0.5 ${isPadding ? 'text-gray-400 dark:text-gray-600' : 'text-gray-800 dark:text-gray-200'} ${isToday ? 'bg-primary-500 text-white rounded-full w-5 h-5 flex items-center justify-center p-0.5' : ''}`}>
                  {date.getDate()}
              </span>
              {/* Details Text */}
              {!isPadding && dayDetails && (
                <div className="mt-auto text-[9px] sm:text-[10px] leading-tight break-words font-medium"> {/* Pushed details down */}
                   {dayDetails}
                </div>
              )}
               {/* Regularization Indicator */}
               {needsReg && (
                  <span title="Regularization Needed" className="absolute bottom-1 right-1 text-yellow-500 dark:text-yellow-400 group-hover:animate-pulse">
                      <AlertTriangle size={10} strokeWidth={3}/>
                  </span>
               )}
            </div>
          );
        })}
      </div>

      {/* Legend */}
      <div className="mt-4 flex flex-wrap gap-x-3 gap-y-1.5 text-xs text-gray-600 dark:text-gray-400">
           <div className="flex items-center space-x-1.5"><div className="w-2.5 h-2.5 bg-green-100 dark:bg-green-900/30 rounded-sm border border-green-200 dark:border-green-800"></div><span>Present</span></div>
           <div className="flex items-center space-x-1.5"><div className="w-2.5 h-2.5 bg-yellow-100 dark:bg-yellow-900/30 rounded-sm border border-yellow-200 dark:border-yellow-800"></div><span>Late</span></div>
           <div className="flex items-center space-x-1.5"><div className="w-2.5 h-2.5 bg-red-100 dark:bg-red-900/30 rounded-sm border border-red-200 dark:border-red-800"></div><span>Absent/Missing</span></div>
           <div className="flex items-center space-x-1.5"><div className="w-2.5 h-2.5 bg-orange-100 dark:bg-orange-900/30 rounded-sm border border-orange-200 dark:border-orange-800"></div><span>Half Day</span></div>
           <div className="flex items-center space-x-1.5"><div className="w-2.5 h-2.5 bg-blue-100 dark:bg-blue-900/30 rounded-sm border border-blue-200 dark:border-blue-800"></div><span>Holiday</span></div>
           <div className="flex items-center space-x-1.5"><div className="w-2.5 h-2.5 bg-purple-100 dark:bg-purple-900/30 rounded-sm border border-purple-200 dark:border-purple-800"></div><span>Leave</span></div>
           <div className="flex items-center space-x-1.5"><div className="w-2.5 h-2.5 bg-gray-100 dark:bg-gray-800/60 rounded-sm border border-gray-200 dark:border-gray-700"></div><span>Weekend</span></div>
      </div>
    </div>
  )
}