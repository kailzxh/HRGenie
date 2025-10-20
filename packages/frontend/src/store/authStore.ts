import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { User as SupabaseUser } from '@supabase/supabase-js'
import { supabase, supabaseServer } from '@/config/supabase'
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
  logout: () => Promise<void>
  setUser: (user: User) => void
  updateUser: (userData: Partial<User>) => void
  clearError: () => void
  setLoading: (loading: boolean) => void
  checkPermission: (permission: string) => boolean
}

type AuthStore = AuthState & AuthActions

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
      'settings.read', 'settings.update',
      'users.create.admin'
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
    let user: SupabaseUser | null = null

    if (credentials.provider === 'google') {
      const { data, error } = await supabase.auth.signInWithOAuth({ provider: 'google' })
      if (error) throw error
      window.location.href = data.url // redirect for OAuth login
      return
    } else if (credentials.email && credentials.password) {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: credentials.email,
        password: credentials.password
      })
      if (error) throw error
      user = data.user
    } else {
      throw new Error('Invalid login credentials')
    }

    if (!user) throw new Error('User not found')

    // Fetch profile from your database...
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .single()

    if (profileError) throw profileError

    const userData: User = {
      id: user.id,
      email: user.email ?? '',
      name: profile?.name ?? user.email?.split('@')[0] ?? 'User',
      role: (profile?.role as UserRole) || 'employee'
    }

    const permissions = getRolePermissions(userData.role)
    set({ user: userData, isAuthenticated: true, permissions, loading: false })
  } catch (error) {
    set({
      error: error instanceof Error ? error.message : 'Login failed',
      loading: false
    })
    throw error
  }
},


      logout: async () => {
        try {
          const { error } = await supabase.auth.signOut()
          if (error) throw error
          set({
            user: null,
            isAuthenticated: false,
            permissions: [],
            error: null
          })
        } catch (error) {
          set({
            error: error instanceof Error ? error.message : 'Logout failed'
          })
          throw error
        }
      },

      setUser: (user: User) => {
        const permissions = getRolePermissions(user.role)
        set({ user, isAuthenticated: true, permissions, error: null })
      },

      updateUser: (userData: Partial<User>) => {
        const { user } = get()
        if (user) set({ user: { ...user, ...userData } })
      },

      clearError: () => {
        set({ error: null })
      },

      setLoading: (loading: boolean) => {
        set({ loading })
      },

      checkPermission: (permission: string) => {
        return get().permissions.includes(permission)
      }
    }),
    {
      name: 'nexushr-auth',
      partialize: (state) => ({
        user: state.user,
        isAuthenticated: state.isAuthenticated,
        permissions: state.permissions
      })
    }
  )
)
