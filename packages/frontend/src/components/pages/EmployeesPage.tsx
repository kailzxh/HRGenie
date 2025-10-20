'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { toast } from 'sonner'
import { supabase } from '@/config/supabase'
import {
  Search,
  Plus,
  Download,
  Eye,
  Edit,
  Trash2,
  LayoutGrid,
  Table
} from 'lucide-react'

import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

interface Employee {
  id: string
  uid?: string
  name: string
  email: string
  phone?: string
  department: string
  position: string
  location: string
  role: string
  salary?: number
  joining_date?: string
  status: string
  created_at?: string
  updated_at?: string
  manager_id?: string
}

const departments = [
  'Engineering',
  'Human Resources',
  'Marketing',
  'Finance',
  'Operations',
  'Design'
]

const locations = ['New York', 'San Francisco', 'Chicago', 'Austin', 'Seattle', 'Remote']

const roles = ['employee', 'hr', 'manager', 'admin']
const API_BASE_URL = process.env.NEXT_PUBLIC_BACKEND_URL;
export default function EmployeesPage() {
  const [employees, setEmployees] = useState<Employee[]>([])
  const [loading, setLoading] = useState(true)
  const [userRole, setUserRole] = useState<string | null>(null)
  const [userEmail, setUserEmail] = useState<string | null>(null)
  const [currentUserEmployee, setCurrentUserEmployee] = useState<Employee | null>(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedDepartment, setSelectedDepartment] = useState('All Departments')
  const [selectedLocation, setSelectedLocation] = useState('All Locations')
  const [viewMode, setViewMode] = useState<'grid' | 'table'>('grid')

  const [showForm, setShowForm] = useState(false)
  const [editEmployee, setEditEmployee] = useState<Employee | null>(null)
  const [formData, setFormData] = useState<Partial<Employee>>({})

  const [viewEmployee, setViewEmployee] = useState<Employee | null>(null)
  const [showViewDialog, setShowViewDialog] = useState(false)

  const getAccessToken = async () => {
    const { data: { session } } = await supabase.auth.getSession()
    return session?.access_token ?? null
  }

  const fetchUserInfo = async () => {
    try {
      const token = await getAccessToken()
      const res = await fetch(`${API_BASE_URL}/auth/user`, {
        headers: { Authorization: `Bearer ${token}` }
      })
      const data = await res.json()
      setUserRole(data.role || null)
      setUserEmail(data.email || null)
      
      // If user is manager or employee, fetch their employee record
      if (data.role === 'manager' || data.role === 'employee') {
        await fetchCurrentUserEmployee(data.email)
      }
    } catch (err) {
      console.error(err)
    }
  }

  const fetchCurrentUserEmployee = async (email: string) => {
    try {
      const token = await getAccessToken()
      const res = await fetch(`${API_BASE_URL}/employees/email/${email}`, {
        headers: { Authorization: `Bearer ${token}` }
      })
      if (res.ok) {
        const employeeData = await res.json()
        setCurrentUserEmployee(employeeData)
      }
    } catch (err) {
      console.error('Error fetching current user employee:', err)
    }
  }

  const fetchEmployees = async () => {
    try {
      setLoading(true)
      const token = await getAccessToken()
      const res = await fetch(`${API_BASE_URL}/employees`, {
        headers: { Authorization: `Bearer ${token}` }
      })
      
      if (!res.ok) {
        throw new Error(`Failed to fetch employees: ${res.status}`)
      }
      
      const data = await res.json()
      setEmployees(Array.isArray(data) ? data : data.data || [])
    } catch (err) {
      console.error('Error fetching employees:', err)
      toast.error('Failed to fetch employees')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchUserInfo()
    fetchEmployees()
  }, [])

  // Role-based permissions
  const canAdd = userRole === 'admin' || userRole === 'hr'
  const canEdit = userRole === 'admin' || userRole === 'hr'
  const canDelete = userRole === 'admin'
  const canView = userRole === 'admin' || userRole === 'hr' || userRole === 'manager'

  // Filter employees based on user role
  const getFilteredEmployeesByRole = (employees: Employee[]) => {
    if (userRole === 'admin' || userRole === 'hr') {
      return employees // Admins and HR see all employees
    }
    
    if (userRole === 'manager' && currentUserEmployee) {
      // Managers see employees under them (where manager_id matches their employee id)
      return employees.filter(emp => emp.manager_id === currentUserEmployee.id)
    }
    
    if (userRole === 'employee') {
      return [] // Employees see no one (this page should be hidden from sidebar)
    }
    
    return employees
  }

  const handleSave = async () => {
    try {
      const token = await getAccessToken()
      const method = editEmployee ? 'PUT' : 'POST'
      const url = editEmployee
        ? `${API_BASE_URL}/employees/${editEmployee.id}`
        : `${API_BASE_URL}/employees`

      const res = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(formData)
      })

      if (!res.ok) throw new Error('Failed to save employee')
      toast.success(editEmployee ? 'Employee updated' : 'Employee added')
      setShowForm(false)
      setEditEmployee(null)
      setFormData({})
      fetchEmployees()
    } catch (err) {
      console.error(err)
      toast.error('Failed to save employee')
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this employee?')) return
    try {
      const token = await getAccessToken()
      const res = await fetch(`${API_BASE_URL}/employees/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` }
      })
      if (!res.ok) throw new Error('Failed to delete')
      toast.success('Employee deleted')
      fetchEmployees()
    } catch (err) {
      console.error(err)
      toast.error('Failed to delete employee')
    }
  }

  // Apply role-based filtering first, then search/filter
  const roleFilteredEmployees = getFilteredEmployeesByRole(employees)
  
  const filteredEmployees = roleFilteredEmployees.filter(emp => {
    const matchesSearch =
      emp.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      emp.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      emp.department.toLowerCase().includes(searchQuery.toLowerCase()) ||
      emp.position.toLowerCase().includes(searchQuery.toLowerCase())

    const matchesDept =
      selectedDepartment === 'All Departments' || emp.department === selectedDepartment
    const matchesLoc =
      selectedLocation === 'All Locations' || emp.location === selectedLocation

    return matchesSearch && matchesDept && matchesLoc
  })

  const getStatusBadge = (status: string) => {
    const styles = {
      active: 'bg-green-100 text-green-800 dark:bg-green-900/40 dark:text-green-300',
      'on-leave': 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/40 dark:text-yellow-300',
      inactive: 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-400'
    }
    return styles[status as keyof typeof styles] || styles.active
  }

  const filteredRoles = userRole === 'hr' ? roles.filter(r => r !== 'admin') : roles

  // Don't show anything for employees
  if (userRole === 'employee') {
    return (
      <div className="space-y-6 p-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold">Employee Directory</h1>
            <p className="text-gray-600 dark:text-gray-400">
              Access restricted
            </p>
          </div>
        </div>
        <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-6 text-center">
          <p className="text-yellow-700 dark:text-yellow-300">
            You don't have permission to access the employee directory.
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">Employee Directory</h1>
          <p className="text-gray-600 dark:text-gray-400">
            {userRole === 'manager' ? 'Manage your team members' : 'Manage and view all employees'}
            {userRole === 'manager' && currentUserEmployee && (
              <span className="ml-2 text-sm text-blue-600 dark:text-blue-400">
                (Manager: {currentUserEmployee.name})
              </span>
            )}
          </p>
        </div>

        <div className="flex items-center space-x-3">
          <Button variant="outline">
            <Download className="w-4 h-4 mr-2" /> Export
          </Button>
          {canAdd && (
            <Button
              onClick={() => {
                setShowForm(true)
                setEditEmployee(null)
                setFormData({})
              }}
            >
              <Plus className="w-4 h-4 mr-2" /> Add Employee
            </Button>
          )}

          {/* View toggle */}
          <div className="flex rounded-md border border-gray-300 dark:border-gray-700">
            <button
              onClick={() => setViewMode('grid')}
              className={`p-2 transition-colors ${
                viewMode === 'grid'
                  ? 'bg-primary/10 text-primary-700 dark:bg-primary/20'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              <LayoutGrid className="w-4 h-4" />
            </button>
            <button
              onClick={() => setViewMode('table')}
              className={`p-2 transition-colors ${
                viewMode === 'table'
                  ? 'bg-primary/10 text-primary-700 dark:bg-primary/20'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              <Table className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Role-based info banner */}
      {userRole === 'manager' && (
        <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
            <span className="text-sm text-blue-700 dark:text-blue-300">
              Manager View: Showing only employees under your management
            </span>
          </div>
        </div>
      )}

      {/* Filters */}
      {canView && (
        <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border dark:border-gray-700">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="md:col-span-2 relative">
              <Search className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
              <Input
                placeholder="Search employees..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9"
              />
            </div>

            <select
              value={selectedDepartment}
              onChange={(e) => setSelectedDepartment(e.target.value)}
              className="border dark:border-gray-700 bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-gray-200 rounded-lg p-2"
            >
              <option>All Departments</option>
              {departments.map(d => <option key={d}>{d}</option>)}
            </select>

            <select
              value={selectedLocation}
              onChange={(e) => setSelectedLocation(e.target.value)}
              className="border dark:border-gray-700 bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-gray-200 rounded-lg p-2"
            >
              <option>All Locations</option>
              {locations.map(l => <option key={l}>{l}</option>)}
            </select>
          </div>
        </div>
      )}

      {/* Grid/Table */}
      {loading ? (
        <p>Loading employees...</p>
      ) : !canView ? (
        <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-6 text-center">
          <p className="text-yellow-700 dark:text-yellow-300">
            You don't have permission to view employees.
          </p>
        </div>
      ) : filteredEmployees.length === 0 ? (
        <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-6 text-center">
          <p className="text-gray-600 dark:text-gray-400">
            {userRole === 'manager' 
              ? 'No team members found under your management.' 
              : 'No employees found.'}
          </p>
        </div>
      ) : viewMode === 'grid' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredEmployees.map((emp, index) => (
            <motion.div
              key={emp.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
              className="border dark:border-gray-700 bg-white dark:bg-gray-900 p-6 rounded-xl shadow-sm hover:shadow-md transition-shadow"
            >
              <h3 className="text-lg font-semibold">{emp.name}</h3>
              <p className="text-sm text-gray-500">{emp.position}</p>
              <p className="text-xs text-gray-400">{emp.role.toUpperCase()}</p>
              <span
                className={`inline-block mt-2 px-2 py-1 rounded-full text-xs ${getStatusBadge(
                  emp.status
                )}`}
              >
                {emp.status}
              </span>
              <p className="text-sm mt-2">{emp.department} • {emp.location}</p>

              <div className="flex justify-center gap-2 mt-4">
                <Button
                  size="icon"
                  variant="ghost"
                  onClick={() => {
                    setViewEmployee(emp)
                    setShowViewDialog(true)
                  }}
                >
                  <Eye className="w-4 h-4" />
                </Button>
                {canEdit && (
                  <Button
                    size="icon"
                    variant="ghost"
                    onClick={() => {
                      setEditEmployee(emp)
                      setFormData(emp)
                      setShowForm(true)
                    }}
                  >
                    <Edit className="w-4 h-4 text-blue-500" />
                  </Button>
                )}
                {canDelete && (
                  <Button size="icon" variant="ghost" onClick={() => handleDelete(emp.id)}>
                    <Trash2 className="w-4 h-4 text-red-500" />
                  </Button>
                )}
              </div>
            </motion.div>
          ))}
        </div>
      ) : (
        <div className="overflow-hidden rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 shadow-sm">
          <table className="w-full text-sm text-gray-700 dark:text-gray-200">
            <thead className="bg-gray-50 dark:bg-gray-800/60 border-b border-gray-200 dark:border-gray-700">
              <tr>
                <th className="px-6 py-3 text-left font-semibold">Name</th>
                <th className="px-6 py-3 text-left font-semibold">Department</th>
                <th className="px-6 py-3 text-left font-semibold">Location</th>
                <th className="px-6 py-3 text-left font-semibold">Role</th>
                <th className="px-6 py-3 text-left font-semibold">Status</th>
                <th className="px-6 py-3 text-right font-semibold">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredEmployees.map((emp, index) => (
                <tr
                  key={emp.id}
                  className={`transition-colors ${
                    index % 2 === 0
                      ? 'bg-white dark:bg-gray-900'
                      : 'bg-gray-50 dark:bg-gray-800/40'
                  } hover:bg-gray-100 dark:hover:bg-gray-800/70`}
                >
                  <td className="px-6 py-3 font-medium">{emp.name}</td>
                  <td className="px-6 py-3">{emp.department}</td>
                  <td className="px-6 py-3">{emp.location}</td>
                  <td className="px-6 py-3 capitalize">{emp.role}</td>
                  <td className="px-6 py-3">
                    <span
                      className={`inline-block px-2.5 py-1 rounded-full text-xs font-medium ${getStatusBadge(emp.status)}`}
                    >
                      {emp.status.replace('-', ' ')}
                    </span>
                  </td>
                  <td className="px-6 py-3 text-right space-x-2">
                    <Button
                      size="icon"
                      variant="ghost"
                      onClick={() => {
                        setViewEmployee(emp)
                        setShowViewDialog(true)
                      }}
                    >
                      <Eye className="w-4 h-4" />
                    </Button>
                    {canEdit && (
                      <Button
                        size="icon"
                        variant="ghost"
                        onClick={() => {
                          setEditEmployee(emp)
                          setFormData(emp)
                          setShowForm(true)
                        }}
                      >
                        <Edit className="w-4 h-4 text-blue-500" />
                      </Button>
                    )}
                    {canDelete && (
                      <Button
                        size="icon"
                        variant="ghost"
                        onClick={() => handleDelete(emp.id)}
                      >
                        <Trash2 className="w-4 h-4 text-red-500" />
                      </Button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Add/Edit Employee Dialog */}
      <Dialog open={showForm} onOpenChange={setShowForm}>
        <DialogContent className="max-w-3xl w-full sm:w-[90%] md:w-[80%] lg:w-[60%] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editEmployee ? 'Edit Employee' : 'Add Employee'}</DialogTitle>
          </DialogHeader>

          <div className="grid gap-4 py-4 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
            <div className="w-full">
              <Label>Name</Label>
              <Input
                value={formData.name || ''}
                onChange={e => setFormData({ ...formData, name: e.target.value })}
              />
            </div>

            <div className="w-full">
              <Label>Email</Label>
              <Input
                value={formData.email || ''}
                onChange={e => setFormData({ ...formData, email: e.target.value })}
              />
            </div>

            <div className="w-full">
              <Label>Phone</Label>
              <Input
                type="tel"
                value={formData.phone || ''}
                onChange={e => setFormData({ ...formData, phone: e.target.value })}
              />
            </div>

            <div className="w-full">
              <Label>Role</Label>
              <select
                value={formData.role || 'employee'}
                onChange={e => setFormData({ ...formData, role: e.target.value })}
                className="w-full border dark:border-gray-700 bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-gray-200 rounded-lg p-2"
              >
                {filteredRoles.map(r => (
                  <option key={r} value={r}>{r}</option>
                ))}
              </select>
            </div>

            <div className="w-full">
              <Label>Department</Label>
              <select
                value={formData.department || ''}
                onChange={e => setFormData({ ...formData, department: e.target.value })}
                className="w-full border dark:border-gray-700 bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-gray-200 rounded-lg p-2"
              >
                <option value="">Select Department</option>
                {departments.map(d => (
                  <option key={d} value={d}>{d}</option>
                ))}
              </select>
            </div>

            <div className="w-full">
              <Label>Position</Label>
              <Input
                value={formData.position || ''}
                onChange={e => setFormData({ ...formData, position: e.target.value })}
              />
            </div>

            <div className="w-full">
              <Label>Location</Label>
              <select
                value={formData.location || ''}
                onChange={e => setFormData({ ...formData, location: e.target.value })}
                className="w-full border dark:border-gray-700 bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-gray-200 rounded-lg p-2"
              >
                <option value="">Select Location</option>
                {locations.map(l => (
                  <option key={l} value={l}>{l}</option>
                ))}
              </select>
            </div>

            <div className="w-full">
              <Label>Salary</Label>
              <Input
                type="number"
                value={formData.salary ?? ''}
                onChange={e => setFormData({ ...formData, salary: Number(e.target.value) })}
              />
            </div>

            <div className="w-full">
              <Label>Joining Date</Label>
              <Input
                type="date"
                value={formData.joining_date ?? ''}
                onChange={e => setFormData({ ...formData, joining_date: e.target.value })}
              />
            </div>

            <div className="w-full">
              <Label>Status</Label>
              <select
                value={formData.status || 'active'}
                onChange={e => setFormData({ ...formData, status: e.target.value })}
                className="w-full border dark:border-gray-700 bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-gray-200 rounded-lg p-2"
              >
                <option value="active">Active</option>
                <option value="on-leave">On Leave</option>
                <option value="inactive">Inactive</option>
              </select>
            </div>
          </div>

          <DialogFooter className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => setShowForm(false)}>Cancel</Button>
            <Button onClick={handleSave}>{editEmployee ? 'Update' : 'Add'}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
          
      {/* View Employee Dialog */}
      <Dialog open={showViewDialog} onOpenChange={setShowViewDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Employee Details</DialogTitle>
          </DialogHeader>
          {viewEmployee && (
            <div className="grid gap-3 py-4">
              <p><strong>Name:</strong> {viewEmployee.name}</p>
              <p><strong>Email:</strong> {viewEmployee.email}</p>
              <p><strong>Role:</strong> {viewEmployee.role}</p>
              <p><strong>Department:</strong> {viewEmployee.department}</p>
              <p><strong>Position:</strong> {viewEmployee.position}</p>
              <p><strong>Location:</strong> {viewEmployee.location}</p>
              <p><strong>Phone:</strong> {viewEmployee.phone || '-'}</p>
              <p><strong>Salary:</strong> {viewEmployee.salary ?? '-'}</p>
              <p><strong>Joining Date:</strong> {viewEmployee.joining_date ?? '-'}</p>
              <p><strong>Status:</strong> {viewEmployee.status}</p>
              <p><strong>Created At:</strong> {viewEmployee.created_at}</p>
              <p><strong>Updated At:</strong> {viewEmployee.updated_at}</p>
            </div>
          )}
          <DialogFooter>
            <Button onClick={() => setShowViewDialog(false)}>Close</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}