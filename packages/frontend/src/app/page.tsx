<<<<<<< HEAD
'use client'

import { useAuth } from '@/hooks/useAuth'
import LoginPage from '@/components/auth/LoginPage'
import DashboardLayout from '@/components/layout/DashboardLayout'
import { useEffect } from 'react'

export default function Home() {
  const { user, loading } = useAuth()

  useEffect(() => {
    // Add any initialization logic here
    console.log('HRGenie Application Initialized')
  }, [])

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary-50 to-primary-100">
        <div className="text-center">
          <div className="loading-spinner w-8 h-8 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading HRGenie...</p>
        </div>
      </div>
    )
  }

  if (!user) {
    return <LoginPage />
  }

  return <DashboardLayout />
}
=======
'use client'

import { useAuth } from '@/hooks/useAuth'
import LoginPage from '@/components/auth/LoginPage'
import DashboardLayout from '@/components/layout/DashboardLayout'
import { useEffect } from 'react'

export default function Home() {
  const { user, loading } = useAuth()

  useEffect(() => {
    // Add any initialization logic here
    console.log('HRGenie Application Initialized')
  }, [])

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary-50 to-primary-100">
        <div className="text-center">
          <div className="loading-spinner w-8 h-8 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading HRGenie...</p>
        </div>
      </div>
    )
  }

  if (!user) {
    return <LoginPage />
  }

  return <DashboardLayout />
}
>>>>>>> 225ed5384cf9eebf7cee947b068a57b523c6c838
