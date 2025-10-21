'use client' 
export const dynamic = 'force-dynamic';

import { useState, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { supabase } from '@/config/supabase'
import { toast } from 'sonner'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'

export default function ResetPasswordPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [accessToken, setAccessToken] = useState<string | null>(null)

  useEffect(() => {
    // Get token from URL hash or query params
    const hash = window.location.hash
    const urlParams = new URLSearchParams(hash.replace('#', '?'))
    const token = urlParams.get('access_token') || searchParams.get('token')
    setAccessToken(token)
  }, [searchParams])

  const handleUpdatePassword = async () => {
    if (!password) return toast.error('Enter a new password')
    if (!accessToken) return toast.error('Invalid or expired link')

    setLoading(true)
    try {
      const { error } = await supabase.auth.updateUser({
        password: password
      })

      if (error) throw error

      toast.success('Password updated successfully!')
      router.push('/login')
    } catch (err: any) {
      console.error('Password update failed:', err)
      toast.error(err.message || 'Failed to update password')
    } finally {
      setLoading(false)
    }
  }

  if (!accessToken) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen p-4 bg-gray-50 dark:bg-gray-900">
        <p className="text-red-600 dark:text-red-400 text-center">
          Invalid or expired link. Please request a new password reset.
        </p>
        <Button 
          onClick={() => router.push('/forgot-password')}
          className="mt-4"
        >
          Request New Reset
        </Button>
      </div>
    )
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-4 bg-gray-50 dark:bg-gray-900">
      <div className="w-full max-w-md space-y-6">
        <h1 className="text-2xl font-bold text-center text-gray-900 dark:text-white">
          Set New Password
        </h1>
        
        <Input
          type="password"
          placeholder="Enter new password"
          value={password}
          onChange={e => setPassword(e.target.value)}
          className="w-full"
        />
        
        <Button 
          onClick={handleUpdatePassword} 
          disabled={loading || !password}
          className="w-full"
        >
          {loading ? 'Updating Password...' : 'Update Password'}
        </Button>
      </div>
    </div>
  )
}