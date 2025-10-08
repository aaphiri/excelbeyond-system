import React, { useState, useEffect } from 'react';
import { Users, Search, Plus, Eye, Edit, Trash2, User as UserIcon, Upload, X, Save } from 'lucide-react';
import { User as UserType } from '../types';
import { supabase } from '../lib/supabase';

interface StudentProfilesProps {
  user?: UserType;
}

interface StudentProfile {
  id: string;
  full_name: string;
  first_name: string;
  last_name: string;
  chl_number?: string;
  email?: string;
  contact_number?: string;
  community?: string;
  gender?: string;
  date_of_birth?: string;
  age?: number;
  nrc_number?: string;
  school_id_number?: string;
  guardian_full_name?: string;
  guardian_community?: string;
  guardian_contact_number?: string;
  guardian_relationship?: string;
  current_program?: string;
  program_level?: string;
  institution_name?: string;
  institution_location?: string;
  area_of_study?: string;
  program_length?: string;
  start_date?: string;
  expected_end_date?: string;
  overall_gpa?: number;
  assigned_officer_name?: string;
  accommodation_type?: string;
  accommodation_monthly_rent?: number;
  accommodation_payment_method?: string;
  accommodation_address?: string;
  accommodation_landlord_name?: string;
  accommodation_landlord_contact?: string;
  laptop_plan?: string;
  laptop_serial_number?: string;
  laptop_monthly_deduction?: number;
  laptop_inspection_date?: string;
  laptop_submission_date?: string;
  laptop_collection_date?: string;
  program_notes?: string;
  profile_photo_url?: string;
  assigned_officer_id?: string;
  created_at: string;
}

const StudentProfiles: React.FC<StudentProfilesProps> = ({ user }) => {
  const [students, setStudents] = useState<StudentProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingStudent, setEditingStudent] = useState<StudentProfile | null>(null);
  const [viewMode, setViewMode] = useState<'view' | 'edit'>('view');

  const emptyForm = {
    first_name: '',
    last_name: '',
    chl_number: '',
    email: '',
    contact_number: '',
    community: '',
    gender: 'male',
    date_of_birth: '',
    nrc_number: '',
    school_id_number: '',
    guardian_full_name: '',
    guardian_community: '',
    guardian_contact_number: '',
    guardian_relationship: '',
    current_program: '',
    program_level: 'university',
    institution_name: '',
    institution_location: '',
    area_of_study: '',
    program_length: '',
    start_date: '',
    expected_end_date: '',
    overall_gpa: 0,
    accommodation_type: 'institution_hostel',
    accommodation_monthly_rent: 0,
    accommodation_payment_method: '',
    accommodation_address: '',
    accommodation_landlord_name: '',
    accommodation_landlord_contact: '',
    laptop_plan: 'none',
    laptop_serial_number: '',
    laptop_monthly_deduction: 0,
    laptop_inspection_date: '',
    laptop_submission_date: '',
    laptop_collection_date: '',
    program_notes: '',
    profile_photo_url: ''
  };

  const [formData, setFormData] = useState(emptyForm);

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
      } else {
        setStudents(data || []);
      }
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddNew = () => {
    setEditingStudent(null);
    setFormData(emptyForm);
    setViewMode('edit');
    setShowModal(true);
  };

  const handleView = (student: StudentProfile) => {
    setEditingStudent(student);
    setViewMode('view');
    setShowModal(true);
  };

  const handleEdit = (student: StudentProfile) => {
    setEditingStudent(student);
    setFormData({
      first_name: student.first_name || '',
      last_name: student.last_name || '',
      chl_number: student.chl_number || '',
      email: student.email || '',
      contact_number: student.contact_number || '',
      community: student.community || '',
      gender: student.gender || 'male',
      date_of_birth: student.date_of_birth || '',
      nrc_number: student.nrc_number || '',
      school_id_number: student.school_id_number || '',
      guardian_full_name: student.guardian_full_name || '',
      guardian_community: student.guardian_community || '',
      guardian_contact_number: student.guardian_contact_number || '',
      guardian_relationship: student.guardian_relationship || '',
      current_program: student.current_program || '',
      program_level: student.program_level || 'university',
      institution_name: student.institution_name || '',
      institution_location: student.institution_location || '',
      area_of_study: student.area_of_study || '',
      program_length: student.program_length || '',
      start_date: student.start_date || '',
      expected_end_date: student.expected_end_date || '',
      overall_gpa: student.overall_gpa || 0,
      accommodation_type: student.accommodation_type || 'institution_hostel',
      accommodation_monthly_rent: student.accommodation_monthly_rent || 0,
      accommodation_payment_method: student.accommodation_payment_method || '',
      accommodation_address: student.accommodation_address || '',
      accommodation_landlord_name: student.accommodation_landlord_name || '',
      accommodation_landlord_contact: student.accommodation_landlord_contact || '',
      laptop_plan: student.laptop_plan || 'none',
      laptop_serial_number: student.laptop_serial_number || '',
      laptop_monthly_deduction: student.laptop_monthly_deduction || 0,
      laptop_inspection_date: student.laptop_inspection_date || '',
      laptop_submission_date: student.laptop_submission_date || '',
      laptop_collection_date: student.laptop_collection_date || '',
      program_notes: student.program_notes || '',
      profile_photo_url: student.profile_photo_url || ''
    });
    setViewMode('edit');
    setShowModal(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this student profile?')) return;

    const { error } = await supabase.from('students').delete().eq('id', id);

    if (error) {
      console.error('Error deleting student:', error);
      alert('Failed to delete student');
    } else {
      fetchStudents();
    }
  };

  const calculateAge = (dob: string) => {
    if (!dob) return 0;
    const today = new Date();
    const birthDate = new Date(dob);
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    return age;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const age = calculateAge(formData.date_of_birth);
    const studentData = {
      ...formData,
      full_name: `${formData.first_name} ${formData.last_name}`,
      age,
      assigned_officer_id: user?.id,
      assigned_officer_name: user?.name,
      updated_at: new Date().toISOString()
    };

    if (editingStudent) {
      const { error } = await supabase
        .from('students')
        .update(studentData)
        .eq('id', editingStudent.id);

      if (error) {
        console.error('Error updating student:', error);
        alert('Failed to update student profile');
        return;
      }
    } else {
      const { error } = await supabase.from('students').insert([studentData]);

      if (error) {
        console.error('Error adding student:', error);
        alert('Failed to add student profile');
        return;
      }
    }

    setShowModal(false);
    setFormData(emptyForm);
    fetchStudents();
  };

  const filteredStudents = students.filter(student =>
    student.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    student.chl_number?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    student.email?.toLowerCase().includes(searchTerm.toLowerCase())
  );

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
        <h1 className="text-3xl font-bold text-slate-800 mb-2">Student Profiles</h1>
        <p className="text-slate-600">Complete student information and records</p>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-slate-200 mb-6">
        <div className="p-4 border-b border-slate-200">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Search by name, CHL ID, or email..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <button
              onClick={handleAddNew}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors whitespace-nowrap"
            >
              <Plus className="w-5 h-5" />
              <span>Add Profile</span>
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 p-6">
          {filteredStudents.length === 0 ? (
            <div className="col-span-full text-center py-12 text-slate-500">
              No student profiles found
            </div>
          ) : (
            filteredStudents.map((student) => (
              <div
                key={student.id}
                className="bg-white border border-slate-200 rounded-xl p-6 hover:shadow-lg transition-shadow"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-16 h-16 rounded-full bg-slate-200 flex items-center justify-center overflow-hidden">
                      {student.profile_photo_url ? (
                        <img src={student.profile_photo_url} alt={student.full_name} className="w-full h-full object-cover" />
                      ) : (
                        <UserIcon className="w-8 h-8 text-slate-400" />
                      )}
                    </div>
                    <div>
                      <h3 className="font-semibold text-slate-800">{student.full_name}</h3>
                      <p className="text-sm text-slate-500">{student.chl_number || 'No CHL ID'}</p>
                    </div>
                  </div>
                </div>

                <div className="space-y-2 mb-4">
                  <div className="text-sm">
                    <span className="text-slate-600">Program:</span>
                    <p className="text-slate-800 font-medium">{student.current_program || 'Not specified'}</p>
                  </div>
                  <div className="text-sm">
                    <span className="text-slate-600">Institution:</span>
                    <p className="text-slate-800">{student.institution_name || 'Not specified'}</p>
                  </div>
                  <div className="text-sm">
                    <span className="text-slate-600">Officer:</span>
                    <p className="text-slate-800">{student.assigned_officer_name || 'Unassigned'}</p>
                  </div>
                </div>

                <div className="flex gap-2 pt-4 border-t border-slate-100">
                  <button
                    onClick={() => handleView(student)}
                    className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition-colors"
                  >
                    <Eye className="w-4 h-4" />
                    <span>View</span>
                  </button>
                  <button
                    onClick={() => handleEdit(student)}
                    className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-green-50 text-green-600 rounded-lg hover:bg-green-100 transition-colors"
                  >
                    <Edit className="w-4 h-4" />
                    <span>Edit</span>
                  </button>
                  {user?.role === 'admin' && (
                    <button
                      onClick={() => handleDelete(student.id)}
                      className="px-3 py-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 overflow-y-auto">
          <div className="bg-white rounded-xl shadow-xl max-w-5xl w-full my-8">
            <div className="p-6 border-b border-slate-200 flex justify-between items-center sticky top-0 bg-white rounded-t-xl z-10">
              <h2 className="text-2xl font-bold text-slate-800">
                {viewMode === 'view'
                  ? 'Student Profile'
                  : editingStudent
                  ? 'Edit Student Profile'
                  : 'Add New Student Profile'}
              </h2>
              <div className="flex gap-2">
                {viewMode === 'view' && (
                  <button
                    onClick={() => setViewMode('edit')}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    Edit
                  </button>
                )}
                <button onClick={() => setShowModal(false)} className="text-slate-400 hover:text-slate-600">
                  <X className="w-6 h-6" />
                </button>
              </div>
            </div>

            {viewMode === 'view' && editingStudent ? (
              <div className="p-6 space-y-6 max-h-[calc(100vh-200px)] overflow-y-auto">
                <div className="flex justify-center mb-6">
                  <div className="w-32 h-32 rounded-full bg-slate-200 flex items-center justify-center overflow-hidden">
                    {editingStudent.profile_photo_url ? (
                      <img src={editingStudent.profile_photo_url} alt={editingStudent.full_name} className="w-full h-full object-cover" />
                    ) : (
                      <UserIcon className="w-16 h-16 text-slate-400" />
                    )}
                  </div>
                </div>

                <div>
                  <h3 className="text-lg font-semibold text-slate-800 mb-4">Personal Information</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm text-slate-600">Student Name</label>
                      <p className="text-slate-800 font-medium">{editingStudent.full_name}</p>
                    </div>
                    <div>
                      <label className="text-sm text-slate-600">CHL ID</label>
                      <p className="text-slate-800 font-medium">{editingStudent.chl_number || 'N/A'}</p>
                    </div>
                    <div>
                      <label className="text-sm text-slate-600">Email</label>
                      <p className="text-slate-800">{editingStudent.email || 'N/A'}</p>
                    </div>
                    <div>
                      <label className="text-sm text-slate-600">Phone</label>
                      <p className="text-slate-800">{editingStudent.contact_number || 'N/A'}</p>
                    </div>
                    <div>
                      <label className="text-sm text-slate-600">Community</label>
                      <p className="text-slate-800">{editingStudent.community || 'N/A'}</p>
                    </div>
                    <div>
                      <label className="text-sm text-slate-600">Gender</label>
                      <p className="text-slate-800 capitalize">{editingStudent.gender || 'N/A'}</p>
                    </div>
                    <div>
                      <label className="text-sm text-slate-600">Date of Birth</label>
                      <p className="text-slate-800">{editingStudent.date_of_birth || 'N/A'}</p>
                    </div>
                    <div>
                      <label className="text-sm text-slate-600">Age</label>
                      <p className="text-slate-800">{editingStudent.age || 'N/A'}</p>
                    </div>
                    <div>
                      <label className="text-sm text-slate-600">NRC</label>
                      <p className="text-slate-800">{editingStudent.nrc_number || 'N/A'}</p>
                    </div>
                    <div>
                      <label className="text-sm text-slate-600">School ID</label>
                      <p className="text-slate-800">{editingStudent.school_id_number || 'N/A'}</p>
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="text-lg font-semibold text-slate-800 mb-4">Guardian Information</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm text-slate-600">Name</label>
                      <p className="text-slate-800">{editingStudent.guardian_full_name || 'N/A'}</p>
                    </div>
                    <div>
                      <label className="text-sm text-slate-600">Community</label>
                      <p className="text-slate-800">{editingStudent.guardian_community || 'N/A'}</p>
                    </div>
                    <div>
                      <label className="text-sm text-slate-600">Contact</label>
                      <p className="text-slate-800">{editingStudent.guardian_contact_number || 'N/A'}</p>
                    </div>
                    <div>
                      <label className="text-sm text-slate-600">Relationship</label>
                      <p className="text-slate-800 capitalize">{editingStudent.guardian_relationship || 'N/A'}</p>
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="text-lg font-semibold text-slate-800 mb-4">Academic Information</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm text-slate-600">Program</label>
                      <p className="text-slate-800">{editingStudent.current_program || 'N/A'}</p>
                    </div>
                    <div>
                      <label className="text-sm text-slate-600">Category</label>
                      <p className="text-slate-800 capitalize">{editingStudent.program_level?.replace('_', ' ') || 'N/A'}</p>
                    </div>
                    <div>
                      <label className="text-sm text-slate-600">Institution</label>
                      <p className="text-slate-800">{editingStudent.institution_name || 'N/A'}</p>
                    </div>
                    <div>
                      <label className="text-sm text-slate-600">Location</label>
                      <p className="text-slate-800">{editingStudent.institution_location || 'N/A'}</p>
                    </div>
                    <div>
                      <label className="text-sm text-slate-600">Area of Study</label>
                      <p className="text-slate-800">{editingStudent.area_of_study || 'N/A'}</p>
                    </div>
                    <div>
                      <label className="text-sm text-slate-600">Program Length</label>
                      <p className="text-slate-800">{editingStudent.program_length || 'N/A'}</p>
                    </div>
                    <div>
                      <label className="text-sm text-slate-600">Start Date</label>
                      <p className="text-slate-800">{editingStudent.start_date || 'N/A'}</p>
                    </div>
                    <div>
                      <label className="text-sm text-slate-600">Expected End</label>
                      <p className="text-slate-800">{editingStudent.expected_end_date || 'N/A'}</p>
                    </div>
                    <div>
                      <label className="text-sm text-slate-600">Overall GPA</label>
                      <p className="text-slate-800">{editingStudent.overall_gpa || 'N/A'}</p>
                    </div>
                    <div>
                      <label className="text-sm text-slate-600">Assigned Officer</label>
                      <p className="text-slate-800">{editingStudent.assigned_officer_name || 'N/A'}</p>
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="text-lg font-semibold text-slate-800 mb-4">Accommodation Information</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm text-slate-600">Type</label>
                      <p className="text-slate-800 capitalize">{editingStudent.accommodation_type?.replace('_', ' ') || 'N/A'}</p>
                    </div>
                    <div>
                      <label className="text-sm text-slate-600">Monthly Rent</label>
                      <p className="text-slate-800">ZMW {editingStudent.accommodation_monthly_rent || 0}</p>
                    </div>
                    <div>
                      <label className="text-sm text-slate-600">Payment Method</label>
                      <p className="text-slate-800">{editingStudent.accommodation_payment_method || 'N/A'}</p>
                    </div>
                    <div>
                      <label className="text-sm text-slate-600">Address</label>
                      <p className="text-slate-800">{editingStudent.accommodation_address || 'N/A'}</p>
                    </div>
                    <div>
                      <label className="text-sm text-slate-600">Landlord</label>
                      <p className="text-slate-800">{editingStudent.accommodation_landlord_name || 'N/A'}</p>
                    </div>
                    <div>
                      <label className="text-sm text-slate-600">Landlord Contact</label>
                      <p className="text-slate-800">{editingStudent.accommodation_landlord_contact || 'N/A'}</p>
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="text-lg font-semibold text-slate-800 mb-4">Digital Resources</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm text-slate-600">Laptop Plan</label>
                      <p className="text-slate-800 capitalize">{editingStudent.laptop_plan?.replace('_', ' ') || 'None'}</p>
                    </div>
                    <div>
                      <label className="text-sm text-slate-600">Serial Number</label>
                      <p className="text-slate-800">{editingStudent.laptop_serial_number || 'N/A'}</p>
                    </div>
                    {editingStudent.laptop_plan === 'rent_to_own' && (
                      <div>
                        <label className="text-sm text-slate-600">Monthly Deduction</label>
                        <p className="text-slate-800">ZMW {editingStudent.laptop_monthly_deduction || 0}</p>
                      </div>
                    )}
                    {editingStudent.laptop_plan === 'rent_to_return' && (
                      <>
                        <div>
                          <label className="text-sm text-slate-600">Inspection Date</label>
                          <p className="text-slate-800">{editingStudent.laptop_inspection_date || 'N/A'}</p>
                        </div>
                        <div>
                          <label className="text-sm text-slate-600">Submission Date</label>
                          <p className="text-slate-800">{editingStudent.laptop_submission_date || 'N/A'}</p>
                        </div>
                        <div>
                          <label className="text-sm text-slate-600">Collection Date</label>
                          <p className="text-slate-800">{editingStudent.laptop_collection_date || 'N/A'}</p>
                        </div>
                      </>
                    )}
                  </div>
                </div>

                <div>
                  <h3 className="text-lg font-semibold text-slate-800 mb-4">Program Notes</h3>
                  <p className="text-slate-800 whitespace-pre-wrap">{editingStudent.program_notes || 'No notes available'}</p>
                </div>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="p-6 space-y-6 max-h-[calc(100vh-200px)] overflow-y-auto">
                <div>
                  <h3 className="text-lg font-semibold text-slate-800 mb-4">Personal Information</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                      <label className="block text-sm font-medium text-slate-700 mb-1">CHL ID</label>
                      <input
                        type="text"
                        value={formData.chl_number}
                        onChange={(e) => setFormData({ ...formData, chl_number: e.target.value })}
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
                      <label className="block text-sm font-medium text-slate-700 mb-1">Phone</label>
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
                      <label className="block text-sm font-medium text-slate-700 mb-1">Gender</label>
                      <select
                        value={formData.gender}
                        onChange={(e) => setFormData({ ...formData, gender: e.target.value })}
                        className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      >
                        <option value="male">Male</option>
                        <option value="female">Female</option>
                        <option value="other">Other</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1">Date of Birth</label>
                      <input
                        type="date"
                        value={formData.date_of_birth}
                        onChange={(e) => setFormData({ ...formData, date_of_birth: e.target.value })}
                        className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1">NRC Number</label>
                      <input
                        type="text"
                        value={formData.nrc_number}
                        onChange={(e) => setFormData({ ...formData, nrc_number: e.target.value })}
                        className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1">School ID</label>
                      <input
                        type="text"
                        value={formData.school_id_number}
                        onChange={(e) => setFormData({ ...formData, school_id_number: e.target.value })}
                        className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="text-lg font-semibold text-slate-800 mb-4">Guardian Information</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1">Name</label>
                      <input
                        type="text"
                        value={formData.guardian_full_name}
                        onChange={(e) => setFormData({ ...formData, guardian_full_name: e.target.value })}
                        className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1">Community</label>
                      <input
                        type="text"
                        value={formData.guardian_community}
                        onChange={(e) => setFormData({ ...formData, guardian_community: e.target.value })}
                        className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1">Contact</label>
                      <input
                        type="tel"
                        value={formData.guardian_contact_number}
                        onChange={(e) => setFormData({ ...formData, guardian_contact_number: e.target.value })}
                        className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1">Relationship</label>
                      <input
                        type="text"
                        placeholder="e.g., Parent, Guardian, Sibling"
                        value={formData.guardian_relationship}
                        onChange={(e) => setFormData({ ...formData, guardian_relationship: e.target.value })}
                        className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="text-lg font-semibold text-slate-800 mb-4">Academic Information</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1">Program</label>
                      <input
                        type="text"
                        value={formData.current_program}
                        onChange={(e) => setFormData({ ...formData, current_program: e.target.value })}
                        className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1">Category</label>
                      <select
                        value={formData.program_level}
                        onChange={(e) => setFormData({ ...formData, program_level: e.target.value })}
                        className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      >
                        <option value="university">University</option>
                        <option value="diploma">College/Diploma</option>
                        <option value="launch_year">Launch Year</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1">Institution</label>
                      <input
                        type="text"
                        value={formData.institution_name}
                        onChange={(e) => setFormData({ ...formData, institution_name: e.target.value })}
                        className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1">Location</label>
                      <input
                        type="text"
                        value={formData.institution_location}
                        onChange={(e) => setFormData({ ...formData, institution_location: e.target.value })}
                        className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1">Area of Study</label>
                      <input
                        type="text"
                        value={formData.area_of_study}
                        onChange={(e) => setFormData({ ...formData, area_of_study: e.target.value })}
                        className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1">Program Length</label>
                      <input
                        type="text"
                        placeholder="e.g., 4 years"
                        value={formData.program_length}
                        onChange={(e) => setFormData({ ...formData, program_length: e.target.value })}
                        className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1">Start Date</label>
                      <input
                        type="date"
                        value={formData.start_date}
                        onChange={(e) => setFormData({ ...formData, start_date: e.target.value })}
                        className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1">Expected End</label>
                      <input
                        type="date"
                        value={formData.expected_end_date}
                        onChange={(e) => setFormData({ ...formData, expected_end_date: e.target.value })}
                        className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1">Overall GPA</label>
                      <input
                        type="number"
                        step="0.01"
                        min="0"
                        max="4.0"
                        value={formData.overall_gpa}
                        onChange={(e) => setFormData({ ...formData, overall_gpa: parseFloat(e.target.value) || 0 })}
                        className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="text-lg font-semibold text-slate-800 mb-4">Accommodation Information</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1">Type</label>
                      <select
                        value={formData.accommodation_type}
                        onChange={(e) => setFormData({ ...formData, accommodation_type: e.target.value })}
                        className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      >
                        <option value="institution_hostel">Institution Hostel</option>
                        <option value="boarding_house">Boarding House</option>
                        <option value="self_paying">Self Paying</option>
                        <option value="other">Other</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1">Monthly Rent (ZMW)</label>
                      <input
                        type="number"
                        step="0.01"
                        min="0"
                        value={formData.accommodation_monthly_rent}
                        onChange={(e) => setFormData({ ...formData, accommodation_monthly_rent: parseFloat(e.target.value) || 0 })}
                        className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1">Payment Method</label>
                      <input
                        type="text"
                        value={formData.accommodation_payment_method}
                        onChange={(e) => setFormData({ ...formData, accommodation_payment_method: e.target.value })}
                        className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1">Address</label>
                      <input
                        type="text"
                        value={formData.accommodation_address}
                        onChange={(e) => setFormData({ ...formData, accommodation_address: e.target.value })}
                        className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1">Landlord</label>
                      <input
                        type="text"
                        value={formData.accommodation_landlord_name}
                        onChange={(e) => setFormData({ ...formData, accommodation_landlord_name: e.target.value })}
                        className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1">Landlord Contact</label>
                      <input
                        type="tel"
                        value={formData.accommodation_landlord_contact}
                        onChange={(e) => setFormData({ ...formData, accommodation_landlord_contact: e.target.value })}
                        className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="text-lg font-semibold text-slate-800 mb-4">Digital Resources</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1">Laptop Plan</label>
                      <select
                        value={formData.laptop_plan}
                        onChange={(e) => setFormData({ ...formData, laptop_plan: e.target.value })}
                        className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      >
                        <option value="none">None</option>
                        <option value="rent_to_return">Rent to Return</option>
                        <option value="rent_to_own">Rent to Own</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1">Serial Number</label>
                      <input
                        type="text"
                        value={formData.laptop_serial_number}
                        onChange={(e) => setFormData({ ...formData, laptop_serial_number: e.target.value })}
                        className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>

                    {formData.laptop_plan === 'rent_to_own' && (
                      <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">Monthly Deduction (ZMW)</label>
                        <input
                          type="number"
                          step="0.01"
                          min="0"
                          value={formData.laptop_monthly_deduction}
                          onChange={(e) => setFormData({ ...formData, laptop_monthly_deduction: parseFloat(e.target.value) || 0 })}
                          className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                        <p className="text-xs text-slate-500 mt-1">This amount will automatically affect the stipend</p>
                      </div>
                    )}

                    {formData.laptop_plan === 'rent_to_return' && (
                      <>
                        <div>
                          <label className="block text-sm font-medium text-slate-700 mb-1">Inspection Date</label>
                          <input
                            type="date"
                            value={formData.laptop_inspection_date}
                            onChange={(e) => setFormData({ ...formData, laptop_inspection_date: e.target.value })}
                            className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-slate-700 mb-1">Submission Date</label>
                          <input
                            type="date"
                            value={formData.laptop_submission_date}
                            onChange={(e) => setFormData({ ...formData, laptop_submission_date: e.target.value })}
                            className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-slate-700 mb-1">Collection Date</label>
                          <input
                            type="date"
                            value={formData.laptop_collection_date}
                            onChange={(e) => setFormData({ ...formData, laptop_collection_date: e.target.value })}
                            className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                          />
                        </div>
                      </>
                    )}
                  </div>
                </div>

                <div>
                  <h3 className="text-lg font-semibold text-slate-800 mb-4">Program Notes</h3>
                  <textarea
                    value={formData.program_notes}
                    onChange={(e) => setFormData({ ...formData, program_notes: e.target.value })}
                    rows={4}
                    placeholder="Enter any notes about the student's program..."
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <h3 className="text-lg font-semibold text-slate-800 mb-4">Profile Photo</h3>
                  <input
                    type="url"
                    placeholder="Enter photo URL"
                    value={formData.profile_photo_url}
                    onChange={(e) => setFormData({ ...formData, profile_photo_url: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <p className="text-xs text-slate-500 mt-1">Paste a URL to a profile photo</p>
                </div>

                <div className="flex gap-3 pt-4 border-t border-slate-200">
                  <button
                    type="submit"
                    className="flex items-center gap-2 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    <Save className="w-5 h-5" />
                    <span>{editingStudent ? 'Update Profile' : 'Create Profile'}</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowModal(false)}
                    className="px-6 py-2 bg-slate-200 text-slate-700 rounded-lg hover:bg-slate-300 transition-colors"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default StudentProfiles;
