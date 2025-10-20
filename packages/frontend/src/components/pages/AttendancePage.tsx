'use client'

import { motion } from 'framer-motion'
import {
  Calendar, Plus, Clock, CheckCircle, XCircle, AlertTriangle, Users,
  Settings, TrendingUp, UserPlus, UserMinus, LucideProps, MapPin
} from 'lucide-react'
import { useState, useEffect, FC, ReactNode, useMemo } from 'react' // Removed unused types
import { format, parseISO, isSameDay } from 'date-fns' // Import date-fns functions used

// --- 1. Import Defined Types ---
import type {
    EmployeeAttendanceViewData,
    ManagerAttendanceViewData,
    AdminAttendanceViewData,
    AttendanceDayStatus,
    RegularizationRequest,
    AttendanceSummaryData
} from '@/types' // Adjust path if needed

// --- 2. Import Child Components (Ensure paths are correct) ---
import {AttendanceSummaryWidget} from '../widgets/AttendanceSummaryWidget'
import {AttendanceCalendar} from '@/components/widgets/AttendanceCalendar'
import {RegularizationForm} from '../widgets/RegularizationForm'
import {RegularizationHistory} from '../widgets/RegularizationHistory'

// --- API Base URL ---
const API_BASE_URL = process.env.NEXT_PUBLIC_BACKEND_URL;

export default function AttendancePage() {
  // --- State Variables ---
  const [userRole, setUserRole] = useState<string | null>(null);
  const [isRoleLoading, setIsRoleLoading] = useState(true);
  const [view, setView] = useState<'employee' | 'manager' | 'admin'>('employee');
  const [isLoading, setIsLoading] = useState(true); // Combined loading state

  const [showRegularizeForm, setShowRegularizeForm] = useState(false)
  const [selectedDate, setSelectedDate] = useState<Date | null>(null)

  // --- State for Fetched Data ---
  const [employeeData, setEmployeeData] = useState<EmployeeAttendanceViewData | null>(null);
  const [managerData, setManagerData] = useState<ManagerAttendanceViewData | null>(null);
  const [adminData, setAdminData] = useState<AdminAttendanceViewData | null>(null);

  // --- Fetch User Role (useEffect - unchanged) ---
  useEffect(() => {
    const fetchUserRoleAndSetDefaultView = async () => {
      setIsRoleLoading(true);
      const token = localStorage.getItem('supabase-auth-token');
      if (!token) {
        console.error("No auth token found, defaulting to employee.");
        setUserRole('employee'); setView('employee'); setIsRoleLoading(false); return;
      }
      try {
        const res = await fetch(`${API_BASE_URL}/auth/user`, { // Use /auth/user endpoint
          headers: { 'Authorization': `Bearer ${token}` }, cache: 'no-cache'
        });
        if (!res.ok) {
           if (res.status === 404) {
             console.warn("User profile not found, defaulting to employee.");
             setUserRole('employee'); setView('employee');
           } else { throw new Error(`Fetch failed: ${res.statusText}`); }
        } else {
           const userData = await res.json();
           // Map 'hr' role from DB to 'admin' view if needed, otherwise use DB role
           const role = userData.role === 'hr' ? 'admin' : userData.role || 'employee';
           setUserRole(role);
           // Set Default View based on fetched role
           if (role === 'admin') setView('admin');
           else if (role === 'manager') setView('manager');
           else setView('employee');
           console.log("Role fetched:", role, "Default View:", role === 'admin' ? 'admin' : role === 'manager' ? 'manager' : 'employee');
        }
      } catch (error) {
        console.error("Error fetching role:", error);
        setUserRole('employee'); setView('employee'); // Fallback on error
      } finally { setIsRoleLoading(false); }
    };
    fetchUserRoleAndSetDefaultView();
  }, []); // Run only once on mount

  // --- Data Fetching Functions (Unchanged) ---
  const fetchEmployeeAttendanceData = async () => {
    const token = localStorage.getItem('supabase-auth-token');
    if (!token) throw new Error('No auth token');
    const res = await fetch(`${API_BASE_URL}/attendance/employee-view`, {
      headers: { 'Authorization': `Bearer ${token}` }, cache: 'no-cache'
    });
    if (!res.ok) throw new Error(`Fetch failed ${res.status}: ${res.statusText}`);
    const data: EmployeeAttendanceViewData = await res.json();
    console.log("Fetched Employee Data:", data);
    setEmployeeData(data);
  };

  const fetchManagerAttendanceData = async () => {
    const token = localStorage.getItem('supabase-auth-token');
    if (!token) throw new Error('No auth token');
    const res = await fetch(`${API_BASE_URL}/attendance/manager-view`, {
      headers: { 'Authorization': `Bearer ${token}` }, cache: 'no-cache'
    });
     if (!res.ok) throw new Error(`Fetch failed ${res.status}: ${res.statusText}`);
    const data: ManagerAttendanceViewData = await res.json();
    console.log("Fetched Manager Data:", data);
    setManagerData(data);
  };

  const fetchAdminAttendanceData = async () => {
    const token = localStorage.getItem('supabase-auth-token');
    if (!token) throw new Error('No auth token');
    const res = await fetch(`${API_BASE_URL}/attendance/admin-view`, {
      headers: { 'Authorization': `Bearer ${token}` }, cache: 'no-cache'
    });
     if (!res.ok) throw new Error(`Fetch failed ${res.status}: ${res.statusText}`);
    const data: AdminAttendanceViewData = await res.json();
    console.log("Fetched Admin Data:", data);
    setAdminData(data);
  };

  // --- useEffect for Fetching Data Based on View ---
  useEffect(() => {
    const fetchDataForView = async () => {
       if (!userRole) return; // Don't fetch until role is known
       setIsLoading(true);
       console.log(`Fetching data for ${view} view (Role: ${userRole})...`);
       try {
         // Check role access *before* fetching
         if (view === 'employee') {
            await fetchEmployeeAttendanceData();
         } else if (view === 'manager' && (userRole === 'manager' || userRole === 'admin' || userRole === 'hr')) {
            await fetchManagerAttendanceData();
         } else if (view === 'admin' && (userRole === 'admin' || userRole === 'hr')) {
            await fetchAdminAttendanceData();
         } else if (view !== 'employee' && userRole === 'employee') { // Explicitly handle employee trying invalid view
            console.warn(`Role 'employee' cannot access '${view}'. Defaulting.`);
            setView('employee'); // Will trigger refetch for employee view
            return; // Exit early
         } else {
            // Handle other potential invalid state combinations if necessary
            console.warn(`Unexpected state: Role '${userRole}', View '${view}'. Defaulting.`);
            setView('employee');
            return;
         }
       } catch (error) {
         console.error(`Failed to fetch data for ${view} view:`, error);
         // Set specific error state to display friendly message in UI
         // setErrorState(`Could not load ${view} data. Please try again later.`);
       } finally {
         setIsLoading(false);
       }
    };
    // Only fetch when role loading is complete
    if (!isRoleLoading) {
        fetchDataForView();
    }
  }, [view, userRole, isRoleLoading]); // Dependencies


 // --- Action Handler Functions ---
 const handleClockInOut = async () => {
   const todayStr = format(new Date(), 'yyyy-MM-dd');
   
   // Your backend 'monthlyAttendance' array uses 'attendance_date'
   const todaysRecord = employeeData?.monthlyAttendance?.find((d) => d.attendance_date === todayStr);

   // Check for the correct backend field names
   const isClockedIn = todaysRecord && todaysRecord.clock_in_time && !todaysRecord.clock_out_time;
   
   const endpoint = isClockedIn ? 'clock-out' : 'clock-in';
   console.log(`Attempting to ${endpoint}...`);
   const token = localStorage.getItem('supabase-auth-token');
   if (!token) return console.error("No auth token");
   try {
     let locationData = {};
     if(endpoint === 'clock-in') {
       // You might want a better way to get location (e.g., GPS, dropdown)
       const location = prompt("Enter work location (e.g., Office, Home):", "Office");
       if (!location) return; // User cancelled prompt
       locationData = { location };
     }
     const res = await fetch(`${API_BASE_URL}/attendance/${endpoint}`, {
       method: 'POST',
       headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
       body: endpoint === 'clock-in' ? JSON.stringify(locationData) : undefined
     });
     const result = await res.json();
     if (!res.ok) throw new Error(result.message || `Failed to ${endpoint}`);
     alert(`Successfully ${endpoint}!`);
     await fetchEmployeeAttendanceData(); // Refresh data immediately
   } catch (error: any) {
     console.error(`Failed to ${endpoint}:`, error);
     alert(`Error: ${error.message}`);
   }
 };

  // Type the formData explicitly based on RegularizationForm's expected output
  const handleRegularizationSubmit = async (formData: {
    date: Date;
    reason: string;
    checkInTime?: string;
    checkOutTime?: string;
    requestedStatus?: string;
  }) => {
    console.log('Submitting regularization:', formData);
    const token = localStorage.getItem('supabase-auth-token');
    if (!token) return console.error("No auth token");
    try {
      const res = await fetch(`${API_BASE_URL}/attendance/regularize`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({
          date: format(formData.date, 'yyyy-MM-dd'), // Format date for backend
          reason: formData.reason,
          requestedClockIn: formData.checkInTime || null, // Backend expects HH:mm or null
          requestedClockOut: formData.checkOutTime || null,
          requestedStatus: formData.requestedStatus || null,
        })
      });
      const result = await res.json();
      if (!res.ok) throw new Error(result.message || 'Failed to submit request');
      alert('Regularization request submitted successfully!');
      setShowRegularizeForm(false);
      await fetchEmployeeAttendanceData(); // Refresh employee data after submission
    } catch (error: any) {
      console.error('Failed to submit regularization:', error);
      alert(`Error: ${error.message}`);
    }
  };

   const handleRegularizationApproval = async (requestId: string | number, newStatus: 'approved' | 'rejected') => {
       // Optional: Prompt for comments only when rejecting
       let comments: string | undefined = undefined;
       if (newStatus === 'rejected') {
           comments = prompt("Optional: Provide a reason for rejection:") || undefined;
           // If user cancels prompt, comments will be undefined, which is fine
       }

        console.log(`Processing request ${requestId} with status ${newStatus}`);
        const token = localStorage.getItem('supabase-auth-token');
        if (!token) return console.error("No auth token");
        try {
          const res = await fetch(`${API_BASE_URL}/attendance/regularize/action`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
            body: JSON.stringify({ requestId, status: newStatus, comments }) // Send comments or undefined
          });
          const result = await res.json();
          if (!res.ok) throw new Error(result.message || 'Failed to process request');
          alert(`Request ${newStatus} successfully!`);
          // Refresh data for the current view
          if (view === 'manager') await fetchManagerAttendanceData();
          if (view === 'admin') await fetchAdminAttendanceData();
        } catch (error: any) {
          console.error('Failed to process regularization:', error);
          alert(`Error: ${error.message}`);
        }
   };

  // Opens the regularization form modal
  const handleRegularize = (date: Date) => {
    setSelectedDate(date)
    setShowRegularizeForm(true)
  }

 // --- Determine Data for Current View (Safely) ---
 const attendanceSummary: AttendanceSummaryData | null = useMemo(() => {
    if (view === 'employee') return employeeData?.attendanceSummary || null;
    if (view === 'manager') return managerData?.teamAttendanceSummary || null;
    if (view === 'admin') return adminData?.companyWideAttendanceSummary || null;
    return null;
 }, [view, employeeData, managerData, adminData]);

 const calendarData = useMemo(() => {
    if (view === 'employee' && employeeData?.monthlyAttendance) {
        // Map backend's snake_case to the camelCase props the calendar expects
        return employeeData.monthlyAttendance.map(record => {
            // Cast record to 'any' to bypass incorrect type inference from a generic type.
            // This allows us to access the raw snake_case properties from the backend API.
            const rawRecord = record as any;
            return {
                date: rawRecord.attendance_date,
                status: rawRecord.status,
                clockIn: rawRecord.clock_in_time,
                clockOut: rawRecord.clock_out_time,
            };
        });
    }
    if (view === 'manager' && managerData?.teamMonthlyAttendanceSummary) {
        return managerData.teamMonthlyAttendanceSummary;
    }
    if (view === 'admin' && adminData?.companyAttendanceSummary) {
        return adminData.companyAttendanceSummary;
    }
    


    // Add admin view mapping if needed
    return [];
 }, [view, employeeData, managerData, adminData]);

 const regularizationHistory: RegularizationRequest[] =
    employeeData?.regularizationHistory || [];

 const pendingApprovals: RegularizationRequest[] =
    view === 'manager' ? (managerData?.pendingRegularizationApprovals || []) :
    view === 'admin' ? (adminData?.allPendingRegularizations || []) : [];

 const insights: string[] = view === 'manager' ? (managerData?.teamInsights || []) : [];
 const alerts: string[] = view === 'admin' ? (adminData?.systemAlerts || []) : [];

 // Determine Clock In/Out button text dynamically
 const { clockInOutText } = useMemo(() => {
    if (view !== 'employee' || !employeeData?.monthlyAttendance) {
        return { clockInOutText: 'Clock In' };
    }
    const todayStr = format(new Date(), 'yyyy-MM-dd');
    // Find today's record from the raw backend data using the correct field name
    const todaysRecord = employeeData.monthlyAttendance.find((d: any) => d.attendance_date === todayStr);

    // Check the correct backend field names: clock_in_time and clock_out_time
    const isClockedIn = !!(todaysRecord && todaysRecord.clock_in_time && !todaysRecord.clock_out_time);

    return {
        clockInOutText: isClockedIn ? 'Clock Out' : 'Clock In',
    };
 }, [employeeData, view]);

 const hours = parseFloat(employeeData?.todaysHours as unknown as string);
 const hoursDisplay = !isNaN(hours) ? hours.toFixed(1) : '0.0';

  // --- Loading Check ---
  if (isRoleLoading || isLoading) {
    // Basic loading indicator
    return (
        <div className="flex justify-center items-center h-[50vh]"> {/* Centered */}
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-500"></div>
            <p className="ml-3 text-gray-600 dark:text-gray-400">Loading Attendance...</p>
        </div>
    );
  }

  return (
    <div className="space-y-6 p-4 md:p-6">
      {/* --- Header with Conditional Buttons --- */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
           <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Attendance</h1>
           <p className="text-gray-600 dark:text-gray-400 mt-1 text-sm sm:text-base"> {/* Adjusted text size */}
               {view === 'employee' ? 'Track your work hours and manage attendance.' :
                view === 'manager' ? 'Monitor team attendance and approvals.' :
                'Company-wide attendance oversight.'}
           </p>
        </div>
        {/* --- View Switching Buttons --- */}
        {!isRoleLoading && userRole && (
            <div className="flex items-center space-x-2 sm:space-x-4 w-full sm:w-auto justify-end">
               <div className="flex space-x-1 sm:space-x-2 bg-gray-100 dark:bg-gray-800 p-1 rounded-lg shadow-sm">
                   {/* My View Button (Always shown if role is loaded) */}
                   <button onClick={() => setView('employee')} className={`px-3 py-1.5 rounded-md text-xs sm:text-sm font-medium transition-colors duration-150 ${view === 'employee' ? 'bg-white dark:bg-gray-900 text-primary-600 dark:text-primary-400 shadow' : 'text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white'}`}>My View</button>
                   {/* Manager View Button */}
                   {(userRole === 'manager' ) && (<button onClick={() => setView('manager')} className={`px-3 py-1.5 rounded-md text-xs sm:text-sm font-medium transition-colors duration-150 ${view === 'manager' ? 'bg-white dark:bg-gray-900 text-primary-600 dark:text-primary-400 shadow' : 'text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white'}`}>Manager</button>)}
                   {/* Admin View Button */}
                   {(userRole === 'admin' || userRole === 'hr') && (<button onClick={() => setView('admin')} className={`px-3 py-1.5 rounded-md text-xs sm:text-sm font-medium transition-colors duration-150 ${view === 'admin' ? 'bg-white dark:bg-gray-900 text-primary-600 dark:text-primary-400 shadow' : 'text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white'}`}>HR Admin</button>)}
               </div>
                {/* Clock In/Out Button */}
               {view === 'employee' && (
                   <button
                       onClick={handleClockInOut}
                       className="flex items-center space-x-1.5 px-3 py-1.5 bg-primary-500 hover:bg-primary-600 text-white rounded-lg text-xs sm:text-sm font-medium shadow transition-colors"
                   >
                       <Clock className="w-4 h-4" /> <span>{clockInOutText}</span>
                   </button>
               )}
            </div>
        )}
      </div>

      {/* --- Quick Stats --- */}
      {/* Conditionally render based on view AND data availability */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6">
        {view === 'employee' && employeeData ? (
          <>
           <StatCard icon={CheckCircle} color="green" label="Present Days" value={employeeData.presentDays ?? 0} />
            {/* Use the new variable here */}
            <StatCard icon={Clock} color="blue" label="Today's Hours" value={hoursDisplay} />
            <StatCard icon={AlertTriangle} color="yellow" label="Pending Reg." value={employeeData.pendingRegularizationsCount ?? 0} />
            <StatCard icon={MapPin} color="purple" label="Location" value={employeeData.currentWorkLocation ?? 'N/A'} isSmallText />
          </>
        ) : view === 'manager' && managerData ? (
          <>
             <StatCard icon={Users} color="green" label="Team Present" value={managerData.teamPresentToday ?? '0/0'} isSmallText />
             <StatCard icon={Clock} color="yellow" label="Team Late" value={managerData.teamLateToday ?? 0} />
             <StatCard icon={AlertTriangle} color="blue" label="Pending Req." value={managerData.pendingApprovalsCount ?? 0} />
             <StatCard icon={TrendingUp} color="purple" label="Team Avg." value={managerData.teamAverageAttendance ?? 'N/A'} isSmallText />
          </>
        ) : view === 'admin' && adminData ? (
           <>
             <StatCard icon={Users} color="green" label="Co. Present" value={adminData.companyPresentToday ?? '0/0'} isSmallText />
             <StatCard icon={Clock} color="yellow" label="Co. Late" value={adminData.companyLateToday ?? 0} />
             <StatCard icon={AlertTriangle} color="blue" label="Pending Req." value={adminData.totalPendingRequests ?? 0} />
             <StatCard icon={TrendingUp} color="purple" label="Co. Avg." value={adminData.companyAverageAttendance ?? 'N/A'} isSmallText />
           </>
        ) : (
          // Only show skeletons if not loading role, but data isn't ready
          !isRoleLoading && [...Array(4)].map((_, i) => <div key={i} className="card p-6 h-24 bg-gray-100 dark:bg-gray-700 animate-pulse rounded-xl shadow-sm"></div>)
        )}
      </div>

     {/* --- Main Content Grid --- */}
     <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column */}
        <div className="lg:col-span-2 space-y-6">
            <AttendanceCalendar
               onRegularize={handleRegularize}
               view={view}
               // Pass data, ensure it's always an array
               attendanceData={calendarData}
            />

            {/* Regularization History (Only Employee View) */}
            {view === 'employee' && <RegularizationHistory requests={regularizationHistory} />}

            {/* Manager Insights */}
            {view === 'manager' && (
             <div className="card p-6 rounded-xl shadow-sm">
               <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Team Insights</h2>
               <div className="space-y-3">
                  {(insights && insights.length > 0) ? (
                      insights.map((insight, index) => (
                          <div key={index} className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg flex items-start space-x-2 border border-blue-100 dark:border-blue-900">
                              <AlertTriangle className="w-4 h-4 text-blue-500 mt-0.5 flex-shrink-0"/>
                              <p className="text-blue-700 dark:text-blue-300 text-sm">{insight}</p>
                          </div>
                      ))
                  ) : ( <p className="text-gray-500 dark:text-gray-400 text-sm italic">No insights available for your team this period.</p> )}
               </div>
             </div>
            )}

          
        </div>

        {/* Right Column */}
        <div className="space-y-6">
            <AttendanceSummaryWidget summary={attendanceSummary} />

            {/* Regularization Form Modal Triggered by State */}
            {showRegularizeForm && selectedDate && (
                // Modal Wrapper Div - Handles centering and background dimming
                <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-center p-4" onClick={() => setShowRegularizeForm(false)}>
                    {/* Stop propagation prevents closing when clicking inside the form */}
                    <div onClick={(e) => e.stopPropagation()}>
                        <RegularizationForm
                            date={selectedDate}
                            onClose={() => setShowRegularizeForm(false)} // Use onClose from props
                            onSubmit={handleRegularizationSubmit}
                        />
                    </div>
                </div>
            )}

            {/* Manager Pending Approvals */}
            {(view === 'manager' || view === 'admin') && ( // Show for Admin too if they handle approvals
               <div className="card p-6 rounded-xl shadow-sm">
                 <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Pending Approvals ({pendingApprovals?.length || 0})</h2>
                  <div className="space-y-3 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar"> {/* Added scroll and custom class */}
                    {(pendingApprovals && pendingApprovals.length > 0) ? (
                       pendingApprovals.map((request) => (
                          <div key={request.id} className="p-3 border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 shadow-sm hover:shadow-md transition-shadow">
                             <div className="flex justify-between items-start gap-2">
                               <div className="flex-1 min-w-0">
                                   <p className="font-medium text-sm text-gray-800 dark:text-white truncate">{request.employeeName}</p>
                                   <p className="text-xs text-gray-500 dark:text-gray-400">
                                       {format(parseISO(request.date), 'MMM d, yyyy')}
                                   </p>
                                   <p className="text-xs text-gray-600 dark:text-gray-300 mt-1 line-clamp-2" title={request.reason}> {/* Add title for full   reason */}
                                       {request.reason || 'No reason provided'}
                                   </p>
                                   <div className="text-xs text-gray-500 mt-1 space-x-2">
                                       {request.requested_clock_in && <span>In: {request.requested_clock_in as string}</span>}
                                       {request.requested_clock_out && <span>Out: {request.requested_clock_out as string}</span>}
                                   </div>
                               </div>
                               <div className="flex flex-col space-y-1.5 flex-shrink-0">
                                   <button
                                       onClick={() => handleRegularizationApproval(request.id, 'approved')}
                                       className="px-2.5 py-1 bg-green-500 text-white rounded text-xs font-semibold hover:bg-green-600 focus:outline-none focus:ring-2 focus:ring-green-400 focus:ring-opacity-50 transition-colors"
                                       aria-label={`Approve request for ${request.employeeName} on ${format(parseISO(request.date), 'MMM d')}`}
                                   >Approve</button>
                                   <button
                                       onClick={() => handleRegularizationApproval(request.id, 'rejected')}
                                       className="px-2.5 py-1 bg-red-500 text-white rounded text-xs font-semibold hover:bg-red-600 focus:outline-none focus:ring-2 focus:ring-red-400 focus:ring-opacity-50 transition-colors"
                                        aria-label={`Reject request for ${request.employeeName} on ${format(parseISO(request.date), 'MMM d')}`}
                                   >Reject</button>
                               </div>
                             </div>
                          </div>
                       ))
                    ) : ( <p className="text-gray-500 dark:text-gray-400 text-sm text-center py-4 italic">No pending approvals.</p> )}
                 </div>
               </div>
              )}

              
        </div>
     </div>
    </div>
  )
}

// --- StatCard Helper Component ---
interface StatCardProps {
    icon: FC<LucideProps>;
    color: 'green' | 'blue' | 'yellow' | 'purple';
    label: string;
    value: string | number | undefined | null; // Allow undefined/null
    isSmallText?: boolean;
}

const StatCard: FC<StatCardProps> = ({ icon: Icon, color, label, value, isSmallText }) => {
    // Define color mappings using object for better organization
    const colorClasses = {
        green: { bg: 'bg-green-100 dark:bg-green-900/20', text: 'text-green-600 dark:text-green-400' },
        blue: { bg: 'bg-blue-100 dark:bg-blue-900/20', text: 'text-blue-600 dark:text-blue-400' },
        yellow: { bg: 'bg-yellow-100 dark:bg-yellow-900/20', text: 'text-yellow-600 dark:text-yellow-400' },
        purple: { bg: 'bg-purple-100 dark:bg-purple-900/20', text: 'text-purple-600 dark:text-purple-400' },
    };
    const currentClasses = colorClasses[color];
    const valueTextSize = isSmallText ? 'text-base sm:text-lg' : 'text-xl sm:text-2xl'; // Slightly adjusted sizes

    // Handle null or undefined values gracefully
    const displayValue = value === undefined || value === null ? '-' : value;

    return (
        <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: Math.random() * 0.2 }}
            className="card p-4 sm:p-5 rounded-xl shadow-sm bg-white dark:bg-gray-800" // Added background
        >
            <div className="flex items-center">
                <div className={`w-10 h-10 sm:w-11 sm:h-11 ${currentClasses.bg} rounded-lg flex items-center justify-center flex-shrink-0`}>
                    <Icon className={`w-5 h-5 sm:w-6 sm:h-6 ${currentClasses.text}`} />
                </div>
                <div className="ml-3 sm:ml-4 overflow-hidden">
                    <p className="text-xs sm:text-sm font-medium text-gray-500 dark:text-gray-400 truncate" title={label}>{label}</p>
                    <p className={`${valueTextSize} font-bold text-gray-800 dark:text-white truncate`} title={String(displayValue)}>{displayValue}</p>
                </div>
            </div>
        </motion.div>
    );
};

