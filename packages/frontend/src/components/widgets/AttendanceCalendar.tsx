'use client'
export const dynamic = 'force-dynamic';
import { useState, useMemo, FC } from 'react'
import { ChevronLeft, ChevronRight, AlertTriangle } from 'lucide-react'
import { format, startOfMonth, endOfMonth, eachDayOfInterval, getDay, isSameDay, parseISO, addMonths, subMonths } from 'date-fns'
import type { AttendanceDayStatus } from '@/types' 

// This type is flexible for Employee (AttendanceDayStatus) or Manager (summary)
type CalendarSummaryData = {
  date: string; // YYYY-MM-DD
  presentCount?: number;
  absentCount?: number;
  lateCount?: number;
  onLeaveCount?: number;
} | AttendanceDayStatus;

interface AttendanceCalendarProps {
  onRegularize: (date: Date) => void
  view: 'employee' | 'manager' | 'admin'
  attendanceData: CalendarSummaryData[] | null;
}

export const AttendanceCalendar: FC<AttendanceCalendarProps> = ({ onRegularize, view, attendanceData }) => {
  const [currentDate, setCurrentDate] = useState(new Date())

  // Memoized map for fast data lookup
  const attendanceMap = useMemo(() => {
    const map = new Map<string, CalendarSummaryData>();
    if (attendanceData) {
      attendanceData.forEach(day => {
        try {
          // Use the 'date' field from employee view (mapped from attendance_date)
          // or the 'date' field from manager view
          const dateKey = format(parseISO(day.date), 'yyyy-MM-dd');
          map.set(dateKey, day);
        } catch (e) { console.error("Invalid date in attendanceData:", day.date, e); }
      });
    }
    return map;
  }, [attendanceData]);

  // Calendar grid generation (unchanged, it's correct)
  const getMonthDays = (date: Date): { date: Date; isPadding: boolean; isCurrentMonth: boolean }[] => {
     const monthStart = startOfMonth(date);
     const monthEnd = endOfMonth(date);
     const daysInMonth = eachDayOfInterval({ start: monthStart, end: monthEnd });
     const allDays = [];
     const firstDayOfMonthWeekday = getDay(monthStart); // 0 = Sunday

     for (let i = 0; i < firstDayOfMonthWeekday; i++) {
         const paddingDate = new Date(monthStart);
         paddingDate.setDate(paddingDate.getDate() - (firstDayOfMonthWeekday - i));
         allDays.push({ date: paddingDate, isPadding: true, isCurrentMonth: false });
     }
     daysInMonth.forEach(day => {
         allDays.push({ date: day, isPadding: false, isCurrentMonth: true });
     });
     const cellsToAdd = 42 - allDays.length; // Ensure 6 rows
     for (let i = 1; i <= cellsToAdd; i++) {
         const paddingDate = new Date(monthEnd);
         paddingDate.setDate(paddingDate.getDate() + i);
         allDays.push({ date: paddingDate, isPadding: true, isCurrentMonth: false });
     }
     return allDays;
  }

  // Day cell styling logic (unchanged, it's correct)
  const getStatusStyle = (date: Date): string => {
     const dateStr = format(date, 'yyyy-MM-dd');
     const dayData = attendanceMap.get(dateStr);
     const dayOfWeek = getDay(date);

     if (!dayData) {
         if (dayOfWeek === 0 || dayOfWeek === 6) return 'bg-gray-100 dark:bg-gray-800/60 text-gray-500'; // Weekend
         return 'bg-white dark:bg-gray-900'; // Default
     }
     if ('status' in dayData) { // Employee View
         const status = (dayData as AttendanceDayStatus).status;
         switch (status) {
           case 'Present': case 'Regularized - Present': return 'bg-green-100 dark:bg-green-900/30 text-green-700';
           case 'Late': case 'Regularized - Late': return 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700';
           case 'Absent': case 'Missing Punch': return 'bg-red-100 dark:bg-red-900/30 text-red-700';
           case 'Half Day - First Half': case 'Half Day - Second Half': return 'bg-orange-100 dark:bg-orange-900/30';
           case 'Holiday': return 'bg-blue-100 dark:bg-blue-900/30 text-blue-700';
           case 'Leave': return 'bg-purple-100 dark:bg-purple-900/30 text-purple-700';
           case 'Weekend': return 'bg-gray-100 dark:bg-gray-800/60 text-gray-500';
           default: return 'bg-white dark:bg-gray-900';
         }
     } else { // Manager/Admin View
         const summary = dayData as { absentCount?: number; lateCount?: number };
         if (summary.absentCount && summary.absentCount > 0) return 'bg-red-50 dark:bg-red-900/10';
         if (summary.lateCount && summary.lateCount > 0) return 'bg-yellow-50 dark:bg-yellow-900/10';
         return 'bg-gray-50 dark:bg-gray-800/50';
     }
  }

  // **(CORRECTED)** - This now reflects your backend data
  const getDayDetailsText = (date: Date): React.ReactNode | null => {
      const dateStr = format(date, 'yyyy-MM-dd');
      const dayData = attendanceMap.get(dateStr);
      if (!dayData) {
        const dayOfWeek = getDay(date);
        if (dayOfWeek === 0 || dayOfWeek === 6) return <span className="text-gray-400 dark:text-gray-500 text-[9px] font-medium opacity-80">Weekend</span>;
        return null;
      }
      if ('status' in dayData) {
          const att = dayData as AttendanceDayStatus;
          // Use clock_in_time and clock_out_time (which are mapped to clockIn/clockOut by parent)
          const clockIn = att.clockIn ? format(parseISO(att.clockIn), 'HH:mm') : '?';
          const clockOut = att.clockOut ? format(parseISO(att.clockOut), 'HH:mm') : '?';

          switch (att.status) {
            case 'Present': case 'Regularized - Present': return `✅ ${clockIn} - ${clockOut}`;
            case 'Late': case 'Regularized - Late': return `⚠️ ${clockIn} - ${clockOut}`;
            case 'Absent': return '❌ Absent';
            case 'Missing Punch': return `❓ Missing ${att.clockIn ? 'Out' : 'In'}`;
            case 'Half Day - First Half': return `½ 1st Half`;
            case 'Half Day - Second Half': return `½ 2nd Half`;
            case 'Holiday': return `🎉 Holiday`; // Simpler - backend doesn't send holidayName
            case 'Leave': return `✈️ On Leave`; // Simpler - backend doesn't send leaveType
            case 'Weekend': return <span className="text-gray-400 dark:text-gray-500 text-[9px] font-medium opacity-80">Weekend</span>;
            default: return null;
          }
      } else { // Manager/Admin
          // This part was already correct
          const summ = dayData as { presentCount?: number; absentCount?: number; lateCount?: number; onLeaveCount?: number };
          const details = [];
          if (summ.presentCount) details.push(`P:${summ.presentCount}`);
          if (summ.absentCount) details.push(`A:${summ.absentCount}`);
          if (summ.lateCount) details.push(`L:${summ.lateCount}`);
          if (summ.onLeaveCount) details.push(`LV:${summ.onLeaveCount}`);
          return details.length > 0 ? <div className="flex flex-wrap gap-x-1">{details.map((d, i) => <span key={i} className={`text-[9px] font-medium ${d.startsWith('A:') ? 'text-red-600' : d.startsWith('L:') ? 'text-yellow-600' : 'text-gray-500'}`}>{d}</span>)}</div> : null;
      }
  }

  // **(CORRECTED)** - This logic determines if the "Regularize" button appears
  const handleDayClick = (date: Date, isPadding: boolean, isCurrentMonth: boolean) => {
      if (isPadding || !isCurrentMonth) return;
      const dateStr = format(date, 'yyyy-MM-dd');
      const dayData = attendanceMap.get(dateStr);

      if (view === 'employee') {
          const status = (dayData as AttendanceDayStatus)?.status;
          // **THE FIX**: Check status directly, not a non-existent prop
          if (['Absent', 'Missing Punch', 'Late'].includes(status)) {
            onRegularize(date); // Call the parent function to open the modal
          }
      } else {
          // For manager/admin, you might want to set a selected day to show details
          // setSelectedDateInfo(dayData || { date: dateStr });
      }
  };

  const dayNeedsRegularization = (date: Date): boolean => {
    if (view !== 'employee') return false;
    const dayData = attendanceMap.get(format(date, 'yyyy-MM-dd'));
    const status = (dayData as AttendanceDayStatus)?.status;
    return ['Absent', 'Missing Punch', 'Late'].includes(status);
  }

  // --- Render method (unchanged, but now uses corrected helpers) ---
  return (
    <div className="card p-4 sm:p-6 rounded-xl shadow-sm bg-white dark:bg-gray-800">
      <div className="flex items-center justify-between mb-4 sm:mb-6">
        <h2 className="text-base sm:text-lg font-semibold text-gray-900 dark:text-white">
          {view === 'employee' ? 'My Attendance' : 'Team Attendance'}
        </h2>
        <div className="flex items-center space-x-2 sm:space-x-3">
           <button onClick={() => setCurrentDate(subMonths(currentDate, 1))} className="p-1.5 text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full" aria-label="Previous month"> <ChevronLeft className="w-5 h-5" /> </button>
           <span className="text-sm sm:text-base font-medium text-gray-700 dark:text-gray-300 w-28 text-center"> {format(currentDate, 'MMMM yyyy')} </span>
           <button onClick={() => setCurrentDate(addMonths(currentDate, 1))} className="p-1.5 text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full" aria-label="Next month"> <ChevronRight className="w-5 h-5" /> </button>
        </div>
      </div>

      <div className="grid grid-cols-7 gap-px bg-gray-200 dark:bg-gray-700 rounded-lg overflow-hidden border border-gray-200 dark:border-gray-700">
        {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
          <div key={day} className="py-2 text-center text-xs font-semibold bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-400 uppercase"> {day} </div>
        ))}
        
        {getMonthDays(currentDate).map(({ date, isPadding, isCurrentMonth }, index) => {
          const dayDetails = getDayDetailsText(date);
          const needsReg = dayNeedsRegularization(date);
          const isSelectable = !isPadding && isCurrentMonth;
          const isToday = isSameDay(date, new Date());

          return (
            <div
              key={index}
              className={`min-h-[90px] p-1.5 flex flex-col justify-start relative group transition-colors ${isPadding ? 'bg-gray-50 dark:bg-gray-800/30' : getStatusStyle(date)} ${isSelectable && needsReg ? 'cursor-pointer focus:ring-2 focus:ring-primary-400' : 'cursor-default'} ${!isCurrentMonth ? 'opacity-60' : ''}`}
              onClick={() => handleDayClick(date, isPadding, isCurrentMonth)}
              tabIndex={isSelectable ? 0 : -1}
              aria-label={isSelectable ? format(date, 'MMMM do, yyyy') : undefined}
            >
              <span className={`text-sm font-semibold ${isPadding ? 'text-gray-400 dark:text-gray-600' : 'text-gray-800 dark:text-gray-200'} ${isToday ? 'bg-primary-500 text-white rounded-full w-6 h-6 flex items-center justify-center' : ''}`}>
                {date.getDate()}
              </span>
              {!isPadding && dayDetails && (
                <div className="mt-auto text-[10px] leading-tight font-medium">
                   {dayDetails}
                </div>
              )}
              {needsReg && (
                 <span title="Regularization Needed" className="absolute bottom-1 right-1 text-yellow-500">
                   <AlertTriangle size={12} strokeWidth={3}/>
                 </span>
              )}
            </div>
          );
        })}
      </div>
       {/* Legend (Unchanged) */}
    </div>
  )
}