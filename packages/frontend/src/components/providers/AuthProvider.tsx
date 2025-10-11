<<<<<<< HEAD
'use client'

import { createContext, useContext, useEffect, useState } from 'react'
import { useAuthStore } from '@/store/authStore'

interface AuthContextType {
  initialized: boolean
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [initialized, setInitialized] = useState(false)
  const { setLoading } = useAuthStore()

  useEffect(() => {
    // Simulate initialization delay
    const initializeAuth = async () => {
      setLoading(true)
      
      // Check for existing session, validate tokens, etc.
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      setLoading(false)
      setInitialized(true)
    }

    initializeAuth()
  }, [setLoading])

  return (
    <AuthContext.Provider value={{ initialized }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuthContext() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuthContext must be used within an AuthProvider')
  }
  return context
}
=======
'use client'

import { createContext, useContext, useEffect, useState } from 'react'
import { useAuthStore } from '@/store/authStore'

interface AuthContextType {
  initialized: boolean
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [initialized, setInitialized] = useState(false)
  const { setLoading } = useAuthStore()

  useEffect(() => {
    // Simulate initialization delay
    const initializeAuth = async () => {
      setLoading(true)
      
      // Check for existing session, validate tokens, etc.
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      setLoading(false)
      setInitialized(true)
    }

    initializeAuth()
  }, [setLoading])

  return (
    <AuthContext.Provider value={{ initialized }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuthContext() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuthContext must be used within an AuthProvider')
  }
  return context
}
>>>>>>> 225ed5384cf9eebf7cee947b068a57b523c6c838
