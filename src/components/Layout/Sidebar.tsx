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
  UserCircle,
  Heart
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
    { name: 'Impact Stories', href: '/impact-stories', icon: Heart },
    { name: 'Corporate Collaborations', href: '/corporate', icon: Handshake },
    { name: 'User Management', href: '/users', icon: Users },
  ];

  const adminOnlyRoutes = user.role === 'admin' || user.role === 'deputy_manager' ? [
    { name: 'Yearbook Admin', href: '/yearbook-admin', icon: GraduationCap },
    { name: 'Stories Admin', href: '/impact-stories-admin', icon: Heart },
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
      <aside className={`
        fixed inset-y-0 left-0 z-30 w-64 sm:w-72 lg:w-64 xl:w-72
        bg-gradient-to-b from-emerald-800 to-emerald-900
        transform transition-transform duration-300 ease-in-out
        lg:translate-x-0 lg:static lg:inset-0
        ${isOpen ? 'translate-x-0' : '-translate-x-full'}
        flex flex-col
      `}
      style={{
        backgroundImage: `linear-gradient(rgba(6, 78, 59, 0.95), rgba(6, 78, 59, 0.95)), url('https://images.pexels.com/photos/5212317/pexels-photo-5212317.jpeg?auto=compress&cs=tinysrgb&w=400')`,
        backgroundSize: 'cover',
        backgroundPosition: 'center'
      }}>
        <div className="flex items-center justify-between h-16 px-4 sm:px-6 border-b border-emerald-700 flex-shrink-0">
          <div className="flex items-center space-x-2 sm:space-x-3 min-w-0">
            <div className="w-8 h-8 sm:w-10 sm:h-10 bg-emerald-500 rounded-lg flex items-center justify-center flex-shrink-0">
              <GraduationCap className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
            </div>
            <div className="min-w-0">
              <h1 className="text-lg sm:text-xl font-bold text-white truncate">ExcelHub</h1>
              <p className="text-xs text-emerald-200 truncate">Family Legacy</p>
            </div>
          </div>
          <button
            onClick={onToggle}
            className="lg:hidden text-emerald-200 hover:text-white transition-colors p-2 flex-shrink-0"
            aria-label="Close sidebar"
          >
            <X className="w-5 h-5 sm:w-6 sm:h-6" />
          </button>
        </div>

        <nav className="mt-4 sm:mt-6 px-3 sm:px-4 flex-1 overflow-y-auto custom-scrollbar">
          <div className="space-y-1 sm:space-y-2 pb-4">
            {allNavigation.map((item) => (
              <NavLink
                key={item.name}
                to={item.href}
                onClick={() => window.innerWidth < 1024 && onToggle()}
                className={({ isActive }) =>
                  `group flex items-center px-3 py-2.5 sm:py-2 text-sm font-medium rounded-lg transition-all duration-200 ${
                    isActive
                      ? 'bg-emerald-700 text-white shadow-lg'
                      : 'text-emerald-100 hover:bg-emerald-700 hover:text-white hover:shadow-md'
                  }`
                }
              >
                <item.icon className="mr-2 sm:mr-3 h-5 w-5 flex-shrink-0 group-hover:scale-110 transition-transform" />
                <span className="truncate text-sm sm:text-base">{item.name}</span>
              </NavLink>
            ))}
          </div>
        </nav>

        <div className="flex-shrink-0 p-3 sm:p-4 border-t border-emerald-700 bg-emerald-900 bg-opacity-50">
          <div className="flex items-center space-x-2 sm:space-x-3">
            <div className="w-9 h-9 sm:w-10 sm:h-10 bg-emerald-500 rounded-full flex items-center justify-center flex-shrink-0">
              <span className="text-white text-sm sm:text-base font-semibold">
                {user.name.charAt(0).toUpperCase()}
              </span>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-white truncate">{user.name}</p>
              <p className="text-xs text-emerald-200 truncate capitalize">{user.role.replace('_', ' ')}</p>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;