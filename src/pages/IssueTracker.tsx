import React, { useState } from 'react';
import { 
  AlertTriangle, 
  Plus, 
  Search, 
  Filter,
  Clock,
  CheckCircle,
  XCircle,
  User,
  MessageSquare,
  Flag,
  Eye
} from 'lucide-react';
import { User as UserType, Issue } from '../types';

interface IssueTrackerProps {
  user: UserType;
}

const IssueTracker: React.FC<IssueTrackerProps> = ({ user }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterCategory, setFilterCategory] = useState('all');
  const [filterPriority, setFilterPriority] = useState('all');

  // Mock issue data
  const issues: Issue[] = [
    {
      id: '1',
      title: 'Accommodation Problem at UNZA',
      description: 'Student facing issues with accommodation facilities. Electricity problems in dormitory Block A.',
      studentId: '1',
      studentName: 'Grace Tembo',
      reportedBy: 'Sarah Banda',
      assignedTo: 'Michael Phiri',
      priority: 'high',
      status: 'open',
      category: 'accommodation',
      createdDate: '2024-03-01',
      comments: [
        {
          id: '1',
          text: 'Contacted university administration about the electrical issues.',
          author: 'Michael Phiri',
          createdDate: '2024-03-02'
        },
        {
          id: '2',
          text: 'University maintenance team scheduled for tomorrow.',
          author: 'Sarah Banda',
          createdDate: '2024-03-03'
        }
      ]
    },
    {
      id: '2',
      title: 'Late Allowance Payment',
      description: 'Student has not received February allowance payment. Bank transfer seems to have failed.',
      studentId: '2',
      studentName: 'John Banda',
      reportedBy: 'John Banda',
      assignedTo: 'Sarah Banda',
      priority: 'urgent',
      status: 'in_progress',
      category: 'financial',
      createdDate: '2024-02-28',
      comments: [
        {
          id: '3',
          text: 'Checking with finance department about the transfer.',
          author: 'Sarah Banda',
          createdDate: '2024-03-01'
        }
      ]
    },
    {
      id: '3',
      title: 'Academic Performance Concern',
      description: 'Student struggling with Mathematics courses. Requested for additional tutoring support.',
      studentId: '3',
      studentName: 'Mercy Mwanza',
      reportedBy: 'Mercy Mwanza',
      assignedTo: 'Sarah Banda',
      priority: 'medium',
      status: 'resolved',
      category: 'academic',
      createdDate: '2024-02-25',
      resolvedDate: '2024-03-05',
      comments: [
        {
          id: '4',
          text: 'Arranged tutoring sessions with senior student.',
          author: 'Sarah Banda',
          createdDate: '2024-02-26'
        },
        {
          id: '5',
          text: 'Student showing improvement in recent tests.',
          author: 'Sarah Banda',
          createdDate: '2024-03-05'
        }
      ]
    },
    {
      id: '4',
      title: 'Health Insurance Issue',
      description: 'Student health insurance card not working at university clinic.',
      studentId: '4',
      studentName: 'David Phiri',
      reportedBy: 'David Phiri',
      priority: 'medium',
      status: 'open',
      category: 'health',
      createdDate: '2024-03-04',
      comments: []
    },
    {
      id: '5',
      title: 'Transportation Strike Impact',
      description: 'Student unable to attend classes due to public transport strike in Kitwe.',
      studentId: '2',
      studentName: 'John Banda',
      reportedBy: 'John Banda',
      assignedTo: 'Michael Phiri',
      priority: 'low',
      status: 'closed',
      category: 'personal',
      createdDate: '2024-02-20',
      resolvedDate: '2024-02-22',
      comments: [
        {
          id: '6',
          text: 'Strike resolved. Student back to normal schedule.',
          author: 'Michael Phiri',
          createdDate: '2024-02-22'
        }
      ]
    },
  ];

  const filteredIssues = issues.filter(issue => {
    const matchesSearch = issue.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         issue.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         issue.studentName.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = filterStatus === 'all' || issue.status === filterStatus;
    const matchesCategory = filterCategory === 'all' || issue.category === filterCategory;
    const matchesPriority = filterPriority === 'all' || issue.priority === filterPriority;
    
    return matchesSearch && matchesStatus && matchesCategory && matchesPriority;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'open': return 'bg-red-100 text-red-800 border-red-200';
      case 'in_progress': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'resolved': return 'bg-green-100 text-green-800 border-green-200';
      case 'closed': return 'bg-gray-100 text-gray-800 border-gray-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'low': return 'bg-green-100 text-green-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'high': return 'bg-orange-100 text-orange-800';
      case 'urgent': return 'bg-red-100 text-red-800';
      case 'critical': return 'bg-purple-100 text-purple-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'academic': return '📚';
      case 'financial': return '💰';
      case 'health': return '🏥';
      case 'accommodation': return '🏠';
      case 'personal': return '👤';
      default: return '❓';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'open': return <AlertTriangle className="w-4 h-4" />;
      case 'in_progress': return <Clock className="w-4 h-4" />;
      case 'resolved': return <CheckCircle className="w-4 h-4" />;
      case 'closed': return <XCircle className="w-4 h-4" />;
      default: return <AlertTriangle className="w-4 h-4" />;
    }
  };

  const statusStats = {
    open: issues.filter(i => i.status === 'open').length,
    in_progress: issues.filter(i => i.status === 'in_progress').length,
    resolved: issues.filter(i => i.status === 'resolved').length,
    closed: issues.filter(i => i.status === 'closed').length,
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-emerald-100 rounded-lg flex items-center justify-center">
            <AlertTriangle className="w-6 h-6 text-emerald-600" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Issue Tracker</h1>
            <p className="text-gray-600">Track and resolve student issues</p>
          </div>
        </div>
        <button className="flex items-center space-x-2 px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 mt-4 sm:mt-0">
          <Plus className="w-4 h-4" />
          <span>Report Issue</span>
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white rounded-xl shadow-sm p-6">
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center">
              <AlertTriangle className="w-6 h-6 text-red-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{statusStats.open}</p>
              <p className="text-sm text-gray-600">Open Issues</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl shadow-sm p-6">
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
              <Clock className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{statusStats.in_progress}</p>
              <p className="text-sm text-gray-600">In Progress</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl shadow-sm p-6">
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
              <CheckCircle className="w-6 h-6 text-green-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{statusStats.resolved}</p>
              <p className="text-sm text-gray-600">Resolved</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl shadow-sm p-6">
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center">
              <XCircle className="w-6 h-6 text-gray-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{statusStats.closed}</p>
              <p className="text-sm text-gray-600">Closed</p>
            </div>
          </div>
        </div>
      </div>

      {/* Filters and Search */}
      <div className="bg-white rounded-xl shadow-sm p-6">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Search issues..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 w-full lg:w-80"
            />
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <Filter className="w-5 h-5 text-gray-400" />
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
            >
              <option value="all">All Status</option>
              <option value="open">Open</option>
              <option value="in_progress">In Progress</option>
              <option value="resolved">Resolved</option>
              <option value="closed">Closed</option>
            </select>
            <select
              value={filterCategory}
              onChange={(e) => setFilterCategory(e.target.value)}
              className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
            >
              <option value="all">All Categories</option>
              <option value="academic">Academic</option>
              <option value="financial">Financial</option>
              <option value="health">Health</option>
              <option value="accommodation">Accommodation</option>
              <option value="personal">Personal</option>
              <option value="other">Other</option>
            </select>
            <select
              value={filterPriority}
              onChange={(e) => setFilterPriority(e.target.value)}
              className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
            >
              <option value="all">All Priority</option>
              <option value="low">Low</option>
              <option value="medium">Medium</option>
              <option value="high">High</option>
              <option value="urgent">Urgent</option>
              <option value="critical">Critical</option>
            </select>
          </div>
        </div>
      </div>

      {/* Issues Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {filteredIssues.map((issue) => (
          <div key={issue.id} className="bg-white rounded-xl shadow-sm hover:shadow-md transition-shadow p-6">
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-start space-x-3">
                <div className="text-2xl">{getCategoryIcon(issue.category)}</div>
                <div className="flex-1">
                  <h3 className="font-semibold text-gray-900 mb-1">{issue.title}</h3>
                  <p className="text-sm text-gray-600 line-clamp-2">{issue.description}</p>
                </div>
              </div>
              <div className="flex flex-col items-end space-y-2">
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${getPriorityColor(issue.priority)}`}>
                  {issue.priority.charAt(0).toUpperCase() + issue.priority.slice(1)}
                </span>
                <span className={`flex items-center space-x-1 px-3 py-1 rounded-full text-xs font-medium border ${getStatusColor(issue.status)}`}>
                  {getStatusIcon(issue.status)}
                  <span className="capitalize">{issue.status.replace('_', ' ')}</span>
                </span>
              </div>
            </div>

            <div className="space-y-3 mb-4">
              <div className="flex items-center space-x-2 text-sm text-gray-600">
                <User className="w-4 h-4" />
                <span>Student: <span className="font-medium text-gray-900">{issue.studentName}</span></span>
              </div>
              <div className="flex items-center space-x-2 text-sm text-gray-600">
                <Flag className="w-4 h-4" />
                <span>Reported by: <span className="font-medium text-gray-900">{issue.reportedBy}</span></span>
              </div>
              {issue.assignedTo && (
                <div className="flex items-center space-x-2 text-sm text-gray-600">
                  <User className="w-4 h-4" />
                  <span>Assigned to: <span className="font-medium text-gray-900">{issue.assignedTo}</span></span>
                </div>
              )}
              <div className="flex items-center space-x-2 text-sm text-gray-600">
                <Clock className="w-4 h-4" />
                <span>Created: {new Date(issue.createdDate).toLocaleDateString()}</span>
                {issue.resolvedDate && (
                  <span className="text-green-600">• Resolved: {new Date(issue.resolvedDate).toLocaleDateString()}</span>
                )}
              </div>
            </div>

            <div className="flex items-center justify-between pt-4 border-t border-gray-100">
              <div className="flex items-center space-x-2 text-sm text-gray-600">
                <MessageSquare className="w-4 h-4" />
                <span>{issue.comments.length} comment{issue.comments.length !== 1 ? 's' : ''}</span>
              </div>
              <button className="flex items-center space-x-2 px-3 py-1 text-sm text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50 rounded-lg">
                <Eye className="w-4 h-4" />
                <span>View Details</span>
              </button>
            </div>
          </div>
        ))}
      </div>

      {filteredIssues.length === 0 && (
        <div className="text-center py-12">
          <AlertTriangle className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-600">No issues found matching your criteria.</p>
        </div>
      )}
    </div>
  );
};

export default IssueTracker;