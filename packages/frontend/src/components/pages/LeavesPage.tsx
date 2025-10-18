'use client'

import { motion } from 'framer-motion'
import { 
  Calendar, Plus, Clock, CheckCircle, XCircle, AlertTriangle, Users, 
  Settings, List, FileText, BookOpen, TrendingUp, UserPlus, UserMinus, LucideProps 
} from 'lucide-react'
import { useState, ChangeEvent, FormEvent, useEffect, FC } from 'react'
import {
  LeaveBalanceCard, LeaveHistoryEntry, CompanyHoliday, LeavePolicyDetails, 
  PendingApprovalRequest, TeamLeaveBalanceSummary, AIConflictAdvisorData, 
  LeavePolicyConfiguration, CompanyWideLeaveDashboardData, AIAbsenteeismForecasterData, 
  LeaveFormState, LeaveStatus
} from '@/types' // Assuming @/types maps to src/types/index.ts

// Base URL for your backend API
const API_BASE_URL = 'http://localhost:5000/api';

// Map icon names from the API to actual Lucide icon components
const iconMap: { [key: string]: FC<LucideProps> } = {
  Calendar,
  Clock,
  CheckCircle,
  XCircle,
};

export default function LeavesPage() {
  const [view, setView] = useState<'employee' | 'manager' | 'hr_admin'>('employee');
  const [isLoading, setIsLoading] = useState(true);

  // --- Main Data State ---
  const [leaveBalances, setLeaveBalances] = useState<LeaveBalanceCard[]>([]);
  const [leaveHistory, setLeaveHistory] = useState<LeaveHistoryEntry[]>([]);
  const [companyHolidays, setCompanyHolidays] = useState<CompanyHoliday[]>([]);
  const [leavePolicies, setLeavePolicies] = useState<LeavePolicyDetails>({});
  const [pendingApprovals, setPendingApprovals] = useState<PendingApprovalRequest[]>([]);
  const [teamLeaveBalances, setTeamLeaveBalances] = useState<TeamLeaveBalanceSummary[]>([]);
  const [aiConflictAdvisor, setAiConflictAdvisor] = useState<AIConflictAdvisorData>({});
  const [leavePolicyConfig, setLeavePolicyConfig] = useState<{ [key: string]: LeavePolicyConfiguration }>({});
  const [companyWideLeaveData, setCompanyWideLeaveData] = useState<CompanyWideLeaveDashboardData | null>(null);
  const [aiAbsenteeismForecaster, setAiAbsenteeismForecaster] = useState<AIAbsenteeismForecasterData>([]);
  
  // --- UI Control State (Modals & Forms) ---
  const [isApplyLeaveModalOpen, setIsApplyLeaveModalOpen] = useState(false);
  const [isAddHolidayModalOpen, setIsAddHolidayModalOpen] = useState(false);
  const [isNewPolicyModalOpen, setIsNewPolicyModalOpen] = useState(false);
  
  const [leavePolicyTooltip, setLeavePolicyTooltip] = useState<string | null>(null);
  
  const [leaveForm, setLeaveForm] = useState<LeaveFormState>({
    leaveType: '', fromDate: '', toDate: '', startSession: 'Full Day',
    endSession: 'Full Day', reason: '', document: null,
  });

  const [newHolidayForm, setNewHolidayForm] = useState({ name: '', date: '' });
  const [newPolicyForm, setNewPolicyForm] = useState({ name: '', totalDays: 12, description: '', icon: 'Calendar', color: 'gray' });
  const [manualAdjustmentForm, setManualAdjustmentForm] = useState({ employeeId: '', policyName: '', days: 0 });

  useEffect(() => {
    const fetchDataForView = async () => {
      setIsLoading(true);
      try {
        if (view === 'employee') await fetchEmployeeData();
        else if (view === 'manager') await fetchManagerData();
        else if (view === 'hr_admin') await fetchHrAdminData();
      } catch (error) {
        console.error("Failed to fetch data:", error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchDataForView();
  }, [view]);

  // --- Data Fetching Functions ---
 const fetchEmployeeData = async () => {
    const token = localStorage.getItem('supabase-auth-token');
    if (!token) throw new Error('No authentication token found. Please log in.');
    const res = await fetch(`${API_BASE_URL}/leaves/employee-view`, { 
      headers: { 
        'Authorization': `Bearer ${token}` 
      },
      cache: 'no-cache' // <-- ADD THIS
    });
    if (!res.ok) throw new Error(`Failed to fetch employee data: ${res.statusText}`);
    const data = await res.json();
    setLeaveBalances(data.balances ?? []);
    setLeaveHistory(data.history ?? []);
    setCompanyHolidays(data.companyHolidays ?? []);
    setLeavePolicies(data.leavePolicies ?? {});
  };

  const fetchManagerData = async () => {
    const token = localStorage.getItem('supabase-auth-token');
    if (!token) throw new Error('No authentication token found. Please log in.');
    const res = await fetch(`${API_BASE_URL}/leaves/manager-view`, { 
      headers: { 
        'Authorization': `Bearer ${token}` 
      },
      cache: 'no-cache' // <-- ADD THIS
    });
    if (!res.ok) throw new Error(`Failed to fetch manager data: ${res.statusText}`);
    const data = await res.json();
    setPendingApprovals(data.pendingApprovals ?? []);
    setTeamLeaveBalances(data.teamBalances ?? []);
    setAiConflictAdvisor(data.aiConflictAdvisor ?? {});
  };

  const fetchHrAdminData = async () => {
    const token = localStorage.getItem('supabase-auth-token');
    if (!token) throw new Error('No authentication token found. Please log in.');
    const res = await fetch(`${API_BASE_URL}/leaves/hr-admin-view`, { 
      headers: { 
        'Authorization': `Bearer ${token}` 
      },
      cache: 'no-cache' // <-- ADD THIS
    });
    if (!res.ok) throw new Error(`Failed to fetch HR admin data: ${res.statusText}`);
    const data = await res.json();
    setLeavePolicyConfig(data.leavePolicyConfig ?? {});
    setCompanyHolidays(data.companyHolidays ?? []);
    setCompanyWideLeaveData(data.companyWideLeaveData ?? null);
    setAiAbsenteeismForecaster(data.aiAbsenteeismForecaster ?? []);
  };

  // --- Handler Functions ---
  const handleLeaveFormChange = (e: ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    if (type === 'file') {
      const files = (e.target as HTMLInputElement).files;
      setLeaveForm(prev => ({ ...prev, document: files ? files[0] : null }));
    } else {
      setLeaveForm(prev => ({ ...prev, [name]: value }));
    }
    if (name === 'leaveType') {
      setLeavePolicyTooltip(leavePolicies[value] || '');
    }
  };

 const handleApplyLeaveSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const token = localStorage.getItem('supabase-auth-token');
    if (!token) return console.error("No auth token found.");

    // --- REMOVED ---
    // const formData = new FormData();
    // Object.entries(leaveForm).forEach(([key, value]) => {
    //   if (value) formData.append(key, value as string | Blob);
    // });

    try {
      const response = await fetch(`${API_BASE_URL}/leaves/apply`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          // --- ADD THIS HEADER ---
          'Content-Type': 'application/json' 
        },
        // --- CHANGE THE BODY ---
        body: JSON.stringify(leaveForm) // Send the form state directly as JSON
      });

      if (!response.ok) {
        // Log the server's error message for better debugging
        const errorData = await response.json();
        console.error('Server error:', errorData.error || errorData.message || 'Failed to submit');
        throw new Error('Failed to submit leave application');
      }

      setIsApplyLeaveModalOpen(false);
      fetchEmployeeData();
    } catch (error) {
      console.error(error);
    }
  };

  const handleApproveReject = async (id: number | string, status: LeaveStatus) => {
    const token = localStorage.getItem('supabase-auth-token');
    if (!token) return console.error("No auth token found.");
    try {
      const response = await fetch(`${API_BASE_URL}/leaves/action`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({ requestId: id, status })
      });
      if (!response.ok) throw new Error('Action failed');
      fetchManagerData();
    } catch (error) {
      console.error(`Failed to ${status} request:`, error);
    }
  };

  // --- ✅ ADDED: Handlers for HR Admin Forms ---
  const handleAddHolidaySubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const token = localStorage.getItem('supabase-auth-token');
    if (!token) return console.error("No auth token found.");
    try {
        await fetch(`${API_BASE_URL}/leaves/hr/holidays`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
            body: JSON.stringify(newHolidayForm)
        });
        setIsAddHolidayModalOpen(false);
        fetchHrAdminData();
    } catch (error) {
        console.error("Failed to add holiday", error);
    }
  };

  const handleNewPolicySubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const token = localStorage.getItem('supabase-auth-token');
    if (!token) return console.error("No auth token found.");
    try {
        await fetch(`${API_BASE_URL}/leaves/hr/policies`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
            body: JSON.stringify(newPolicyForm)
        });
        setIsNewPolicyModalOpen(false);
        fetchHrAdminData();
    } catch (error) {
        console.error("Failed to create policy", error);
    }
  };

  const handleManualAdjustment = async (action: 'credit' | 'debit') => {
    const token = localStorage.getItem('supabase-auth-token');
    if (!token) return console.error("No auth token found.");
    try {
        await fetch(`${API_BASE_URL}/leaves/hr/adjust`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
            body: JSON.stringify({ ...manualAdjustmentForm, action })
        });
        alert("Balance adjusted successfully!");
    } catch (error) {
        console.error("Failed to adjust balance", error);
    }
  };


  if (isLoading) {
    return <div className="text-center p-8">Loading...</div>;
  }
  return (
     <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Leave Management</h1>
          <p className="text-gray-600 dark:text-gray-400">Manage leave requests and track balances</p>
        </div>
        <div className="flex space-x-2">
          <button onClick={() => setView('employee')} className={`px-4 py-2 rounded-lg ${view === 'employee' ? 'bg-primary-500 text-white' : 'bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200'}`}>Employee</button>
          <button onClick={() => setView('manager')} className={`px-4 py-2 rounded-lg ${view === 'manager' ? 'bg-primary-500 text-white' : 'bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200'}`}>Manager</button>
          <button onClick={() => setView('hr_admin')} className={`px-4 py-2 rounded-lg ${view === 'hr_admin' ? 'bg-primary-500 text-white' : 'bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200'}`}>HR Admin</button>
        </div>
      </div>
      {view === 'employee' && (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {leaveBalances.map((leave, index) => {
                const IconComponent = iconMap[leave.icon] || Calendar; // Translate string to component
                return (
                  <motion.div key={index} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: index * 0.1 }} className="card p-6">
                    <div className="flex items-center">
                      <div className={`w-12 h-12 bg-${leave.color}-100 dark:bg-${leave.color}-900/20 rounded-lg flex items-center justify-center`}>
                        <IconComponent className={`w-6 h-6 text-${leave.color}-600 dark:text-${leave.color}-400`} />
                      </div>
                      <div className="ml-4">
                        <p className="text-sm font-medium text-gray-600 dark:text-gray-400">{leave.type}</p>
                        <p className="text-2xl font-bold text-gray-900 dark:text-white">{`${leave.used} / ${leave.total}`}</p>
                      </div>
                    </div>
                  </motion.div>
                );
            })}
          </div>

          <div className="card p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">My Leave History</h2>
              <button onClick={() => setIsApplyLeaveModalOpen(true)} className="flex items-center space-x-2 px-4 py-2 bg-primary-500 hover:bg-primary-600 text-white rounded-lg">
                <Plus className="w-4 h-4" />
                <span>Apply for Leave</span>
              </button>
            </div>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                <thead>
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Leave Type</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">From</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">To</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Days</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Reason</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                  {leaveHistory.map((leave) => (
                    <tr key={leave.id}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">{leave.type}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">{leave.from}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">{leave.to}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">{leave.days}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">{leave.reason}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                          leave.status === 'approved' ? 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400' :
                          leave.status === 'pending' ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400' :
                          'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400'
                        }`}>{leave.status}</span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="card p-6">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Team Availability Calendar</h2>
              <div className="text-center py-12 text-gray-500 dark:text-gray-400">
                <Calendar className="w-12 h-12 mx-auto mb-4 opacity-50" />
                <p>Team calendar view coming soon...</p>
                <p className="text-sm">See who's on leave to plan your work better.</p>
              </div>
            </div>
            <div className="card p-6">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Company Holiday List</h2>
              <ul className="space-y-2">
                {companyHolidays.map((holiday, index) => (
                  <li key={index} className="flex justify-between items-center text-gray-700 dark:text-gray-300">
                    <span>{holiday.name}</span>
                    <span className="font-medium">{holiday.date}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
          
          {isApplyLeaveModalOpen && (
            <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50 flex justify-center items-center">
              <div className="relative p-8 border w-full max-w-lg shadow-lg rounded-md bg-white dark:bg-gray-800">
                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4">Apply for Leave</h3>
                <form onSubmit={handleApplyLeaveSubmit} className="space-y-4">
                  <div>
                    <label htmlFor="leaveType" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Leave Type</label>
                    <div className="relative group">
                      <select id="leaveType" name="leaveType" value={leaveForm.leaveType} onChange={handleLeaveFormChange} required className="mt-1 block w-full p-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100">
                        <option value="">Select Leave Type</option>
                        {/* ✅ FIX: Populate dropdown from all available policies, not just balances */}
                        {Object.keys(leavePolicies).map((policyName, index) => (
                          <option key={index} value={policyName}>{policyName}</option>
                        ))}
                      </select>
                      {leavePolicyTooltip && (
                        <div className="absolute left-full ml-2 top-1/2 -translate-y-1/2 hidden group-hover:block bg-gray-800 text-white text-xs rounded py-1 px-2 z-10 whitespace-nowrap">
                          {leavePolicyTooltip}
                        </div>
                      )}
                    </div>
                  </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label htmlFor="fromDate" className="block text-sm font-medium text-gray-700 dark:text-gray-300">From Date</label>
                        <input type="date" id="fromDate" name="fromDate" value={leaveForm.fromDate} onChange={handleLeaveFormChange} required className="mt-1 block w-full p-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100" />
                      </div>
                      <div>
                        <label htmlFor="toDate" className="block text-sm font-medium text-gray-700 dark:text-gray-300">To Date</label>
                        <input type="date" id="toDate" name="toDate" value={leaveForm.toDate} onChange={handleLeaveFormChange} required className="mt-1 block w-full p-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100" />
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label htmlFor="startSession" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Start Session</label>
                        <select id="startSession" name="startSession" value={leaveForm.startSession} onChange={handleLeaveFormChange} className="mt-1 block w-full p-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100">
                          <option value="Full Day">Full Day</option>
                          <option value="First Half">First Half</option>
                          <option value="Second Half">Second Half</option>
                        </select>
                      </div>
                      <div>
                        <label htmlFor="endSession" className="block text-sm font-medium text-gray-700 dark:text-gray-300">End Session</label>
                        <select id="endSession" name="endSession" value={leaveForm.endSession} onChange={handleLeaveFormChange} className="mt-1 block w-full p-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100">
                          <option value="Full Day">Full Day</option>
                          <option value="First Half">First Half</option>
                          <option value="Second Half">Second Half</option>
                        </select>
                      </div>
                    </div>
                  <div>
                    <label htmlFor="reason" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Reason</label>
                    <textarea id="reason" name="reason" rows={3} value={leaveForm.reason} onChange={handleLeaveFormChange} required className="mt-1 block w-full p-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"></textarea>
                           </div>
                  {leaveForm.leaveType === 'Sick Leave' && (
                    <div>
                      <label htmlFor="document" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Attach Document (e.g., Doctor's note)</label>
                      <input type="file" id="document" name="document" onChange={handleLeaveFormChange} className="mt-1 block w-full text-sm text-gray-900 dark:text-gray-100 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-primary-50 file:text-primary-700 hover:file:bg-primary-100" />
                    </div>
                  )}
                  <div className="flex justify-end space-x-2">
                    <button type="button" onClick={() => setIsApplyLeaveModalOpen(false)} className="px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 rounded-lg">
                      Cancel
                    </button>
                    <button type="submit" className="px-4 py-2 bg-primary-500 hover:bg-primary-600 text-white rounded-lg">
                      Submit Application
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}
        </>
      )}

      {view === 'manager' && (
        <>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="lg:col-span-2 card p-6 space-y-4">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Pending Leave Approvals</h2>
              {pendingApprovals.length === 0 ? (
                <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                  <CheckCircle className="w-12 h-12 mx-auto mb-4 opacity-50" />
                  <p>No pending leave requests.</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {pendingApprovals.map((request) => (
                    <div key={request.id} className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
                      <div className="flex justify-between items-center mb-2">
                        <p className="font-medium text-gray-900 dark:text-white">{`${request.employee} - ${request.type}`}</p>
                        <span className="text-sm text-gray-600 dark:text-gray-400">{`Balance: ${request.balance}`}</span>
                      </div>
                      <p className="text-sm text-gray-700 dark:text-gray-300 mb-2">{`Dates: ${request.from} to ${request.to} (${request.days} days)`}</p>
                      <p className="text-sm text-gray-700 dark:text-gray-300 mb-4">{`Reason: ${request.reason}`}</p>
                      {aiConflictAdvisor[request.employee] && (
                        <div className="mb-4 space-y-2">
                          <h3 className="text-sm font-medium text-gray-800 dark:text-gray-200 flex items-center space-x-1">
                            <AlertTriangle className="w-4 h-4 text-yellow-500" />
                            <span>AI Conflict Advisor:</span>
                          </h3>
                          {aiConflictAdvisor[request.employee].map((alert, idx) => (
                            <p key={idx} className="text-xs text-yellow-600 dark:text-yellow-400">{alert}</p>
                          ))}
                        </div>
                      )}
                      <div className="flex space-x-2">
                        <button onClick={() => handleApproveReject(request.id, 'approved')} className="px-4 py-2 bg-green-500 hover:bg-green-600 text-white rounded-lg text-sm">
                          Approve
                        </button>
                        <button onClick={() => handleApproveReject(request.id, 'rejected')} className="px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg text-sm">
                          Reject
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </motion.div>

            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="card p-6 space-y-4">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Team Leave Balances</h2>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                  <thead>
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Employee</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Casual</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Sick</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Earned</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                    {teamLeaveBalances.map((teamMember, index) => (
                      <tr key={index}>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">{teamMember.employee}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">{teamMember.casual}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">{teamMember.sick}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">{teamMember.earned}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </motion.div>
          </div>

          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="card p-6">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Interactive Team Calendar</h2>
            <div className="text-center py-12 text-gray-500 dark:text-gray-400">
              <Calendar className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <p>Full-screen interactive team calendar coming soon...</p>
              <p className="text-sm">Click on pending requests to approve/reject directly.</p>
            </div>
          </motion.div>
        </>
      )}

      {view === 'hr_admin' && (
        <>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="lg:col-span-2 card p-6 space-y-4">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Leave Policy Configuration</h2>
              <div className="space-y-6">
                {Object.entries(leavePolicyConfig).map(([type, policy], index) => (
                  <div key={index} className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
                    {/* ... Policy display JSX is unchanged ... */}
                  </div>
                ))}
                <button onClick={() => setIsNewPolicyModalOpen(true)} className="flex items-center space-x-2 px-4 py-2 bg-green-500 hover:bg-green-600 text-white rounded-lg">
                  <Plus className="w-4 h-4" />
                  <span>Create New Leave Type</span>
                </button>
              </div>
            </motion.div>

            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="card p-6 space-y-4">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Holiday Calendar Management</h2>
              <ul className="space-y-2">
                {companyHolidays.map((holiday, index) => (
                  <li key={index} className="flex justify-between items-center text-gray-700 dark:text-gray-300">
                    <span>{holiday.name}</span>
                    <span className="font-medium">{holiday.date}</span>
                    <button className="text-red-500 hover:text-red-700 text-sm">Delete</button>
                  </li>
                ))}
              </ul>
              <button onClick={() => setIsAddHolidayModalOpen(true)} className="flex items-center space-x-2 px-4 py-2 bg-primary-500 hover:bg-primary-600 text-white rounded-lg">
                <Plus className="w-4 h-4" />
                <span>Add Holiday</span>
              </button>
            </motion.div>
          </div>
          
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="card p-6 space-y-4">
            {/* ... Company-Wide Dashboard JSX is unchanged ... */}
            <div className="mt-6 space-y-3">
              <h3 className="font-medium text-gray-800 dark:text-gray-200">Manual Adjustments</h3>
              <div className="flex space-x-2">
                <input type="text" placeholder="Employee ID" value={manualAdjustmentForm.employeeId} onChange={(e) => setManualAdjustmentForm(prev => ({...prev, employeeId: e.target.value}))} className="p-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100" />
                <select value={manualAdjustmentForm.policyName} onChange={(e) => setManualAdjustmentForm(prev => ({...prev, policyName: e.target.value}))} className="p-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100">
                    <option value="">Select Leave Type</option>
                    {Object.keys(leavePolicies).map(p => <option key={p} value={p}>{p}</option>)}
                </select>
                <input type="number" placeholder="Days" value={manualAdjustmentForm.days} onChange={(e) => setManualAdjustmentForm(prev => ({...prev, days: Number(e.target.value)}))} className="p-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100" />
                <button onClick={() => handleManualAdjustment('credit')} className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg flex items-center space-x-2">
                  <UserPlus className="w-4 h-4" /> <span>Credit</span>
                </button>
                <button onClick={() => handleManualAdjustment('debit')} className="px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg flex items-center space-x-2">
                  <UserMinus className="w-4 h-4" /> <span>Debit</span>
                </button>
              </div>
            </div>
          </motion.div>

          {/* ✅ ADDED: Modal for Adding a Holiday */}
          {isAddHolidayModalOpen && (
            <div className="fixed inset-0 bg-gray-600 bg-opacity-50 z-50 flex justify-center items-center">
              <div className="relative p-8 border w-full max-w-md shadow-lg rounded-md bg-white dark:bg-gray-800">
                <h3 className="text-xl font-bold mb-4">Add New Holiday</h3>
                <form onSubmit={handleAddHolidaySubmit} className="space-y-4">
                  <div>
                    <label htmlFor="name" className="block text-sm font-medium">Holiday Name</label>
                    <input type="text" id="name" name="name" value={newHolidayForm.name} onChange={(e) => setNewHolidayForm(p => ({...p, name: e.target.value}))} required className="mt-1 block w-full p-2 border rounded-md" />
                  </div>
                  <div>
                    <label htmlFor="date" className="block text-sm font-medium">Date</label>
                    <input type="date" id="date" name="date" value={newHolidayForm.date} onChange={(e) => setNewHolidayForm(p => ({...p, date: e.target.value}))} required className="mt-1 block w-full p-2 border rounded-md" />
                  </div>
                  <div className="flex justify-end space-x-2">
                    <button type="button" onClick={() => setIsAddHolidayModalOpen(false)} className="px-4 py-2 bg-gray-200 rounded-lg">Cancel</button>
                    <button type="submit" className="px-4 py-2 bg-primary-500 text-white rounded-lg">Add Holiday</button>
                  </div>
                </form>
              </div>
            </div>
          )}

          {/* ✅ ADDED: Modal for Creating a New Leave Policy */}
          {isNewPolicyModalOpen && (
             <div className="fixed inset-0 bg-gray-600 bg-opacity-50 z-50 flex justify-center items-center">
              <div className="relative p-8 border w-full max-w-md shadow-lg rounded-md bg-white dark:bg-gray-800">
                <h3 className="text-xl font-bold mb-4">Create New Leave Type</h3>
                <form onSubmit={handleNewPolicySubmit} className="space-y-4">
                   <div>
                        <label htmlFor="policyName" className="block text-sm font-medium">Policy Name</label>
                        <input type="text" id="policyName" name="name" value={newPolicyForm.name} onChange={(e) => setNewPolicyForm(p => ({...p, name: e.target.value}))} required className="mt-1 block w-full p-2 border rounded-md" />
                   </div>
                   <div>
                        <label htmlFor="totalDays" className="block text-sm font-medium">Total Days per Year</label>
                        <input type="number" id="totalDays" name="totalDays" value={newPolicyForm.totalDays} onChange={(e) => setNewPolicyForm(p => ({...p, totalDays: Number(e.target.value)}))} required className="mt-1 block w-full p-2 border rounded-md" />
                   </div>
                   <div>
                        <label htmlFor="description" className="block text-sm font-medium">Description</label>
                        <textarea id="description" name="description" value={newPolicyForm.description} onChange={(e) => setNewPolicyForm(p => ({...p, description: e.target.value}))} className="mt-1 block w-full p-2 border rounded-md"></textarea>
                   </div>
                  <div className="flex justify-end space-x-2">
                    <button type="button" onClick={() => setIsNewPolicyModalOpen(false)} className="px-4 py-2 bg-gray-200 rounded-lg">Cancel</button>
                    <button type="submit" className="px-4 py-2 bg-green-500 text-white rounded-lg">Create Policy</button>
                  </div>
                </form>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  )
}

