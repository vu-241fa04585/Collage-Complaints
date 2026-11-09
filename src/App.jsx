import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext';
import { getDashboardRoute } from './utils/helpers';
import { Toaster } from 'react-hot-toast';

// Layout & Common
import DashboardLayout from './components/layout/DashboardLayout';
import LoadingSpinner from './components/common/LoadingSpinner';

// Auth Pages
import LoginPage from './pages/auth/LoginPage';
import RegisterPage from './pages/auth/RegisterPage';

// Student Pages
import StudentDashboard from './pages/student/StudentDashboard';
import SubmitComplaint from './pages/student/SubmitComplaint';
import MyComplaints from './pages/student/MyComplaints';
import ComplaintDetail from './pages/student/ComplaintDetail';
import NotificationsPage from './pages/student/NotificationsPage';
import ProfilePage from './pages/student/ProfilePage';

// Faculty Pages
import FacultyDashboard from './pages/faculty/FacultyDashboard';
import DepartmentComplaints from './pages/faculty/DepartmentComplaints';

// Department Head Pages
import DeptHeadDashboard from './pages/departmentHead/DeptHeadDashboard';
import StaffManagement from './pages/departmentHead/StaffManagement';
import DeptAnalytics from './pages/departmentHead/DeptAnalytics';

// Admin Pages
import AdminDashboard from './pages/admin/AdminDashboard';
import AllComplaints from './pages/admin/AllComplaints';
import UserManagement from './pages/admin/UserManagement';
import DepartmentManagement from './pages/admin/DepartmentManagement';
import AnalyticsReports from './pages/admin/AnalyticsReports';
import SLAConfiguration from './pages/admin/SLAConfiguration';
import AuditLogsPage from './pages/admin/AuditLogsPage';

// Management Pages
import ManagementDashboard from './pages/management/ManagementDashboard';
import PerformanceOverview from './pages/management/PerformanceOverview';

// Protected Route Guard
const ProtectedRoute = ({ children, allowedRoles }) => {
  const { user, isAuthenticated, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <LoadingSpinner message="Authenticating session..." />
      </div>
    );
  }

  if (!isAuthenticated || !user) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles && !allowedRoles.includes(user.role)) {
    return <Navigate to={getDashboardRoute(user.role)} replace />;
  }

  return children;
};

// Root index redirect
const RootRedirect = () => {
  const { user, isAuthenticated, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <LoadingSpinner message="Loading CGR Portal..." />
      </div>
    );
  }

  if (isAuthenticated && user) {
    return <Navigate to={getDashboardRoute(user.role)} replace />;
  }

  return <Navigate to="/login" replace />;
};

function App() {
  return (
    <>
      <Toaster
        position="top-right"
        toastOptions={{
          duration: 4000,
          style: {
            background: '#0f172a',
            color: '#fff',
            borderRadius: '0.75rem',
            fontSize: '0.875rem',
          },
        }}
      />

      <Routes>
        {/* Public Routes */}
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/" element={<RootRedirect />} />

        {/* Protected Dashboard Routes */}
        <Route
          element={
            <ProtectedRoute>
              <DashboardLayout />
            </ProtectedRoute>
          }
        >
          {/* Student Routes */}
          <Route
            path="/student/dashboard"
            element={
              <ProtectedRoute allowedRoles={['student']}>
                <StudentDashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/student/submit"
            element={
              <ProtectedRoute allowedRoles={['student', 'admin']}>
                <SubmitComplaint />
              </ProtectedRoute>
            }
          />
          <Route
            path="/student/complaints"
            element={
              <ProtectedRoute allowedRoles={['student']}>
                <MyComplaints />
              </ProtectedRoute>
            }
          />

          {/* Faculty Routes */}
          <Route
            path="/faculty/dashboard"
            element={
              <ProtectedRoute allowedRoles={['faculty']}>
                <FacultyDashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/faculty/department-complaints"
            element={
              <ProtectedRoute allowedRoles={['faculty']}>
                <DepartmentComplaints />
              </ProtectedRoute>
            }
          />

          {/* Department Head Routes */}
          <Route
            path="/department/dashboard"
            element={
              <ProtectedRoute allowedRoles={['department_head']}>
                <DeptHeadDashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/department/complaints"
            element={
              <ProtectedRoute allowedRoles={['department_head']}>
                <DepartmentComplaints />
              </ProtectedRoute>
            }
          />
          <Route
            path="/department/staff"
            element={
              <ProtectedRoute allowedRoles={['department_head']}>
                <StaffManagement />
              </ProtectedRoute>
            }
          />
          <Route
            path="/department/analytics"
            element={
              <ProtectedRoute allowedRoles={['department_head']}>
                <DeptAnalytics />
              </ProtectedRoute>
            }
          />

          {/* Administrator Routes */}
          <Route
            path="/admin/dashboard"
            element={
              <ProtectedRoute allowedRoles={['admin', 'management']}>
                <AdminDashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/complaints"
            element={
              <ProtectedRoute allowedRoles={['admin', 'department_head']}>
                <AllComplaints />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/users"
            element={
              <ProtectedRoute allowedRoles={['admin']}>
                <UserManagement />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/departments"
            element={
              <ProtectedRoute allowedRoles={['admin']}>
                <DepartmentManagement />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/analytics"
            element={
              <ProtectedRoute allowedRoles={['admin', 'management']}>
                <AnalyticsReports />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/sla"
            element={
              <ProtectedRoute allowedRoles={['admin']}>
                <SLAConfiguration />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/audit-logs"
            element={
              <ProtectedRoute allowedRoles={['admin']}>
                <AuditLogsPage />
              </ProtectedRoute>
            }
          />

          {/* Management Routes */}
          <Route
            path="/management/dashboard"
            element={
              <ProtectedRoute allowedRoles={['management', 'admin']}>
                <ManagementDashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/management/performance"
            element={
              <ProtectedRoute allowedRoles={['management', 'admin']}>
                <PerformanceOverview />
              </ProtectedRoute>
            }
          />

          {/* Shared Across Authenticated Roles */}
          <Route path="/complaint/:id" element={<ComplaintDetail />} />
          <Route path="/notifications" element={<NotificationsPage />} />
          <Route path="/profile" element={<ProfilePage />} />
        </Route>

        {/* Fallback */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </>
  );
}

export default App;

