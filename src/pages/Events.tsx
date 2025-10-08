import React, { useState } from 'react';
import { 
  Calendar, 
  Plus, 
  Search, 
  Filter,
  MapPin,
  Clock,
  Users,
  Video,
  Star,
  Share2,
  BookmarkPlus,
  Eye,
  Edit,
  Trash2,
  UserPlus
} from 'lucide-react';
import { User as UserType, Event } from '../types';

interface EventsProps {
  user: UserType;
}

const Events: React.FC<EventsProps> = ({ user }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  // Mock events data
  const events: Event[] = [
    {
      id: '1',
      title: 'Excel Beyond Leadership Summit 2024',
      description: 'Join us for an inspiring leadership summit featuring successful African entrepreneurs, business leaders, and change-makers. This full-day event will include keynote speeches, panel discussions, networking sessions, and workshops designed to empower the next generation of African leaders.',
      type: 'seminar',
      date: '2024-04-15',
      time: '09:00 AM',
      location: 'Lusaka International Conference Centre',
      isVirtual: false,
      organizer: 'Family Legacy Team',
      maxAttendees: 500,
      currentAttendees: 287,
      registrationDeadline: '2024-04-10',
      status: 'upcoming',
      imageUrl: 'https://images.pexels.com/photos/1181406/pexels-photo-1181406.jpeg?auto=compress&cs=tinysrgb&w=800',
      attendees: ['1', '2', '3', '4', '5'],
      requirements: ['Student ID', 'Registration confirmation', 'Business attire'],
      tags: ['leadership', 'networking', 'entrepreneurship', 'career development']
    },
    {
      id: '2',
      title: 'Digital Skills Workshop Series',
      description: 'A comprehensive 3-day workshop series covering essential digital skills including Microsoft Office Suite, Google Workspace, basic programming concepts, and digital marketing fundamentals. Perfect for students looking to enhance their employability.',
      type: 'workshop',
      date: '2024-03-25',
      time: '02:00 PM',
      location: 'Virtual Event',
      isVirtual: true,
      virtualLink: 'https://zoom.us/j/123456789',
      organizer: 'Sarah Banda',
      maxAttendees: 100,
      currentAttendees: 78,
      registrationDeadline: '2024-03-20',
      status: 'upcoming',
      imageUrl: 'https://images.pexels.com/photos/3184465/pexels-photo-3184465.jpeg?auto=compress&cs=tinysrgb&w=800',
      attendees: ['2', '3', '4'],
      requirements: ['Laptop/Computer', 'Stable internet connection', 'Notebook for taking notes'],
      tags: ['digital skills', 'technology', 'career', 'online learning']
    },
    {
      id: '3',
      title: 'University of Zambia Graduation Ceremony',
      description: 'Celebrating the achievements of our sponsored students graduating from the University of Zambia. Join us as we honor their hard work, dedication, and academic excellence. Family members and friends are welcome to attend.',
      type: 'graduation',
      date: '2024-05-20',
      time: '10:00 AM',
      location: 'University of Zambia Great Hall',
      isVirtual: false,
      organizer: 'John Mwanza',
      currentAttendees: 45,
      registrationDeadline: '2024-05-15',
      status: 'upcoming',
      imageUrl: 'https://images.pexels.com/photos/267885/pexels-photo-267885.jpeg?auto=compress&cs=tinysrgb&w=800',
      attendees: ['1', '3', '5'],
      requirements: ['Formal attire', 'Invitation card', 'Valid ID'],
      tags: ['graduation', 'celebration', 'achievement', 'university']
    },
    {
      id: '4',
      title: 'Career Fair and Networking Event',
      description: 'Connect with top employers, explore career opportunities, and build professional networks. This event features company booths, job interviews, career counseling sessions, and professional development workshops.',
      type: 'networking',
      date: '2024-04-08',
      time: '09:00 AM',
      location: 'Mulungushi International Conference Centre',
      isVirtual: false,
      organizer: 'Michael Phiri',
      maxAttendees: 300,
      currentAttendees: 156,
      registrationDeadline: '2024-04-05',
      status: 'upcoming',
      imageUrl: 'https://images.pexels.com/photos/1181533/pexels-photo-1181533.jpeg?auto=compress&cs=tinysrgb&w=800',
      attendees: ['1', '2', '4', '5'],
      requirements: ['CV/Resume', 'Professional attire', 'Portfolio (if applicable)'],
      tags: ['career', 'networking', 'jobs', 'professional development']
    },
    {
      id: '5',
      title: 'New Student Orientation Program',
      description: 'Welcome new Family Legacy sponsored students! This comprehensive orientation program covers program expectations, support services, academic resources, and introduces students to their program officers and peers.',
      type: 'orientation',
      date: '2024-02-15',
      time: '08:00 AM',
      location: 'Family Legacy Head Office',
      isVirtual: false,
      organizer: 'Sarah Banda',
      maxAttendees: 50,
      currentAttendees: 42,
      registrationDeadline: '2024-02-10',
      status: 'completed',
      imageUrl: 'https://images.pexels.com/photos/1181772/pexels-photo-1181772.jpeg?auto=compress&cs=tinysrgb&w=800',
      attendees: ['4', '5'],
      requirements: ['Student documents', 'Notebook', 'Pen'],
      tags: ['orientation', 'new students', 'introduction', 'program']
    },
    {
      id: '6',
      title: 'Excel Beyond Annual Gala Dinner',
      description: 'Join us for an elegant evening celebrating the achievements of our students, recognizing outstanding performers, and raising funds for future scholarships. The event features dinner, entertainment, awards ceremony, and guest speakers.',
      type: 'social',
      date: '2024-06-30',
      time: '06:00 PM',
      location: 'InterContinental Lusaka Hotel',
      isVirtual: false,
      organizer: 'John Mwanza',
      maxAttendees: 200,
      currentAttendees: 89,
      registrationDeadline: '2024-06-25',
      status: 'upcoming',
      imageUrl: 'https://images.pexels.com/photos/1181406/pexels-photo-1181406.jpeg?auto=compress&cs=tinysrgb&w=800',
      attendees: ['1', '2', '3'],
      requirements: ['Formal evening wear', 'Invitation', 'Valid ID'],
      tags: ['gala', 'celebration', 'awards', 'fundraising', 'networking']
    }
  ];

  const filteredEvents = events.filter(event => {
    const matchesSearch = event.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         event.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         event.location.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         event.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()));
    
    const matchesType = filterType === 'all' || event.type === filterType;
    const matchesStatus = filterStatus === 'all' || event.status === filterStatus;
    
    return matchesSearch && matchesType && matchesStatus;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'upcoming': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'ongoing': return 'bg-green-100 text-green-800 border-green-200';
      case 'completed': return 'bg-gray-100 text-gray-800 border-gray-200';
      case 'cancelled': return 'bg-red-100 text-red-800 border-red-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'workshop': return 'bg-purple-100 text-purple-800';
      case 'seminar': return 'bg-blue-100 text-blue-800';
      case 'networking': return 'bg-green-100 text-green-800';
      case 'graduation': return 'bg-yellow-100 text-yellow-800';
      case 'orientation': return 'bg-indigo-100 text-indigo-800';
      case 'social': return 'bg-pink-100 text-pink-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const isRegistrationOpen = (deadline: string) => {
    return new Date(deadline) > new Date();
  };

  const typeStats = {
    workshop: events.filter(e => e.type === 'workshop').length,
    seminar: events.filter(e => e.type === 'seminar').length,
    networking: events.filter(e => e.type === 'networking').length,
    graduation: events.filter(e => e.type === 'graduation').length,
    total: events.length,
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-pink-50">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute top-16 left-16 w-48 h-48 bg-purple-600 rounded-full animate-pulse"></div>
        <div className="absolute bottom-1/3 right-12 w-36 h-36 bg-pink-600 rounded-full animate-bounce" style={{ animationDuration: '5s' }}></div>
        <div className="absolute top-2/3 left-1/3 w-28 h-28 bg-purple-400 rounded-full animate-ping"></div>
      </div>

      <div className="relative z-10 space-y-4 sm:space-y-6 p-4 sm:p-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
              <Calendar className="w-6 h-6 text-purple-600" />
            </div>
            <div>
              <h1 className="text-xl sm:text-2xl font-bold text-gray-900">Excel Beyond Events</h1>
              <p className="text-sm sm:text-base text-gray-600">Discover and join amazing events</p>
            </div>
          </div>
          <div className="flex items-center space-x-2 mt-4 sm:mt-0">
            <div className="flex items-center bg-gray-100 rounded-lg p-1">
              <button
                onClick={() => setViewMode('grid')}
                className={`px-2 sm:px-3 py-1 rounded-md text-xs sm:text-sm font-medium transition-colors ${
                  viewMode === 'grid' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-600'
                }`}
              >
                Grid
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`px-2 sm:px-3 py-1 rounded-md text-xs sm:text-sm font-medium transition-colors ${
                  viewMode === 'list' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-600'
                }`}
              >
                List
              </button>
            </div>
            {(user.role === 'admin' || user.role === 'program_officer') && (
              <button className="flex items-center space-x-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700">
                <Plus className="w-4 h-4" />
                <span className="hidden sm:inline">Create Event</span>
              </button>
            )}
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-5 gap-3 sm:gap-6">
          <div className="bg-white rounded-xl shadow-sm p-4 sm:p-6">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 sm:w-12 sm:h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                <Calendar className="w-5 h-5 sm:w-6 sm:h-6 text-purple-600" />
              </div>
              <div>
                <p className="text-lg sm:text-2xl font-bold text-gray-900">{typeStats.workshop}</p>
                <p className="text-xs sm:text-sm text-gray-600">Workshops</p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-xl shadow-sm p-4 sm:p-6">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 sm:w-12 sm:h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <Users className="w-5 h-5 sm:w-6 sm:h-6 text-blue-600" />
              </div>
              <div>
                <p className="text-lg sm:text-2xl font-bold text-gray-900">{typeStats.seminar}</p>
                <p className="text-xs sm:text-sm text-gray-600">Seminars</p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-xl shadow-sm p-4 sm:p-6">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 sm:w-12 sm:h-12 bg-green-100 rounded-lg flex items-center justify-center">
                <Share2 className="w-5 h-5 sm:w-6 sm:h-6 text-green-600" />
              </div>
              <div>
                <p className="text-lg sm:text-2xl font-bold text-gray-900">{typeStats.networking}</p>
                <p className="text-xs sm:text-sm text-gray-600">Networking</p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-xl shadow-sm p-4 sm:p-6">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 sm:w-12 sm:h-12 bg-yellow-100 rounded-lg flex items-center justify-center">
                <Star className="w-5 h-5 sm:w-6 sm:h-6 text-yellow-600" />
              </div>
              <div>
                <p className="text-lg sm:text-2xl font-bold text-gray-900">{typeStats.graduation}</p>
                <p className="text-xs sm:text-sm text-gray-600">Graduations</p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-xl shadow-sm p-4 sm:p-6">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 sm:w-12 sm:h-12 bg-pink-100 rounded-lg flex items-center justify-center">
                <Calendar className="w-5 h-5 sm:w-6 sm:h-6 text-pink-600" />
              </div>
              <div>
                <p className="text-lg sm:text-2xl font-bold text-gray-900">{typeStats.total}</p>
                <p className="text-xs sm:text-sm text-gray-600">Total Events</p>
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
                placeholder="Search events..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 w-full lg:w-80 text-sm sm:text-base"
              />
            </div>
            <div className="flex flex-wrap items-center gap-2 sm:gap-3">
              <Filter className="w-5 h-5 text-gray-400" />
              <select
                value={filterType}
                onChange={(e) => setFilterType(e.target.value)}
                className="border border-gray-300 rounded-lg px-2 sm:px-3 py-2 focus:ring-2 focus:ring-purple-500 focus:border-purple-500 text-xs sm:text-sm"
              >
                <option value="all">All Types</option>
                <option value="workshop">Workshop</option>
                <option value="seminar">Seminar</option>
                <option value="networking">Networking</option>
                <option value="graduation">Graduation</option>
                <option value="orientation">Orientation</option>
                <option value="social">Social</option>
              </select>
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="border border-gray-300 rounded-lg px-2 sm:px-3 py-2 focus:ring-2 focus:ring-purple-500 focus:border-purple-500 text-xs sm:text-sm"
              >
                <option value="all">All Status</option>
                <option value="upcoming">Upcoming</option>
                <option value="ongoing">Ongoing</option>
                <option value="completed">Completed</option>
                <option value="cancelled">Cancelled</option>
              </select>
            </div>
          </div>
        </div>

        {/* Events Grid/List */}
        {viewMode === 'grid' ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
            {filteredEvents.map((event) => (
              <div key={event.id} className="bg-white rounded-xl shadow-sm hover:shadow-md transition-all duration-300 overflow-hidden group">
                <div className="relative">
                  <img 
                    src={event.imageUrl} 
                    alt={event.title}
                    className="w-full h-40 sm:h-48 object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  <div className="absolute top-3 left-3">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getTypeColor(event.type)}`}>
                      {event.type.charAt(0).toUpperCase() + event.type.slice(1)}
                    </span>
                  </div>
                  <div className="absolute top-3 right-3">
                    <span className={`px-3 py-1 rounded-full text-xs font-medium border ${getStatusColor(event.status)}`}>
                      {event.status.charAt(0).toUpperCase() + event.status.slice(1)}
                    </span>
                  </div>
                  <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-20 transition-all duration-300 flex items-center justify-center">
                    <button className="opacity-0 group-hover:opacity-100 transition-opacity duration-300 bg-white rounded-full p-2 sm:p-3">
                      <Eye className="w-4 h-4 sm:w-5 sm:h-5 text-purple-600" />
                    </button>
                  </div>
                </div>
                
                <div className="p-4 sm:p-6">
                  <h3 className="font-semibold text-gray-900 text-sm sm:text-base mb-2 line-clamp-2">{event.title}</h3>
                  <p className="text-xs sm:text-sm text-gray-600 mb-4 line-clamp-3">{event.description}</p>
                  
                  <div className="space-y-2 mb-4">
                    <div className="flex items-center space-x-2 text-xs sm:text-sm text-gray-600">
                      <Calendar className="w-3 h-3 sm:w-4 sm:h-4" />
                      <span>{new Date(event.date).toLocaleDateString()} at {event.time}</span>
                    </div>
                    <div className="flex items-center space-x-2 text-xs sm:text-sm text-gray-600">
                      {event.isVirtual ? <Video className="w-3 h-3 sm:w-4 sm:h-4" /> : <MapPin className="w-3 h-3 sm:w-4 sm:h-4" />}
                      <span className="truncate">{event.location}</span>
                    </div>
                    <div className="flex items-center space-x-2 text-xs sm:text-sm text-gray-600">
                      <Users className="w-3 h-3 sm:w-4 sm:h-4" />
                      <span>
                        {event.currentAttendees} attendees
                        {event.maxAttendees && ` / ${event.maxAttendees} max`}
                      </span>
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-1 mb-4">
                    {event.tags.slice(0, 3).map((tag, index) => (
                      <span key={index} className="px-2 py-1 bg-gray-100 text-gray-600 rounded-full text-xs">
                        #{tag}
                      </span>
                    ))}
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <button className="p-2 text-gray-400 hover:text-purple-600 hover:bg-purple-50 rounded-lg">
                        <BookmarkPlus className="w-4 h-4" />
                      </button>
                      <button className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg">
                        <Share2 className="w-4 h-4" />
                      </button>
                    </div>
                    {event.status === 'upcoming' && isRegistrationOpen(event.registrationDeadline) ? (
                      <button className="flex items-center space-x-1 px-3 py-1 bg-purple-600 text-white rounded-lg hover:bg-purple-700 text-xs sm:text-sm">
                        <UserPlus className="w-3 h-3 sm:w-4 sm:h-4" />
                        <span>Register</span>
                      </button>
                    ) : (
                      <button className="px-3 py-1 bg-gray-100 text-gray-600 rounded-lg text-xs sm:text-sm cursor-not-allowed">
                        {event.status === 'completed' ? 'Completed' : 'Registration Closed'}
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="bg-white rounded-xl shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="text-left px-4 sm:px-6 py-4 font-medium text-gray-900 text-sm sm:text-base">Event</th>
                    <th className="text-left px-4 sm:px-6 py-4 font-medium text-gray-900 text-sm sm:text-base hidden md:table-cell">Date & Time</th>
                    <th className="text-left px-4 sm:px-6 py-4 font-medium text-gray-900 text-sm sm:text-base hidden lg:table-cell">Location</th>
                    <th className="text-left px-4 sm:px-6 py-4 font-medium text-gray-900 text-sm sm:text-base">Status</th>
                    <th className="text-left px-4 sm:px-6 py-4 font-medium text-gray-900 text-sm sm:text-base">Attendees</th>
                    <th className="text-left px-4 sm:px-6 py-4 font-medium text-gray-900 text-sm sm:text-base">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {filteredEvents.map((event) => (
                    <tr key={event.id} className="hover:bg-gray-50">
                      <td className="px-4 sm:px-6 py-4">
                        <div className="flex items-center space-x-3">
                          <img 
                            src={event.imageUrl} 
                            alt={event.title}
                            className="w-12 h-12 sm:w-16 sm:h-16 object-cover rounded-lg"
                          />
                          <div className="min-w-0 flex-1">
                            <p className="font-medium text-gray-900 text-sm sm:text-base truncate">{event.title}</p>
                            <p className="text-xs sm:text-sm text-gray-500 line-clamp-1">{event.description}</p>
                            <span className={`inline-block px-2 py-1 rounded-full text-xs font-medium mt-1 ${getTypeColor(event.type)}`}>
                              {event.type}
                            </span>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 sm:px-6 py-4 text-sm text-gray-900 hidden md:table-cell">
                        <div>
                          <p>{new Date(event.date).toLocaleDateString()}</p>
                          <p className="text-gray-500">{event.time}</p>
                        </div>
                      </td>
                      <td className="px-4 sm:px-6 py-4 text-sm text-gray-900 hidden lg:table-cell">
                        <div className="flex items-center space-x-1">
                          {event.isVirtual ? <Video className="w-4 h-4" /> : <MapPin className="w-4 h-4" />}
                          <span className="truncate max-w-32">{event.location}</span>
                        </div>
                      </td>
                      <td className="px-4 sm:px-6 py-4">
                        <span className={`px-3 py-1 rounded-full text-xs font-medium border ${getStatusColor(event.status)}`}>
                          {event.status.charAt(0).toUpperCase() + event.status.slice(1)}
                        </span>
                      </td>
                      <td className="px-4 sm:px-6 py-4 text-sm text-gray-900">
                        <div className="flex items-center space-x-1">
                          <Users className="w-4 h-4" />
                          <span>{event.currentAttendees}</span>
                          {event.maxAttendees && <span className="text-gray-500">/{event.maxAttendees}</span>}
                        </div>
                      </td>
                      <td className="px-4 sm:px-6 py-4">
                        <div className="flex items-center space-x-2">
                          <button className="p-2 text-gray-400 hover:text-purple-600 hover:bg-purple-50 rounded-lg">
                            <Eye className="w-4 h-4" />
                          </button>
                          {event.status === 'upcoming' && isRegistrationOpen(event.registrationDeadline) && (
                            <button className="p-2 text-gray-400 hover:text-green-600 hover:bg-green-50 rounded-lg">
                              <UserPlus className="w-4 h-4" />
                            </button>
                          )}
                          {(user.role === 'admin' || event.organizer === user.name) && (
                            <>
                              <button className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg">
                                <Edit className="w-4 h-4" />
                              </button>
                              <button className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg">
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {filteredEvents.length === 0 && (
          <div className="text-center py-12">
            <Calendar className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600">No events found matching your criteria.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Events;