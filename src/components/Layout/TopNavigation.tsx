import React, { useState } from 'react';
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
  GraduationCap,
  BookOpen,
  Megaphone,
  Calendar,
  Handshake,
  UserCircle,
  Heart,
  Menu,
  X,
  ChevronDown,
  Bell,
  LogOut,
  Search
} from 'lucide-react';
import { User } from '../../types';

interface TopNavigationProps {
  user: User;
  onLogout: () => void;
}

const TopNavigation: React.FC<TopNavigationProps> = ({ user, onLogout }) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);

  const mainNavigation = [
    { name: 'Dashboard', href: '/dashboard', icon: Home },
    { name: 'Students', href: '/students', icon: Users },
    { name: 'Profiles', href: '/profiles', icon: UserCircle },
    { name: 'Allowances', href: '/allowances', icon: DollarSign },
    { name: 'Tasks', href: '/tasks', icon: CheckSquare },
    { name: 'Issues', href: '/issues', icon: AlertTriangle },
  ];

  const moreNavigation = [
    { name: 'Forms', href: '/forms', icon: FileText },
    { name: 'Student Files', href: '/files', icon: FolderOpen },
    { name: 'Library', href: '/library', icon: BookOpen },
    { name: 'Announcements', href: '/announcements', icon: Megaphone },
    { name: 'Events', href: '/events', icon: Calendar },
    { name: 'Yearbook', href: '/yearbook', icon: BookOpen },
    { name: 'Impact Stories', href: '/impact-stories', icon: Heart },
    { name: 'Corporate', href: '/corporate', icon: Handshake },
    { name: 'User Management', href: '/users', icon: Users },
  ];

  const adminOnlyRoutes = user.role === 'admin' || user.role === 'deputy_manager' ? [
    { name: 'Yearbook Admin', href: '/yearbook-admin', icon: GraduationCap },
    { name: 'Stories Admin', href: '/impact-stories-admin', icon: Heart },
    { name: 'Settings', href: '/settings', icon: Settings },
  ] : [];

  const allMoreNavigation = [...moreNavigation, ...adminOnlyRoutes];

  return (
    <nav className="bg-gradient-to-r from-emerald-800 to-emerald-900 shadow-lg sticky top-0 z-50"
      style={{
        backgroundImage: `linear-gradient(rgba(6, 78, 59, 0.95), rgba(6, 78, 59, 0.95)), url('https://images.pexels.com/photos/5212317/pexels-photo-5212317.jpeg?auto=compress&cs=tinysrgb&w=1920')`,
        backgroundSize: 'cover',
        backgroundPosition: 'center'
      }}>
      <div className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-6">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <div className="flex items-center space-x-2 sm:space-x-3 flex-shrink-0">
            <div className="w-8 h-8 sm:w-10 sm:h-10 bg-emerald-500 rounded-lg flex items-center justify-center">
              <GraduationCap className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
            </div>
            <div className="hidden sm:block">
              <h1 className="text-lg sm:text-xl font-bold text-white">ExcelHub</h1>
              <p className="text-xs text-emerald-200">Family Legacy</p>
            </div>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden lg:flex items-center space-x-1 flex-1 mx-6">
            {mainNavigation.map((item) => (
              <NavLink
                key={item.name}
                to={item.href}
                className={({ isActive }) =>
                  `flex items-center px-3 py-2 text-sm font-medium rounded-lg transition-all ${
                    isActive
                      ? 'bg-emerald-700 text-white shadow-lg'
                      : 'text-emerald-100 hover:bg-emerald-700 hover:text-white'
                  }`
                }
              >
                <item.icon className="w-4 h-4 mr-2" />
                <span className="hidden xl:inline">{item.name}</span>
              </NavLink>
            ))}

            {/* More Dropdown */}
            <div className="relative">
              <button
                onClick={() => setDropdownOpen(!dropdownOpen)}
                className="flex items-center px-3 py-2 text-sm font-medium rounded-lg text-emerald-100 hover:bg-emerald-700 hover:text-white transition-all"
              >
                <span className="hidden xl:inline">More</span>
                <span className="xl:hidden">···</span>
                <ChevronDown className="w-4 h-4 ml-1" />
              </button>

              {dropdownOpen && (
                <>
                  <div
                    className="fixed inset-0 z-10"
                    onClick={() => setDropdownOpen(false)}
                  />
                  <div className="absolute right-0 mt-2 w-56 bg-white rounded-lg shadow-xl z-20 max-h-96 overflow-y-auto">
                    {allMoreNavigation.map((item) => (
                      <NavLink
                        key={item.name}
                        to={item.href}
                        onClick={() => setDropdownOpen(false)}
                        className={({ isActive }) =>
                          `flex items-center px-4 py-3 text-sm transition-colors ${
                            isActive
                              ? 'bg-emerald-50 text-emerald-900 font-medium'
                              : 'text-gray-700 hover:bg-gray-50'
                          }`
                        }
                      >
                        <item.icon className="w-4 h-4 mr-3 text-emerald-600" />
                        {item.name}
                      </NavLink>
                    ))}
                  </div>
                </>
              )}
            </div>
          </div>

          {/* Search Bar - Desktop */}
          <div className="hidden md:flex items-center flex-1 max-w-md mx-4">
            <div className="relative w-full">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search className="h-4 w-4 text-emerald-300" />
              </div>
              <input
                type="text"
                placeholder="Search..."
                className="block w-full pl-10 pr-3 py-2 text-sm border border-emerald-700 bg-emerald-800 bg-opacity-50 rounded-lg text-white placeholder-emerald-300 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all"
              />
            </div>
          </div>

          {/* Right Side Actions */}
          <div className="flex items-center space-x-2 sm:space-x-3">
            {/* Notifications */}
            <button className="relative p-2 text-emerald-200 hover:text-white hover:bg-emerald-700 rounded-lg transition-colors">
              <Bell className="w-5 h-5" />
              <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
            </button>

            {/* User Profile */}
            <div className="hidden sm:flex items-center space-x-3 pl-3 border-l border-emerald-700">
              <div className="text-right">
                <p className="text-sm font-medium text-white truncate max-w-[120px]">{user.name}</p>
                <p className="text-xs text-emerald-200 capitalize truncate">{user.role.replace('_', ' ')}</p>
              </div>
              <div className="w-9 h-9 bg-emerald-500 rounded-full flex items-center justify-center">
                <span className="text-white text-sm font-semibold">
                  {user.name.charAt(0).toUpperCase()}
                </span>
              </div>
            </div>

            {/* Logout */}
            <button
              onClick={onLogout}
              className="p-2 text-emerald-200 hover:text-white hover:bg-emerald-700 rounded-lg transition-colors"
              title="Logout"
              aria-label="Logout"
            >
              <LogOut className="w-5 h-5" />
            </button>

            {/* Mobile Menu Button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden p-2 text-emerald-200 hover:text-white hover:bg-emerald-700 rounded-lg transition-colors"
              aria-label="Toggle menu"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>

        {/* Mobile Search */}
        <div className="md:hidden pb-3">
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="h-4 w-4 text-emerald-300" />
            </div>
            <input
              type="text"
              placeholder="Search..."
              className="block w-full pl-10 pr-3 py-2 text-sm border border-emerald-700 bg-emerald-800 bg-opacity-50 rounded-lg text-white placeholder-emerald-300 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
            />
          </div>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="lg:hidden pb-4 border-t border-emerald-700 mt-2">
            <div className="pt-4 space-y-1">
              {[...mainNavigation, ...allMoreNavigation].map((item) => (
                <NavLink
                  key={item.name}
                  to={item.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className={({ isActive }) =>
                    `flex items-center px-3 py-2 text-sm font-medium rounded-lg transition-all ${
                      isActive
                        ? 'bg-emerald-700 text-white shadow-lg'
                        : 'text-emerald-100 hover:bg-emerald-700 hover:text-white'
                    }`
                  }
                >
                  <item.icon className="w-5 h-5 mr-3" />
                  {item.name}
                </NavLink>
              ))}
            </div>

            {/* Mobile User Info */}
            <div className="sm:hidden mt-4 pt-4 border-t border-emerald-700">
              <div className="flex items-center space-x-3 px-3">
                <div className="w-10 h-10 bg-emerald-500 rounded-full flex items-center justify-center">
                  <span className="text-white font-semibold">
                    {user.name.charAt(0).toUpperCase()}
                  </span>
                </div>
                <div>
                  <p className="text-sm font-medium text-white">{user.name}</p>
                  <p className="text-xs text-emerald-200 capitalize">{user.role.replace('_', ' ')}</p>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};

export default TopNavigation;
