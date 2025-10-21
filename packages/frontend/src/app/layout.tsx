import type { Metadata, Viewport } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';

// Import the combined Client Component wrapper (src/app/providers.tsx)
import Providers from '../providers'; 

const inter = Inter({ subsets: ['latin'] });

// 1. Define Viewport using the dedicated export (resolves warning)
export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
};

// 2. Define Metadata 
export const metadata: Metadata = {
  title: 'HRGenie - Modern HR Management Platform',
  description: 'Comprehensive HR management system with AI-powered recruitment, payroll, attendance tracking, and performance management.',
  keywords: 'HR, Human Resources, Payroll, Recruitment, Employee Management, AI',
  authors: [{ name: 'HRGenie Team' }],
};

// 3. RootLayout is a Server Component by default
export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        {/* head content is correct here. Meta tags like viewport are handled by the exports above. */}
        <link href="https://fonts.googleapis.com/icon?family=Material+Icons" rel="stylesheet" />
        <link rel="icon" href="/favicon.ico" />
      </head>
      <body className={inter.className}>
        {/* The Providers component acts as the client component boundary */}
        <Providers>
          {children}
        </Providers>
      </body>
    </html>
  );
}
