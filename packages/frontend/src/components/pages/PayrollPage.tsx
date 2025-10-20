'use client'

import React, { useEffect, useMemo, useState } from 'react'
import { supabase } from '@/config/supabase'
import { Download, Search, Edit3, CheckCircle2, Trash2, Play, FileText, Plus, X, AlertTriangle } from 'lucide-react'

/**
 * Enhanced Payroll Admin UI (single file)
 * - Real backend integration
 * - Consistent theme with other pages
 * - Fully functional payroll management
 */

/* ----------------------------- Types ----------------------------- */

interface Employee {
  id: string
  name: string
  email: string
  department: string
  status: string
  base_salary: number
  allowances?: number
  bonus?: number
  gross?: number
  tax?: number
  pf?: number
  deductions?: number
  net?: number
  bank_account?: string
}

interface PayrollRun {
  id: string
  month: number
  year: number
  status: 'draft' | 'processing' | 'completed'
  total_gross: number
  created_at: string
  processed_at: string | null
  lines: PayrollLine[]
  payslipArchiveUrl?: string
}

interface PayrollLine {
  id: string
  employee_id: string
  employee_name: string
  base_salary: number
  allowances: number
  bonus: number
  gross: number
  tax: number
  pf: number
  deductions: number
  net: number
  bank_account?: string
  payslipUrl?: string
}
const API_BASE_URL = process.env.NEXT_PUBLIC_BACKEND_URL;


/* ----------------------------- API Service ----------------------------- */

class PayrollService {
  private static baseURL = `${API_BASE_URL}/payroll`

  private static async handleResponse(response: Response) {
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ error: 'Unknown error' }))
      throw new Error(errorData.error || `HTTP error! status: ${response.status}`)
    }
    return response.json()
  }

  private static getAuthHeaders() {
    const token = localStorage.getItem('supabase-auth-token')
    return {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    }
  }

  static async getEmployees(filters?: {
    department?: string
    status?: string
    minSalary?: number
    maxSalary?: number
    search?: string
  }) {
    const queryParams = new URLSearchParams()
    
    if (filters?.department) queryParams.append('department', filters.department)
    if (filters?.status) queryParams.append('status', filters.status)
    if (filters?.minSalary) queryParams.append('minSalary', filters.minSalary.toString())
    if (filters?.maxSalary) queryParams.append('maxSalary', filters.maxSalary.toString())
    if (filters?.search) queryParams.append('search', filters.search)

    const response = await fetch(`${this.baseURL}/employees?${queryParams}`, {
      headers: this.getAuthHeaders()
    })

    return this.handleResponse(response)
  }

  static async createPayrollRun(payload: { month: number; year: number; employeeIds?: string[] }) {
    // Validate payload
    if (!payload.month || !payload.year) {
      throw new Error('Month and year are required')
    }

    const response = await fetch(`${this.baseURL}/runs`, {
      method: 'POST',
      headers: this.getAuthHeaders(),
      body: JSON.stringify(payload)
    })

    return this.handleResponse(response)
  }

  static async updateEmployeeSalary(employeeId: string, baseSalary: number) {
    if (!employeeId) {
      throw new Error('Employee ID is required')
    }
    if (!baseSalary || baseSalary < 0) {
      throw new Error('Valid base salary is required')
    }

    const response = await fetch(`${this.baseURL}/employees/${employeeId}/salary`, {
      method: 'PUT',
      headers: this.getAuthHeaders(),
      body: JSON.stringify({ base_salary: baseSalary })
    })

    return this.handleResponse(response)
  }

  static async processPayrollRun(runId: string) {
    // Validate runId before making the request
    if (!runId || runId === 'undefined') {
      throw new Error('Invalid payroll run ID')
    }

    // Validate UUID format
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i
    if (!uuidRegex.test(runId)) {
      throw new Error('Invalid payroll run ID format')
    }

    const response = await fetch(`${this.baseURL}/runs/${runId}/process`, {
      method: 'POST',
      headers: this.getAuthHeaders()
    })

    return this.handleResponse(response)
  }

  static async getPayrollRuns(filters?: { status?: string }) {
    const queryParams = new URLSearchParams()
    
    if (filters?.status) queryParams.append('status', filters.status)

    const url = filters?.status 
      ? `${this.baseURL}/runs?${queryParams}`
      : `${this.baseURL}/runs`

    const response = await fetch(url, {
      headers: this.getAuthHeaders()
    })

    return this.handleResponse(response)
  }

  static async getPayrollRunById(runId: string) {
    if (!runId || runId === 'undefined') {
      throw new Error('Invalid payroll run ID')
    }

    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i
    if (!uuidRegex.test(runId)) {
      throw new Error('Invalid payroll run ID format')
    }

    const response = await fetch(`${this.baseURL}/runs/${runId}`, {
      headers: this.getAuthHeaders()
    })

    return this.handleResponse(response)
  }

  static async deletePayrollRun(runId: string) {
    if (!runId || runId === 'undefined') {
      throw new Error('Invalid payroll run ID')
    }

    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i
    if (!uuidRegex.test(runId)) {
      throw new Error('Invalid payroll run ID format')
    }

    const response = await fetch(`${this.baseURL}/runs/${runId}`, {
      method: 'DELETE',
      headers: this.getAuthHeaders()
    })

    return this.handleResponse(response)
  }

  static async updatePayrollLine(runId: string, lineId: string, updates: any) {
    if (!runId || !lineId) {
      throw new Error('Payroll run ID and line ID are required')
    }

    const response = await fetch(`${this.baseURL}/runs/${runId}/lines/${lineId}`, {
      method: 'PUT',
      headers: this.getAuthHeaders(),
      body: JSON.stringify(updates)
    })

    return this.handleResponse(response)
  }

  static async getDepartments() {
    const response = await fetch(`${this.baseURL}/departments`, {
      headers: this.getAuthHeaders()
    })

    return this.handleResponse(response)
  }
}
/* ----------------------------- Main Component ----------------------------- */
export default function EnhancedPayrollAdmin({ role = 'admin' }: { role?: 'admin' | 'hr' | 'manager' | 'employee' }) {
  const canManage = (role === 'admin' || role === 'hr')
  const canViewTeam = (role === 'manager' || role === 'admin' || role === 'hr')
  const canViewAll = (role === 'admin' || role === 'hr')

  // State
  const [restrictedView, setRestrictedView] = useState(false)
    const [userContext, setUserContext] = useState<{role: string, department?: string, restrictedView?: boolean}>({role: 'employee'})
  const [employees, setEmployees] = useState<Employee[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  
  // Filters
  const [filter, setFilter] = useState('')
  const [departmentFilter, setDepartmentFilter] = useState<string>('')
  const [statusFilter, setStatusFilter] = useState<string>('')
  const [salaryMin, setSalaryMin] = useState<number | ''>('')
  const [salaryMax, setSalaryMax] = useState<number | ''>('')
  const [page, setPage] = useState(1)
  const pageSize = 8

  // Payroll runs
  const [runs, setRuns] = useState<PayrollRun[]>([])
  const [selectedRunId, setSelectedRunId] = useState<string | null>(null)

  // UI states
  const [editingEmployee, setEditingEmployee] = useState<Employee | null>(null)
  const [showCreateRun, setShowCreateRun] = useState(false)
  const [creatingRunLoading, setCreatingRunLoading] = useState(false)
  const [processingRunId, setProcessingRunId] = useState<string | null>(null)
  const [processProgress, setProcessProgress] = useState<number>(0)
  const [viewPayslip, setViewPayslip] = useState<{employee: Employee, run?: PayrollRun} | null>(null)
  const [selectedRowsForRun, setSelectedRowsForRun] = useState<Record<string, boolean>>({})

  // Derived data
  const departments = useMemo(() => 
    Array.from(new Set(employees.map(e => e.department).filter(Boolean)), 
    ) as string[], [employees]
  )

  const filteredEmployees = useMemo(() => {
    return employees.filter(e => {
      const searchTerm = filter.toLowerCase()
      const matchesSearch = !filter || 
        e.name.toLowerCase().includes(searchTerm) || 
        e.email.toLowerCase().includes(searchTerm) ||
        (e.department && e.department.toLowerCase().includes(searchTerm))

      const matchesDepartment = !departmentFilter || e.department === departmentFilter
      const matchesStatus = !statusFilter || e.status === statusFilter
      const matchesMinSalary = salaryMin === '' || (e.base_salary >= Number(salaryMin))
      const matchesMaxSalary = salaryMax === '' || (e.base_salary <= Number(salaryMax))

      return matchesSearch && matchesDepartment && matchesStatus && matchesMinSalary && matchesMaxSalary
    })
  }, [employees, filter, departmentFilter, statusFilter, salaryMin, salaryMax])

  const totalPages = Math.max(1, Math.ceil(filteredEmployees.length / pageSize))
  const pagedEmployees = filteredEmployees.slice((page - 1) * pageSize, page * pageSize)

  // Load data
  useEffect(() => {
    loadEmployees()
    loadPayrollRuns()
  }, [])

  useEffect(() => {
    if (page > totalPages) setPage(totalPages)
  }, [totalPages])

 const loadEmployees = async () => {
    try {
      setLoading(true)
      const response = await PayrollService.getEmployees()
      const employeesData = response.data
      const context = response.userContext
      
      if (context) {
        setUserContext(context)
        setRestrictedView(context.restrictedView || false)
      }
      
      const employeesWithCalculations = Array.isArray(employeesData) 
        ? employeesData.map((emp: any) => calculateEmployeePayroll(emp))
        : []
      setEmployees(employeesWithCalculations)
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }
  const loadPayrollRuns = async () => {
    try {
      const response = await PayrollService.getPayrollRuns()
      const runsData = response.data
      
      const runsWithLines = Array.isArray(runsData) 
        ? runsData.map(run => ({
            ...run,
            lines: Array.isArray(run.lines) ? run.lines : []
          }))
        : []
      
      setRuns(runsWithLines)
    } catch (err: any) {
      console.error('❌ Error loading payroll runs:', err)
      setError(err.message)
    }
  }

  // Helper functions
  const rupee = (n: number) => '₹' + Number(n || 0).toLocaleString('en-IN', { maximumFractionDigits: 0 })

  const calculateEmployeePayroll = (employee: any): Employee => {
    const base_salary = Number(employee.base_salary || employee.salary || 0)
    const allowances = Number(employee.allowances || 0)
    const bonus = Number(employee.bonus || 0)
    const gross = base_salary + allowances + bonus
    const tax = Math.round(gross * 0.12) // 12% tax
    const pf = Math.round(base_salary * 0.12) // 12% PF
    const deductions = tax + pf
    const net = gross - deductions

    return {
      ...employee,
      base_salary,
      allowances,
      bonus,
      gross,
      tax,
      pf,
      deductions,
      net
    }
  }

  const handleViewPayslip = (employee: Employee) => {
    // Find the latest payroll run for this employee
    const employeeRuns = runs.filter(run => 
      run.lines?.some(line => line.employee_id === employee.id)
    )
    const latestRun = employeeRuns[0] // Get the most recent run
    
    setViewPayslip({
      employee,
      run: latestRun
    })
  }

  // Event handlers
  const handleUpdateSalary = async (employeeId: string, newBaseSalary: number) => {
    try {
      await PayrollService.updateEmployeeSalary(employeeId, newBaseSalary)
      await loadEmployees() // Reload to get updated data
    } catch (err: any) {
      setError(err.message)
    }
  }

  const handleCreateRun = async (month: number, year: number, includeSelectedOnly: boolean) => {
    try {
      setCreatingRunLoading(true)
      const employeeIds = includeSelectedOnly ? 
        Object.keys(selectedRowsForRun).filter(k => selectedRowsForRun[k]) : 
        undefined

      const newRun = await PayrollService.createPayrollRun({ month, year, employeeIds })
      setRuns(prev => [newRun, ...prev])
      setSelectedRunId(newRun.id)
      setShowCreateRun(false)
    } catch (err: any) {
      setError(err.message)
    } finally {
      setCreatingRunLoading(false)
    }
  }

  const handleProcessRun = async (runId: string) => {
    if (!canManage) {
      alert('Permission denied')
      return
    }

    try {
      setProcessingRunId(runId)
      setProcessProgress(0)
      
      const progressInterval = setInterval(() => {
        setProcessProgress(prev => {
          if (prev >= 90) {
            clearInterval(progressInterval)
            return 90
          }
          return prev + 10
        })
      }, 500)

      await PayrollService.processPayrollRun(runId)
      
      clearInterval(progressInterval)
      setProcessProgress(100)
      
      // Reload runs to get updated status
      await loadPayrollRuns()
      
      setTimeout(() => {
        setProcessingRunId(null)
        setProcessProgress(0)
      }, 1000)
    } catch (err: any) {
      setError(err.message)
      setProcessingRunId(null)
      setProcessProgress(0)
    }
  }

  const handleDeleteRun = async (runId: string) => {
    if (!confirm('Delete this payroll run? This action cannot be undone.')) return
    
    try {
      await PayrollService.deletePayrollRun(runId)
      setRuns(prev => prev.filter(r => r.id !== runId))
      if (selectedRunId === runId) setSelectedRunId(null)
    } catch (err: any) {
      setError(err.message)
    }
  }

  const toggleSelectForRun = (empId: string) => {
    setSelectedRowsForRun(prev => ({ ...prev, [empId]: !prev[empId] }))
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-lg text-gray-600 dark:text-gray-400">Loading payroll data...</div>
      </div>
    )
  }

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Payroll Management</h1>
          <p className="text-gray-600 dark:text-gray-400">
            {restrictedView ? 'View your payroll information and payslips' : 'Create runs, edit lines, process payroll and export payslips'}
          </p>
        </div>

        {/* Show different header controls based on role */}
        {!restrictedView ? (
          <div className="flex items-center gap-2 flex-wrap">
            <div className="relative">
              <Search className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
              <input
                placeholder="Search employee..."
                value={filter}
                onChange={e => { setFilter(e.target.value); setPage(1) }}
                className="pl-10 pr-3 py-2 rounded-lg bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 text-sm focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
              />
            </div>

            <select 
              value={departmentFilter} 
              onChange={e => setDepartmentFilter(e.target.value)}
              className="px-3 py-2 rounded-lg bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white text-sm focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
            >
              <option value="">All departments</option>
              {departments.map(d => <option key={d} value={d}>{d}</option>)}
            </select>

            <input 
              type="number" 
              placeholder="Min salary" 
              value={salaryMin}
              onChange={e => setSalaryMin(e.target.value === '' ? '' : Number(e.target.value))}
              className="w-24 p-2 rounded-lg bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white text-sm focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
            />
            <input 
              type="number" 
              placeholder="Max salary" 
              value={salaryMax}
              onChange={e => setSalaryMax(e.target.value === '' ? '' : Number(e.target.value))}
              className="w-24 p-2 rounded-lg bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white text-sm focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
            />

            {canManage && (
              <>
                <button 
                  onClick={() => setShowCreateRun(true)}
                  className="px-4 py-2 bg-primary-500 hover:bg-primary-600 text-white rounded-lg flex items-center gap-2 transition-colors"
                >
                  <Plus className="w-4 h-4" /> Create Run
                </button>
                <button className="px-3 py-2 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors">
                  <Download className="w-4 h-4" />
                </button>
              </>
            )}
          </div>
        ) : (
          <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
              <span className="text-sm text-blue-700 dark:text-blue-300">
                Personal View: Showing only your payroll information
              </span>
            </div>
          </div>
        )}
      </div>

      {error && (
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
          <div className="flex items-center gap-2 text-red-700 dark:text-red-400">
            <AlertTriangle className="w-4 h-4" />
            <span>{error}</span>
          </div>
        </div>
      )}

      {/* Body grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left: Employee table */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                {restrictedView ? 'Your Payroll Information' : 'Employee Payroll Overview'}
                <span className="ml-2 text-sm text-gray-500 dark:text-gray-400">({filteredEmployees.length})</span>
              </h2>
              {!restrictedView && (
                <div className="text-sm text-gray-500 dark:text-gray-400">Page {page} / {totalPages}</div>
              )}
            </div>

            <div className="overflow-x-auto">
              <table className="min-w-full text-sm">
                <thead>
                  <tr className="text-left text-gray-500 dark:text-gray-400 border-b border-gray-200 dark:border-gray-700">
                    {!restrictedView && <th className="py-3 pl-4 font-medium">Select</th>}
                    <th className="py-3 font-medium">Name</th>
                    <th className="py-3 font-medium">Email</th>
                    <th className="py-3 font-medium">Dept</th>
                    <th className="py-3 font-medium text-right">Gross</th>
                    <th className="py-3 font-medium text-right">Net</th>
                    <th className="py-3 font-medium text-right">Deductions</th>
                    <th className="py-3 font-medium">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {pagedEmployees.map(emp => (
                    <tr key={emp.id} className="border-b border-gray-100 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                      {!restrictedView && (
                        <td className="py-3 pl-4">
                          {canManage && (
                            <input 
                              type="checkbox" 
                              checked={!!selectedRowsForRun[emp.id]} 
                              onChange={() => toggleSelectForRun(emp.id)}
                              className="rounded border-gray-300 dark:border-gray-600 text-primary-600 focus:ring-primary-500"
                            />
                          )}
                        </td>
                      )}
                      <td className="py-3 font-medium text-gray-900 dark:text-white">{emp.name}</td>
                      <td className="py-3 text-gray-600 dark:text-gray-400">{emp.email}</td>
                      <td className="py-3 text-gray-600 dark:text-gray-400">{emp.department}</td>
                      <td className="py-3 text-right font-medium text-gray-900 dark:text-white">{rupee(emp.gross || 0)}</td>
                      <td className="py-3 text-right font-medium text-green-600 dark:text-green-400">{rupee(emp.net || 0)}</td>
                      <td className="py-3 text-right text-red-600 dark:text-red-400">{rupee(emp.deductions || 0)}</td>
                      <td className="py-3">
                        <div className="flex gap-2">
                          {!restrictedView && canManage && (
                            <button 
                              onClick={() => setEditingEmployee(emp)}
                              className="p-1 text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 transition-colors"
                              title="Edit salary"
                            >
                              <Edit3 className="w-4 h-4" />
                            </button>
                          )}
                          <button 
                            onClick={() => handleViewPayslip(emp)}
                            className="p-1 text-gray-500 hover:text-blue-600 transition-colors"
                            title="View payslip"
                          >
                            <FileText className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination - only show for admin/hr */}
            {!restrictedView && (
              <div className="flex justify-between items-center mt-4">
                <div className="text-sm text-gray-500 dark:text-gray-400">
                  Showing {((page - 1) * pageSize) + 1}—{Math.min(page * pageSize, filteredEmployees.length)} of {filteredEmployees.length}
                </div>
                <div className="flex items-center gap-2">
                  <button 
                    disabled={page === 1}
                    onClick={() => setPage(p => Math.max(1, p - 1))}
                    className="px-3 py-1 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-700 dark:text-gray-300 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors"
                  >
                    Previous
                  </button>
                  <span className="text-sm text-gray-500 dark:text-gray-400">Page {page} / {totalPages}</span>
                  <button 
                    disabled={page >= totalPages}
                    onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                    className="px-3 py-1 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-700 dark:text-gray-300 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors"
                  >
                    Next
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Selected Run Editor */}
          {selectedRunId && !restrictedView && (
            <PayrollRunEditor
              run={runs.find(r => r.id === selectedRunId)}
              canEdit={canManage}
              onClose={() => setSelectedRunId(null)}
              onProcess={() => handleProcessRun(selectedRunId)}
              onDelete={() => handleDeleteRun(selectedRunId)}
            />
          )}
        </div>

        {/* Right column */}
        <div className="space-y-6">
          {/* Payroll Runs */}
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                {restrictedView ? 'Your Payslips' : 'Payroll Runs'}
              </h3>
              <span className="text-sm text-gray-500 dark:text-gray-400">{runs.length}</span>
            </div>
            <div className="space-y-3">
              {Array.isArray(runs) && runs.map(run => (
                <div key={run.id} className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="font-medium text-gray-900 dark:text-white">
                        {run.month}/{run.year}
                        <span className="ml-2 text-xs text-gray-500 dark:text-gray-400">
                          • {run.lines?.length || 0} employees
                        </span>
                      </div>
                      <div className="text-xs text-gray-500 dark:text-gray-400">
                        Status: <span className={
                          run.status === 'completed' ? 'text-green-600 dark:text-green-400' :
                          run.status === 'processing' ? 'text-yellow-600 dark:text-yellow-400' :
                          'text-gray-600 dark:text-gray-400'
                        }>{run.status}</span>
                      </div>
                    </div>
                    <div className="flex gap-1">
                      <button 
                        onClick={() => setSelectedRunId(run.id)}
                        className="p-1 text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 transition-colors"
                        title="Open run"
                      >
                        <Edit3 className="w-4 h-4" />
                      </button>
                      {!restrictedView && canManage && (
                        <>
                          <button 
                            onClick={() => handleProcessRun(run.id)}
                            className="p-1 text-gray-500 hover:text-green-600 transition-colors"
                            title="Process run"
                          >
                            <Play className="w-4 h-4" />
                          </button>
                          <button 
                            onClick={() => handleDeleteRun(run.id)}
                            className="p-1 text-gray-500 hover:text-red-600 transition-colors"
                            title="Delete run"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Analytics - only show for admin/hr */}
          {!restrictedView && (
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Payroll Analytics</h3>
              <div className="grid grid-cols-2 gap-3">
                <div className="bg-primary-50 dark:bg-primary-900/20 rounded-lg p-3">
                  <div className="text-sm text-primary-600 dark:text-primary-400">Total Gross</div>
                  <div className="font-semibold text-primary-700 dark:text-primary-300">
                    {rupee(employees.reduce((sum, emp) => sum + (emp.gross || 0), 0))}
                  </div>
                </div>
                <div className="bg-green-50 dark:bg-green-900/20 rounded-lg p-3">
                  <div className="text-sm text-green-600 dark:text-green-400">Total Net</div>
                  <div className="font-semibold text-green-700 dark:text-green-300">
                    {rupee(employees.reduce((sum, emp) => sum + (emp.net || 0), 0))}
                  </div>
                </div>
                <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-3">
                  <div className="text-sm text-blue-600 dark:text-blue-400">Avg Gross</div>
                  <div className="font-semibold text-blue-700 dark:text-blue-300">
                    {rupee(Math.round(employees.reduce((sum, emp) => sum + (emp.gross || 0), 0) / Math.max(1, employees.length)))}
                  </div>
                </div>
                <div className="bg-purple-50 dark:bg-purple-900/20 rounded-lg p-3">
                  <div className="text-sm text-purple-600 dark:text-purple-400">Employees</div>
                  <div className="font-semibold text-purple-700 dark:text-purple-300">{employees.length}</div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Modals */}
      {viewPayslip && (
        <Modal title={`Payslip - ${viewPayslip.employee.name}`} onClose={() => setViewPayslip(null)}>
          <PayslipViewer 
            employee={viewPayslip.employee}
            payrollRun={viewPayslip.run}
            onClose={() => setViewPayslip(null)}
          />
        </Modal>
      )}

      {editingEmployee && !restrictedView && (
        <Modal title="Edit Salary" onClose={() => setEditingEmployee(null)}>
          <EditSalaryForm
            employee={editingEmployee}
            onCancel={() => setEditingEmployee(null)}
            onSave={(baseSalary: number) => {
              handleUpdateSalary(editingEmployee.id, baseSalary)
              setEditingEmployee(null)
            }}
          />
        </Modal>
      )}

      {showCreateRun && !restrictedView && (
        <Modal title="Create Payroll Run" onClose={() => setShowCreateRun(false)}>
          <CreateRunForm
            onCancel={() => setShowCreateRun(false)}
            onCreate={handleCreateRun}
            selectedCount={Object.values(selectedRowsForRun).filter(Boolean).length}
            loading={creatingRunLoading}
          />
        </Modal>
      )}

      {processingRunId && !restrictedView && (
        <Modal title="Processing Payroll" onClose={() => setProcessingRunId(null)}>
          <div className="space-y-4">
            <div className="text-sm text-gray-600 dark:text-gray-400">
              Processing payroll run: {processingRunId}
            </div>
            <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
              <div 
                className="bg-primary-500 h-2 rounded-full transition-all duration-300"
                style={{ width: `${processProgress}%` }}
              />
            </div>
            <div className="text-right text-sm text-gray-500 dark:text-gray-400">
              {processProgress}%
            </div>
          </div>
        </Modal>
      )}
    </div>
  )
}
/* --------------------- Subcomponents --------------------- */

function Modal({ title, onClose, children }: any) {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">{title}</h3>
          <button 
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
        <div className="p-6">{children}</div>
      </div>
    </div>
  )
}
function PayslipViewer({ employee, payrollRun, onClose }: any) {
  const rupee = (n: number) => '₹' + Number(n || 0).toLocaleString('en-IN')
  
  // Get payroll data - don't use calculateEmployeePayroll
  const payrollData = payrollRun ? 
    payrollRun.lines?.find((line: any) => line.employee_id === employee.id) : 
    null

  // Use existing employee data instead of recalculating
  const displayData = {
    base_salary: payrollData?.base_salary || employee.base_salary || employee.salary || 0,
    allowances: payrollData?.allowances || employee.allowances || 0,
    bonus: payrollData?.bonus || employee.bonus || 0,
    gross: payrollData?.gross_salary || employee.gross || 0,
    tax: payrollData?.income_tax || employee.tax || 0,
    pf: payrollData?.provident_fund || employee.pf || 0,
    deductions: payrollData?.total_deductions || employee.deductions || 0,
    net: payrollData?.net_salary || employee.net || 0
  }

  return (
    <div className="space-y-6">
      {/* Employee Info */}
      <div className="grid grid-cols-2 gap-4 p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
        <div>
          <div className="text-sm text-gray-500 dark:text-gray-400">Employee</div>
          <div className="font-semibold text-gray-900 dark:text-white">{employee.name}</div>
          <div className="text-sm text-gray-600 dark:text-gray-300">{employee.email}</div>
        </div>
        <div>
          <div className="text-sm text-gray-500 dark:text-gray-400">Department</div>
          <div className="font-semibold text-gray-900 dark:text-white">{employee.department}</div>
          <div className="text-sm text-gray-600 dark:text-gray-300">{employee.designation || 'Employee'}</div>
        </div>
      </div>

      {/* Pay Period */}
      {payrollRun && (
        <div className="text-center p-3 bg-primary-50 dark:bg-primary-900/20 rounded-lg">
          <div className="text-sm text-primary-600 dark:text-primary-400">Pay Period</div>
          <div className="font-semibold text-primary-700 dark:text-primary-300">
            {payrollRun.month}/{payrollRun.year}
          </div>
          <div className="text-xs text-primary-500 dark:text-primary-400 mt-1">
            Payroll Run: {payrollRun.status}
          </div>
        </div>
      )}

      {/* Earnings */}
      <div className="p-4 border border-gray-200 dark:border-gray-600 rounded-lg">
        <h4 className="font-semibold text-gray-900 dark:text-white mb-3">Earnings</h4>
        <div className="space-y-2">
          <div className="flex justify-between">
            <span className="text-gray-600 dark:text-gray-300">Basic Salary</span>
            <span className="font-medium">{rupee(displayData.base_salary)}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600 dark:text-gray-300">Allowances</span>
            <span className="font-medium">{rupee(displayData.allowances)}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600 dark:text-gray-300">Bonus</span>
            <span className="font-medium">{rupee(displayData.bonus)}</span>
          </div>
          <div className="flex justify-between border-t border-gray-200 dark:border-gray-600 pt-2 mt-2">
            <span className="font-semibold text-gray-900 dark:text-white">Gross Salary</span>
            <span className="font-semibold text-green-600 dark:text-green-400">
              {rupee(displayData.gross)}
            </span>
          </div>
        </div>
      </div>

      {/* Deductions */}
      <div className="p-4 border border-gray-200 dark:border-gray-600 rounded-lg">
        <h4 className="font-semibold text-gray-900 dark:text-white mb-3">Deductions</h4>
        <div className="space-y-2">
          <div className="flex justify-between">
            <span className="text-gray-600 dark:text-gray-300">Income Tax</span>
            <span className="font-medium text-red-600 dark:text-red-400">
              {rupee(displayData.tax)}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600 dark:text-gray-300">Provident Fund</span>
            <span className="font-medium text-red-600 dark:text-red-400">
              {rupee(displayData.pf)}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600 dark:text-gray-300">Professional Tax</span>
            <span className="font-medium text-red-600 dark:text-red-400">
              {rupee(200)}
            </span>
          </div>
          <div className="flex justify-between border-t border-gray-200 dark:border-gray-600 pt-2 mt-2">
            <span className="font-semibold text-gray-900 dark:text-white">Total Deductions</span>
            <span className="font-semibold text-red-600 dark:text-red-400">
              {rupee(displayData.deductions)}
            </span>
          </div>
        </div>
      </div>

      {/* Net Salary */}
      <div className="p-4 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-800">
        <div className="flex justify-between items-center">
          <span className="text-lg font-bold text-gray-900 dark:text-white">Net Salary</span>
          <span className="text-2xl font-bold text-green-600 dark:text-green-400">
            {rupee(displayData.net)}
          </span>
        </div>
      </div>

      {/* Bank Details */}
      {(employee.bank_account_number || payrollData?.bank_account) && (
        <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
          <h4 className="font-semibold text-gray-900 dark:text-white mb-2">Bank Details</h4>
          <div className="text-sm text-gray-600 dark:text-gray-300 space-y-1">
            <div><span className="font-medium">Account:</span> {payrollData?.bank_account || employee.bank_account_number || 'N/A'}</div>
            <div><span className="font-medium">Bank:</span> {payrollData?.bank_name || employee.bank_name || 'N/A'}</div>
            <div><span className="font-medium">IFSC:</span> {payrollData?.ifsc_code || employee.ifsc_code || 'N/A'}</div>
          </div>
        </div>
      )}

      {/* Actions */}
      <div className="flex justify-end gap-3 pt-4 border-t border-gray-200 dark:border-gray-600">
        <button
          onClick={onClose}
          className="px-4 py-2 text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 transition-colors border border-gray-300 dark:border-gray-600 rounded-lg"
        >
          Close
        </button>
        <button
          onClick={() => window.print()}
          className="px-4 py-2 bg-primary-500 hover:bg-primary-600 text-white rounded-lg transition-colors flex items-center gap-2"
        >
          <Download className="w-4 h-4" />
          Print Payslip
        </button>
      </div>
    </div>
  )
}

function EditSalaryForm({ employee, onCancel, onSave }: any) {
  const [baseSalary, setBaseSalary] = useState(employee.base_salary)

  return (
    <div className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          Base Salary for {employee.name}
        </label>
        <input
          type="number"
          value={baseSalary}
          onChange={e => setBaseSalary(Number(e.target.value))}
          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
        />
      </div>
      <div className="flex justify-end gap-3">
        <button
          onClick={onCancel}
          className="px-4 py-2 text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 transition-colors"
        >
          Cancel
        </button>
        <button
          onClick={() => onSave(baseSalary)}
          className="px-4 py-2 bg-primary-500 hover:bg-primary-600 text-white rounded-lg transition-colors"
        >
          Save Changes
        </button>
      </div>
    </div>
  )
}

function CreateRunForm({ onCancel, onCreate, selectedCount, loading }: any) {
  const [month, setMonth] = useState(new Date().getMonth() + 1)
  const [year, setYear] = useState(new Date().getFullYear())
  const [onlySelected, setOnlySelected] = useState(false)

  return (
    <div className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          Month
        </label>
        <select
          value={month}
          onChange={e => setMonth(Number(e.target.value))}
          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
        >
          {Array.from({ length: 12 }, (_, i) => i + 1).map(m => (
            <option key={m} value={m}>{m}</option>
          ))}
        </select>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          Year
        </label>
        <input
          type="number"
          value={year}
          onChange={e => setYear(Number(e.target.value))}
          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
        />
      </div>

      {selectedCount > 0 && (
        <div className="flex items-center gap-3">
          <input
            type="checkbox"
            checked={onlySelected}
            onChange={e => setOnlySelected(e.target.checked)}
            className="rounded border-gray-300 dark:border-gray-600 text-primary-600 focus:ring-primary-500"
          />
          <label className="text-sm text-gray-700 dark:text-gray-300">
            Include only selected employees ({selectedCount})
          </label>
        </div>
      )}

      <div className="flex justify-end gap-3 pt-4">
        <button
          onClick={onCancel}
          className="px-4 py-2 text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 transition-colors"
        >
          Cancel
        </button>
        <button
          onClick={() => onCreate(month, year, onlySelected)}
          disabled={loading}
          className="px-4 py-2 bg-primary-500 hover:bg-primary-600 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-lg transition-colors flex items-center gap-2"
        >
          {loading ? 'Creating...' : 'Create Run'}
        </button>
      </div>
    </div>
  )
}
function PayrollRunEditor({ run, canEdit, onClose, onProcess, onDelete }: any) {
  if (!run) return null

  const rupee = (n: number) => '₹' + Number(n || 0).toLocaleString('en-IN')
  
  // Safely access lines
  const lines = Array.isArray(run.lines) ? run.lines : []

  return (
    <Modal title={`Payroll Run: ${run.month}/${run.year}`} onClose={onClose}>
      <div className="space-y-4">
        <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
          <div>
            <div className="font-medium text-gray-900 dark:text-white">Status: {run.status}</div>
            <div className="text-sm text-gray-500 dark:text-gray-400">
              {lines.length} employees • Total: {rupee(run.total_gross || 0)}
            </div>
          </div>
          {/* ... rest of your component */}
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead>
              <tr className="text-left text-gray-500 dark:text-gray-400 border-b border-gray-200 dark:border-gray-700">
                <th className="py-2 font-medium">Employee</th>
                <th className="py-2 font-medium text-right">Base</th>
                <th className="py-2 font-medium text-right">Allowances</th>
                <th className="py-2 font-medium text-right">Bonus</th>
                <th className="py-2 font-medium text-right">Gross</th>
                <th className="py-2 font-medium text-right">Net</th>
              </tr>
            </thead>
            <tbody>
              {lines.map((line: any) => (
                <tr key={line.id} className="border-b border-gray-100 dark:border-gray-800">
                  <td className="py-2 text-gray-900 dark:text-white">{line.employee_name}</td>
                  <td className="py-2 text-right text-gray-600 dark:text-gray-400">{rupee(line.base_salary || 0)}</td>
                  <td className="py-2 text-right text-gray-600 dark:text-gray-400">{rupee(line.allowances || 0)}</td>
                  <td className="py-2 text-right text-gray-600 dark:text-gray-400">{rupee(line.bonus || 0)}</td>
                  <td className="py-2 text-right font-medium text-gray-900 dark:text-white">{rupee(line.gross_salary || 0)}</td>
                  <td className="py-2 text-right font-medium text-green-600 dark:text-green-400">{rupee(line.net_salary || 0)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </Modal>
  )
}