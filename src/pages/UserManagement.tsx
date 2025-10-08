import React, { useState } from 'react';
import { 
  Users, 
  Plus, 
  Search, 
  Filter,
  Edit,
  Trash2,
  Eye,
  Shield,
  UserPlus,
  Settings,
  Lock,
  Unlock,
  Mail,
  Phone,
  Calendar,
  MapPin,
  User as UserIcon
} from 'lucide-react';
import { User, UserProfile, Role } from '../types';

interface UserManagementProps {
  user: User;
}

const UserManagement: React.FC<UserManagementProps> = ({ user }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterRole, setFilterRole] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');
  const [showAddModal, setShowAddModal] = useState(false);
  const [showRoleModal, setShowRoleModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState<UserProfile | null>(null);

  // Mock user data
  const users: UserProfile[] = [
    {
      id: '1',
      name: 'John Mwanza',
      firstName: 'John',
      lastName: 'Mwanza',
      email: 'john.mwanza@familylegacy.zm',
      role: 'admin',
      department: 'Administration',
      phoneNumber: '+260 977 123 456',
      address: 'Lusaka, Zambia',
      dateOfBirth: '1985-03-15',
      isActive: true,
      lastLogin: '2024-03-15T10:30:00Z',
      createdDate: '2023-01-15',
      updatedDate: '2024-03-15',
      createdBy: 'system',
      permissions: ['all'],
      emergencyContact: {
        name: 'Mary Mwanza',
        phone: '+260 966 789 012',
        relationship: 'Spouse'
      }
    },
    {
      id: '2',
      name: 'Sarah Banda',
      firstName: 'Sarah',
      lastName: 'Banda',
      email: 'sarah.banda@familylegacy.zm',
      role: 'program_officer',
      department: 'Student Affairs',
      phoneNumber: '+260 955 234 567',
      address: 'Lusaka, Zambia',
      dateOfBirth: '1990-07-22',
      isActive: true,
      lastLogin: '2024-03-15T09:15:00Z',
      createdDate: '2023-02-20',
      updatedDate: '2024-03-14',
      createdBy: '1',
      permissions: ['students.read', 'students.write', 'allowances.write', 'tasks.write'],
      emergencyContact: {
        name: 'Peter Banda',
        phone: '+260 977 345 678',
        relationship: 'Brother'
      }
    },
    {
      id: '3',
      name: 'Michael Phiri',
      firstName: 'Michael',
      lastName: 'Phiri',
      email: 'michael.phiri@familylegacy.zm',
      role: 'deputy_manager',
      department: 'Management',
      phoneNumber: '+260 966 345 678',
      address: 'Kitwe, Zambia',
      dateOfBirth: '1988-11-10',
      isActive: true,
      lastLogin: '2024-03-15T08:45:00Z',
      createdDate: '2023-01-20',
      updatedDate: '2024-03-13',
      createdBy: '1',
      permissions: ['allowances.approve', 'students.read', 'tasks.read', 'reports.read'],
      emergencyContact: {
        name: 'Grace Phiri',
        phone: '+260 955 456 789',
        relationship: 'Spouse'
      }
    },
    {
      id: '4',
      name: 'Grace Tembo',
      firstName: 'Grace',
      lastName: 'Tembo',
      email: 'grace.tembo@student.unza.zm',
      role: 'student',
      department: 'Engineering',
      phoneNumber: '+260 977 456 789',
      address: 'Lusaka, Zambia',
      dateOfBirth: '2001-05-18',
      isActive: true,
      lastLogin: '2024-03-14T20:30:00Z',
      createdDate: '2022-01-15',
      updatedDate: '2024-03-14',
      createdBy: '2',
      permissions: ['profile.read', 'profile.write', 'library.read', 'events.read'],
      emergencyContact: {
        name: 'Mary Tembo',
        phone: '+260 966 567 890',
        relationship: 'Mother'
      }
    },
    {
      id: '5',
      name: 'David Mulenga',
      firstName: 'David',
      lastName: 'Mulenga',
      email: 'david.mulenga@familylegacy.zm',
      role: 'program_officer',
      department: 'Student Affairs',
      phoneNumber: '+260 955 567 890',
      address: 'Ndola, Zambia',
      dateOfBirth: '1992-09-03',
      isActive: false,
      lastLogin: '2024-02-28T16:20:00Z',
      createdDate: '2023-06-10',
      updatedDate: '2024-02-28',
      createdBy: '1',
      permissions: ['students.read', 'students.write', 'allowances.write'],
      emergencyContact: {
        name: 'Jane Mulenga',
        phone: '+260 977 678 901',
        relationship: 'Sister'
      }
    }
  ];

  // Mock roles data
  const roles: Role[] = [
    {
      id: '1',
      name: 'Admin',
      description: 'Full system access and management capabilities',
      permissions: ['all'],
      isActive: true,
      createdDate: '2023-01-01'
    },
    {
      id: '2',
      name: 'Program Officer',
      description: 'Manage assigned students and handle daily operations',
      permissions: ['students.read', 'students.write', 'allowances.write', 'tasks.write', 'forms.write'],
      isActive: true,
      createdDate: '2023-01-01'
    },
    {
      id: '3',
      name: 'Deputy Manager',
      description: 'Approve allowances and oversee program operations',
      permissions: ['allowances.approve', 'students.read', 'tasks.read', 'reports.read'],
      isActive: true,
      createdDate: '2023-01-01'
    },
    {
      id: '4',
      name: 'Student',
      description: 'Access personal information and learning resources',
      permissions: ['profile.read', 'profile.write', 'library.read', 'events.read'],
      isActive: true,
      createdDate: '2023-01-01'
    }
  ];

  const filteredUsers = users.filter(userProfile => {
    const matchesSearch = userProfile.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         userProfile.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         userProfile.department?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesRole = filterRole === 'all' || userProfile.role === filterRole;
    const matchesStatus = filterStatus === 'all' || 
                         (filterStatus === 'active' && userProfile.isActive) ||
                         (filterStatus === 'inactive' && !userProfile.isActive);
    
    return matchesSearch && matchesRole && matchesStatus;
  });

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'admin': return 'bg-red-100 text-red-800';
      case 'program_officer': return 'bg-blue-100 text-blue-800';
      case 'deputy_manager': return 'bg-purple-100 text-purple-800';
      case 'student': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusColor = (isActive: boolean) => {
    return isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800';
  };

  const formatLastLogin = (lastLogin?: string) => {
    if (!lastLogin) return 'Never';
    const date = new Date(lastLogin);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - date.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 1) return 'Today';
    if (diffDays === 2) return 'Yesterday';
    if (diffDays <= 7) return `${diffDays - 1} days ago`;
    return date.toLocaleDateString();
  };

  const roleStats = {
    admin: users.filter(u => u.role === 'admin').length,
    program_officer: users.filter(u => u.role === 'program_officer').length,
    deputy_manager: users.filter(u => u.role === 'deputy_manager').length,
    student: users.filter(u => u.role === 'student').length,
    active: users.filter(u => u.isActive).length,
    inactive: users.filter(u => !u.isActive).length,
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute top-16 right-16 w-48 h-48 bg-blue-600 rounded-full animate-pulse"></div>
        <div className="absolute bottom-1/3 left-12 w-36 h-36 bg-indigo-600 rounded-full animate-bounce" style={{ animationDuration: '5s' }}></div>
        <div className="absolute top-2/3 right-1/3 w-28 h-28 bg-blue-400 rounded-full animate-ping"></div>
      </div>

      <div className="relative z-10 space-y-4 sm:space-y-6 p-4 sm:p-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
              <Users className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <h1 className="text-xl sm:text-2xl font-bold text-gray-900">User Management</h1>
              <p className="text-sm sm:text-base text-gray-600">Manage system users and permissions</p>
            </div>
          </div>
          <div className="flex items-center space-x-2 mt-4 sm:mt-0">
            <button 
              onClick={() => setShowRoleModal(true)}
              className="flex items-center space-x-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
            >
              <Shield className="w-4 h-4" />
              <span className="hidden sm:inline">Manage Roles</span>
            </button>
            <button 
              onClick={() => setShowAddModal(true)}
              className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              <Plus className="w-4 h-4" />
              <span className="hidden sm:inline">Add User</span>
            </button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-6 gap-3 sm:gap-6">
          <div className="bg-white rounded-xl shadow-sm p-4 sm:p-6">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 sm:w-12 sm:h-12 bg-red-100 rounded-lg flex items-center justify-center">
                <Shield className="w-5 h-5 sm:w-6 sm:h-6 text-red-600" />
              </div>
              <div>
                <p className="text-lg sm:text-2xl font-bold text-gray-900">{roleStats.admin}</p>
                <p className="text-xs sm:text-sm text-gray-600">Admins</p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-xl shadow-sm p-4 sm:p-6">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 sm:w-12 sm:h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <UserIcon className="w-5 h-5 sm:w-6 sm:h-6 text-blue-600" />
              </div>
              <div>
                <p className="text-lg sm:text-2xl font-bold text-gray-900">{roleStats.program_officer}</p>
                <p className="text-xs sm:text-sm text-gray-600">Officers</p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-xl shadow-sm p-4 sm:p-6">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 sm:w-12 sm:h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                <Settings className="w-5 h-5 sm:w-6 sm:h-6 text-purple-600" />
              </div>
              <div>
                <p className="text-lg sm:text-2xl font-bold text-gray-900">{roleStats.deputy_manager}</p>
                <p className="text-xs sm:text-sm text-gray-600">Managers</p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-xl shadow-sm p-4 sm:p-6">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 sm:w-12 sm:h-12 bg-green-100 rounded-lg flex items-center justify-center">
                <UserPlus className="w-5 h-5 sm:w-6 sm:h-6 text-green-600" />
              </div>
              <div>
                <p className="text-lg sm:text-2xl font-bold text-gray-900">{roleStats.student}</p>
                <p className="text-xs sm:text-sm text-gray-600">Students</p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-xl shadow-sm p-4 sm:p-6">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 sm:w-12 sm:h-12 bg-emerald-100 rounded-lg flex items-center justify-center">
                <Unlock className="w-5 h-5 sm:w-6 sm:h-6 text-emerald-600" />
              </div>
              <div>
                <p className="text-lg sm:text-2xl font-bold text-gray-900">{roleStats.active}</p>
                <p className="text-xs sm:text-sm text-gray-600">Active</p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-xl shadow-sm p-4 sm:p-6">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gray-100 rounded-lg flex items-center justify-center">
                <Lock className="w-5 h-5 sm:w-6 sm:h-6 text-gray-600" />
              </div>
              <div>
                <p className="text-lg sm:text-2xl font-bold text-gray-900">{roleStats.inactive}</p>
                <p className="text-xs sm:text-sm text-gray-600">Inactive</p>
              </div>
            </div>
          </div>
        </div>

        {/* Filters and Search */}
        <div className="bg-white rounded-xl shadow-sm p-4 sm:p-6">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Search users..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 w-full lg:w-80 text-sm sm:text-base"
              />
            </div>
            <div className="flex flex-wrap items-center gap-2 sm:gap-3">
              <Filter className="w-5 h-5 text-gray-400" />
              <select
                value={filterRole}
                onChange={(e) => setFilterRole(e.target.value)}
                className="border border-gray-300 rounded-lg px-2 sm:px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-xs sm:text-sm"
              >
                <option value="all">All Roles</option>
                <option value="admin">Admin</option>
                <option value="program_officer">Program Officer</option>
                <option value="deputy_manager">Deputy Manager</option>
                <option value="student">Student</option>
              </select>
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="border border-gray-300 rounded-lg px-2 sm:px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-xs sm:text-sm"
              >
                <option value="all">All Status</option>
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
              </select>
            </div>
          </div>
        </div>

        {/* Users Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4 sm:gap-6">
          {filteredUsers.map((userProfile) => (
            <div key={userProfile.id} className="bg-white rounded-xl shadow-sm hover:shadow-md transition-shadow p-4 sm:p-6">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center space-x-3">
                  <div className="w-12 h-12 sm:w-16 sm:h-16 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full flex items-center justify-center">
                    <span className="text-white font-semibold text-sm sm:text-lg">
                      {userProfile.firstName.charAt(0)}{userProfile.lastName.charAt(0)}
                    </span>
                  </div>
                  <div className="min-w-0 flex-1">
                    <h3 className="font-semibold text-gray-900 text-sm sm:text-base truncate">{userProfile.name}</h3>
                    <p className="text-xs sm:text-sm text-gray-600 truncate">{userProfile.department}</p>
                    <div className="flex items-center space-x-2 mt-1">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getRoleColor(userProfile.role)}`}>
                        {userProfile.role.replace('_', ' ')}
                      </span>
                    </div>
                  </div>
                </div>
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(userProfile.isActive)}`}>
                  {userProfile.isActive ? 'Active' : 'Inactive'}
                </span>
              </div>

              <div className="space-y-2 mb-4">
                <div className="flex items-center space-x-2 text-xs sm:text-sm text-gray-600">
                  <Mail className="w-3 h-3 sm:w-4 sm:h-4" />
                  <span className="truncate">{userProfile.email}</span>
                </div>
                {userProfile.phoneNumber && (
                  <div className="flex items-center space-x-2 text-xs sm:text-sm text-gray-600">
                    <Phone className="w-3 h-3 sm:w-4 sm:h-4" />
                    <span>{userProfile.phoneNumber}</span>
                  </div>
                )}
                {userProfile.address && (
                  <div className="flex items-center space-x-2 text-xs sm:text-sm text-gray-600">
                    <MapPin className="w-3 h-3 sm:w-4 sm:h-4" />
                    <span className="truncate">{userProfile.address}</span>
                  </div>
                )}
                <div className="flex items-center space-x-2 text-xs sm:text-sm text-gray-600">
                  <Calendar className="w-3 h-3 sm:w-4 sm:h-4" />
                  <span>Last login: {formatLastLogin(userProfile.lastLogin)}</span>
                </div>
              </div>

              <div className="bg-gray-50 rounded-lg p-3 mb-4">
                <div className="text-xs sm:text-sm">
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-gray-600">Permissions:</span>
                    <span className="font-medium text-gray-900">{userProfile.permissions.length}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Created:</span>
                    <span className="font-medium text-gray-900">{new Date(userProfile.createdDate).toLocaleDateString()}</span>
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                <div className="text-xs text-gray-500">
                  ID: {userProfile.id}
                </div>
                <div className="flex items-center space-x-2">
                  <button 
                    onClick={() => setSelectedUser(userProfile)}
                    className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg"
                  >
                    <Eye className="w-4 h-4" />
                  </button>
                  <button className="p-2 text-gray-400 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg">
                    <Edit className="w-4 h-4" />
                  </button>
                  <button className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg">
                    <Trash2 className="w-4 h-4" />
                  </button>
                  <button className="p-2 text-gray-400 hover:text-purple-600 hover:bg-purple-50 rounded-lg">
                    {userProfile.isActive ? <Lock className="w-4 h-4" /> : <Unlock className="w-4 h-4" />}
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {filteredUsers.length === 0 && (
          <div className="text-center py-12">
            <Users className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600">No users found matching your criteria.</p>
          </div>
        )}

        {/* User Detail Modal */}
        {selectedUser && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
              <div className="p-6 border-b border-gray-200">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold text-gray-900">User Details</h3>
                  <button 
                    onClick={() => setSelectedUser(null)}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    ×
                  </button>
                </div>
              </div>
              <div className="p-6 space-y-6">
                <div className="flex items-center space-x-4">
                  <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full flex items-center justify-center">
                    <span className="text-white font-semibold text-2xl">
                      {selectedUser.firstName.charAt(0)}{selectedUser.lastName.charAt(0)}
                    </span>
                  </div>
                  <div>
                    <h4 className="text-xl font-semibold text-gray-900">{selectedUser.name}</h4>
                    <p className="text-gray-600">{selectedUser.email}</p>
                    <div className="flex items-center space-x-2 mt-2">
                      <span className={`px-3 py-1 rounded-full text-sm font-medium ${getRoleColor(selectedUser.role)}`}>
                        {selectedUser.role.replace('_', ' ')}
                      </span>
                      <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(selectedUser.isActive)}`}>
                        {selectedUser.isActive ? 'Active' : 'Inactive'}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h5 className="font-medium text-gray-900 mb-3">Personal Information</h5>
                    <div className="space-y-2 text-sm">
                      <div><span className="text-gray-600">Phone:</span> {selectedUser.phoneNumber || 'Not provided'}</div>
                      <div><span className="text-gray-600">Address:</span> {selectedUser.address || 'Not provided'}</div>
                      <div><span className="text-gray-600">Date of Birth:</span> {selectedUser.dateOfBirth ? new Date(selectedUser.dateOfBirth).toLocaleDateString() : 'Not provided'}</div>
                      <div><span className="text-gray-600">Department:</span> {selectedUser.department}</div>
                    </div>
                  </div>

                  <div>
                    <h5 className="font-medium text-gray-900 mb-3">Emergency Contact</h5>
                    {selectedUser.emergencyContact ? (
                      <div className="space-y-2 text-sm">
                        <div><span className="text-gray-600">Name:</span> {selectedUser.emergencyContact.name}</div>
                        <div><span className="text-gray-600">Phone:</span> {selectedUser.emergencyContact.phone}</div>
                        <div><span className="text-gray-600">Relationship:</span> {selectedUser.emergencyContact.relationship}</div>
                      </div>
                    ) : (
                      <p className="text-sm text-gray-500">No emergency contact provided</p>
                    )}
                  </div>
                </div>

                <div>
                  <h5 className="font-medium text-gray-900 mb-3">System Information</h5>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                    <div><span className="text-gray-600">User ID:</span> {selectedUser.id}</div>
                    <div><span className="text-gray-600">Created:</span> {new Date(selectedUser.createdDate).toLocaleDateString()}</div>
                    <div><span className="text-gray-600">Last Updated:</span> {new Date(selectedUser.updatedDate).toLocaleDateString()}</div>
                    <div><span className="text-gray-600">Last Login:</span> {formatLastLogin(selectedUser.lastLogin)}</div>
                  </div>
                </div>

                <div>
                  <h5 className="font-medium text-gray-900 mb-3">Permissions ({selectedUser.permissions.length})</h5>
                  <div className="flex flex-wrap gap-2">
                    {selectedUser.permissions.map((permission, index) => (
                      <span key={index} className="px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-xs">
                        {permission}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default UserManagement;