import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import LoginPage from './pages/LoginPage';
import VerticalHeadDashboard from './pages/VerticalHeadDashboard';
import AddMembersPage from './pages/AddMembersPage';
import GlobalAdminDashboard from './pages/GlobalAdminDashboard';
import MeetingAttendancePage from './pages/MeetingAttendancePage';
import UnauthorizedPage from './pages/UnauthorizedPage';
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
    <AuthProvider>
      <Router>
        <div className="min-h-screen bg-gray-50">
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
                <ProtectedRoute allowedRoles={['vertical_head']}>
                  <MeetingAttendancePage />
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
            
            {/* Default route - redirect to appropriate dashboard */}
            <Route path="/" element={<HomeRedirect />} />
            
            {/* Catch all - redirect to home */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;
