import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { ThemeProvider } from '@/components/providers/ThemeProvider'
import { AuthProvider } from '@/components/providers/AuthProvider'
import { analytics } from '@/config/supabase' // Import analytics
import { Notifications } from '@/components/ui/notifications'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'HRGenie - Modern HR Management Platform',
  description: 'Comprehensive HR management system with AI-powered recruitment, payroll, attendance tracking, and performance management.',
  keywords: 'HR, Human Resources, Payroll, Recruitment, Employee Management, AI',
  authors: [{ name: 'HRGenie Team' }],
  viewport: 'width=device-width, initial-scale=1',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link href="https://fonts.googleapis.com/icon?family=Material+Icons" rel="stylesheet" />
        <link rel="icon" href="/favicon.ico" />
      </head>
      <body className={inter.className}>
        <ThemeProvider>
          <AuthProvider>
            {children}
            <Notifications />
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  )
}
