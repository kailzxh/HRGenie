// App.tsx - ULTIMATE FIX
import { Routes, Route, Navigate } from 'react-router-dom';
import HomePage from './pages/HomePage';
import LoginPage from './pages/auth/login/page';
import SignupPage from './pages/auth/signup/page';
import DashboardPage from './pages/dashboard/DashboardPage';
import HrInterviewPage from './pages/interview/hr/HrInterviewPage';
import TechnicalInterviewPage from './pages/interview/technical/TechnicalInterviewPage';
import { JobsPage } from './pages/jobs/JobsPage';
import JobApplyPage from './pages/jobs/apply/JobApplyPage';
import { useAuth } from './contexts/AuthContext';
import type { JSX } from 'react';
import React, { useEffect, useState } from 'react';

// Simple loading component
function LoadingSpinner({ message = "Loading..." }: { message?: string }) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-slate-900 mx-auto mb-4"></div>
        <p className="text-slate-600">{message}</p>
      </div>
    </div>
  );
}

// PrivateRoute - SIMPLIFIED
function PrivateRoute({ children }: { children: JSX.Element }) {
  const { user, initialized } = useAuth();

  if (!initialized) {
    return <LoadingSpinner message="Checking authentication..." />;
  }

  return user ? children : <Navigate to="/auth/login" replace />;
}

// PublicRoute - SIMPLIFIED  
function PublicRoute({ children }: { children: JSX.Element }) {
  const { user, initialized } = useAuth();

  if (!initialized) {
    return <LoadingSpinner message="Checking authentication..." />;
  }

  return user ? <Navigate to="/dashboard" replace /> : children;
}

// App content with initialization timeout
function AppContent() {
  const { initialized, loading } = useAuth();
  const [showTimeout, setShowTimeout] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      if (!initialized) {
        setShowTimeout(true);
      }
    }, 5000); // Show timeout message after 5 seconds

    return () => clearTimeout(timer);
  }, [initialized]);

  console.log('🎯 App render state:', { initialized, loading });

  // Show loading only during initial app load
  if (!initialized) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-slate-900 mx-auto mb-4"></div>
          <h2 className="text-xl font-semibold text-slate-900">HireAI</h2>
          <p className="text-slate-600 mt-2">Starting up...</p>
          {showTimeout && (
            <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-md">
              <p className="text-yellow-800 text-sm">
                Taking longer than expected?{' '}
                <button 
                  onClick={() => window.location.reload()} 
                  className="underline font-medium"
                >
                  Try reloading
                </button>
              </p>
            </div>
          )}
        </div>
      </div>
    );
  }

  // Once initialized, render the app routes
  return (
    <div className="min-h-screen">
      <Routes>
        {/* Public routes */}
        <Route path="/" element={<HomePage />} />
        <Route 
          path="/auth/login" 
          element={
            <PublicRoute>
              <LoginPage />
            </PublicRoute>
          } 
        />
        <Route 
          path="/auth/signup" 
          element={
            <PublicRoute>
              <SignupPage />
            </PublicRoute>
          } 
        />

        {/* Private routes */}
        <Route
          path="/dashboard"
          element={
            <PrivateRoute>
              <DashboardPage />
            </PrivateRoute>
          }
        />
        <Route
          path="/interview/hr/:id"
          element={
            <PrivateRoute>
              <HrInterviewPage />
            </PrivateRoute>
          }
        />
        <Route
          path="/interview/technical/:id"
          element={
            <PrivateRoute>
              <TechnicalInterviewPage />
            </PrivateRoute>
          }
        />
        <Route
          path="/jobs"
          element={
            <PrivateRoute>
              <JobsPage initialJobs={[]} />
            </PrivateRoute>
          }
        />
        <Route
          path="/jobs/:id/apply"
          element={
            <PrivateRoute>
              <JobApplyPage />
            </PrivateRoute>
          }
        />

        {/* Fallback route */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </div>
  );
}

export default function App() {
  return <AppContent />;
}