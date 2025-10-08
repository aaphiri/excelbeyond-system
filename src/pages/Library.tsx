import React, { useState } from 'react';
import { 
  BookOpen, 
  Search, 
  Filter,
  Download,
  Play,
  Star,
  Clock,
  User,
  Tag,
  Volume2,
  FileText,
  Video,
  Headphones,
  Eye,
  Heart
} from 'lucide-react';
import { User as UserType, LibraryResource } from '../types';

interface LibraryProps {
  user: UserType;
}

const Library: React.FC<LibraryProps> = ({ user }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('all');
  const [filterCategory, setFilterCategory] = useState('all');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  // Mock library data
  const resources: LibraryResource[] = [
    {
      id: '1',
      title: 'Engineering Mathematics Fundamentals',
      description: 'Comprehensive guide to mathematical concepts essential for engineering students.',
      type: 'book',
      category: 'academic',
      author: 'Dr. James Mwanza',
      thumbnailUrl: 'https://images.pexels.com/photos/159711/books-bookstore-book-reading-159711.jpeg?auto=compress&cs=tinysrgb&w=400',
      resourceUrl: '#',
      uploadedBy: 'Sarah Banda',
      uploadedDate: '2024-02-15',
      downloads: 245,
      rating: 4.8,
      tags: ['mathematics', 'engineering', 'fundamentals']
    },
    {
      id: '2',
      title: 'Leadership Skills for African Youth',
      description: 'Inspiring audiobook about developing leadership qualities in the African context.',
      type: 'audiobook',
      category: 'personal_development',
      author: 'Grace Mutale',
      duration: '4h 32m',
      thumbnailUrl: 'https://images.pexels.com/photos/3184291/pexels-photo-3184291.jpeg?auto=compress&cs=tinysrgb&w=400',
      resourceUrl: '#',
      uploadedBy: 'Michael Phiri',
      uploadedDate: '2024-02-20',
      downloads: 189,
      rating: 4.9,
      tags: ['leadership', 'youth', 'africa', 'development']
    },
    {
      id: '3',
      title: 'Computer Science Fundamentals',
      description: 'Video lecture series covering basic computer science concepts and programming.',
      type: 'video',
      category: 'academic',
      author: 'Prof. David Banda',
      duration: '12h 45m',
      thumbnailUrl: 'https://images.pexels.com/photos/574071/pexels-photo-574071.jpeg?auto=compress&cs=tinysrgb&w=400',
      resourceUrl: '#',
      uploadedBy: 'Sarah Banda',
      uploadedDate: '2024-03-01',
      downloads: 156,
      rating: 4.7,
      tags: ['computer science', 'programming', 'fundamentals']
    },
    {
      id: '4',
      title: 'Career Success Stories',
      description: 'Podcast series featuring successful African professionals sharing their journey.',
      type: 'podcast',
      category: 'career',
      author: 'Family Legacy Team',
      duration: '45m per episode',
      thumbnailUrl: 'https://images.pexels.com/photos/7130560/pexels-photo-7130560.jpeg?auto=compress&cs=tinysrgb&w=400',
      resourceUrl: '#',
      uploadedBy: 'John Mwanza',
      uploadedDate: '2024-03-05',
      downloads: 298,
      rating: 4.6,
      tags: ['career', 'success', 'interviews', 'inspiration']
    },
    {
      id: '5',
      title: 'Financial Literacy for Students',
      description: 'Essential guide to managing finances during university and beyond.',
      type: 'book',
      category: 'life_skills',
      author: 'Mary Tembo',
      thumbnailUrl: 'https://images.pexels.com/photos/3943716/pexels-photo-3943716.jpeg?auto=compress&cs=tinysrgb&w=400',
      resourceUrl: '#',
      uploadedBy: 'Sarah Banda',
      uploadedDate: '2024-02-28',
      downloads: 167,
      rating: 4.5,
      tags: ['finance', 'budgeting', 'students', 'money management']
    },
    {
      id: '6',
      title: 'African History and Culture',
      description: 'Comprehensive video documentary about African heritage and cultural diversity.',
      type: 'video',
      category: 'entertainment',
      author: 'Cultural Heritage Foundation',
      duration: '2h 15m',
      thumbnailUrl: 'https://images.pexels.com/photos/6077326/pexels-photo-6077326.jpeg?auto=compress&cs=tinysrgb&w=400',
      resourceUrl: '#',
      uploadedBy: 'Michael Phiri',
      uploadedDate: '2024-03-03',
      downloads: 134,
      rating: 4.8,
      tags: ['history', 'culture', 'africa', 'heritage']
    }
  ];

  const filteredResources = resources.filter(resource => {
    const matchesSearch = resource.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         resource.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         resource.author?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         resource.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()));
    
    const matchesType = filterType === 'all' || resource.type === filterType;
    const matchesCategory = filterCategory === 'all' || resource.category === filterCategory;
    
    return matchesSearch && matchesType && matchesCategory;
  });

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'book': return <FileText className="w-5 h-5" />;
      case 'audiobook': return <Volume2 className="w-5 h-5" />;
      case 'video': return <Video className="w-5 h-5" />;
      case 'podcast': return <Headphones className="w-5 h-5" />;
      default: return <BookOpen className="w-5 h-5" />;
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'book': return 'bg-blue-100 text-blue-600';
      case 'audiobook': return 'bg-green-100 text-green-600';
      case 'video': return 'bg-purple-100 text-purple-600';
      case 'podcast': return 'bg-orange-100 text-orange-600';
      default: return 'bg-gray-100 text-gray-600';
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'academic': return 'bg-blue-100 text-blue-800';
      case 'personal_development': return 'bg-green-100 text-green-800';
      case 'career': return 'bg-purple-100 text-purple-800';
      case 'life_skills': return 'bg-yellow-100 text-yellow-800';
      case 'entertainment': return 'bg-pink-100 text-pink-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const typeStats = {
    book: resources.filter(r => r.type === 'book').length,
    audiobook: resources.filter(r => r.type === 'audiobook').length,
    video: resources.filter(r => r.type === 'video').length,
    podcast: resources.filter(r => r.type === 'podcast').length,
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-white to-teal-50">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute top-10 left-10 w-32 h-32 bg-emerald-600 rounded-full animate-pulse"></div>
        <div className="absolute top-1/3 right-20 w-24 h-24 bg-teal-600 rounded-full animate-bounce" style={{ animationDuration: '3s' }}></div>
        <div className="absolute bottom-20 left-1/4 w-20 h-20 bg-emerald-400 rounded-full animate-ping"></div>
      </div>

      <div className="relative z-10 space-y-4 sm:space-y-6 p-4 sm:p-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-emerald-100 rounded-lg flex items-center justify-center">
              <BookOpen className="w-6 h-6 text-emerald-600" />
            </div>
            <div>
              <h1 className="text-xl sm:text-2xl font-bold text-gray-900">Students Library</h1>
              <p className="text-sm sm:text-base text-gray-600">Access books, audiobooks, videos and podcasts</p>
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
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-6">
          <div className="bg-white rounded-xl shadow-sm p-4 sm:p-6">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 sm:w-12 sm:h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <FileText className="w-5 h-5 sm:w-6 sm:h-6 text-blue-600" />
              </div>
              <div>
                <p className="text-lg sm:text-2xl font-bold text-gray-900">{typeStats.book}</p>
                <p className="text-xs sm:text-sm text-gray-600">Books</p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-xl shadow-sm p-4 sm:p-6">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 sm:w-12 sm:h-12 bg-green-100 rounded-lg flex items-center justify-center">
                <Volume2 className="w-5 h-5 sm:w-6 sm:h-6 text-green-600" />
              </div>
              <div>
                <p className="text-lg sm:text-2xl font-bold text-gray-900">{typeStats.audiobook}</p>
                <p className="text-xs sm:text-sm text-gray-600">Audiobooks</p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-xl shadow-sm p-4 sm:p-6">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 sm:w-12 sm:h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                <Video className="w-5 h-5 sm:w-6 sm:h-6 text-purple-600" />
              </div>
              <div>
                <p className="text-lg sm:text-2xl font-bold text-gray-900">{typeStats.video}</p>
                <p className="text-xs sm:text-sm text-gray-600">Videos</p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-xl shadow-sm p-4 sm:p-6">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 sm:w-12 sm:h-12 bg-orange-100 rounded-lg flex items-center justify-center">
                <Headphones className="w-5 h-5 sm:w-6 sm:h-6 text-orange-600" />
              </div>
              <div>
                <p className="text-lg sm:text-2xl font-bold text-gray-900">{typeStats.podcast}</p>
                <p className="text-xs sm:text-sm text-gray-600">Podcasts</p>
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
                placeholder="Search library resources..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 w-full lg:w-80 text-sm sm:text-base"
              />
            </div>
            <div className="flex flex-wrap items-center gap-2 sm:gap-3">
              <Filter className="w-5 h-5 text-gray-400" />
              <select
                value={filterType}
                onChange={(e) => setFilterType(e.target.value)}
                className="border border-gray-300 rounded-lg px-2 sm:px-3 py-2 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 text-xs sm:text-sm"
              >
                <option value="all">All Types</option>
                <option value="book">Books</option>
                <option value="audiobook">Audiobooks</option>
                <option value="video">Videos</option>
                <option value="podcast">Podcasts</option>
              </select>
              <select
                value={filterCategory}
                onChange={(e) => setFilterCategory(e.target.value)}
                className="border border-gray-300 rounded-lg px-2 sm:px-3 py-2 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 text-xs sm:text-sm"
              >
                <option value="all">All Categories</option>
                <option value="academic">Academic</option>
                <option value="personal_development">Personal Development</option>
                <option value="career">Career</option>
                <option value="life_skills">Life Skills</option>
                <option value="entertainment">Entertainment</option>
              </select>
            </div>
          </div>
        </div>

        {/* Resources Grid/List */}
        {viewMode === 'grid' ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
            {filteredResources.map((resource) => (
              <div key={resource.id} className="bg-white rounded-xl shadow-sm hover:shadow-md transition-all duration-300 overflow-hidden group">
                <div className="relative">
                  <img 
                    src={resource.thumbnailUrl} 
                    alt={resource.title}
                    className="w-full h-32 sm:h-40 object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  <div className="absolute top-2 right-2">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium flex items-center space-x-1 ${getTypeColor(resource.type)}`}>
                      {getTypeIcon(resource.type)}
                      <span className="capitalize hidden sm:inline">{resource.type}</span>
                    </span>
                  </div>
                  <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-20 transition-all duration-300 flex items-center justify-center">
                    <button className="opacity-0 group-hover:opacity-100 transition-opacity duration-300 bg-white rounded-full p-2 sm:p-3">
                      {resource.type === 'video' || resource.type === 'audiobook' || resource.type === 'podcast' ? 
                        <Play className="w-4 h-4 sm:w-5 sm:h-5 text-emerald-600" /> : 
                        <Eye className="w-4 h-4 sm:w-5 sm:h-5 text-emerald-600" />
                      }
                    </button>
                  </div>
                </div>
                
                <div className="p-4 sm:p-6">
                  <div className="flex items-start justify-between mb-2">
                    <h3 className="font-semibold text-gray-900 text-sm sm:text-base line-clamp-2">{resource.title}</h3>
                    <button className="text-gray-400 hover:text-red-500 transition-colors">
                      <Heart className="w-4 h-4" />
                    </button>
                  </div>
                  
                  <p className="text-xs sm:text-sm text-gray-600 mb-3 line-clamp-2">{resource.description}</p>
                  
                  <div className="space-y-2 mb-4">
                    {resource.author && (
                      <div className="flex items-center space-x-2 text-xs sm:text-sm text-gray-600">
                        <User className="w-3 h-3 sm:w-4 sm:h-4" />
                        <span>{resource.author}</span>
                      </div>
                    )}
                    {resource.duration && (
                      <div className="flex items-center space-x-2 text-xs sm:text-sm text-gray-600">
                        <Clock className="w-3 h-3 sm:w-4 sm:h-4" />
                        <span>{resource.duration}</span>
                      </div>
                    )}
                    <div className="flex items-center space-x-2 text-xs sm:text-sm text-gray-600">
                      <Download className="w-3 h-3 sm:w-4 sm:h-4" />
                      <span>{resource.downloads} downloads</span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center space-x-1">
                      {[...Array(5)].map((_, i) => (
                        <Star 
                          key={i} 
                          className={`w-3 h-3 sm:w-4 sm:h-4 ${i < Math.floor(resource.rating) ? 'text-yellow-400 fill-current' : 'text-gray-300'}`} 
                        />
                      ))}
                      <span className="text-xs sm:text-sm text-gray-600 ml-1">{resource.rating}</span>
                    </div>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getCategoryColor(resource.category)}`}>
                      {resource.category.replace('_', ' ')}
                    </span>
                  </div>

                  <div className="flex flex-wrap gap-1 mb-4">
                    {resource.tags.slice(0, 3).map((tag, index) => (
                      <span key={index} className="inline-flex items-center space-x-1 px-2 py-1 bg-gray-100 text-gray-600 rounded-full text-xs">
                        <Tag className="w-2 h-2 sm:w-3 sm:h-3" />
                        <span>{tag}</span>
                      </span>
                    ))}
                  </div>

                  <button className="w-full bg-emerald-600 text-white py-2 px-4 rounded-lg hover:bg-emerald-700 transition-colors text-sm sm:text-base font-medium">
                    {resource.type === 'video' || resource.type === 'audiobook' || resource.type === 'podcast' ? 'Play Now' : 'Read Now'}
                  </button>
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
                    <th className="text-left px-4 sm:px-6 py-4 font-medium text-gray-900 text-sm sm:text-base">Resource</th>
                    <th className="text-left px-4 sm:px-6 py-4 font-medium text-gray-900 text-sm sm:text-base hidden sm:table-cell">Type</th>
                    <th className="text-left px-4 sm:px-6 py-4 font-medium text-gray-900 text-sm sm:text-base hidden md:table-cell">Category</th>
                    <th className="text-left px-4 sm:px-6 py-4 font-medium text-gray-900 text-sm sm:text-base hidden lg:table-cell">Author</th>
                    <th className="text-left px-4 sm:px-6 py-4 font-medium text-gray-900 text-sm sm:text-base">Rating</th>
                    <th className="text-left px-4 sm:px-6 py-4 font-medium text-gray-900 text-sm sm:text-base">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {filteredResources.map((resource) => (
                    <tr key={resource.id} className="hover:bg-gray-50">
                      <td className="px-4 sm:px-6 py-4">
                        <div className="flex items-center space-x-3">
                          <img 
                            src={resource.thumbnailUrl} 
                            alt={resource.title}
                            className="w-12 h-12 sm:w-16 sm:h-16 object-cover rounded-lg"
                          />
                          <div className="min-w-0 flex-1">
                            <p className="font-medium text-gray-900 text-sm sm:text-base truncate">{resource.title}</p>
                            <p className="text-xs sm:text-sm text-gray-500 line-clamp-1">{resource.description}</p>
                            <div className="flex items-center space-x-2 mt-1 sm:hidden">
                              <span className={`px-2 py-1 rounded-full text-xs font-medium ${getTypeColor(resource.type)}`}>
                                {resource.type}
                              </span>
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 sm:px-6 py-4 hidden sm:table-cell">
                        <span className={`inline-flex items-center space-x-2 px-3 py-1 rounded-full text-sm font-medium ${getTypeColor(resource.type)}`}>
                          {getTypeIcon(resource.type)}
                          <span className="capitalize">{resource.type}</span>
                        </span>
                      </td>
                      <td className="px-4 sm:px-6 py-4 hidden md:table-cell">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getCategoryColor(resource.category)}`}>
                          {resource.category.replace('_', ' ')}
                        </span>
                      </td>
                      <td className="px-4 sm:px-6 py-4 text-sm text-gray-900 hidden lg:table-cell">{resource.author}</td>
                      <td className="px-4 sm:px-6 py-4">
                        <div className="flex items-center space-x-1">
                          <Star className="w-4 h-4 text-yellow-400 fill-current" />
                          <span className="text-sm text-gray-900">{resource.rating}</span>
                        </div>
                      </td>
                      <td className="px-4 sm:px-6 py-4">
                        <div className="flex items-center space-x-2">
                          <button className="p-2 text-gray-400 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg">
                            {resource.type === 'video' || resource.type === 'audiobook' || resource.type === 'podcast' ? 
                              <Play className="w-4 h-4" /> : 
                              <Eye className="w-4 h-4" />
                            }
                          </button>
                          <button className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg">
                            <Download className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {filteredResources.length === 0 && (
          <div className="text-center py-12">
            <BookOpen className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600">No resources found matching your criteria.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Library;