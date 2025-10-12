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

// PrivateRoute wrapper
function PrivateRoute({ children }: { children: JSX.Element }) {
  const { user, loading } = useAuth();

  if (loading) return <div className="text-center mt-20">Loading user...</div>;
  if (!user) return <Navigate to="/auth/login" replace />;

  return children;
}

export default function App() {
  return (
    <Routes>
      {/* Public routes */}
      <Route path="/" element={<HomePage />} />
      <Route path="/auth/login" element={<LoginPage />} />
      <Route path="/auth/signup" element={<SignupPage />} />

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
    </Routes>
  );
}
