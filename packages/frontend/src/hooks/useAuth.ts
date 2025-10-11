<<<<<<< HEAD
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
=======
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
>>>>>>> 225ed5384cf9eebf7cee947b068a57b523c6c838
