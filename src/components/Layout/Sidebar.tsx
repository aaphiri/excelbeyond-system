import React from 'react';
import { NavLink } from 'react-router-dom';
import {
  Home,
  Users,
  DollarSign,
  CheckSquare,
  AlertTriangle,
  FileText,
  FolderOpen,
  Settings,
  X,
  GraduationCap,
  BookOpen,
  Megaphone,
  Calendar,
  Handshake,
  UserCircle
} from 'lucide-react';
import { User } from '../../types';

interface SidebarProps {
  user: User;
  isOpen: boolean;
  onToggle: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ user, isOpen, onToggle }) => {
  const navigation = [
    { name: 'Dashboard', href: '/dashboard', icon: Home },
    { name: 'Students', href: '/students', icon: Users },
    { name: 'Student Profiles', href: '/profiles', icon: UserCircle },
    { name: 'Allowances', href: '/allowances', icon: DollarSign },
    { name: 'Tasks', href: '/tasks', icon: CheckSquare },
    { name: 'Issues', href: '/issues', icon: AlertTriangle },
    { name: 'Forms', href: '/forms', icon: FileText },
    { name: 'Student Files', href: '/files', icon: FolderOpen },
    { name: 'Library', href: '/library', icon: BookOpen },
    { name: 'Announcements', href: '/announcements', icon: Megaphone },
    { name: 'Excel Beyond Events', href: '/events', icon: Calendar },
    { name: 'Graduation Yearbook', href: '/yearbook', icon: BookOpen },
    { name: 'Corporate Collaborations', href: '/corporate', icon: Handshake },
    { name: 'User Management', href: '/users', icon: Users },
  ];

  const adminOnlyRoutes = user.role === 'admin' || user.role === 'deputy_manager' ? [
    { name: 'Yearbook Admin', href: '/yearbook-admin', icon: GraduationCap },
    { name: 'Settings', href: '/settings', icon: Settings },
  ] : [];

  const allNavigation = [...navigation, ...adminOnlyRoutes];

  return (
    <>
      {/* Mobile overlay */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-gray-600 bg-opacity-75 z-20 lg:hidden"
          onClick={onToggle}
        />
      )}

      {/* Sidebar */}
      <div className={`
        fixed inset-y-0 left-0 z-30 w-64 bg-gradient-to-b from-emerald-800 to-emerald-900
        transform transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static lg:inset-0
        ${isOpen ? 'translate-x-0' : '-translate-x-full'}
      `}
      style={{
        backgroundImage: `linear-gradient(rgba(6, 78, 59, 0.95), rgba(6, 78, 59, 0.95)), url('https://images.pexels.com/photos/5212317/pexels-photo-5212317.jpeg?auto=compress&cs=tinysrgb&w=400')`,
        backgroundSize: 'cover',
        backgroundPosition: 'center'
      }}>
        <div className="flex items-center justify-between h-16 px-6 border-b border-emerald-700">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-emerald-500 rounded-lg flex items-center justify-center">
              <GraduationCap className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-white">ExcelHub</h1>
              <p className="text-xs text-emerald-200">Family Legacy</p>
            </div>
          </div>
          <button
            onClick={onToggle}
            className="lg:hidden text-emerald-200 hover:text-white transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <nav className="mt-8 px-4 flex-1 overflow-y-auto">
          <div className="space-y-2">
            {allNavigation.map((item) => (
              <NavLink
                key={item.name}
                to={item.href}
                onClick={() => window.innerWidth < 1024 && onToggle()}
                className={({ isActive }) =>
                  `group flex items-center px-3 py-2 text-sm font-medium rounded-lg transition-all duration-200 hover:scale-105 ${
                    isActive
                      ? 'bg-emerald-700 text-white shadow-lg transform scale-105'
                      : 'text-emerald-100 hover:bg-emerald-700 hover:text-white hover:shadow-md'
                  }`
                }
              >
                <item.icon className="mr-3 h-5 w-5 flex-shrink-0 group-hover:scale-110 transition-transform" />
                <span className="truncate">{item.name}</span>
              </NavLink>
            ))}
          </div>
        </nav>

        <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-emerald-700">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-emerald-500 rounded-full flex items-center justify-center">
              <span className="text-white text-sm font-semibold">
                {user.name.charAt(0).toUpperCase()}
              </span>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-white truncate">{user.name}</p>
              <p className="text-xs text-emerald-200 truncate capitalize">{user.role.replace('_', ' ')}</p>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Sidebar;