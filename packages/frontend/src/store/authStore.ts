import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { User, LoginCredentials, UserRole } from '@/types'

interface AuthState {
  user: User | null
  loading: boolean
  error: string | null
  isAuthenticated: boolean
  permissions: string[]
}

interface AuthActions {
  login: (credentials: LoginCredentials) => Promise<void>
  logout: () => void
  updateUser: (userData: Partial<User>) => void
  clearError: () => void
  setLoading: (loading: boolean) => void
  checkPermission: (permission: string) => boolean
}

type AuthStore = AuthState & AuthActions

// Mock user data for demonstration
const mockUsers: Record<string, User> = {
  'admin@nexushr.com': {
    id: '1',
    name: 'John Admin',
    email: 'admin@nexushr.com',
    role: 'admin',
    avatar: 'https://ui-avatars.com/api/?name=John+Admin&background=14b8a6&color=fff',
    department: 'Administration',
    position: 'System Administrator',
    employeeId: 'EMP001',
    joinDate: '2020-01-15',
    permissions: [
      { module: 'all', actions: ['create', 'read', 'update', 'delete'] }
    ]
  },
  'hr@nexushr.com': {
    id: '2',
    name: 'Sarah Wilson',
    email: 'hr@nexushr.com',
    role: 'hr',
    avatar: 'https://ui-avatars.com/api/?name=Sarah+Wilson&background=ec4899&color=fff',
    department: 'Human Resources',
    position: 'HR Manager',
    employeeId: 'EMP002',
    joinDate: '2021-03-10',
    permissions: [
      { module: 'recruitment', actions: ['create', 'read', 'update', 'delete'] },
      { module: 'employees', actions: ['create', 'read', 'update'] },
      { module: 'leaves', actions: ['read', 'update'] },
      { module: 'payroll', actions: ['read'] },
    ]
  },
  'manager@nexushr.com': {
    id: '3',
    name: 'Mike Johnson',
    email: 'manager@nexushr.com',
    role: 'manager',
    avatar: 'https://ui-avatars.com/api/?name=Mike+Johnson&background=3b82f6&color=fff',
    department: 'Engineering',
    position: 'Engineering Manager',
    employeeId: 'EMP003',
    joinDate: '2019-08-20',
    directReports: ['4', '5', '6'],
    permissions: [
      { module: 'team', actions: ['read', 'update'] },
      { module: 'leaves', actions: ['read', 'update'] },
      { module: 'performance', actions: ['create', 'read', 'update'] },
      { module: 'attendance', actions: ['read'] },
    ]
  },
  'employee@nexushr.com': {
    id: '4',
    name: 'Emily Chen',
    email: 'employee@nexushr.com',
    role: 'employee',
    avatar: 'https://ui-avatars.com/api/?name=Emily+Chen&background=10b981&color=fff',
    department: 'Engineering',
    position: 'Software Developer',
    employeeId: 'EMP004',
    joinDate: '2022-02-14',
    manager: '3',
    permissions: [
      { module: 'profile', actions: ['read', 'update'] },
      { module: 'leaves', actions: ['create', 'read'] },
      { module: 'attendance', actions: ['read', 'update'] },
      { module: 'payroll', actions: ['read'] },
    ]
  }
}

// Support alternate demo domain used in the UI (hrGenie.com)
mockUsers['admin@hrgenie.com'] = { ...mockUsers['admin@nexushr.com'], email: 'admin@hrgenie.com' }
mockUsers['hr@hrgenie.com'] = { ...mockUsers['hr@nexushr.com'], email: 'hr@hrgenie.com' }
mockUsers['manager@hrgenie.com'] = { ...mockUsers['manager@nexushr.com'], email: 'manager@hrgenie.com' }
mockUsers['employee@hrgenie.com'] = { ...mockUsers['employee@nexushr.com'], email: 'employee@hrgenie.com' }

const getRolePermissions = (role: UserRole): string[] => {
  const permissions: Record<UserRole, string[]> = {
    admin: [
      'users.create', 'users.read', 'users.update', 'users.delete',
      'employees.create', 'employees.read', 'employees.update', 'employees.delete',
      'recruitment.create', 'recruitment.read', 'recruitment.update', 'recruitment.delete',
      'payroll.create', 'payroll.read', 'payroll.update', 'payroll.delete',
      'leaves.create', 'leaves.read', 'leaves.update', 'leaves.delete',
      'attendance.create', 'attendance.read', 'attendance.update', 'attendance.delete',
      'performance.create', 'performance.read', 'performance.update', 'performance.delete',
      'reports.read', 'reports.export',
      'settings.read', 'settings.update'
    ],
    hr: [
      'employees.create', 'employees.read', 'employees.update',
      'recruitment.create', 'recruitment.read', 'recruitment.update', 'recruitment.delete',
      'leaves.read', 'leaves.update',
      'payroll.read',
      'attendance.read',
      'performance.read',
      'reports.read'
    ],
    manager: [
      'employees.read',
      'team.read', 'team.update',
      'leaves.read', 'leaves.update',
      'attendance.read',
      'performance.create', 'performance.read', 'performance.update',
      'reports.read'
    ],
    employee: [
      'profile.read', 'profile.update',
      'leaves.create', 'leaves.read',
      'attendance.read', 'attendance.update',
      'payroll.read',
      'performance.read'
    ]
  }
  
  return permissions[role] || []
}

export const useAuthStore = create<AuthStore>()(
  persist(
    (set, get) => ({
      user: null,
      loading: false,
      error: null,
      isAuthenticated: false,
      permissions: [],

      login: async (credentials: LoginCredentials) => {
        set({ loading: true, error: null })
        
        try {
          // Simulate API call delay
          await new Promise(resolve => setTimeout(resolve, 1000))
          
          // Check credentials
          const user = mockUsers[credentials.email.toLowerCase()]
          
          if (!user) {
            throw new Error('Invalid email or password')
          }
          
          // In a real app, you'd verify the password here
          // For demo purposes, any password works
          
          const permissions = getRolePermissions(user.role)
          
          set({ 
            user, 
            isAuthenticated: true, 
            loading: false, 
            error: null,
            permissions
          })
        } catch (error) {
          set({ 
            error: error instanceof Error ? error.message : 'Login failed', 
            loading: false 
          })
          throw error
        }
      },

      logout: () => {
        set({ 
          user: null, 
          isAuthenticated: false, 
          error: null,
          permissions: []
        })
      },

      updateUser: (userData: Partial<User>) => {
        const { user } = get()
        if (user) {
          set({ user: { ...user, ...userData } })
        }
      },

      clearError: () => {
        set({ error: null })
      },

      setLoading: (loading: boolean) => {
        set({ loading })
      },

      checkPermission: (permission: string) => {
        const { permissions } = get()
        return permissions.includes(permission)
      },
    }),
    {
      name: 'nexushr-auth',
      partialize: (state) => ({
        user: state.user,
        isAuthenticated: state.isAuthenticated,
        permissions: state.permissions,
      }),
    }
  )
)
