'use client'

import React, { useEffect, useMemo, useState } from 'react'
import { Download, Search, Edit3, CheckCircle2, Trash2, Play, FileText, Plus, X, AlertTriangle } from 'lucide-react'

/**
 * Enhanced Payroll Admin UI (single file)
 * - Mocked backend calls (replace with real APIs)
 * - Supports create -> draft -> process flows
 * - Inline payroll-line editing, validation, payslip preview, audit log
 */

/* ----------------------------- Helpers & Mock Data ----------------------------- */

const rupee = (n: number) => '₹' + Number(n || 0).toLocaleString('en-IN', { maximumFractionDigits: 0 })

function generateMockEmployees(count = 28) {
  const depts = ['Engineering', 'Sales', 'Marketing', 'HR', 'Finance']
  const names = ['Amit', 'Priya', 'Rahul', 'Sneha', 'Vikram', 'Riya', 'Siddharth', 'Anika']
  return Array.from({ length: count }).map((_, i) => {
    const base = 35000 + Math.round(Math.random() * 90000)
    const allowances = Math.round(base * 0.18)
    const bonus = Math.random() > 0.85 ? Math.round(base * (Math.random() * 0.4)) : 0
    const tax = Math.round((base + allowances + bonus) * 0.12)
    const pf = Math.round(base * 0.12)
    const deductions = tax + pf
    const net = base + allowances + bonus - deductions
    return {
      id: `emp-${i + 1}`,
      uid: `UID${1000 + i}`,
      name: `${names[i % names.length]} ${i + 1}`,
      email: `user${i + 1}@example.com`,
      department: depts[i % depts.length],
      base_salary: base,
      allowances,
      bonus,
      gross: base + allowances + bonus,
      tax,
      pf,
      deductions,
      net,
      bank_account: Math.random() > 0.12 ? `XXXX-XXXX-${1000 + i}` : null, // some missing bank details to trigger validation
      status: 'active'
    }
  })
}

/* Mock payroll runs storage */
function defaultMockRuns() {
  return [
    {
      id: 'run-2025-08',
      month: 8,
      year: 2025,
      status: 'completed',
      total_gross: 12100000,
      created_at: '2025-08-31T08:00:00Z',
      processed_at: '2025-08-31T13:45:00Z',
      lines: [] as any[],
      payslipArchiveUrl: null
    },
    {
      id: 'run-2025-09',
      month: 9,
      year: 2025,
      status: 'draft',
      total_gross: 12000000,
      created_at: '2025-09-01T08:00:00Z',
      processed_at: null,
      lines: [] as any[],
      payslipArchiveUrl: null
    },
  ]
}

/* ----------------------------- Main Exported Component ----------------------------- */

export default function EnhancedPayrollAdmin({ role = 'admin' }: { role?: 'admin' | 'hr' | 'manager' | 'employee' }) {
  const canManage = role === 'admin' || role === 'hr'
  const canViewTeam = role === 'manager' || canManage

  // data
  const [employees, setEmployees] = useState<any[]>(() => generateMockEmployees(34))
  const [filter, setFilter] = useState('')
  const [departmentFilter, setDepartmentFilter] = useState<string>('')
  const [statusFilter, setStatusFilter] = useState<string>('')
  const [salaryMin, setSalaryMin] = useState<number | ''>('')
  const [salaryMax, setSalaryMax] = useState<number | ''>('')
  const [page, setPage] = useState(1)
  const pageSize = 8
  const [loading, setLoading] = useState(false)

  // payroll runs & audit
  const [runs, setRuns] = useState<any[]>(() => defaultMockRuns())
  const [audit, setAudit] = useState<any[]>(() => [])
  const [selectedRunId, setSelectedRunId] = useState<string | null>(null)

  // UI modals
  const [editingEmployee, setEditingEmployee] = useState<any | null>(null)
  const [showCreateRun, setShowCreateRun] = useState(false)
  const [creatingRunLoading, setCreatingRunLoading] = useState(false)
  const [processingRunId, setProcessingRunId] = useState<string | null>(null)
  const [processProgress, setProcessProgress] = useState<number>(0)
  const [viewPayslip, setViewPayslip] = useState<any | null>(null)
  const [selectedRowsForRun, setSelectedRowsForRun] = useState<Record<string, boolean>>({})

  // derived lists
  const departments = useMemo(() => Array.from(new Set(employees.map(e => e.department).filter(Boolean))), [employees])

  const filteredEmployees = useMemo(() => {
    return employees.filter(e => {
      const q = (e.name + e.email + (e.department || '')).toLowerCase()
      if (filter && !q.includes(filter.toLowerCase())) return false
      if (departmentFilter && e.department !== departmentFilter) return false
      if (statusFilter && e.status !== statusFilter) return false
      if (salaryMin !== '' && Number(e.base_salary) < Number(salaryMin)) return false
      if (salaryMax !== '' && Number(e.base_salary) > Number(salaryMax)) return false
      return true
    })
  }, [employees, filter, departmentFilter, statusFilter, salaryMin, salaryMax])

  const totalPages = Math.max(1, Math.ceil(filteredEmployees.length / pageSize))
  useEffect(() => { if (page > totalPages) setPage(totalPages) }, [totalPages])

  const paged = filteredEmployees.slice((page - 1) * pageSize, page * pageSize)

  /* ----------------- Mock API-like helpers (replace these with real fetches) ----------------- */

  function pushAudit(action: string, details: any = {}) {
    setAudit(prev => [{ id: `a-${Date.now()}`, action, details, at: new Date().toISOString() }, ...prev])
  }

  async function apiUpdateEmployeeBase(id: string, newBase: number) {
    // update employee and recalc
    setEmployees(prev => prev.map(p => {
      if (p.id !== id) return p
      const base_salary = Number(newBase)
      const gross = base_salary + (p.allowances || 0) + (p.bonus || 0)
      const tax = Math.round((base_salary + (p.allowances || 0) + (p.bonus || 0)) * 0.12)
      const pf = Math.round(base_salary * 0.12)
      const deductions = tax + pf
      const net = gross - deductions
      return { ...p, base_salary, gross, tax, pf, deductions, net }
    }))
    pushAudit('update.employee.base', { id, newBase })
    return true
  }

  async function apiCreatePayrollRun(payload: { month: number; year: number; employeeIds?: string[] }) {
    setCreatingRunLoading(true)
    await new Promise(r => setTimeout(r, 500)) // simulate latency
    const id = `run-${payload.year}-${String(payload.month).padStart(2, '0')}-${Date.now()}`
    // build lines from selected employees or all employees
    const selected = payload.employeeIds && payload.employeeIds.length ? employees.filter(e => payload.employeeIds!.includes(e.id)) : employees
    const lines = selected.map(e => ({
      id: `line-${e.id}-${id}`,
      employee_id: e.id,
      employee_name: e.name,
      base_salary: e.base_salary,
      allowances: e.allowances,
      bonus: e.bonus,
      gross: e.gross,
      tax: e.tax,
      pf: e.pf,
      deductions: e.deductions,
      net: e.net,
      bank_account: e.bank_account,
      payslipUrl: null
    }))
    const total_gross = lines.reduce((s, l) => s + (l.gross || 0), 0)
    const newRun = {
      id,
      month: payload.month,
      year: payload.year,
      status: 'draft',
      lines,
      total_gross,
      created_at: new Date().toISOString(),
      processed_at: null,
      payslipArchiveUrl: null
    }
    setRuns(prev => [newRun, ...prev])
    pushAudit('create.run', { id, month: payload.month, year: payload.year, count: lines.length })
    setCreatingRunLoading(false)
    return newRun
  }

  async function apiUpdateRunLine(runId: string, lineId: string, patch: Partial<any>) {
    setRuns(prev => prev.map(run => {
      if (run.id !== runId) return run
      const lines = run.lines.map((L: any) => L.id === lineId ? { ...L, ...patch, gross: (patch.base_salary ?? L.base_salary) + (patch.allowances ?? L.allowances) + (patch.bonus ?? L.bonus) } : L)
      const total_gross = lines.reduce((s: number, l: any) => s + (l.gross || 0), 0)
      return { ...run, lines, total_gross }
    }))
    pushAudit('update.run.line', { runId, lineId, patch })
  }

  async function apiProcessRun(runId: string, onProgress?: (p: number) => void) {
    // Simulated processing: validate, compute, generate payslips
    const run = runs.find(r => r.id === runId)
    if (!run) return { ok: false, error: 'not found' }
    // set status -> processing
    setRuns(prev => prev.map(r => r.id === runId ? { ...r, status: 'processing' } : r))
    pushAudit('process.run.start', { runId })
    setProcessProgress(0)
    for (let i = 1; i <= 6; i++) {
      await new Promise(r => setTimeout(r, 400 + Math.random() * 400))
      const p = Math.round((i / 6) * 100)
      setProcessProgress(p)
      onProgress?.(p)
    }
    // finalize: attach payslip URLs (mock)
    setRuns(prev => prev.map(r => {
      if (r.id !== runId) return r
      const lines = r.lines.map((L: any) => ({ ...L, payslipUrl: `/mock-payslips/${r.id}/${L.employee_id}.pdf` }))
      const payslipArchiveUrl = `/mock-payslips/${r.id}/archive.zip`
      return { ...r, status: 'completed', processed_at: new Date().toISOString(), lines, payslipArchiveUrl }
    }))
    pushAudit('process.run.complete', { runId })
    setProcessProgress(100)
    await new Promise(r => setTimeout(r, 200))
    setProcessingRunId(null)
    setProcessProgress(0)
    return { ok: true }
  }

  async function apiExportRun(runId: string, type = 'payslips') {
    // mock export - in real world call backend and return/download file
    alert(`(mock) Export ${type} for run ${runId}`)
    pushAudit('export.run', { runId, type })
  }

  /* ----------------- UI & Handlers ----------------- */

  function startEditEmployee(emp: any) {
    setEditingEmployee(emp)
  }

  function saveEditEmployee(payload: any) {
    apiUpdateEmployeeBase(payload.id, Number(payload.base_salary))
    setEditingEmployee(null)
  }

  async function handleCreateRunOpen() {
    setShowCreateRun(true)
    setSelectedRowsForRun({})
  }

  async function handleCreateRunConfirm(month: number, year: number, includeSelectedOnly = false) {
    setShowCreateRun(false)
    setCreatingRunLoading(true)
    const employeeIds = includeSelectedOnly ? Object.keys(selectedRowsForRun).filter(k => selectedRowsForRun[k]) : undefined
    const newRun = await apiCreatePayrollRun({ month, year, employeeIds })
    // open run editor automatically
    setSelectedRunId(newRun.id)
    setCreatingRunLoading(false)
  }

  function toggleSelectForRun(empId: string) {
    setSelectedRowsForRun(prev => ({ ...prev, [empId]: !prev[empId] }))
  }

  function openRunEditor(runId: string) {
    setSelectedRunId(runId)
  }

  async function handleProcessRun(runId: string) {
    if (!canManage) { alert('Permission denied'); return }
    setProcessingRunId(runId)
    await apiProcessRun(runId, (p) => setProcessProgress(p))
  }

  function deleteRun(runId: string) {
    if (!confirm('Delete run? This will remove draft permanently.')) return
    setRuns(prev => prev.filter(r => r.id !== runId))
    pushAudit('delete.run', { runId })
    if (selectedRunId === runId) setSelectedRunId(null)
  }

  // validation for run (simple checks)
  function runValidations(run: any) {
    const warnings: string[] = []
    if (!run) return warnings
    // missing bank details
    const missingBank = run.lines.filter((l: any) => !l.bank_account)
    if (missingBank.length) warnings.push(`${missingBank.length} employee(s) missing bank details`)
    // negative net (shouldn't occur here, but check)
    const negativeNet = run.lines.filter((l: any) => (l.net ?? 0) < 0)
    if (negativeNet.length) warnings.push(`${negativeNet.length} employee(s) have negative net pay`)
    return warnings
  }

  /* ----------------- Render ----------------- */

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Payroll Management</h1>
          <p className="text-gray-600 dark:text-gray-400">Create runs, edit lines, process payroll and export payslips</p>
        </div>

        <div className="flex items-center gap-2">
          <div className="relative">
            <Search className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
            <input
              placeholder="Search employee..."
              value={filter}
              onChange={e => { setFilter(e.target.value); setPage(1) }}
              className="pl-10 pr-3 py-2 rounded-md bg-white/10 border border-white/20 text-white placeholder-gray-400 text-sm"
            />
          </div>

          <select className="px-2 py-2 bg-white/10 border border-white/20 rounded" value={departmentFilter} onChange={e => setDepartmentFilter(e.target.value)}>
            <option value="">All departments</option>
            {departments.map(d => <option key={d} value={d}>{d}</option>)}
          </select>

          <input type="number" placeholder="Min base" value={salaryMin === '' ? '' : String(salaryMin)} onChange={e => setSalaryMin(e.target.value === '' ? '' : Number(e.target.value))} className="w-24 p-2 rounded bg-white/10 border border-white/20 text-sm" />
          <input type="number" placeholder="Max base" value={salaryMax === '' ? '' : String(salaryMax)} onChange={e => setSalaryMax(e.target.value === '' ? '' : Number(e.target.value))} className="w-24 p-2 rounded bg-white/10 border border-white/20 text-sm" />

          {canManage && (
            <>
              <button onClick={handleCreateRunOpen} className="px-4 py-2 bg-primary-500 text-white rounded-lg flex items-center gap-2">
                <Plus className="w-4 h-4" /> Create Run
              </button>
              <button onClick={() => apiExportRun('latest', 'register')} className="px-3 py-2 btn-glass"><Download className="w-4 h-4" /></button>
            </>
          )}
        </div>
      </div>

      {/* Body grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left: Employee table (main) */}
        <div className="lg:col-span-2 space-y-6">
          <div className="card p-4">
            <div className="flex items-center justify-between mb-3">
              <div className="text-sm text-gray-400">Employee Payroll Overview <span className="ml-2 text-xs text-gray-300">({filteredEmployees.length})</span></div>
              <div className="text-xs text-gray-400">Page {page} / {totalPages}</div>
            </div>

            <div className="overflow-x-auto">
              <table className="min-w-full text-sm">
                <thead>
                  <tr className="text-left text-gray-400 border-b border-white/10">
                    <th className="py-2 pl-3">Select</th>
                    <th>Name</th>
                    <th>Email</th>
                    <th>Dept</th>
                    <th className="text-right">Gross</th>
                    <th className="text-right">Net</th>
                    <th className="text-right">Deductions</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {paged.map(emp => (
                    <tr key={emp.id} className="border-b border-white/5 hover:bg-white/5 transition">
                      <td className="py-2 pl-3">
                        {canManage ? <input type="checkbox" checked={!!selectedRowsForRun[emp.id]} onChange={() => toggleSelectForRun(emp.id)} /> : <input type="checkbox" disabled />}
                      </td>
                      <td className="py-2 font-medium text-white">{emp.name}</td>
                      <td className="text-gray-400">{emp.email}</td>
                      <td className="text-gray-400">{emp.department}</td>
                      <td className="text-right">{rupee(emp.gross)}</td>
                      <td className="text-right">{rupee(emp.net)}</td>
                      <td className="text-right">{rupee(emp.deductions)}</td>
                      <td className="flex gap-2">
                        {canManage && <button onClick={() => startEditEmployee(emp)} className="btn-glass px-2 py-1 text-xs flex items-center"><Edit3 className="w-3 h-3 mr-1"/>Edit</button>}
                        <button onClick={() => { setViewPayslip(emp) }} className="btn-glass px-2 py-1 text-xs flex items-center"><FileText className="w-3 h-3 mr-1"/>Payslip</button>
                        {canManage && <button onClick={() => { /* process single employee mock */ const runId = `preview-${emp.id}-${Date.now()}`; setProcessingRunId(runId); setTimeout(()=>{ setProcessingRunId(null); alert('Processed single employee (mock)'); pushAudit('process.employee', { empId: emp.id }) }, 800) }} className="btn-glass px-2 py-1 text-xs text-green-400 flex items-center"><CheckCircle2 className="w-3 h-3 mr-1"/>Process</button>}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* pagination */}
            <div className="flex justify-between items-center mt-3">
              <div className="text-xs text-gray-400">Showing {((page - 1) * pageSize) + 1}—{Math.min(page * pageSize, filteredEmployees.length)} of {filteredEmployees.length}</div>
              <div className="flex items-center gap-2">
                <button disabled={page === 1} onClick={() => setPage(p => Math.max(1, p - 1))} className="px-2 py-1 btn-glass text-sm">Prev</button>
                <div className="text-sm text-gray-300">Page {page} / {totalPages}</div>
                <button disabled={page >= totalPages} onClick={() => setPage(p => Math.min(totalPages, p + 1))} className="px-2 py-1 btn-glass text-sm">Next</button>
              </div>
            </div>
          </div>

          {/* Selected Run editor */}
          {selectedRunId && (
            <RunEditor
              run={runs.find(r => r.id === selectedRunId)}
              canEdit={canManage}
              onClose={() => setSelectedRunId(null)}
              onUpdateLine={(lineId, patch) => apiUpdateRunLine(selectedRunId as string, lineId, patch)}
              onProcess={() => handleProcessRun(selectedRunId as string)}
              onExport={(t) => apiExportRun(selectedRunId as string, t)}
              onAudit={(a) => pushAudit(a.action, a.details)}
              onDelete={() => { if (confirm('Delete this run?')) { setRuns(prev => prev.filter(r => r.id !== selectedRunId)); setSelectedRunId(null); pushAudit('delete.run', { runId: selectedRunId }) } }}
            />
          )}
        </div>

        {/* Right column: Runs list + Analytics + Audit */}
        <div className="space-y-6">
          {/* Runs list */}
          <div className="card p-4">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-lg font-semibold">Payroll Runs</h3>
              <div className="text-xs text-gray-400">{runs.length}</div>
            </div>
            <div className="space-y-2">
              {runs.map(run => (
                <div key={run.id} className="flex items-center justify-between bg-white/5 p-3 rounded">
                  <div>
                    <div className="font-medium">{run.month}/{run.year} <span className="text-xs text-gray-400">• {run.lines?.length ?? '—'} lines</span></div>
                    <div className="text-xs text-gray-400">Status: <span className={run.status === 'completed' ? 'text-green-400' : run.status === 'processing' ? 'text-yellow-300' : 'text-gray-300'}>{run.status}</span> {run.processed_at ? `• processed ${new Date(run.processed_at).toLocaleString()}` : ''}</div>
                  </div>
                  <div className="flex gap-2 items-center">
                    <button onClick={() => openRunEditor(run.id)} className="btn-glass px-2 py-1 text-xs flex items-center"><Edit3 className="w-3 h-3 mr-1"/>Open</button>
                    <button onClick={() => { setProcessingRunId(run.id); handleProcessRun(run.id) }} className="btn-glass px-2 py-1 text-xs flex items-center"><Play className="w-3 h-3 mr-1"/>Process</button>
                    <button onClick={() => apiExportRun(run.id, 'payslips')} className="btn-glass px-2 py-1 text-xs"><Download className="w-3 h-3"/></button>
                    <button onClick={() => deleteRun(run.id)} className="btn-glass px-2 py-1 text-xs text-rose-500"><Trash2 className="w-3 h-3"/></button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Quick Analytics */}
          <div className="card p-4">
            <h3 className="text-lg font-semibold mb-3">Quick Analytics</h3>
            <div className="grid grid-cols-2 gap-2">
              <div className="p-3 bg-white/5 rounded">
                <div className="text-sm text-gray-400">Total Gross</div>
                <div className="font-semibold">{rupee(employees.reduce((s,e) => s + (e.gross || 0), 0))}</div>
              </div>
              <div className="p-3 bg-white/5 rounded">
                <div className="text-sm text-gray-400">Total Net</div>
                <div className="font-semibold">{rupee(employees.reduce((s,e) => s + (e.net || 0), 0))}</div>
              </div>
              <div className="p-3 bg-white/5 rounded">
                <div className="text-sm text-gray-400">Avg Gross</div>
                <div className="font-semibold">{rupee(Math.round(employees.reduce((s,e) => s + (e.gross || 0), 0) / Math.max(1, employees.length)))}</div>
              </div>
              <div className="p-3 bg-white/5 rounded">
                <div className="text-sm text-gray-400">Employees</div>
                <div className="font-semibold">{employees.length}</div>
              </div>
            </div>
          </div>

          {/* Audit log (mini) */}
          <div className="card p-4">
            <h3 className="text-lg font-semibold mb-3">Audit (recent)</h3>
            <div className="space-y-2 text-xs text-gray-400 max-h-48 overflow-auto">
              {audit.length === 0 && <div className="text-gray-500">No audit entries yet.</div>}
              {audit.map(a => (
                <div key={a.id} className="flex justify-between items-start gap-2">
                  <div>
                    <div className="font-medium text-sm">{a.action}</div>
                    <div className="text-xs text-gray-400">{JSON.stringify(a.details)}</div>
                  </div>
                  <div className="text-right text-xs text-gray-400">{new Date(a.at).toLocaleTimeString()}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* ------------------ Modals / Drawers ------------------ */}

      {editingEmployee && (
        <Modal title="Edit Salary" onClose={() => setEditingEmployee(null)}>
          <EditSalaryForm initial={editingEmployee} onCancel={() => setEditingEmployee(null)} onSave={(v:any) => saveEditEmployee(v)} />
        </Modal>
      )}

      {viewPayslip && (
        <Modal title="Payslip Preview" onClose={() => setViewPayslip(null)}>
          <PayslipPreview employee={viewPayslip} />
        </Modal>
      )}

      {showCreateRun && (
        <Modal title="Create Payroll Run" onClose={() => setShowCreateRun(false)}>
          <CreateRunForm
            defaultMonth={new Date().getMonth()+1}
            defaultYear={new Date().getFullYear()}
            onCancel={() => setShowCreateRun(false)}
            onCreate={(m,y,onlySelected) => handleCreateRunConfirm(m,y,onlySelected)}
            selectedCount={Object.values(selectedRowsForRun).filter(Boolean).length}
            loading={creatingRunLoading}
          />
        </Modal>
      )}

      {processingRunId && (
        <Modal title="Processing Payroll" onClose={() => setProcessingRunId(null)}>
          <div>
            <div className="text-sm text-gray-500 mb-2">Run: {processingRunId}</div>
            <div className="w-full bg-white/10 h-3 rounded overflow-hidden mb-3">
              <div style={{ width: `${processProgress}%` }} className="bg-primary-500 h-full" />
            </div>
            <div className="flex justify-end gap-2">
              <button onClick={() => { setProcessingRunId(null) }} className="px-3 py-1 btn-glass">Close</button>
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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/40" onClick={onClose}></div>
      <div className="relative bg-white dark:bg-gray-800 rounded-lg shadow-xl z-10 max-w-2xl w-full p-5">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold">{title}</h3>
          <button onClick={onClose} className="p-1 text-gray-500"><X className="w-4 h-4" /></button>
        </div>
        <div>{children}</div>
      </div>
    </div>
  )
}

function EditSalaryForm({ initial, onCancel, onSave }: any) {
  const [base, setBase] = useState(Number(initial.base_salary || 0))
  return (
    <div>
      <div className="mb-2"><strong>{initial.name}</strong></div>
      <label className="block text-sm text-gray-600 mb-1">Base salary</label>
      <input type="number" value={base} onChange={e => setBase(Number(e.target.value))} className="w-full p-2 border rounded mb-4" />
      <div className="flex justify-end gap-2">
        <button onClick={onCancel} className="px-3 py-1 btn-glass">Cancel</button>
        <button onClick={() => onSave({ id: initial.id, base_salary: base })} className="px-3 py-1 bg-primary-500 text-white rounded">Save</button>
      </div>
    </div>
  )
}


// function CreateRunForm({ defaultMonth, defaultYear, onCancel, onCreate, selectedCount, loading }: any) {
//   const [month, setMonth] = useState(defaultMonth)
//   const [year, setYear] = useState(defaultYear)
//   const [onlySelected, setOnlySelected] = useState(false)
//   return (
//     <div>
//       <label className="block text-sm mb-1">Month</label>
//       <select value={month} onChange={e => set
