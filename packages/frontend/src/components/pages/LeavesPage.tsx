'use client'

import { motion } from 'framer-motion'
import { Calendar, Plus, Clock, CheckCircle, XCircle, AlertTriangle, Users, Settings, List, FileText, BookOpen, TrendingUp, UserPlus, UserMinus } from 'lucide-react'
import { useState, ChangeEvent, FormEvent } from 'react'
import {
  LeaveBalanceCard,
  LeaveHistoryEntry,
  CompanyHoliday,
  LeavePolicyDetails,
  PendingApprovalRequest,
  TeamLeaveBalanceSummary,
  AIConflictAdvisorData,
  LeavePolicyConfiguration,
  CompanyWideLeaveDashboardData,
  AIAbsenteeismForecasterData,
  LeaveFormState,
  LeaveStatus,
} from '@/types' // Assuming @/types maps to src/types/index.ts

export default function LeavesPage() {
  const [view, setView] = useState<'employee' | 'manager' | 'hr_admin'>('employee');
  const [isApplyLeaveModalOpen, setIsApplyLeaveModalOpen] = useState(false);
  const [leaveForm, setLeaveForm] = useState<LeaveFormState>({
    leaveType: '',
    fromDate: '',
    toDate: '',
    startSession: 'Full Day',
    endSession: 'Full Day',
    reason: '',
    document: null,
  });
  const [leavePolicyTooltip, setLeavePolicyTooltip] = useState<string>('');

  // Placeholder data for Employee View
  const leaveBalances: LeaveBalanceCard[] = [
    { type: 'Casual Leave', used: 12, total: 15, icon: Calendar, color: 'blue' },
    { type: 'Sick Leave', used: 8, total: 10, icon: CheckCircle, color: 'red' },
    { type: 'Earned Leave', used: 5, total: 20, icon: Clock, color: 'green' },
    { type: 'Bereavement Leave', used: 0, total: 3, icon: XCircle, color: 'purple' },
  ];

  const leaveHistory: LeaveHistoryEntry[] = [
    { id: 1, type: 'Casual Leave', from: '2024-09-10', to: '2024-09-12', days: 3, reason: 'Family event', status: 'approved' },
    { id: 2, type: 'Sick Leave', from: '2024-08-01', to: '2024-08-01', days: 1, reason: 'Fever', status: 'approved' },
    { id: 3, type: 'Earned Leave', from: '2024-11-01', to: '2024-11-05', days: 5, reason: 'Vacation', status: 'pending' },
  ];

  const companyHolidays: CompanyHoliday[] = [
    { date: '2024-10-24', name: 'Diwali' },
    { date: '2024-12-25', name: 'Christmas' },
  ];

  const leavePolicies: LeavePolicyDetails = {
    'Casual Leave': 'Can be availed for personal reasons. Requires 1 day prior notice.',
    'Sick Leave': 'Requires a doctor\'s note for more than 2 consecutive days.',
    'Earned Leave': 'Can be availed only after 90 days of service. Must be applied for 15 days in advance.',
    'Bereavement Leave': 'For immediate family members. Requires documentation.',
  };

  // Placeholder data for Manager View
  const pendingApprovals: PendingApprovalRequest[] = [
    { id: 1, employee: 'John Doe', type: 'Earned Leave', from: '2024-11-01', to: '2024-11-05', days: 5, reason: 'Vacation', balance: '5 / 20' },
    { id: 2, employee: 'Jane Smith', type: 'Casual Leave', from: '2024-10-28', to: '2024-10-29', days: 2, reason: 'Personal work', balance: '10 / 15' },
  ];

  const teamLeaveBalances: TeamLeaveBalanceSummary[] = [
    { employee: 'John Doe', casual: '5 / 15', sick: '3 / 10', earned: '5 / 20' },
    { employee: 'Jane Smith', casual: '10 / 15', sick: '7 / 10', earned: '12 / 20' },
    { employee: 'Peter Jones', casual: '8 / 15', sick: '5 / 10', earned: '18 / 20' },
  ];

  const aiConflictAdvisor: AIConflictAdvisorData = {
    'John Doe': [
      "Conflict: Approving this request will result in 3 of 5 team members being on leave simultaneously.",
      "Project Risk: This leave overlaps with the critical deadline for the 'Phoenix Project'."
    ],
    'Jane Smith': [
      "Pattern Detected: This is the 4th time this employee has requested leave on a Monday in the past two months."
    ]
  };

  // Placeholder data for HR Admin View
  const leavePolicyConfig: { [key: string]: LeavePolicyConfiguration } = {
    casual: { accrual: 'monthly', carryForward: '5 days', encashment: 'none', approvalWorkflow: 'Manager' },
    sick: { accrual: 'annually', carryForward: 'none', encashment: 'none', approvalWorkflow: 'Manager -> HR Head' },
  };

  const companyWideLeaveData: CompanyWideLeaveDashboardData = {
    consumptionByDepartment: { 'Engineering': '60%', 'Sales': '40%', 'Marketing': '30%' },
    trendsInLeaveTypes: { 'Sick Leave': 'Increased by 35% last quarter', 'Casual Leave': 'Stable' },
    totalLeaveBalances: '1500 days remaining across company',
  };

  const aiAbsenteeismForecaster: AIAbsenteeismForecasterData = [
    "Trend Alert: Sick leave applications have increased by 35% in the last quarter, which may indicate employee burnout or health concerns.",
    "Forecast: Expect a high volume of leave applications during the last two weeks of December. Advise managers to plan for resource allocation."
  ];

  const handleLeaveFormChange = (e: ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value, files } = e.target as HTMLInputElement; // Cast to HTMLInputElement to access files
    setLeaveForm(prev => ({
      ...prev,
      [name]: files ? files[0] : value,
    }));

    if (name === 'leaveType') {
      setLeavePolicyTooltip(leavePolicies[value] || '');
    }
  };

  const handleApplyLeaveSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    console.log('Leave application submitted:', leaveForm);
    setIsApplyLeaveModalOpen(false);
    // Add logic to submit leave request
  };

  const handleApproveReject = (id: number, status: LeaveStatus) => {
    console.log(`Leave request ${id} ${status}`);
    // Add logic to update leave request status
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Leave Management</h1>
          <p className="text-gray-600 dark:text-gray-400">Manage leave requests and track balances</p>
        </div>
        <div className="flex space-x-2">
          <button
            onClick={() => setView('employee')}
            className={`px-4 py-2 rounded-lg ${view === 'employee' ? 'bg-primary-500 text-white' : 'bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200'}`}
          >
            Employee View
          </button>
          <button
            onClick={() => setView('manager')}
            className={`px-4 py-2 rounded-lg ${view === 'manager' ? 'bg-primary-500 text-white' : 'bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200'}`}
          >
            Manager View
          </button>
          <button
            onClick={() => setView('hr_admin')}
            className={`px-4 py-2 rounded-lg ${view === 'hr_admin' ? 'bg-primary-500 text-white' : 'bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200'}`}
          >
            HR Admin View
          </button>
        </div>
      </div>

      {view === 'employee' && (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {leaveBalances.map((leave, index) => (
              <motion.div key={index} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: index * 0.1 }} className="card p-6">
                <div className="flex items-center">
                  <div className={`w-12 h-12 bg-${leave.color}-100 dark:bg-${leave.color}-900/20 rounded-lg flex items-center justify-center`}>
                    <leave.icon className={`w-6 h-6 text-${leave.color}-600 dark:text-${leave.color}-400`} />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600 dark:text-gray-400">{leave.type}</p>
                    <p className="text-2xl font-bold text-gray-900 dark:text-white">{leave.used} / {leave.total}</p>
                  </div>
                </div>
              </motion.div>
            ))}
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
                        }`}>
                          {leave.status}
                        </span>
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

          {/* Apply Leave Modal */}
          {isApplyLeaveModalOpen && (
            <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50 flex justify-center items-center">
              <div className="relative p-8 border w-full max-w-lg shadow-lg rounded-md bg-white dark:bg-gray-800">
                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4">Apply for Leave</h3>
                <form onSubmit={handleApplyLeaveSubmit} className="space-y-4">
                  <div>
                    <label htmlFor="leaveType" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Leave Type</label>
                    <div className="relative group">
                      <select
                        id="leaveType"
                        name="leaveType"
                        value={leaveForm.leaveType}
                        onChange={handleLeaveFormChange}
                        required
                        className="mt-1 block w-full p-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                      >
                        <option value="">Select Leave Type</option>
                        {leaveBalances.map((leave, index) => (
                          <option key={index} value={leave.type}>{leave.type}</option>
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
                      <input
                        type="date"
                        id="fromDate"
                        name="fromDate"
                        value={leaveForm.fromDate}
                        onChange={handleLeaveFormChange}
                        required
                        className="mt-1 block w-full p-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                      />
                    </div>
                    <div>
                      <label htmlFor="toDate" className="block text-sm font-medium text-gray-700 dark:text-gray-300">To Date</label>
                      <input
                        type="date"
                        id="toDate"
                        name="toDate"
                        value={leaveForm.toDate}
                        onChange={handleLeaveFormChange}
                        required
                        className="mt-1 block w-full p-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label htmlFor="startSession" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Start Session</label>
                      <select
                        id="startSession"
                        name="startSession"
                        value={leaveForm.startSession}
                        onChange={handleLeaveFormChange}
                        className="mt-1 block w-full p-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                      >
                        <option value="Full Day">Full Day</option>
                        <option value="First Half">First Half</option>
                        <option value="Second Half">Second Half</option>
                      </select>
                    </div>
                    <div>
                      <label htmlFor="endSession" className="block text-sm font-medium text-gray-700 dark:text-gray-300">End Session</label>
                      <select
                        id="endSession"
                        name="endSession"
                        value={leaveForm.endSession}
                        onChange={handleLeaveFormChange}
                        className="mt-1 block w-full p-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                      >
                        <option value="Full Day">Full Day</option>
                        <option value="First Half">First Half</option>
                        <option value="Second Half">Second Half</option>
                      </select>
                    </div>
                  </div>
                  <div>
                    <label htmlFor="reason" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Reason</label>
                    <textarea
                      id="reason"
                      name="reason"
                      rows={3}
                      value={leaveForm.reason}
                      onChange={handleLeaveFormChange}
                      required
                      className="mt-1 block w-full p-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                    ></textarea>
                  </div>
                  {leaveForm.leaveType === 'Sick Leave' && (
                    <div>
                      <label htmlFor="document" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Attach Document (e.g., Doctor's note)</label>
                      <input
                        type="file"
                        id="document"
                        name="document"
                        onChange={handleLeaveFormChange}
                        className="mt-1 block w-full text-sm text-gray-900 dark:text-gray-100 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-primary-50 file:text-primary-700 hover:file:bg-primary-100"
                      />
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
            {/* Pending Approvals Widget */}
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
                        <p className="font-medium text-gray-900 dark:text-white">{request.employee} - {request.type}</p>
                        <span className="text-sm text-gray-600 dark:text-gray-400">Balance: {request.balance}</span>
                      </div>
                      <p className="text-sm text-gray-700 dark:text-gray-300 mb-2">Dates: {request.from} to {request.to} ({request.days} days)</p>
                      <p className="text-sm text-gray-700 dark:text-gray-300 mb-4">Reason: {request.reason}</p>
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

            {/* Team Leave Balances */}
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

          {/* Interactive Team Calendar */}
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
            {/* Leave Policy Configuration */}
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="lg:col-span-2 card p-6 space-y-4">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Leave Policy Configuration</h2>
              <div className="space-y-6">
                {Object.entries(leavePolicyConfig).map(([type, policy], index) => (
                  <div key={index} className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
                    <h3 className="font-medium text-gray-900 dark:text-white capitalize mb-2">{type} Leave Policy</h3>
                    <div className="grid grid-cols-2 gap-2 text-sm text-gray-700 dark:text-gray-300">
                      <p><strong>Accrual:</strong> {policy.accrual}</p>
                      <p><strong>Carry-Forward:</strong> {policy.carryForward}</p>
                      <p><strong>Encashment:</strong> {policy.encashment}</p>
                      <p><strong>Approval Workflow:</strong> {policy.approvalWorkflow}</p>
                    </div>
                    <button className="mt-4 px-3 py-1 bg-primary-500 hover:bg-primary-600 text-white text-sm rounded-md">
                      Edit Policy
                    </button>
                  </div>
                ))}
                <button className="flex items-center space-x-2 px-4 py-2 bg-green-500 hover:bg-green-600 text-white rounded-lg">
                  <Plus className="w-4 h-4" />
                  <span>Create New Leave Type</span>
                </button>
              </div>
            </motion.div>

            {/* Holiday Calendar Management */}
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
              <button className="flex items-center space-x-2 px-4 py-2 bg-primary-500 hover:bg-primary-600 text-white rounded-lg">
                <Plus className="w-4 h-4" />
                <span>Add Holiday</span>
              </button>
            </motion.div>
          </div>

          {/* Company-Wide Leave Dashboard & AI Forecaster */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="card p-6 space-y-4">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Company-Wide Leave Dashboard</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="p-4 bg-gray-100 dark:bg-gray-700 rounded-lg">
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Leave Consumption by Dept.</p>
                <p className="text-xl font-bold text-gray-900 dark:text-white">{companyWideLeaveData.consumptionByDepartment.Engineering}</p>
              </div>
              <div className="p-4 bg-gray-100 dark:bg-gray-700 rounded-lg">
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Sick Leave Trend</p>
                <p className="text-xl font-bold text-gray-900 dark:text-white flex items-center space-x-1">
                  <TrendingUp className="w-5 h-5 text-red-500" />
                  <span>{companyWideLeaveData.trendsInLeaveTypes['Sick Leave']}</span>
                </p>
              </div>
              <div className="p-4 bg-gray-100 dark:bg-gray-700 rounded-lg">
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Leave Balances</p>
                <p className="text-xl font-bold text-gray-900 dark:text-white">{companyWideLeaveData.totalLeaveBalances}</p>
              </div>
            </div>

            <div className="mt-6 space-y-2">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center space-x-2">
                <BookOpen className="w-5 h-5 text-primary-500" />
                <span>AI Absenteeism & Trend Forecaster</span>
              </h3>
              {aiAbsenteeismForecaster.map((insight, index) => (
                <p key={index} className="text-sm text-gray-700 dark:text-gray-300 flex items-start space-x-2">
                  <AlertTriangle className="w-4 h-4 flex-shrink-0 mt-1 text-blue-500" />
                  <span>{insight}</span>
                </p>
              ))}
            </div>

            <div className="mt-6 space-y-3">
              <h3 className="font-medium text-gray-800 dark:text-gray-200">Manual Adjustments</h3>
              <div className="flex space-x-2">
                <input type="text" placeholder="Employee ID" className="p-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100" />
                <select className="p-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100">
                  <option>Casual Leave</option>
                  <option>Sick Leave</option>
                  <option>Earned Leave</option>
                </select>
                <input type="number" placeholder="Days" className="p-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100" />
                <button className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg flex items-center space-x-2">
                  <UserPlus className="w-4 h-4" />
                  <span>Credit</span>
                </button>
                <button className="px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg flex items-center space-x-2">
                  <UserMinus className="w-4 h-4" />
                  <span>Debit</span>
                </button>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </div>
  )
}
