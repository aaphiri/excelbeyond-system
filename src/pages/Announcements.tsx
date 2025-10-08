import React, { useState } from 'react';
import { 
  Megaphone, 
  Plus, 
  Search, 
  Filter,
  Bell,
  AlertTriangle,
  Info,
  Calendar,
  User,
  Eye,
  Edit,
  Trash2,
  Pin,
  Clock
} from 'lucide-react';
import { User as UserType, Announcement } from '../types';

interface AnnouncementsProps {
  user: UserType;
}

const Announcements: React.FC<AnnouncementsProps> = ({ user }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('all');
  const [filterPriority, setFilterPriority] = useState('all');

  // Mock announcements data
  const announcements: Announcement[] = [
    {
      id: '1',
      title: 'New Scholarship Opportunities Available',
      content: 'We are excited to announce new scholarship opportunities for outstanding students in Engineering and Medical programs. Applications are now open for the 2024-2025 academic year. Eligible students must maintain a GPA of 3.5 or higher and demonstrate financial need. The scholarship covers full tuition, accommodation, and a monthly stipend. Application deadline is March 31st, 2024.',
      type: 'general',
      priority: 'high',
      targetAudience: 'students',
      author: 'John Mwanza',
      createdDate: '2024-03-01',
      expiryDate: '2024-03-31',
      isActive: true,
      attachments: ['scholarship_application_form.pdf', 'eligibility_criteria.pdf'],
      readBy: ['1', '2', '3']
    },
    {
      id: '2',
      title: 'System Maintenance Scheduled',
      content: 'ExcelHub will undergo scheduled maintenance on March 15th, 2024, from 2:00 AM to 6:00 AM. During this time, the system will be temporarily unavailable. We apologize for any inconvenience and appreciate your patience.',
      type: 'urgent',
      priority: 'urgent',
      targetAudience: 'all',
      author: 'Sarah Banda',
      createdDate: '2024-03-05',
      expiryDate: '2024-03-16',
      isActive: true,
      readBy: ['1', '4', '5']
    },
    {
      id: '3',
      title: 'March Allowance Processing Update',
      content: 'All March allowance applications have been processed and approved. Payments will be disbursed to student accounts by March 10th, 2024. Students who have not received their payments by March 12th should contact their assigned program officer immediately.',
      type: 'financial',
      priority: 'medium',
      targetAudience: 'students',
      author: 'Michael Phiri',
      createdDate: '2024-03-08',
      isActive: true,
      readBy: ['2', '3', '4', '5']
    },
    {
      id: '4',
      title: 'Academic Performance Review Meeting',
      content: 'All program officers are required to attend the quarterly academic performance review meeting scheduled for March 20th, 2024, at 10:00 AM in the main conference room. Please bring updated student progress reports and be prepared to discuss any challenges or concerns.',
      type: 'academic',
      priority: 'high',
      targetAudience: 'officers',
      author: 'John Mwanza',
      createdDate: '2024-03-10',
      expiryDate: '2024-03-20',
      isActive: true,
      readBy: ['6', '7']
    },
    {
      id: '5',
      title: 'New Library Resources Added',
      content: 'We have added over 200 new digital resources to our student library, including e-books, audiobooks, and video lectures covering various academic subjects. Students can now access these resources through the Library section of ExcelHub.',
      type: 'general',
      priority: 'low',
      targetAudience: 'students',
      author: 'Sarah Banda',
      createdDate: '2024-03-12',
      isActive: true,
      readBy: ['1', '2', '3', '4']
    }
  ];

  const filteredAnnouncements = announcements.filter(announcement => {
    const matchesSearch = announcement.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         announcement.content.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         announcement.author.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesType = filterType === 'all' || announcement.type === filterType;
    const matchesPriority = filterPriority === 'all' || announcement.priority === filterPriority;
    
    return matchesSearch && matchesType && matchesPriority && announcement.isActive;
  });

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'urgent': return <AlertTriangle className="w-5 h-5" />;
      case 'academic': return <Calendar className="w-5 h-5" />;
      case 'financial': return <Info className="w-5 h-5" />;
      case 'event': return <Calendar className="w-5 h-5" />;
      default: return <Bell className="w-5 h-5" />;
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'urgent': return 'bg-red-100 text-red-600';
      case 'academic': return 'bg-blue-100 text-blue-600';
      case 'financial': return 'bg-green-100 text-green-600';
      case 'event': return 'bg-purple-100 text-purple-600';
      default: return 'bg-gray-100 text-gray-600';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'low': return 'bg-green-100 text-green-800 border-green-200';
      case 'medium': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'high': return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'urgent': return 'bg-red-100 text-red-800 border-red-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const isExpiringSoon = (expiryDate?: string) => {
    if (!expiryDate) return false;
    const expiry = new Date(expiryDate);
    const now = new Date();
    const diffTime = expiry.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays <= 3 && diffDays > 0;
  };

  const typeStats = {
    general: announcements.filter(a => a.type === 'general' && a.isActive).length,
    urgent: announcements.filter(a => a.type === 'urgent' && a.isActive).length,
    academic: announcements.filter(a => a.type === 'academic' && a.isActive).length,
    financial: announcements.filter(a => a.type === 'financial' && a.isActive).length,
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute top-20 right-10 w-40 h-40 bg-blue-600 rounded-full animate-pulse"></div>
        <div className="absolute bottom-1/4 left-10 w-32 h-32 bg-indigo-600 rounded-full animate-bounce" style={{ animationDuration: '4s' }}></div>
        <div className="absolute top-1/2 right-1/3 w-24 h-24 bg-blue-400 rounded-full animate-ping"></div>
      </div>

      <div className="relative z-10 space-y-4 sm:space-y-6 p-4 sm:p-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
              <Megaphone className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <h1 className="text-xl sm:text-2xl font-bold text-gray-900">Announcements</h1>
              <p className="text-sm sm:text-base text-gray-600">Stay updated with important information</p>
            </div>
          </div>
          {(user.role === 'admin' || user.role === 'program_officer') && (
            <button className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 mt-4 sm:mt-0">
              <Plus className="w-4 h-4" />
              <span className="hidden sm:inline">New Announcement</span>
            </button>
          )}
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-6">
          <div className="bg-white rounded-xl shadow-sm p-4 sm:p-6">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gray-100 rounded-lg flex items-center justify-center">
                <Bell className="w-5 h-5 sm:w-6 sm:h-6 text-gray-600" />
              </div>
              <div>
                <p className="text-lg sm:text-2xl font-bold text-gray-900">{typeStats.general}</p>
                <p className="text-xs sm:text-sm text-gray-600">General</p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-xl shadow-sm p-4 sm:p-6">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 sm:w-12 sm:h-12 bg-red-100 rounded-lg flex items-center justify-center">
                <AlertTriangle className="w-5 h-5 sm:w-6 sm:h-6 text-red-600" />
              </div>
              <div>
                <p className="text-lg sm:text-2xl font-bold text-gray-900">{typeStats.urgent}</p>
                <p className="text-xs sm:text-sm text-gray-600">Urgent</p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-xl shadow-sm p-4 sm:p-6">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 sm:w-12 sm:h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <Calendar className="w-5 h-5 sm:w-6 sm:h-6 text-blue-600" />
              </div>
              <div>
                <p className="text-lg sm:text-2xl font-bold text-gray-900">{typeStats.academic}</p>
                <p className="text-xs sm:text-sm text-gray-600">Academic</p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-xl shadow-sm p-4 sm:p-6">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 sm:w-12 sm:h-12 bg-green-100 rounded-lg flex items-center justify-center">
                <Info className="w-5 h-5 sm:w-6 sm:h-6 text-green-600" />
              </div>
              <div>
                <p className="text-lg sm:text-2xl font-bold text-gray-900">{typeStats.financial}</p>
                <p className="text-xs sm:text-sm text-gray-600">Financial</p>
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
                placeholder="Search announcements..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 w-full lg:w-80 text-sm sm:text-base"
              />
            </div>
            <div className="flex flex-wrap items-center gap-2 sm:gap-3">
              <Filter className="w-5 h-5 text-gray-400" />
              <select
                value={filterType}
                onChange={(e) => setFilterType(e.target.value)}
                className="border border-gray-300 rounded-lg px-2 sm:px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-xs sm:text-sm"
              >
                <option value="all">All Types</option>
                <option value="general">General</option>
                <option value="urgent">Urgent</option>
                <option value="academic">Academic</option>
                <option value="financial">Financial</option>
                <option value="event">Event</option>
              </select>
              <select
                value={filterPriority}
                onChange={(e) => setFilterPriority(e.target.value)}
                className="border border-gray-300 rounded-lg px-2 sm:px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-xs sm:text-sm"
              >
                <option value="all">All Priority</option>
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
                <option value="urgent">Urgent</option>
              </select>
            </div>
          </div>
        </div>

        {/* Announcements List */}
        <div className="space-y-4 sm:space-y-6">
          {filteredAnnouncements.map((announcement) => (
            <div key={announcement.id} className="bg-white rounded-xl shadow-sm hover:shadow-md transition-shadow p-4 sm:p-6">
              <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between mb-4">
                <div className="flex items-start space-x-3 mb-3 sm:mb-0">
                  <div className={`w-10 h-10 sm:w-12 sm:h-12 rounded-lg flex items-center justify-center ${getTypeColor(announcement.type)}`}>
                    {getTypeIcon(announcement.type)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center space-x-2 mb-1">
                      <h3 className="text-base sm:text-lg font-semibold text-gray-900">{announcement.title}</h3>
                      {announcement.priority === 'urgent' && (
                        <Pin className="w-4 h-4 text-red-500" />
                      )}
                      {isExpiringSoon(announcement.expiryDate) && (
                        <span className="px-2 py-1 bg-yellow-100 text-yellow-800 text-xs rounded-full">
                          Expiring Soon
                        </span>
                      )}
                    </div>
                    <div className="flex flex-wrap items-center gap-2 text-xs sm:text-sm text-gray-600">
                      <div className="flex items-center space-x-1">
                        <User className="w-3 h-3 sm:w-4 sm:h-4" />
                        <span>{announcement.author}</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <Clock className="w-3 h-3 sm:w-4 sm:h-4" />
                        <span>{new Date(announcement.createdDate).toLocaleDateString()}</span>
                      </div>
                      {announcement.expiryDate && (
                        <div className="flex items-center space-x-1">
                          <Calendar className="w-3 h-3 sm:w-4 sm:h-4" />
                          <span>Expires: {new Date(announcement.expiryDate).toLocaleDateString()}</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <span className={`px-3 py-1 rounded-full text-xs font-medium border ${getPriorityColor(announcement.priority)}`}>
                    {announcement.priority.charAt(0).toUpperCase() + announcement.priority.slice(1)}
                  </span>
                  <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">
                    {announcement.targetAudience}
                  </span>
                </div>
              </div>

              <div className="mb-4">
                <p className="text-sm sm:text-base text-gray-700 leading-relaxed">
                  {announcement.content.length > 200 ? 
                    `${announcement.content.substring(0, 200)}...` : 
                    announcement.content
                  }
                </p>
              </div>

              {announcement.attachments && announcement.attachments.length > 0 && (
                <div className="mb-4">
                  <p className="text-xs sm:text-sm font-medium text-gray-700 mb-2">Attachments:</p>
                  <div className="flex flex-wrap gap-2">
                    {announcement.attachments.map((attachment, index) => (
                      <span key={index} className="inline-flex items-center space-x-1 px-2 py-1 bg-gray-100 text-gray-600 rounded-lg text-xs">
                        <Eye className="w-3 h-3" />
                        <span>{attachment}</span>
                      </span>
                    ))}
                  </div>
                </div>
              )}

              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between pt-4 border-t border-gray-100">
                <div className="text-xs sm:text-sm text-gray-500 mb-2 sm:mb-0">
                  Read by {announcement.readBy.length} people
                </div>
                <div className="flex items-center space-x-2">
                  <button className="flex items-center space-x-1 px-3 py-1 text-xs sm:text-sm text-blue-600 hover:text-blue-700 hover:bg-blue-50 rounded-lg">
                    <Eye className="w-3 h-3 sm:w-4 sm:h-4" />
                    <span>Read More</span>
                  </button>
                  {(user.role === 'admin' || announcement.author === user.name) && (
                    <>
                      <button className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg">
                        <Edit className="w-3 h-3 sm:w-4 sm:h-4" />
                      </button>
                      <button className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg">
                        <Trash2 className="w-3 h-3 sm:w-4 sm:h-4" />
                      </button>
                    </>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>

        {filteredAnnouncements.length === 0 && (
          <div className="text-center py-12">
            <Megaphone className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600">No announcements found matching your criteria.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Announcements;