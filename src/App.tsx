import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Sidebar from './components/Layout/Sidebar';
import Header from './components/Layout/Header';
import LoginPage from './pages/LoginPage';
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
import { User, UserRole } from './types';

function App() {
  const [user, setUser] = useState<User | null>(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    // Check for stored user session
    const storedUser = localStorage.getItem('excelhub_user');
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
  }, []);

  const handleLogin = (userData: User) => {
    setUser(userData);
    localStorage.setItem('excelhub_user', JSON.stringify(userData));
  };

  const handleLogout = () => {
    setUser(null);
    localStorage.removeItem('excelhub_user');
  };

  if (!user) {
    return <LoginPage onLogin={handleLogin} />;
  }

  return (
    <Router>
      <div className="flex h-screen bg-gray-50">
        <Sidebar 
          user={user} 
          isOpen={sidebarOpen} 
          onToggle={() => setSidebarOpen(!sidebarOpen)} 
        />
        <div className="flex-1 flex flex-col overflow-hidden">
          <Header 
            user={user} 
            onLogout={handleLogout}
            onMenuClick={() => setSidebarOpen(!sidebarOpen)}
          />
          <main className="flex-1 overflow-y-auto bg-gray-50 p-3 sm:p-6">
            <Routes>
              <Route path="/" element={<Dashboard user={user} />} />
              <Route path="/dashboard" element={<Dashboard user={user} />} />
              <Route path="/students" element={<StudentManagement user={user} />} />
              <Route path="/profiles" element={<StudentProfiles user={user} />} />
              <Route path="/allowances" element={<AllowanceManagement user={user} />} />
              <Route path="/tasks" element={<TaskManagement user={user} />} />
              <Route path="/issues" element={<IssueTracker user={user} />} />
              <Route path="/forms" element={<Forms user={user} />} />
              <Route path="/files" element={<StudentFiles user={user} />} />
              <Route path="/library" element={<Library user={user} />} />
              <Route path="/announcements" element={<Announcements user={user} />} />
              <Route path="/events" element={<Events user={user} />} />
              <Route path="/yearbook" element={<Yearbook user={user} />} />
              <Route path="/yearbook-admin" element={<YearbookAdmin user={user} />} />
              <Route path="/impact-stories" element={<ImpactStories user={user} />} />
              <Route path="/impact-stories-admin" element={<ImpactStoriesAdmin user={user} />} />
              <Route path="/corporate" element={<CorporateCollaborations />} />
              <Route path="/users" element={<UserManagement user={user} />} />
              <Route path="/settings" element={<Settings user={user} />} />
              <Route path="*" element={<Navigate to="/dashboard" replace />} />
            </Routes>
          </main>
        </div>
      </div>
    </Router>
  );
}

export default App;