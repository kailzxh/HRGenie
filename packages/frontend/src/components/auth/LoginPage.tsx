'use client'

import { useState } from 'react'
import { useAuth } from '@/hooks/useAuth'
import { LoginCredentials, UserRole } from '@/types'
import { motion } from 'framer-motion'
import { Eye, EyeOff, Building2, ChevronDown, Check } from 'lucide-react'
// Background video inspired by the provided reference link

export default function LoginPage() {
  const { login, loading, error, clearError } = useAuth()
  const [showPassword, setShowPassword] = useState(false)
  const [credentials, setCredentials] = useState<LoginCredentials>({
    email: '',
    password: '',
    role: undefined
  })
  const [roleOpen, setRoleOpen] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    clearError()
    
    try {
      await login(credentials)
    } catch (error) {
      console.error('Login failed:', error)
    }
  }

  const handleDemoLogin = (role: UserRole) => {
    const demoCredentials: Record<UserRole, { email: string; password: string }> = {
      admin: { email: 'admin@hrGenie.com', password: 'admin123' },
      hr: { email: 'hr@hrGenie.com', password: 'hr123' },
      manager: { email: 'manager@hrGenie.com', password: 'manager123' },
      employee: { email: 'employee@hrGenie.com', password: 'employee123' }
    }
    
    setCredentials({
      ...demoCredentials[role],
      role
    })
  }

  const handleOAuthLogin = (provider: 'google' | 'linkedin') => {
    // Simulate OAuth login
    const demoUser = {
      email: `${provider.toLowerCase()}@hrGenie.com`,
      password: 'oauth123',
      role: 'employee' as UserRole
    }
    
    setCredentials(demoUser)
    login(demoUser)
  }

  return (
    <div className="min-h-screen bg-gray-900 relative overflow-hidden">
      {/* Video Background */}
      <video
        className="absolute inset-0 h-full w-full object-cover opacity-70"
        autoPlay
        muted
        loop
        playsInline
        // The source can stream directly; consider moving to `public/` for reliability if needed
        src="https://www.pexels.com/download/video/29848606/"
      />
      {/* Themed gradient overlays for better contrast */}
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-teal-900/70 via-teal-950/60 to-gray-900/80" />
      <div className="pointer-events-none absolute inset-0 [mask-image:radial-gradient(80%_60%_at_20%_40%,black,transparent)]" />

      {/* Content */}
      <div className="relative z-10 mx-auto max-w-7xl px-4 py-10 lg:py-16">
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-2 items-center">
          {/* Login Card */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="w-full max-w-xl"
          >
            <div className="bg-white/15 dark:bg-white/15 backdrop-blur-3xl rounded-2xl shadow-[0_20px_60px_-15px_rgba(0,0,0,0.45)] p-8 border border-white/50 ring-1 ring-white/20">
          {/* Header */}
            <div className="text-center mb-8">
            <motion.div 
              initial={{ scale: 0.8 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2, duration: 0.4 }}
              className="inline-flex items-center justify-center w-16 h-16 rounded-xl mb-4 bg-gradient-to-br from-teal-500 to-teal-700 shadow-lg shadow-teal-900/30"
            >
              <Building2 className="w-8 h-8 text-white" />
            </motion.div>
            
              <h1 className="text-3xl font-bold text-white mb-2">HRGenie</h1>
              <p className="text-white/80">Modern HR Management Platform</p>
          </div>

          {/* Demo Login Buttons */}
          <div className="mb-6">
            <p className="text-sm text-white-600 mb-3 text-center">Try demo accounts:</p>
            <div className="grid grid-cols-2 gap-2">
              {(['admin', 'hr', 'manager', 'employee'] as UserRole[]).map((role) => (
                <button
                  key={role}
                  onClick={() => handleDemoLogin(role)}
                  className="px-3 py-2 text-black bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors capitalize"
                  type="button"
                >
                  {role === 'hr' ? 'HR' : role} 
                </button>
              ))}
            </div>
          </div>

          {/* Login Form */}
          <form onSubmit={handleSubmit} className="space-y-6">
            {error && (
              <motion.div 
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm"
              >
                {error}
              </motion.div>
            )}

            {/* Email Field */}
            <div>
              <label htmlFor="email" className="block text-sm font-semibold text-white/90 mb-2">
                Email / Employee ID
              </label>
              <div className="relative">
                <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-teal-700/70">✉️</span>
                <input
                  id="email"
                  type="text"
                  required
                  value={credentials.email}
                  onChange={(e) => setCredentials({ ...credentials, email: e.target.value })}
                  className="w-full pl-10 pr-4 py-3 rounded-xl border border-white/60 bg-white/15 backdrop-blur-3xl backdrop-saturate-150 shadow-inner focus:ring-4 focus:ring-teal-500/30 focus:border-teal-600/60 transition-all text-white placeholder:text-white/80 placeholder:opacity-90 font-medium caret-teal-200"
                  placeholder="Enter your email or employee ID"
                />
              </div>
            </div>

            {/* Password Field */}
            <div>
              <label htmlFor="password" className="block text-sm font-semibold text-white/90 mb-2">
                Password
              </label>
              <div className="relative">
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={credentials.password}
                  onChange={(e) => setCredentials({ ...credentials, password: e.target.value })}
                  className="w-full pl-4 pr-12 py-3 rounded-xl border border-white/60 bg-white/15 backdrop-blur-3xl backdrop-saturate-150 shadow-inner focus:ring-4 focus:ring-teal-500/30 focus:border-teal-600/60 transition-all text-white placeholder:text-white/80 placeholder:opacity-90 font-medium caret-teal-200"
                  placeholder="Enter your password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-white/80 hover:text-white"
                >
                  {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
            </div>

            {/* Role Selection */}
            <div>
              <label htmlFor="role" className="block text-sm font-semibold text-white/90 mb-2">
                Login as
              </label>
              {/* Custom glass dropdown to ensure styled menu */}
              <div className="relative" onBlur={() => setRoleOpen(false)} tabIndex={-1}>
                <button
                  id="role"
                  type="button"
                  aria-haspopup="listbox"
                  aria-expanded={roleOpen}
                  onClick={() => setRoleOpen(!roleOpen)}
                  className="w-full flex items-center justify-between px-4 py-3 rounded-xl border border-white/60 bg-white/15 backdrop-blur-3xl backdrop-saturate-150 shadow-inner focus:ring-4 focus:ring-teal-500/30 focus:border-teal-600/60 transition-all text-white font-medium"
                >
                  <span className="truncate">
                    {credentials.role ? (
                      credentials.role === 'hr' ? 'HR Recruiter' :
                      credentials.role === 'manager' ? 'Senior Manager' :
                      credentials.role === 'admin' ? 'Management Admin' :
                      'Employee'
                    ) : 'Select your role'}
                  </span>
                  <ChevronDown className={`ml-3 h-5 w-5 transition-transform ${roleOpen ? 'rotate-180' : ''}`} />
                </button>

                {roleOpen && (
                  <ul
                    role="listbox"
                    className="absolute z-50 mt-2 w-full overflow-hidden rounded-2xl border border-white/60 bg-white/45 backdrop-blur-5xl backdrop-saturate-150 shadow-xl ring-1 ring-white/20"
                  >
                    {[
                      { value: '', label: 'Select your role' },
                      { value: 'employee', label: 'Employee' },
                      { value: 'hr', label: 'HR Recruiter' },
                      { value: 'manager', label: 'Senior Manager' },
                      { value: 'admin', label: 'Management Admin' }
                    ].map(({ value, label }) => {
                      const selected = (credentials.role || '') === value
                      return (
                        <li
                          key={label}
                          role="option"
                          aria-selected={selected}
                          onMouseDown={(e) => e.preventDefault()}
                          onClick={() => {
                            setCredentials({ ...credentials, role: (value || undefined) as UserRole })
                            setRoleOpen(false)
                          }}
                          className={`flex items-center justify-between px-4 py-2 cursor-pointer text-black hover:bg-white/50 ${selected ? 'bg-white/0' : ''}`}
                        >
                          <span>{label}</span>
                          {selected && <Check className="h-4 w-4" />}
                        </li>
                      )
                    })}
                  </ul>
                )}
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="relative w-full group disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold py-3 px-4 rounded-2xl transition-all transform hover:scale-[1.02] active:scale-[0.98]"
              style={{ WebkitTapHighlightColor: 'transparent' }}
            >
              {/* Glassy gradient border */}
              <span className="absolute inset-0 rounded-2xl bg-gradient-to-br from-teal-400/60 via-teal-500/60 to-teal-700/60 opacity-90" aria-hidden></span>
              <span className="absolute inset-[2px] rounded-[14px] bg-white/15 backdrop-blur-xl border border-white/30 shadow-[inset_0_1px_0_rgba(255,255,255,0.25),0_10px_30px_-10px_rgba(14,165,233,0.6)]" aria-hidden></span>
              {/* Shine */}
              <span className="pointer-events-none absolute -inset-x-4 -top-8 h-16 bg-gradient-to-b from-white/60 to-transparent rounded-full blur-2xl opacity-40 group-hover:opacity-60 transition-opacity" aria-hidden></span>
              {loading ? (
                <div className="flex items-center justify-center">
                  <div className="loading-spinner mr-2"></div>
                  Signing in...
                </div>
              ) : (
                <span className="relative z-10">Sign In</span>
              )}
            </button>

            {/* Forgot Password */}
            <div className="text-center">
              <button
                type="button"
                className="text-primary-600 hover:text-primary-700 text-sm font-medium"
                onClick={() => alert('Password reset functionality would be implemented here')}
              >
                Forgot your password?
              </button>
            </div>
          </form>

          {/* OAuth Section */}
          <div className="mt-8">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                {/* <div className="w-full border-t border-white/50"></div> */}
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-white/40 backdrop-blur-3xl text-white rounded-md">or continue with</span>
              </div>
            </div>

            <div className="mt-6 grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => handleOAuthLogin('google')}
                className="w-full inline-flex justify-center py-3 px-4 rounded-xl border border-white/60 bg-white/15 backdrop-blur-3xl text-sm font-medium text-white hover:bg-white/20 transition-colors"
              >
                <div className="w-5 h-5 bg-red-500/80 rounded-full mr-2 ring-1 ring-white/40"></div>
                Google
              </button>
              
              <button
                type="button"
                onClick={() => handleOAuthLogin('linkedin')}
                className="w-full inline-flex justify-center py-3 px-4 rounded-xl border border-white/60 bg-white/15 backdrop-blur-3xl text-sm font-medium text-white hover:bg-white/20 transition-colors"
              >
                <div className="w-5 h-5 bg-blue-600/80 rounded-full mr-2 ring-1 ring-white/40"></div>
                Apple
              </button>
            </div>
          </div>
            </div>

            {/* Footer */}
            <div className="text-center mt-8 text-white/80 text-sm">
              <p>&copy; 2024 HRGenie. All rights reserved.</p>
            </div>
          </motion.div>

          {/* Right Marketing Panel */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1, duration: 0.6 }}
            className="text-white/95"
          >
            <div className="max-w-2xl lg:ml-auto">
              <h2 className="text-4xl sm:text-5xl font-bold leading-tight tracking-tight">
                Revolutionize HR with Smarter Automation
              </h2>
              <div className="mt-8 p-6 rounded-2xl bg-white/12 border border-white/40 backdrop-blur-3xl">
                <p className="text-lg text-white/90 italic">
                  "HRGenie has streamlined our people operations. It's reliable, efficient,
                  and ensures our teams stay focused on what matters."
                </p>
                <div className="mt-6 flex items-center gap-3">
                  <div className="h-10 w-10 rounded-full bg-white/20 backdrop-blur-3xl border border-white/40" />
                  <div>
                    <p className="font-semibold text-white">Michael Carter</p>
                    <p className="text-white/80 text-sm">Software Engineer at DevCore</p>
                  </div>
                </div>
              </div>

              <div className="mt-10">
                <p className="text-white/80 text-sm mb-4">JOIN 1K+ TEAMS</p>
                <div className="grid grid-cols-3 sm:grid-cols-6 gap-4 opacity-90">
                  {['Discord','mailchimp','grammarly','attentive','Square','Dropbox'].map((logo) => (
                    <div key={logo} className="h-10 rounded-lg bg-white/15 border border-white/50 backdrop-blur-3xl flex items-center justify-center text-xs text-white/90">
                      {logo}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  )
}
