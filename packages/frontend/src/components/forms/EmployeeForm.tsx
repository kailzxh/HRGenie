'use client'

import { useState, useMemo } from 'react'
import { Employee, Role } from '@/types'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectTrigger,
  SelectContent,
  SelectItem,
  SelectValue
} from '@/components/ui/select'
import { Label } from '@/components/ui/label'
import { toast } from 'sonner'
import { useAuth } from '@/hooks/useAuth'

interface EmployeeFormProps {
  onSubmit: (employee: Employee) => Promise<void>
  onCancel: () => void
  initialData?: Partial<Employee>
  isEdit?: boolean
}

const departments = [
  'Engineering',
  'Human Resources',
  'Marketing',
  'Finance',
  'Operations',
  'Design'
]

const locations = [
  'New York',
  'San Francisco',
  'Chicago',
  'Austin',
  'Seattle',
  'Remote'
]

export function EmployeeForm({ onSubmit, onCancel, initialData, isEdit }: EmployeeFormProps) {
  const { user, checkPermission } = useAuth()

  const canCreateAdmin = checkPermission('employees.create.admin')

  const [formData, setFormData] = useState<Partial<Employee>>({
    name: '',
    email: '',
    phone: '',
    department: '',
    position: '',
    location: '',
    salary: 0,
    joinDate: new Date().toISOString().split('T')[0],
    status: 'active',
    role: initialData?.role || 'employee',
    ...initialData
  })

  const [loading, setLoading] = useState(false)
  
  const availableRoles = useMemo(() => {
    const roles: Role[] = ['employee', 'manager', 'hr'];
    if (canCreateAdmin) {
      roles.push('admin');
    }
    return roles;
  }, [canCreateAdmin]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      await onSubmit(formData as Employee)
      toast.success(isEdit ? 'Employee updated successfully' : 'Employee created successfully')
      onCancel()
    } catch (error) {
      toast.error(isEdit ? 'Failed to update employee' : 'Failed to create employee')
      console.error('Form submission error:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: name === 'salary' ? parseFloat(value) : value
    }))
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="space-y-4">
        {/* Name and Email */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label>Name</Label>
            <Input
              name="name"
              value={formData.name}
              onChange={handleChange}
              required
              placeholder="Enter employee name"
            />
          </div>
          <div>
            <Label>Email</Label>
            <Input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              required
              placeholder="Enter email address"
            />
          </div>
        </div>

        {/* Phone and Department */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label>Phone</Label>
            <Input
              type="tel"
              name="phone"
              value={formData.phone}
              onChange={handleChange}
              placeholder="Enter phone number"
            />
          </div>
          <div>
            <Label>Department</Label>
            <select id="department"
              name="department"
              value={formData.department}
              onChange={handleChange}
              required
              className="w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 dark:border-gray-700 dark:bg-gray-800"
            >
              <option value="">Select department</option>
              {departments.map(dept => (
                <option key={dept} value={dept}>{dept}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Position and Location */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label>Position</Label>
            <Input
              name="position"
              value={formData.position}
              onChange={handleChange}
              required
              placeholder="Enter job position"
            />
          </div>
          <div>
            <Label>Location</Label>
            <select id="location"
              name="location"
              value={formData.location}
              onChange={handleChange}
              required
              className="w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 dark:border-gray-700 dark:bg-gray-800"
            >
              <option value="">Select location</option>
              {locations.map(loc => (
                <option key={loc} value={loc}>{loc}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Role Dropdown */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label>Role</Label>
            <Select 
              id="role"
              value={formData.role || 'employee'}
              onValueChange={(value: Role) => setFormData({ ...formData, role: value })}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select role" />
              </SelectTrigger>
              <SelectContent id="role-content">
                {availableRoles.map(role => (
                  <SelectItem key={role} value={role}>{role.charAt(0).toUpperCase() + role.slice(1)}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Salary and Join Date */}
          <div>
            <Label>Salary</Label>
            <Input
              type="number"
              name="salary"
              value={formData.salary}
              onChange={handleChange}
              required
              min="0"
              step="1000"
              placeholder="Enter salary"
            />
          </div>
          <div>
            <Label>Join Date</Label>
            <Input
              type="date"
              name="joinDate"
              value={formData.joinDate}
              onChange={handleChange}
              required
            />
          </div>
        </div>
      </div>

      <div className="flex justify-end space-x-3">
        <Button
          type="button"
          variant="outline"
          onClick={onCancel}
          disabled={loading}
        >
          Cancel
        </Button>
        <Button
          type="submit"
          disabled={loading}
        >
          {loading ? 'Saving...' : isEdit ? 'Update Employee' : 'Add Employee'}
        </Button>
      </div>
    </form>
  )
}
