import React, { useState } from 'react';
import { 
  FileText, 
  Plus, 
  Search, 
  Filter,
  Home,
  UserX,
  Phone,
  Calendar,
  User,
  Eye,
  Edit,
  Download
} from 'lucide-react';
import { User as UserType, Form } from '../types';

interface FormsProps {
  user: UserType;
}

const Forms: React.FC<FormsProps> = ({ user }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');

  // Mock form data
  const forms: Form[] = [
    {
      id: '1',
      type: 'home_visit',
      studentId: '1',
      studentName: 'Grace Tembo',
      completedBy: 'Sarah Banda',
      completedDate: '2024-03-01',
      status: 'completed',
      data: {
        visitDate: '2024-02-28',
        location: 'Lusaka, Chilenje',
        familyPresent: ['Mother', 'Father', 'Sister'],
        homeCondition: 'Good',
        challenges: 'None significant',
        recommendations: 'Continue support'
      }
    },
    {
      id: '2',
      type: 'care_call',
      studentId: '2',
      studentName: 'John Banda',
      completedBy: 'Michael Phiri',
      completedDate: '2024-03-02',
      status: 'completed',
      data: {
        callDate: '2024-03-02',
        duration: '45 minutes',
        topics: ['Academic progress', 'Financial needs', 'Accommodation'],
        concerns: 'Struggling with mathematics',
        followUpRequired: true,
        followUpDate: '2024-03-16'
      }
    },
    {
      id: '3',
      type: 'discharge',
      studentId: '5',
      studentName: 'Sarah Mulenga',
      completedBy: 'Sarah Banda',
      completedDate: '2024-02-15',
      status: 'reviewed',
      data: {
        dischargeDate: '2024-02-10',
        reason: 'Graduation',
        finalGrade: 'Distinction',
        employmentStatus: 'Employed',
        employer: 'Zambia Environmental Management Agency',
        feedbackRating: 9,
        recommendations: 'Excellent performance throughout the program'
      }
    },
    {
      id: '4',
      type: 'home_visit',
      studentId: '3',
      studentName: 'Mercy Mwanza',
      completedBy: 'Sarah Banda',
      completedDate: '2024-03-03',
      status: 'draft',
      data: {
        visitDate: '2024-03-03',
        location: 'Lusaka, Kalingalinga',
        familyPresent: ['Mother', 'Grandmother'],
        homeCondition: 'Fair',
        challenges: 'Financial constraints',
        recommendations: 'Increase allowance review'
      }
    },
    {
      id: '5',
      type: 'care_call',
      studentId: '4',
      studentName: 'David Phiri',
      completedBy: 'Michael Phiri',
      completedDate: '2024-03-04',
      status: 'completed',
      data: {
        callDate: '2024-03-04',
        duration: '30 minutes',
        topics: ['Orientation', 'Program expectations', 'Support services'],
        concerns: 'None',
        followUpRequired: false
      }
    },
  ];

  const filteredForms = forms.filter(form => {
    const matchesSearch = form.studentName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         form.completedBy.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesType = filterType === 'all' || form.type === filterType;
    const matchesStatus = filterStatus === 'all' || form.status === filterStatus;
    
    return matchesSearch && matchesType && matchesStatus;
  });

  const getFormIcon = (type: string) => {
    switch (type) {
      case 'home_visit': return <Home className="w-5 h-5" />;
      case 'discharge': return <UserX className="w-5 h-5" />;
      case 'care_call': return <Phone className="w-5 h-5" />;
      default: return <FileText className="w-5 h-5" />;
    }
  };

  const getFormColor = (type: string) => {
    switch (type) {
      case 'home_visit': return 'bg-blue-100 text-blue-600';
      case 'discharge': return 'bg-red-100 text-red-600';
      case 'care_call': return 'bg-green-100 text-green-600';
      default: return 'bg-gray-100 text-gray-600';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'draft': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'completed': return 'bg-green-100 text-green-800 border-green-200';
      case 'reviewed': return 'bg-blue-100 text-blue-800 border-blue-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getFormTitle = (type: string) => {
    switch (type) {
      case 'home_visit': return 'Home Visit Form';
      case 'discharge': return 'Discharge Form';
      case 'care_call': return 'Care Call Form';
      default: return 'Form';
    }
  };

  const formStats = {
    home_visit: forms.filter(f => f.type === 'home_visit').length,
    discharge: forms.filter(f => f.type === 'discharge').length,
    care_call: forms.filter(f => f.type === 'care_call').length,
    total: forms.length,
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-emerald-100 rounded-lg flex items-center justify-center">
            <FileText className="w-6 h-6 text-emerald-600" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Forms Management</h1>
            <p className="text-gray-600">Manage student forms and documentation</p>
          </div>
        </div>
        <div className="flex items-center space-x-3 mt-4 sm:mt-0">
          <button className="flex items-center space-x-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50">
            <Download className="w-4 h-4" />
            <span className="hidden sm:inline">Export</span>
          </button>
          <button className="flex items-center space-x-2 px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700">
            <Plus className="w-4 h-4" />
            <span className="hidden sm:inline">New Form</span>
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white rounded-xl shadow-sm p-6">
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
              <Home className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{formStats.home_visit}</p>
              <p className="text-sm text-gray-600">Home Visits</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl shadow-sm p-6">
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
              <Phone className="w-6 h-6 text-green-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{formStats.care_call}</p>
              <p className="text-sm text-gray-600">Care Calls</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl shadow-sm p-6">
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center">
              <UserX className="w-6 h-6 text-red-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{formStats.discharge}</p>
              <p className="text-sm text-gray-600">Discharge Forms</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl shadow-sm p-6">
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 bg-emerald-100 rounded-lg flex items-center justify-center">
              <FileText className="w-6 h-6 text-emerald-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{formStats.total}</p>
              <p className="text-sm text-gray-600">Total Forms</p>
            </div>
          </div>
        </div>
      </div>

      {/* Filters and Search */}
      <div className="bg-white rounded-xl shadow-sm p-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Search forms..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 w-full sm:w-80"
            />
          </div>
          <div className="flex items-center space-x-3">
            <Filter className="w-5 h-5 text-gray-400" />
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
            >
              <option value="all">All Types</option>
              <option value="home_visit">Home Visit</option>
              <option value="care_call">Care Call</option>
              <option value="discharge">Discharge</option>
            </select>
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
            >
              <option value="all">All Status</option>
              <option value="draft">Draft</option>
              <option value="completed">Completed</option>
              <option value="reviewed">Reviewed</option>
            </select>
          </div>
        </div>
      </div>

      {/* Forms Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
        {filteredForms.map((form) => (
          <div key={form.id} className="bg-white rounded-xl shadow-sm hover:shadow-md transition-shadow p-6">
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center space-x-3">
                <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${getFormColor(form.type)}`}>
                  {getFormIcon(form.type)}
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900">{getFormTitle(form.type)}</h3>
                  <p className="text-sm text-gray-600">Form #{form.id}</p>
                </div>
              </div>
              <span className={`px-3 py-1 rounded-full text-xs font-medium border ${getStatusColor(form.status)}`}>
                {form.status.charAt(0).toUpperCase() + form.status.slice(1)}
              </span>
            </div>

            <div className="space-y-3 mb-4">
              <div className="flex items-center space-x-2 text-sm text-gray-600">
                <User className="w-4 h-4" />
                <span>Student: <span className="font-medium text-gray-900">{form.studentName}</span></span>
              </div>
              <div className="flex items-center space-x-2 text-sm text-gray-600">
                <User className="w-4 h-4" />
                <span>Completed by: <span className="font-medium text-gray-900">{form.completedBy}</span></span>
              </div>
              <div className="flex items-center space-x-2 text-sm text-gray-600">
                <Calendar className="w-4 h-4" />
                <span>Date: {new Date(form.completedDate).toLocaleDateString()}</span>
              </div>
            </div>

            {/* Form-specific details */}
            <div className="bg-gray-50 rounded-lg p-3 mb-4">
              <div className="text-sm space-y-1">
                {form.type === 'home_visit' && (
                  <>
                    <div><span className="text-gray-600">Location:</span> <span className="font-medium">{form.data.location}</span></div>
                    <div><span className="text-gray-600">Condition:</span> <span className="font-medium">{form.data.homeCondition}</span></div>
                  </>
                )}
                {form.type === 'care_call' && (
                  <>
                    <div><span className="text-gray-600">Duration:</span> <span className="font-medium">{form.data.duration}</span></div>
                    <div><span className="text-gray-600">Topics:</span> <span className="font-medium">{form.data.topics?.length || 0} items</span></div>
                  </>
                )}
                {form.type === 'discharge' && (
                  <>
                    <div><span className="text-gray-600">Reason:</span> <span className="font-medium">{form.data.reason}</span></div>
                    <div><span className="text-gray-600">Grade:</span> <span className="font-medium">{form.data.finalGrade}</span></div>
                  </>
                )}
              </div>
            </div>

            <div className="flex items-center justify-between pt-4 border-t border-gray-100">
              <div className="text-xs text-gray-500">
                Updated {new Date(form.completedDate).toLocaleDateString()}
              </div>
              <div className="flex items-center space-x-2">
                <button className="p-2 text-gray-400 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg">
                  <Eye className="w-4 h-4" />
                </button>
                <button className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg">
                  <Edit className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {filteredForms.length === 0 && (
        <div className="text-center py-12">
          <FileText className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-600">No forms found matching your criteria.</p>
        </div>
      )}
    </div>
  );
};

export default Forms;