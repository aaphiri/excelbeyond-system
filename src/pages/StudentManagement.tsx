import React, { useState, useEffect } from 'react';
import { Users, Plus, Search, Upload, Eye, Edit, Trash2, GraduationCap, Award, X, CheckCircle2, AlertCircle, Download } from 'lucide-react';
import { User as UserType } from '../types';
import { supabase } from '../lib/supabase';
import Papa from 'papaparse';
import StudentForm from '../components/StudentForm';

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
  date_of_birth?: string;
  gender?: string;
  nrc_number?: string;
  chl_number?: string;
  school_id_number?: string;
  program_level: 'university' | 'diploma' | 'launch_year';
  program_status: 'enrolled' | 'graduated' | 'discharged' | 'suspended' | 'transferred';
  academic_standing: 'excellent' | 'good' | 'probation' | 'warning';
  institution_name?: string;
  institution_location?: string;
  current_program?: string;
  area_of_study?: string;
  start_date?: string;
  expected_end_date?: string;
  assigned_officer_id?: string;
  assigned_officer_name?: string;
  overall_gpa?: number;
  profile_picture?: string;
  guardian_full_name?: string;
  guardian_contact_number?: string;
  guardian_community?: string;
  guardian_relationship?: string;
  created_at: string;
}

const StudentManagement: React.FC<StudentManagementProps> = ({ user }) => {
  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState<'all' | 'university' | 'diploma' | 'launch_year'>('all');
  const [filterStatus, setFilterStatus] = useState('all');
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showImportModal, setShowImportModal] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [notification, setNotification] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  const [formData, setFormData] = useState({
    first_name: '',
    last_name: '',
    email: '',
    contact_number: '',
    community: '',
    date_of_birth: '',
    gender: '',
    nrc_number: '',
    chl_number: '',
    school_id_number: '',
    program_level: 'university' as 'university' | 'diploma' | 'launch_year',
    program_status: 'enrolled' as 'enrolled' | 'graduated' | 'discharged' | 'suspended' | 'transferred',
    academic_standing: 'good' as 'excellent' | 'good' | 'probation' | 'warning',
    institution_name: '',
    institution_location: '',
    current_program: '',
    area_of_study: '',
    start_date: '',
    expected_end_date: '',
    guardian_full_name: '',
    guardian_contact_number: '',
    guardian_community: '',
    guardian_relationship: '',
    assigned_officer_id: '',
    assigned_officer_name: ''
  });

  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    fetchStudents();
  }, [user]);

  useEffect(() => {
    if (notification) {
      const timer = setTimeout(() => setNotification(null), 5000);
      return () => clearTimeout(timer);
    }
  }, [notification]);

  const showNotification = (type: 'success' | 'error', message: string) => {
    setNotification({ type, message });
  };

  const fetchStudents = async () => {
    setLoading(true);
    try {
      let query = supabase
        .from('students')
        .select('*');

      // Application-level access control
      if (user?.role === 'program_officer') {
        // Program officers only see their assigned students
        query = query.eq('assigned_officer_id', user.id);
      }
      // Admins and deputy managers see all students (no filter needed)

      const { data, error } = await query.order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching students:', error);
        showNotification('error', 'Failed to load students: ' + error.message);
      } else {
        setStudents(data || []);
      }
    } catch (error: any) {
      console.error('Error:', error);
      showNotification('error', 'An error occurred while loading students');
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      first_name: '',
      last_name: '',
      email: '',
      contact_number: '',
      community: '',
      date_of_birth: '',
      gender: '',
      nrc_number: '',
      chl_number: '',
      school_id_number: '',
      program_level: 'university',
      program_status: 'enrolled',
      academic_standing: 'good',
      institution_name: '',
      institution_location: '',
      current_program: '',
      area_of_study: '',
      start_date: '',
      expected_end_date: '',
      guardian_full_name: '',
      guardian_contact_number: '',
      guardian_community: '',
      guardian_relationship: '',
      assigned_officer_id: '',
      assigned_officer_name: ''
    });
    setPhotoFile(null);
    setPhotoPreview(null);
  };

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        showNotification('error', 'Photo size must be less than 5MB');
        return;
      }
      if (!['image/jpeg', 'image/jpg', 'image/png', 'image/webp'].includes(file.type)) {
        showNotification('error', 'Photo must be JPEG, PNG, or WebP format');
        return;
      }
      setPhotoFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setPhotoPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handlePhotoRemove = () => {
    setPhotoFile(null);
    setPhotoPreview(null);
  };

  const uploadPhoto = async (studentId: string): Promise<string | null> => {
    if (!photoFile) return null;

    try {
      const fileExt = photoFile.name.split('.').pop()?.toLowerCase() || 'jpg';
      const fileName = `${studentId}-${Date.now()}.${fileExt}`;
      const filePath = fileName;

      console.log('Uploading photo:', { fileName, fileSize: photoFile.size, fileType: photoFile.type });

      // Delete old photo if exists (optional cleanup)
      try {
        const { data: existingFiles } = await supabase.storage
          .from('student-photos')
          .list('', {
            search: studentId
          });

        if (existingFiles && existingFiles.length > 0) {
          const filesToDelete = existingFiles.map(f => f.name);
          await supabase.storage
            .from('student-photos')
            .remove(filesToDelete);
        }
      } catch (cleanupError) {
        console.log('Cleanup error (non-critical):', cleanupError);
      }

      // Upload the new photo
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('student-photos')
        .upload(filePath, photoFile, {
          cacheControl: '3600',
          upsert: true
        });

      if (uploadError) {
        console.error('Upload error:', uploadError);
        showNotification('error', `Failed to upload photo: ${uploadError.message}`);
        throw uploadError;
      }

      console.log('Upload successful:', uploadData);

      // Get the public URL
      const { data: { publicUrl } } = supabase.storage
        .from('student-photos')
        .getPublicUrl(filePath);

      console.log('Public URL:', publicUrl);
      return publicUrl;
    } catch (error: any) {
      console.error('Error uploading photo:', error);
      showNotification('error', `Photo upload failed: ${error.message || 'Unknown error'}`);
      throw error;
    }
  };

  const handleAddStudent = async (e: React.FormEvent) => {
    e.preventDefault();
    setUploading(true);

    try {
      const studentData = {
        ...formData,
        full_name: `${formData.first_name} ${formData.last_name}`,
        assigned_officer_id: formData.assigned_officer_id || user?.id,
        assigned_officer_name: formData.assigned_officer_name || user?.name
      };

      const { data: newStudent, error } = await supabase
        .from('students')
        .insert([studentData])
        .select()
        .single();

      if (error) {
        console.error('Error adding student:', error);
        showNotification('error', 'Failed to add student: ' + error.message);
        setUploading(false);
        return;
      }

      if (photoFile && newStudent) {
        try {
          const photoUrl = await uploadPhoto(newStudent.id);
          if (photoUrl) {
            const { error: updateError } = await supabase
              .from('students')
              .update({ profile_photo_url: photoUrl })
              .eq('id', newStudent.id);

            if (updateError) {
              console.error('Error updating photo URL:', updateError);
              showNotification('success', 'Student added but failed to save photo URL');
            }
          }
        } catch (photoError) {
          console.error('Error uploading photo:', photoError);
          showNotification('success', 'Student added successfully (photo upload failed)');
        }
      }

      showNotification('success', 'Student added successfully');
      setShowAddModal(false);
      resetForm();
      fetchStudents();
    } catch (error: any) {
      console.error('Error:', error);
      showNotification('error', 'An error occurred while adding the student');
    } finally {
      setUploading(false);
    }
  };

  const handleEditStudent = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!selectedStudent) return;

    // Application-level access control
    const canEdit =
      user?.role === 'admin' ||
      user?.role === 'deputy_manager' ||
      (user?.role === 'program_officer' && selectedStudent.assigned_officer_id === user?.id);

    if (!canEdit) {
      showNotification('error', 'You do not have permission to edit this student');
      return;
    }

    setUploading(true);

    try {
      const studentData = {
        ...formData,
        full_name: `${formData.first_name} ${formData.last_name}`,
      };

      // Upload new photo if selected
      if (photoFile) {
        try {
          const photoUrl = await uploadPhoto(selectedStudent.id);
          if (photoUrl) {
            (studentData as any).profile_photo_url = photoUrl;
          }
        } catch (photoError) {
          console.error('Error uploading photo:', photoError);
          // Continue with update even if photo fails - user can try again
        }
      }

      const { error } = await supabase
        .from('students')
        .update(studentData)
        .eq('id', selectedStudent.id);

      if (error) {
        console.error('Error updating student:', error);
        showNotification('error', 'Failed to update student: ' + error.message);
        setUploading(false);
        return;
      }

      showNotification('success', 'Student updated successfully');
      setShowEditModal(false);
      setSelectedStudent(null);
      resetForm();
      fetchStudents();
    } catch (error: any) {
      console.error('Error:', error);
      showNotification('error', 'An error occurred while updating the student');
    } finally {
      setUploading(false);
    }
  };

  const handleDeleteStudent = async (id: string) => {
    // Application-level access control: Only admins can delete
    if (user?.role !== 'admin') {
      showNotification('error', 'Only administrators can delete students');
      return;
    }

    if (!confirm('Are you sure you want to delete this student? This action cannot be undone.')) return;

    try {
      const { error } = await supabase.from('students').delete().eq('id', id);

      if (error) {
        console.error('Error deleting student:', error);
        showNotification('error', 'Failed to delete student: ' + error.message);
        return;
      }

      showNotification('success', 'Student deleted successfully');
      fetchStudents();
    } catch (error: any) {
      console.error('Error:', error);
      showNotification('error', 'An error occurred while deleting the student');
    }
  };

  const openEditModal = (student: Student) => {
    setSelectedStudent(student);
    setFormData({
      first_name: student.first_name,
      last_name: student.last_name,
      email: student.email || '',
      contact_number: student.contact_number || '',
      community: student.community || '',
      date_of_birth: student.date_of_birth || '',
      gender: student.gender || '',
      nrc_number: student.nrc_number || '',
      chl_number: student.chl_number || '',
      school_id_number: student.school_id_number || '',
      program_level: student.program_level,
      program_status: student.program_status,
      academic_standing: student.academic_standing,
      institution_name: student.institution_name || '',
      institution_location: student.institution_location || '',
      current_program: student.current_program || '',
      area_of_study: student.area_of_study || '',
      start_date: student.start_date || '',
      expected_end_date: student.expected_end_date || '',
      guardian_full_name: student.guardian_full_name || '',
      guardian_contact_number: student.guardian_contact_number || '',
      guardian_community: student.guardian_community || '',
      guardian_relationship: student.guardian_relationship || '',
      assigned_officer_id: student.assigned_officer_id || '',
      assigned_officer_name: student.assigned_officer_name || ''
    });
    setPhotoPreview(student.profile_photo_url || null);
    setPhotoFile(null);
    setShowEditModal(true);
  };

  const handleCSVImport = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    Papa.parse(file, {
      header: true,
      complete: async (results) => {
        try {
          const studentsToImport = results.data
            .filter((row: any) => row.first_name && row.last_name)
            .map((row: any) => ({
              first_name: row.first_name,
              last_name: row.last_name,
              full_name: `${row.first_name} ${row.last_name}`,
              email: row.email || null,
              contact_number: row.contact_number || null,
              community: row.community || null,
              program_level: row.program_level || 'university',
              program_status: row.program_status || 'enrolled',
              academic_standing: row.academic_standing || 'good',
              institution_name: row.institution_name || null,
              current_program: row.current_program || null,
              assigned_officer_id: row.assigned_officer_id || user?.id,
              assigned_officer_name: row.assigned_officer_name || user?.name
            }));

          if (studentsToImport.length === 0) {
            showNotification('error', 'No valid student data found in CSV');
            return;
          }

          const { error } = await supabase.from('students').insert(studentsToImport);

          if (error) {
            console.error('Error importing students:', error);
            showNotification('error', 'Failed to import students: ' + error.message);
            return;
          }

          showNotification('success', `Successfully imported ${studentsToImport.length} students`);
          setShowImportModal(false);
          fetchStudents();
        } catch (error: any) {
          console.error('Error:', error);
          showNotification('error', 'An error occurred during import');
        }
      },
      error: (error) => {
        console.error('CSV parsing error:', error);
        showNotification('error', 'Failed to parse CSV file');
      }
    });

    event.target.value = '';
  };

  const downloadCSVTemplate = () => {
    const template = `first_name,last_name,email,contact_number,community,program_level,program_status,academic_standing,institution_name,current_program,assigned_officer_id,assigned_officer_name
John,Doe,john.doe@example.com,+260977123456,Lusaka,university,enrolled,good,University of Zambia,Computer Science,,
Jane,Smith,jane.smith@example.com,+260966789012,Ndola,diploma,enrolled,excellent,NIPA,Information Technology,,`;

    const blob = new Blob([template], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'student_import_template.csv';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
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
      <span className={`px-2 py-1 text-xs rounded-full font-medium ${styles[level as keyof typeof styles]}`}>
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
      <span className={`px-2 py-1 text-xs rounded-full font-medium ${styles[status as keyof typeof styles] || 'bg-gray-100 text-gray-700'}`}>
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
      {notification && (
        <div className={`fixed top-4 right-4 z-50 max-w-md p-4 rounded-lg shadow-lg border-2 ${
          notification.type === 'success'
            ? 'bg-green-50 border-green-200'
            : 'bg-red-50 border-red-200'
        } flex items-start gap-3 animate-slide-in`}>
          {notification.type === 'success' ? (
            <CheckCircle2 className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
          ) : (
            <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
          )}
          <div className="flex-1">
            <p className={`text-sm font-medium ${
              notification.type === 'success' ? 'text-green-800' : 'text-red-800'
            }`}>
              {notification.message}
            </p>
          </div>
          <button
            onClick={() => setNotification(null)}
            className={notification.type === 'success' ? 'text-green-600' : 'text-red-600'}
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

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
              ? 'border-blue-500 bg-blue-50 shadow-md'
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
              ? 'border-blue-500 bg-blue-50 shadow-md'
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
              ? 'border-green-500 bg-green-50 shadow-md'
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
              ? 'border-orange-500 bg-orange-50 shadow-md'
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
              onClick={() => setShowImportModal(true)}
              className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors whitespace-nowrap"
            >
              <Upload className="w-5 h-5" />
              <span>Import CSV</span>
            </button>

            <button
              onClick={() => {
                resetForm();
                setShowAddModal(true);
              }}
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
                    {searchTerm || filterStatus !== 'all' || filterCategory !== 'all'
                      ? 'No students match your search criteria'
                      : 'No students found. Click "Add Student" to get started.'}
                  </td>
                </tr>
              ) : (
                filteredStudents.map((student) => (
                  <tr key={student.id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center">
                          <span className="text-white font-semibold text-sm">
                            {student.first_name?.charAt(0)}{student.last_name?.charAt(0)}
                          </span>
                        </div>
                        <div className="ml-3">
                          <div className="text-sm font-medium text-slate-800">{student.full_name}</div>
                          <div className="text-sm text-slate-500">{student.email || 'No email'}</div>
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
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => {
                            setSelectedStudent(student);
                            setShowDetailModal(true);
                          }}
                          className="text-blue-600 hover:text-blue-900 transition-colors"
                          title="View details"
                        >
                          <Eye className="w-5 h-5" />
                        </button>
                        {(user?.role === 'admin' || user?.role === 'deputy_manager' ||
                          (user?.role === 'program_officer' && student.assigned_officer_id === user?.id)) && (
                          <>
                            <button
                              onClick={() => openEditModal(student)}
                              className="text-green-600 hover:text-green-900 transition-colors"
                              title="Edit student"
                            >
                              <Edit className="w-5 h-5" />
                            </button>
                            <button
                              onClick={() => handleDeleteStudent(student.id)}
                              className="text-red-600 hover:text-red-900 transition-colors"
                              title="Delete student"
                            >
                              <Trash2 className="w-5 h-5" />
                            </button>
                          </>
                        )}
                      </div>
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
            <div className="p-6 border-b border-slate-200 flex justify-between items-center">
              <h2 className="text-2xl font-bold text-slate-800">Add New Student</h2>
              <button
                onClick={() => setShowAddModal(false)}
                className="text-slate-400 hover:text-slate-600"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <form onSubmit={handleAddStudent} className="p-6">
              <StudentForm
                formData={formData}
                setFormData={setFormData}
                photoPreview={photoPreview}
                onPhotoChange={handlePhotoChange}
                onPhotoRemove={handlePhotoRemove}
              />

              <div className="flex gap-3 mt-6">
                <button
                  type="submit"
                  disabled={uploading}
                  className="flex-1 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium disabled:bg-blue-400 disabled:cursor-not-allowed"
                >
                  {uploading ? 'Adding Student...' : 'Add Student'}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowAddModal(false);
                    resetForm();
                  }}
                  className="px-6 py-2 bg-slate-200 text-slate-700 rounded-lg hover:bg-slate-300 transition-colors font-medium"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {showEditModal && selectedStudent && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-slate-200 flex justify-between items-center">
              <h2 className="text-2xl font-bold text-slate-800">Edit Student</h2>
              <button
                onClick={() => {
                  setShowEditModal(false);
                  setSelectedStudent(null);
                  resetForm();
                }}
                className="text-slate-400 hover:text-slate-600"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <form onSubmit={handleEditStudent} className="p-6">
              <StudentForm
                formData={formData}
                setFormData={setFormData}
                photoPreview={photoPreview}
                onPhotoChange={handlePhotoChange}
                onPhotoRemove={handlePhotoRemove}
                isEdit={true}
              />

              <div className="flex gap-3 mt-6">
                <button
                  type="submit"
                  disabled={uploading}
                  className="flex-1 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium disabled:bg-blue-400 disabled:cursor-not-allowed"
                >
                  {uploading ? 'Updating Student...' : 'Update Student'}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowEditModal(false);
                    setSelectedStudent(null);
                    resetForm();
                  }}
                  className="px-6 py-2 bg-slate-200 text-slate-700 rounded-lg hover:bg-slate-300 transition-colors font-medium"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {showImportModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-lg w-full">
            <div className="p-6 border-b border-slate-200 flex justify-between items-center">
              <h2 className="text-2xl font-bold text-slate-800">Import Students from CSV</h2>
              <button
                onClick={() => setShowImportModal(false)}
                className="text-slate-400 hover:text-slate-600"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="p-6">
              <p className="text-slate-600 mb-4">
                Upload a CSV file with student information. The file should include columns for first_name, last_name, email, and other student details.
              </p>

              <button
                onClick={downloadCSVTemplate}
                className="flex items-center gap-2 px-4 py-2 bg-slate-100 text-slate-700 rounded-lg hover:bg-slate-200 transition-colors mb-4 w-full justify-center"
              >
                <Download className="w-5 h-5" />
                <span>Download CSV Template</span>
              </button>

              <label className="block">
                <input
                  type="file"
                  accept=".csv"
                  onChange={handleCSVImport}
                  className="block w-full text-sm text-slate-500
                    file:mr-4 file:py-2 file:px-4
                    file:rounded-lg file:border-0
                    file:text-sm file:font-semibold
                    file:bg-blue-50 file:text-blue-700
                    hover:file:bg-blue-100
                    cursor-pointer"
                />
              </label>

              <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <p className="text-sm text-blue-800">
                  <strong>Required columns:</strong> first_name, last_name
                </p>
                <p className="text-sm text-blue-700 mt-1">
                  Optional columns: email, contact_number, community, program_level, program_status, academic_standing, institution_name, current_program
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {showDetailModal && selectedStudent && (
        <div className="fixed inset-0 bg-black bg-opacity-60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-5xl w-full max-h-[95vh] overflow-y-auto">
            <div className="relative bg-gradient-to-r from-blue-600 via-blue-500 to-cyan-500 p-8 text-white">
              <button
                onClick={() => {
                  setShowDetailModal(false);
                  setSelectedStudent(null);
                }}
                className="absolute top-4 right-4 text-white hover:bg-white hover:bg-opacity-20 rounded-full p-2 transition-all"
              >
                <X className="w-6 h-6" />
              </button>

              <div className="flex flex-col md:flex-row items-center gap-6">
                <div className="group relative">
                  {selectedStudent.profile_photo_url ? (
                    <div className="relative">
                      <img
                        src={selectedStudent.profile_photo_url}
                        alt={selectedStudent.full_name}
                        className="w-32 h-32 md:w-40 md:h-40 rounded-full object-cover border-4 border-white shadow-xl transition-transform duration-300 group-hover:scale-110"
                      />
                      <div className="absolute inset-0 rounded-full bg-black bg-opacity-0 group-hover:bg-opacity-20 transition-all duration-300 flex items-center justify-center">
                        <span className="text-white opacity-0 group-hover:opacity-100 transition-opacity duration-300 text-sm font-medium">
                          View Larger
                        </span>
                      </div>
                      <div className="invisible group-hover:visible absolute left-full ml-4 top-1/2 -translate-y-1/2 z-50 pointer-events-none">
                        <img
                          src={selectedStudent.profile_photo_url}
                          alt={selectedStudent.full_name}
                          className="w-80 h-80 rounded-2xl object-cover shadow-2xl border-4 border-white transform transition-all duration-300 scale-0 group-hover:scale-100"
                        />
                      </div>
                    </div>
                  ) : (
                    <div className="w-32 h-32 md:w-40 md:h-40 rounded-full bg-white bg-opacity-20 backdrop-blur-sm flex items-center justify-center border-4 border-white shadow-xl">
                      <span className="text-white font-bold text-5xl">
                        {selectedStudent.first_name?.charAt(0)}{selectedStudent.last_name?.charAt(0)}
                      </span>
                    </div>
                  )}
                </div>

                <div className="flex-1 text-center md:text-left">
                  <h2 className="text-4xl font-bold mb-2 drop-shadow-lg">{selectedStudent.full_name}</h2>
                  <p className="text-blue-100 text-lg mb-3">{selectedStudent.email || 'No email provided'}</p>
                  <div className="flex flex-wrap gap-2 justify-center md:justify-start">
                    {getProgramLevelBadge(selectedStudent.program_level)}
                    {getStatusBadge(selectedStudent.program_status)}
                  </div>
                </div>
              </div>
            </div>

            <div className="p-8">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <div className="space-y-6">
                  <div>
                    <h3 className="text-sm font-semibold text-slate-500 uppercase tracking-wide mb-4 flex items-center gap-2">
                      <div className="w-1 h-5 bg-blue-500 rounded-full"></div>
                      Personal Information
                    </h3>
                    <div className="space-y-4 bg-slate-50 rounded-xl p-5">
                      <div className="flex justify-between items-start">
                        <span className="text-slate-600 font-medium">Contact Number</span>
                        <span className="text-slate-900 font-semibold">{selectedStudent.contact_number || 'Not provided'}</span>
                      </div>
                      <div className="border-t border-slate-200"></div>
                      <div className="flex justify-between items-start">
                        <span className="text-slate-600 font-medium">Community</span>
                        <span className="text-slate-900 font-semibold">{selectedStudent.community || 'Not provided'}</span>
                      </div>
                      {selectedStudent.date_of_birth && (
                        <>
                          <div className="border-t border-slate-200"></div>
                          <div className="flex justify-between items-start">
                            <span className="text-slate-600 font-medium">Date of Birth</span>
                            <span className="text-slate-900 font-semibold">{new Date(selectedStudent.date_of_birth).toLocaleDateString()}</span>
                          </div>
                        </>
                      )}
                      {selectedStudent.gender && (
                        <>
                          <div className="border-t border-slate-200"></div>
                          <div className="flex justify-between items-start">
                            <span className="text-slate-600 font-medium">Gender</span>
                            <span className="text-slate-900 font-semibold capitalize">{selectedStudent.gender}</span>
                          </div>
                        </>
                      )}
                      {selectedStudent.nrc_number && (
                        <>
                          <div className="border-t border-slate-200"></div>
                          <div className="flex justify-between items-start">
                            <span className="text-slate-600 font-medium">NRC Number</span>
                            <span className="text-slate-900 font-semibold">{selectedStudent.nrc_number}</span>
                          </div>
                        </>
                      )}
                      {selectedStudent.chl_number && (
                        <>
                          <div className="border-t border-slate-200"></div>
                          <div className="flex justify-between items-start">
                            <span className="text-slate-600 font-medium">CHL Number</span>
                            <span className="text-slate-900 font-semibold">{selectedStudent.chl_number}</span>
                          </div>
                        </>
                      )}
                    </div>
                  </div>

                  {(selectedStudent.guardian_full_name || selectedStudent.guardian_contact_number) && (
                    <div>
                      <h3 className="text-sm font-semibold text-slate-500 uppercase tracking-wide mb-4 flex items-center gap-2">
                        <div className="w-1 h-5 bg-cyan-500 rounded-full"></div>
                        Guardian Information
                      </h3>
                      <div className="space-y-4 bg-slate-50 rounded-xl p-5">
                        {selectedStudent.guardian_full_name && (
                          <div className="flex justify-between items-start">
                            <span className="text-slate-600 font-medium">Full Name</span>
                            <span className="text-slate-900 font-semibold">{selectedStudent.guardian_full_name}</span>
                          </div>
                        )}
                        {selectedStudent.guardian_contact_number && (
                          <>
                            <div className="border-t border-slate-200"></div>
                            <div className="flex justify-between items-start">
                              <span className="text-slate-600 font-medium">Contact</span>
                              <span className="text-slate-900 font-semibold">{selectedStudent.guardian_contact_number}</span>
                            </div>
                          </>
                        )}
                        {selectedStudent.guardian_community && (
                          <>
                            <div className="border-t border-slate-200"></div>
                            <div className="flex justify-between items-start">
                              <span className="text-slate-600 font-medium">Community</span>
                              <span className="text-slate-900 font-semibold">{selectedStudent.guardian_community}</span>
                            </div>
                          </>
                        )}
                        {selectedStudent.guardian_relationship && (
                          <>
                            <div className="border-t border-slate-200"></div>
                            <div className="flex justify-between items-start">
                              <span className="text-slate-600 font-medium">Relationship</span>
                              <span className="text-slate-900 font-semibold capitalize">{selectedStudent.guardian_relationship}</span>
                            </div>
                          </>
                        )}
                      </div>
                    </div>
                  )}
                </div>

                <div className="space-y-6">
                  <div>
                    <h3 className="text-sm font-semibold text-slate-500 uppercase tracking-wide mb-4 flex items-center gap-2">
                      <div className="w-1 h-5 bg-green-500 rounded-full"></div>
                      Academic Information
                    </h3>
                    <div className="space-y-4 bg-slate-50 rounded-xl p-5">
                      <div className="flex justify-between items-start">
                        <span className="text-slate-600 font-medium">Institution</span>
                        <span className="text-slate-900 font-semibold text-right">{selectedStudent.institution_name || 'Not specified'}</span>
                      </div>
                      {selectedStudent.institution_location && (
                        <>
                          <div className="border-t border-slate-200"></div>
                          <div className="flex justify-between items-start">
                            <span className="text-slate-600 font-medium">Location</span>
                            <span className="text-slate-900 font-semibold">{selectedStudent.institution_location}</span>
                          </div>
                        </>
                      )}
                      <div className="border-t border-slate-200"></div>
                      <div className="flex justify-between items-start">
                        <span className="text-slate-600 font-medium">Current Program</span>
                        <span className="text-slate-900 font-semibold text-right">{selectedStudent.current_program || 'Not specified'}</span>
                      </div>
                      {selectedStudent.area_of_study && (
                        <>
                          <div className="border-t border-slate-200"></div>
                          <div className="flex justify-between items-start">
                            <span className="text-slate-600 font-medium">Area of Study</span>
                            <span className="text-slate-900 font-semibold text-right">{selectedStudent.area_of_study}</span>
                          </div>
                        </>
                      )}
                      <div className="border-t border-slate-200"></div>
                      <div className="flex justify-between items-start">
                        <span className="text-slate-600 font-medium">Academic Standing</span>
                        <span className={`font-semibold capitalize ${
                          selectedStudent.academic_standing === 'excellent' ? 'text-green-600' :
                          selectedStudent.academic_standing === 'good' ? 'text-blue-600' :
                          selectedStudent.academic_standing === 'probation' ? 'text-orange-600' :
                          'text-red-600'
                        }`}>
                          {selectedStudent.academic_standing}
                        </span>
                      </div>
                      {selectedStudent.start_date && (
                        <>
                          <div className="border-t border-slate-200"></div>
                          <div className="flex justify-between items-start">
                            <span className="text-slate-600 font-medium">Start Date</span>
                            <span className="text-slate-900 font-semibold">{new Date(selectedStudent.start_date).toLocaleDateString()}</span>
                          </div>
                        </>
                      )}
                      {selectedStudent.expected_end_date && (
                        <>
                          <div className="border-t border-slate-200"></div>
                          <div className="flex justify-between items-start">
                            <span className="text-slate-600 font-medium">Expected End Date</span>
                            <span className="text-slate-900 font-semibold">{new Date(selectedStudent.expected_end_date).toLocaleDateString()}</span>
                          </div>
                        </>
                      )}
                      {selectedStudent.overall_gpa && (
                        <>
                          <div className="border-t border-slate-200"></div>
                          <div className="flex justify-between items-start">
                            <span className="text-slate-600 font-medium">Overall GPA</span>
                            <span className="text-slate-900 font-bold text-lg">{selectedStudent.overall_gpa.toFixed(2)}</span>
                          </div>
                        </>
                      )}
                      {selectedStudent.school_id_number && (
                        <>
                          <div className="border-t border-slate-200"></div>
                          <div className="flex justify-between items-start">
                            <span className="text-slate-600 font-medium">School ID</span>
                            <span className="text-slate-900 font-semibold">{selectedStudent.school_id_number}</span>
                          </div>
                        </>
                      )}
                    </div>
                  </div>

                  <div>
                    <h3 className="text-sm font-semibold text-slate-500 uppercase tracking-wide mb-4 flex items-center gap-2">
                      <div className="w-1 h-5 bg-amber-500 rounded-full"></div>
                      Program Management
                    </h3>
                    <div className="space-y-4 bg-slate-50 rounded-xl p-5">
                      <div className="flex justify-between items-start">
                        <span className="text-slate-600 font-medium">Assigned Officer</span>
                        <span className="text-slate-900 font-semibold text-right">{selectedStudent.assigned_officer_name || 'Unassigned'}</span>
                      </div>
                      <div className="border-t border-slate-200"></div>
                      <div className="flex justify-between items-start">
                        <span className="text-slate-600 font-medium">Enrollment Date</span>
                        <span className="text-slate-900 font-semibold">{new Date(selectedStudent.created_at).toLocaleDateString()}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="px-8 pb-8 flex gap-3">
              {(user?.role === 'admin' || user?.role === 'deputy_manager' ||
                (user?.role === 'program_officer' && selectedStudent.assigned_officer_id === user?.id)) && (
                <button
                  onClick={() => {
                    setShowDetailModal(false);
                    openEditModal(selectedStudent);
                  }}
                  className="flex-1 px-6 py-3 bg-gradient-to-r from-blue-600 to-cyan-600 text-white rounded-lg hover:from-blue-700 hover:to-cyan-700 transition-all font-semibold shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
                >
                  Edit Student Profile
                </button>
              )}
              <button
                onClick={() => {
                  setShowDetailModal(false);
                  setSelectedStudent(null);
                }}
                className="px-6 py-3 bg-slate-100 text-slate-700 rounded-lg hover:bg-slate-200 transition-colors font-semibold"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default StudentManagement;
