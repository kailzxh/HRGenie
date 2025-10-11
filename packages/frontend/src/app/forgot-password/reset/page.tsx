'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/config/supabase'
import { toast } from 'sonner'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'

export default function ResetPasswordPage() {
  const router = useRouter()
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [accessToken, setAccessToken] = useState<string | null>(null)

  useEffect(() => {
    // Supabase sometimes sends token in the URL hash (#access_token=...)
    const hash = window.location.hash
    const token = new URLSearchParams(hash.replace('#', '?')).get('access_token')
    setAccessToken(token)
  }, [])

  const handleUpdatePassword = async () => {
    if (!password) return toast.error('Enter a new password')
    if (!accessToken) return toast.error('Invalid or expired link')

    setLoading(true)
    try {
      const { error } = await supabase.auth.updateUser(
        { password },
        { accessToken }
      )

      if (error) throw error

      toast.success('Password updated successfully!')
      router.push('/login') // redirect to login
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
        <p className="text-red-600 dark:text-red-400">
          Invalid or expired link. Please request a new password reset.
        </p>
      </div>
    )
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-4 bg-gray-50 dark:bg-gray-900">
      <h1 className="text-2xl font-bold mb-4 text-gray-900 dark:text-white">
        Set New Password
      </h1>

      <div className="w-full max-w-md space-y-4">
        <Input
          type="password"
          placeholder="New password"
          value={password}
          onChange={e => setPassword(e.target.value)}
        />
        <Button onClick={handleUpdatePassword} disabled={loading}>
          {loading ? 'Updating...' : 'Update Password'}
        </Button>
      </div>
    </div>
  )
}
