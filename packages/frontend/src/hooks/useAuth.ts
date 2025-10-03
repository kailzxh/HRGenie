import { useAuthStore } from '@/store/authStore'
import { LoginCredentials } from '@/types'

export const useAuth = () => {
  const {
    user,
    loading,
    error,
    isAuthenticated,
    permissions,
    login,
    logout,
    updateUser,
    clearError,
    setLoading,
    checkPermission,
  } = useAuthStore()

  return {
    user,
    loading,
    error,
    isAuthenticated,
    permissions,
    login,
    logout,
    updateUser,
    clearError,
    setLoading,
    checkPermission,
  }
}
