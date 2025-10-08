import React, { useState, useEffect } from 'react';
import { Users, Plus, Search, Filter, Eye, Edit, Trash2, GraduationCap, MapPin, Phone, Mail, Award } from 'lucide-react';
import { User as UserType } from '../types';
import { supabase } from '../lib/supabase';

interface StudentManagementProps {
  user?: UserType;
}

interface Student {
  id: string;
  full_name: string;
  first_name: string;
  last_name: string;
  email?: string;
  contact_number?: string;
  community?: string;
  program_level: 'university' | 'diploma' | 'launch_year';
  program_status: 'enrolled' | 'graduated' | 'discharged' | 'suspended' | 'transferred';
  academic_standing: 'excellent' | 'good' | 'probation' | 'warning';
  institution_name?: string;
  current_program?: string;
  assigned_officer_id?: string;
  assigned_officer_name?: string;
  overall_gpa?: number;
  profile_picture?: string;
  created_at: string;
}

const StudentManagement: React.FC<StudentManagementProps> = ({ user }) => {
  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState<'all' | 'university' | 'diploma' | 'launch_year'>('all');
  const [filterStatus, setFilterStatus] = useState('all');
  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
  const [showDetailModal, setShowDetailModal] = useState(false);

  const [formData, setFormData] = useState({
    first_name: '',
    last_name: '',
    email: '',
    contact_number: '',
    community: '',
    program_level: 'university' as 'university' | 'diploma' | 'launch_year',
    program_status: 'enrolled' as 'enrolled' | 'graduated' | 'discharged' | 'suspended' | 'transferred',
    academic_standing: 'good' as 'excellent' | 'good' | 'probation' | 'warning',
    institution_name: '',
    current_program: '',
    assigned_officer_id: '',
    assigned_officer_name: ''
  });

  useEffect(() => {
    fetchStudents();
  }, [user]);

  const fetchStudents = async () => {
    setLoading(true);
    try {
      let query = supabase.from('students').select('*');

      if (user?.role === 'program_officer') {
        query = query.eq('assigned_officer_id', user.id);
      }

      const { data, error } = await query.order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching students:', error);
        alert('Failed to load students');
      } else {
        setStudents(data || []);
      }
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddStudent = async (e: React.FormEvent) => {
    e.preventDefault();

    const studentData = {
      ...formData,
      full_name: `${formData.first_name} ${formData.last_name}`,
      assigned_officer_id: formData.assigned_officer_id || user?.id,
      assigned_officer_name: formData.assigned_officer_name || user?.name
    };

    const { error } = await supabase.from('students').insert([studentData]);

    if (error) {
      console.error('Error adding student:', error);
      alert('Failed to add student');
      return;
    }

    setShowAddModal(false);
    setFormData({
      first_name: '',
      last_name: '',
      email: '',
      contact_number: '',
      community: '',
      program_level: 'university',
      program_status: 'enrolled',
      academic_standing: 'good',
      institution_name: '',
      current_program: '',
      assigned_officer_id: '',
      assigned_officer_name: ''
    });
    fetchStudents();
  };

  const handleDeleteStudent = async (id: string) => {
    if (!confirm('Are you sure you want to delete this student?')) return;

    const { error } = await supabase.from('students').delete().eq('id', id);

    if (error) {
      console.error('Error deleting student:', error);
      alert('Failed to delete student');
      return;
    }

    fetchStudents();
  };

  const filteredStudents = students.filter(student => {
    const matchesSearch = student.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         student.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         student.institution_name?.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesCategory = filterCategory === 'all' || student.program_level === filterCategory;
    const matchesStatus = filterStatus === 'all' || student.program_status === filterStatus;

    return matchesSearch && matchesCategory && matchesStatus;
  });

  const getCategoryStats = () => {
    return {
      all: students.length,
      university: students.filter(s => s.program_level === 'university').length,
      diploma: students.filter(s => s.program_level === 'diploma').length,
      launch_year: students.filter(s => s.program_level === 'launch_year').length
    };
  };

  const stats = getCategoryStats();

  const getProgramLevelBadge = (level: string) => {
    const styles = {
      university: 'bg-blue-100 text-blue-700',
      diploma: 'bg-green-100 text-green-700',
      launch_year: 'bg-orange-100 text-orange-700'
    };
    const labels = {
      university: 'University',
      diploma: 'College/Diploma',
      launch_year: 'Launch Year'
    };
    return (
      <span className={`px-2 py-1 text-xs rounded-full ${styles[level as keyof typeof styles]}`}>
        {labels[level as keyof typeof labels]}
      </span>
    );
  };

  const getStatusBadge = (status: string) => {
    const styles = {
      enrolled: 'bg-green-100 text-green-700',
      graduated: 'bg-blue-100 text-blue-700',
      discharged: 'bg-gray-100 text-gray-700',
      suspended: 'bg-red-100 text-red-700',
      transferred: 'bg-yellow-100 text-yellow-700'
    };
    return (
      <span className={`px-2 py-1 text-xs rounded-full ${styles[status as keyof typeof styles] || 'bg-gray-100 text-gray-700'}`}>
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </span>
    );
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-slate-800 mb-2">Student Management</h1>
        <p className="text-slate-600">
          {user?.role === 'program_officer'
            ? 'Manage your assigned students'
            : 'Manage all students in the program'}
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <button
          onClick={() => setFilterCategory('all')}
          className={`p-4 rounded-xl border-2 transition-all ${
            filterCategory === 'all'
              ? 'border-blue-500 bg-blue-50'
              : 'border-slate-200 bg-white hover:border-blue-300'
          }`}
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-600">All Students</p>
              <p className="text-2xl font-bold text-slate-800">{stats.all}</p>
            </div>
            <Users className="w-8 h-8 text-blue-600" />
          </div>
        </button>

        <button
          onClick={() => setFilterCategory('university')}
          className={`p-4 rounded-xl border-2 transition-all ${
            filterCategory === 'university'
              ? 'border-blue-500 bg-blue-50'
              : 'border-slate-200 bg-white hover:border-blue-300'
          }`}
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-600">University</p>
              <p className="text-2xl font-bold text-slate-800">{stats.university}</p>
            </div>
            <GraduationCap className="w-8 h-8 text-blue-600" />
          </div>
        </button>

        <button
          onClick={() => setFilterCategory('diploma')}
          className={`p-4 rounded-xl border-2 transition-all ${
            filterCategory === 'diploma'
              ? 'border-green-500 bg-green-50'
              : 'border-slate-200 bg-white hover:border-green-300'
          }`}
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-600">College/Diploma</p>
              <p className="text-2xl font-bold text-slate-800">{stats.diploma}</p>
            </div>
            <Award className="w-8 h-8 text-green-600" />
          </div>
        </button>

        <button
          onClick={() => setFilterCategory('launch_year')}
          className={`p-4 rounded-xl border-2 transition-all ${
            filterCategory === 'launch_year'
              ? 'border-orange-500 bg-orange-50'
              : 'border-slate-200 bg-white hover:border-orange-300'
          }`}
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-600">Launch Year</p>
              <p className="text-2xl font-bold text-slate-800">{stats.launch_year}</p>
            </div>
            <Award className="w-8 h-8 text-orange-600" />
          </div>
        </button>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-slate-200 mb-6">
        <div className="p-4 border-b border-slate-200">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Search students..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">All Statuses</option>
              <option value="enrolled">Enrolled</option>
              <option value="graduated">Graduated</option>
              <option value="suspended">Suspended</option>
              <option value="discharged">Discharged</option>
              <option value="transferred">Transferred</option>
            </select>

            <button
              onClick={() => setShowAddModal(true)}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors whitespace-nowrap"
            >
              <Plus className="w-5 h-5" />
              <span>Add Student</span>
            </button>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-slate-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                  Student
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                  Category
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                  Program
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                  Officer
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-slate-200">
              {filteredStudents.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-slate-500">
                    No students found
                  </td>
                </tr>
              ) : (
                filteredStudents.map((student) => (
                  <tr key={student.id} className="hover:bg-slate-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="w-10 h-10 rounded-full bg-slate-200 flex items-center justify-center">
                          <span className="text-slate-600 font-semibold">
                            {student.first_name?.charAt(0)}{student.last_name?.charAt(0)}
                          </span>
                        </div>
                        <div className="ml-3">
                          <div className="text-sm font-medium text-slate-800">{student.full_name}</div>
                          <div className="text-sm text-slate-500">{student.email}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {getProgramLevelBadge(student.program_level)}
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-slate-800">{student.current_program || 'Not specified'}</div>
                      <div className="text-sm text-slate-500">{student.institution_name}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {getStatusBadge(student.program_status)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-slate-800">{student.assigned_officer_name || 'Unassigned'}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <button
                        onClick={() => {
                          setSelectedStudent(student);
                          setShowDetailModal(true);
                        }}
                        className="text-blue-600 hover:text-blue-900 mr-3"
                      >
                        <Eye className="w-5 h-5" />
                      </button>
                      {(user?.role === 'admin' || user?.role === 'deputy_manager' ||
                        (user?.role === 'program_officer' && student.assigned_officer_id === user?.id)) && (
                        <button
                          onClick={() => handleDeleteStudent(student.id)}
                          className="text-red-600 hover:text-red-900"
                        >
                          <Trash2 className="w-5 h-5" />
                        </button>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {showAddModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-slate-200">
              <h2 className="text-2xl font-bold text-slate-800">Add New Student</h2>
            </div>

            <form onSubmit={handleAddStudent} className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">First Name *</label>
                  <input
                    type="text"
                    required
                    value={formData.first_name}
                    onChange={(e) => setFormData({ ...formData, first_name: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Last Name *</label>
                  <input
                    type="text"
                    required
                    value={formData.last_name}
                    onChange={(e) => setFormData({ ...formData, last_name: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Email</label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Contact Number</label>
                  <input
                    type="tel"
                    value={formData.contact_number}
                    onChange={(e) => setFormData({ ...formData, contact_number: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Community</label>
                  <input
                    type="text"
                    value={formData.community}
                    onChange={(e) => setFormData({ ...formData, community: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Program Category *</label>
                  <select
                    required
                    value={formData.program_level}
                    onChange={(e) => setFormData({ ...formData, program_level: e.target.value as any })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="university">University</option>
                    <option value="diploma">College/Diploma</option>
                    <option value="launch_year">Launch Year</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Institution Name</label>
                  <input
                    type="text"
                    value={formData.institution_name}
                    onChange={(e) => setFormData({ ...formData, institution_name: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Current Program</label>
                  <input
                    type="text"
                    value={formData.current_program}
                    onChange={(e) => setFormData({ ...formData, current_program: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Program Status</label>
                  <select
                    value={formData.program_status}
                    onChange={(e) => setFormData({ ...formData, program_status: e.target.value as any })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="enrolled">Enrolled</option>
                    <option value="graduated">Graduated</option>
                    <option value="suspended">Suspended</option>
                    <option value="discharged">Discharged</option>
                    <option value="transferred">Transferred</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Academic Standing</label>
                  <select
                    value={formData.academic_standing}
                    onChange={(e) => setFormData({ ...formData, academic_standing: e.target.value as any })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="excellent">Excellent</option>
                    <option value="good">Good</option>
                    <option value="probation">Probation</option>
                    <option value="warning">Warning</option>
                  </select>
                </div>
              </div>

              <div className="flex gap-3">
                <button
                  type="submit"
                  className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Add Student
                </button>
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-6 py-2 bg-slate-200 text-slate-700 rounded-lg hover:bg-slate-300 transition-colors"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {showDetailModal && selectedStudent && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-3xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-slate-200 flex justify-between items-center">
              <h2 className="text-2xl font-bold text-slate-800">Student Details</h2>
              <button
                onClick={() => setShowDetailModal(false)}
                className="text-slate-400 hover:text-slate-600"
              >
                <span className="text-2xl">&times;</span>
              </button>
            </div>

            <div className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h3 className="text-sm font-medium text-slate-500 mb-1">Full Name</h3>
                  <p className="text-slate-800">{selectedStudent.full_name}</p>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-slate-500 mb-1">Email</h3>
                  <p className="text-slate-800">{selectedStudent.email || 'Not provided'}</p>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-slate-500 mb-1">Contact</h3>
                  <p className="text-slate-800">{selectedStudent.contact_number || 'Not provided'}</p>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-slate-500 mb-1">Community</h3>
                  <p className="text-slate-800">{selectedStudent.community || 'Not provided'}</p>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-slate-500 mb-1">Program Category</h3>
                  <div>{getProgramLevelBadge(selectedStudent.program_level)}</div>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-slate-500 mb-1">Status</h3>
                  <div>{getStatusBadge(selectedStudent.program_status)}</div>
                </div>
                <div className="md:col-span-2">
                  <h3 className="text-sm font-medium text-slate-500 mb-1">Current Program</h3>
                  <p className="text-slate-800">{selectedStudent.current_program || 'Not specified'}</p>
                </div>
                <div className="md:col-span-2">
                  <h3 className="text-sm font-medium text-slate-500 mb-1">Institution</h3>
                  <p className="text-slate-800">{selectedStudent.institution_name || 'Not specified'}</p>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-slate-500 mb-1">Assigned Officer</h3>
                  <p className="text-slate-800">{selectedStudent.assigned_officer_name || 'Unassigned'}</p>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-slate-500 mb-1">Academic Standing</h3>
                  <p className="text-slate-800 capitalize">{selectedStudent.academic_standing}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default StudentManagement;
