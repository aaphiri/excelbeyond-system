import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import Sidebar from './components/Layout/Sidebar';
import Header from './components/Layout/Header';
import GoogleLoginPage from './pages/GoogleLoginPage';
import StaffLoginPage from './pages/StaffLoginPage';
import ForgotPassword from './pages/ForgotPassword';
import ResetPassword from './pages/ResetPassword';
import VerifyEmail from './pages/VerifyEmail';
import Dashboard from './pages/Dashboard';
import StudentManagement from './pages/StudentManagement';
import StudentProfiles from './pages/StudentProfiles';
import AllowanceManagement from './pages/AllowanceManagement';
import TaskManagement from './pages/TaskManagement';
import IssueTracker from './pages/IssueTracker';
import Forms from './pages/Forms';
import StudentFiles from './pages/StudentFiles';
import Library from './pages/Library';
import Announcements from './pages/Announcements';
import Events from './pages/Events';
import Yearbook from './pages/Yearbook';
import YearbookAdmin from './pages/YearbookAdmin';
import ImpactStories from './pages/ImpactStories';
import ImpactStoriesAdmin from './pages/ImpactStoriesAdmin';
import UserManagement from './pages/UserManagement';
import Settings from './pages/Settings';
import CorporateCollaborations from './pages/CorporateCollaborations';
import { User } from './types';

const AppContent: React.FC = () => {
  const { user: authUser, signOut, loading } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const legacyUser: User | null = authUser ? {
    id: authUser.id,
    name: authUser.name,
    email: authUser.email,
    role: authUser.role as any,
  } : null;

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!authUser) {
    return (
      <Routes>
        <Route path="/login" element={<GoogleLoginPage />} />
        <Route
          path="/staff-login"
          element={<StaffLoginPage onSwitchToGoogle={() => window.location.href = '/login'} />}
        />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/reset-password" element={<ResetPassword />} />
        <Route path="/verify-email" element={<VerifyEmail />} />
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    );
  }


  return (
    <div className="flex h-screen bg-gray-50">
      <Sidebar
        user={legacyUser!}
        isOpen={sidebarOpen}
        onToggle={() => setSidebarOpen(!sidebarOpen)}
      />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header
          user={legacyUser!}
          onLogout={signOut}
          onMenuClick={() => setSidebarOpen(!sidebarOpen)}
        />
        <main className="flex-1 overflow-y-auto bg-gray-50 p-3 sm:p-6">
          <Routes>
            <Route path="/login" element={<Navigate to="/dashboard" replace />} />
            <Route
              path="/"
              element={
                <ProtectedRoute>
                  <Dashboard user={legacyUser!} />
                </ProtectedRoute>
              }
            />
            <Route
              path="/dashboard"
              element={
                <ProtectedRoute>
                  <Dashboard user={legacyUser!} />
                </ProtectedRoute>
              }
            />
            <Route
              path="/students"
              element={
                <ProtectedRoute>
                  <StudentManagement user={legacyUser!} />
                </ProtectedRoute>
              }
            />
            <Route
              path="/profiles"
              element={
                <ProtectedRoute>
                  <StudentProfiles user={legacyUser!} />
                </ProtectedRoute>
              }
            />
            <Route
              path="/allowances"
              element={
                <ProtectedRoute>
                  <AllowanceManagement user={legacyUser!} />
                </ProtectedRoute>
              }
            />
            <Route
              path="/tasks"
              element={
                <ProtectedRoute>
                  <TaskManagement user={legacyUser!} />
                </ProtectedRoute>
              }
            />
            <Route
              path="/issues"
              element={
                <ProtectedRoute>
                  <IssueTracker user={legacyUser!} />
                </ProtectedRoute>
              }
            />
            <Route
              path="/forms"
              element={
                <ProtectedRoute>
                  <Forms user={legacyUser!} />
                </ProtectedRoute>
              }
            />
            <Route
              path="/files"
              element={
                <ProtectedRoute>
                  <StudentFiles user={legacyUser!} />
                </ProtectedRoute>
              }
            />
            <Route
              path="/library"
              element={
                <ProtectedRoute>
                  <Library user={legacyUser!} />
                </ProtectedRoute>
              }
            />
            <Route
              path="/announcements"
              element={
                <ProtectedRoute>
                  <Announcements user={legacyUser!} />
                </ProtectedRoute>
              }
            />
            <Route
              path="/events"
              element={
                <ProtectedRoute>
                  <Events user={legacyUser!} />
                </ProtectedRoute>
              }
            />
            <Route
              path="/yearbook"
              element={
                <ProtectedRoute>
                  <Yearbook user={legacyUser!} />
                </ProtectedRoute>
              }
            />
            <Route
              path="/yearbook-admin"
              element={
                <ProtectedRoute requiredRole="deputy_manager">
                  <YearbookAdmin user={legacyUser!} />
                </ProtectedRoute>
              }
            />
            <Route
              path="/impact-stories"
              element={
                <ProtectedRoute>
                  <ImpactStories user={legacyUser!} />
                </ProtectedRoute>
              }
            />
            <Route
              path="/impact-stories-admin"
              element={
                <ProtectedRoute requiredRole="deputy_manager">
                  <ImpactStoriesAdmin user={legacyUser!} />
                </ProtectedRoute>
              }
            />
            <Route
              path="/corporate"
              element={
                <ProtectedRoute>
                  <CorporateCollaborations />
                </ProtectedRoute>
              }
            />
            <Route
              path="/users"
              element={
                <ProtectedRoute>
                  <UserManagement user={legacyUser!} />
                </ProtectedRoute>
              }
            />
            <Route
              path="/settings"
              element={
                <ProtectedRoute requiredRole="admin">
                  <Settings user={legacyUser!} />
                </ProtectedRoute>
              }
            />
            <Route path="*" element={<Navigate to="/dashboard" replace />} />
          </Routes>
        </main>
      </div>
    </div>
  );
};

function App() {
  return (
    <Router>
      <AuthProvider>
        <AppContent />
      </AuthProvider>
    </Router>
  );
}

export default App;
