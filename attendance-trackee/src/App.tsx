import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { ThemeProvider } from './contexts/ThemeContext';
import ProtectedRoute from './components/ProtectedRoute';
import LoginPage from './pages/LoginPage';
import VerticalHeadDashboard from './pages/VerticalHeadDashboard';
import AddMembersPage from './pages/AddMembersPage';
import GlobalAdminDashboard from './pages/GlobalAdminDashboard';
import MeetingAttendancePage from './pages/MeetingAttendancePage';
import UnauthorizedPage from './pages/UnauthorizedPage';
import VerticalHeadAttendance from './pages/VerticalHeadAttendance';
import GlobalAdminAllAttendancePage from './pages/GlobalAdminAllAttendancePage';
import AddVerticalHeadPage from './pages/AddVerticalHeadPage';
import GlobalAdminVerticalAttendance from './pages/GlobalAdminVerticalAttendance';
import DeleteRequestsPage from './pages/DeleteRequestsPage';
import DeleteHistoryPage from './pages/DeleteHistoryPage';
import ManageMembersPage from './pages/ManageMembersPage';
import VerticalHeadDeleteRequestPage from './pages/VerticalHeadDeleteRequestPage';

import './App.css';

// Home redirect component
const HomeRedirect: React.FC = () => {
  const { isAuthenticated, user } = useAuth();

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (user?.role === 'global_admin') {
    return <Navigate to="/admin/dashboard" replace />;
  } else {
    return <Navigate to="/dashboard" replace />;
  }
};

function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <Router>
          <div className="min-h-screen bg-gray-50 text-gray-900 transition-colors duration-500 dark:bg-gray-950 dark:text-gray-100">
            <Toaster
              position="bottom-center"
              toastOptions={{
                duration: 4000,
                style: {
                  background: '#333',
                  color: '#fff',
                },
                success: {
                  duration: 3000,
                  iconTheme: {
                    primary: '#10b981',
                    secondary: '#fff',
                  },
                },
                error: {
                  duration: 4000,
                  iconTheme: {
                    primary: '#ef4444',
                    secondary: '#fff',
                  },
                },
              }}
            />
            <Routes>
              {/* Public Routes */}
              <Route path="/login" element={<LoginPage />} />
              <Route path="/unauthorized" element={<UnauthorizedPage />} />

              {/* Protected Routes - Vertical Head */}
              <Route
                path="/dashboard"
                element={
                  <ProtectedRoute allowedRoles={['vertical_head']}>
                    <VerticalHeadDashboard />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/members/add"
                element={
                  <ProtectedRoute allowedRoles={['vertical_head']}>
                    <AddMembersPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/meeting/:meetingId/attendance"
                element={
                  <ProtectedRoute allowedRoles={['vertical_head', 'global_admin']}>
                    <MeetingAttendancePage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/vertical-head/attendance"
                element={
                  <ProtectedRoute allowedRoles={['vertical_head']}>
                    <VerticalHeadAttendance />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/vertical-head/delete-request"
                element={
                  <ProtectedRoute allowedRoles={['vertical_head']}>
                    <VerticalHeadDeleteRequestPage />
                  </ProtectedRoute>
                }
              />

              {/* Protected Routes - Global Admin */}
              <Route
                path="/admin/dashboard"
                element={
                  <ProtectedRoute allowedRoles={['global_admin']}>
                    <GlobalAdminDashboard />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/admin/add-vertical-head"
                element={
                  <ProtectedRoute allowedRoles={['global_admin']}>
                    <AddVerticalHeadPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/admin/manage-members"
                element={
                  <ProtectedRoute allowedRoles={['global_admin']}>
                    <ManageMembersPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/admin/vertical-attendance"
                element={
                  <ProtectedRoute allowedRoles={['global_admin']}>
                    <GlobalAdminVerticalAttendance />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/global-admin/all-attendance"
                element={
                  <ProtectedRoute allowedRoles={['global_admin']}>
                    <GlobalAdminAllAttendancePage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/admin/delete-requests"
                element={
                  <ProtectedRoute allowedRoles={['global_admin']}>
                    <DeleteRequestsPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/admin/delete-history"
                element={
                  <ProtectedRoute allowedRoles={['global_admin']}>
                    <DeleteHistoryPage />
                  </ProtectedRoute>
                }
              />

              {/* Default route - redirect to appropriate dashboard */}
              <Route path="/" element={<HomeRedirect />} />

              {/* Catch all - redirect to home */}
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </div>
        </Router>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;
