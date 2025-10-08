import React, { useState } from 'react';
import { Users, Plus, Search, Filter, Eye, CreditCard as Edit, Trash2, GraduationCap, MapPin, Phone, Mail, Calendar, Award, BookOpen, Home, User, Camera, MessageSquare, StickyNote, Send, Smile, Paperclip, X, Upload, Tag, Flag, Lock, Heart, ThumbsUp } from 'lucide-react';
import { User as UserType, Student, StudentNote, ChatMessage, MessageReaction } from '../types';

interface StudentManagementProps {
  user?: UserType;
}

const StudentManagement: React.FC<StudentManagementProps> = ({ user }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterLevel, setFilterLevel] = useState('all');
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showPhotoModal, setShowPhotoModal] = useState(false);
  const [showChatModal, setShowChatModal] = useState(false);
  const [editingStudent, setEditingStudent] = useState<Student | null>(null);
  const [activeTab, setActiveTab] = useState<'notes' | 'chat'>('notes');
  const [newNote, setNewNote] = useState({
    title: '',
    content: '',
    category: 'general' as const,
    priority: 'medium' as const,
    tags: [] as string[],
    isPrivate: false
  });
  const [newMessage, setNewMessage] = useState('');
  const [newTag, setNewTag] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [showBulkModal, setShowBulkModal] = useState(false);
  const [showFilesModal, setShowFilesModal] = useState(false);
  const [newStudent, setNewStudent] = useState<Partial<Student>>({
    fullName: '',
    firstName: '',
    lastName: '',
    email: '',
    contactNumber: '',
    community: '',
    guardianFullName: '',
    guardianCommunity: '',
    guardianContactNumber: '',
    chlNumber: '',
    schoolIdNumber: '',
    nrcNumber: '',
    gender: 'male',
    dateOfBirth: '',
    currentProgram: '',
    programLevel: 'university',
    programStatus: 'enrolled',
    academicStanding: 'good',
    institutionName: '',
    institutionLocation: '',
    areaOfStudy: '',
    programLength: '',
    startDate: '',
    expectedEndDate: '',
    assignedOfficer: '',
    programNotes: '',
    grades: [],
    semesterAverages: [],
    overallGPA: 0,
    accommodation: {
      type: 'university_hostel',
      address: '',
      landlordName: '',
      landlordContact: '',
      monthlyRent: 0,
      paymentMethod: 'direct_to_landlord',
      contractStartDate: '',
      contractEndDate: '',
      notes: ''
    },
    notes: [],
    chatMessages: []
  });
  const [bulkFile, setBulkFile] = useState<File | null>(null);
  const [studentFiles, setStudentFiles] = useState<any[]>([]);

  // Mock student data with comprehensive information
  const students: Student[] = [
    {
      id: '1',
      fullName: 'Grace Tembo',
      firstName: 'Grace',
      lastName: 'Tembo',
      profilePicture: 'https://images.pexels.com/photos/3769021/pexels-photo-3769021.jpeg?auto=compress&cs=tinysrgb&w=400',
      email: 'grace.tembo@student.unza.zm',
      contactNumber: '+260 977 123 456',
      community: 'Chilenje',
      guardianFullName: 'Mary Tembo',
      guardianCommunity: 'Chilenje',
      guardianContactNumber: '+260 966 789 012',
      chlNumber: 'CHL2024001',
      schoolIdNumber: 'UNZA2024001',
      nrcNumber: '123456/78/9',
      gender: 'female',
      dateOfBirth: '2001-05-15',
      age: 22,
      currentProgram: 'Bachelor of Engineering in Civil Engineering',
      programLevel: 'university',
      programStatus: 'enrolled',
      academicStanding: 'good',
      institutionName: 'University of Zambia',
      institutionLocation: 'Lusaka',
      areaOfStudy: 'Civil Engineering',
      programLength: '4 years',
      startDate: '2022-08-15',
      expectedEndDate: '2026-07-15',
      actualGraduationDate: undefined,
      isOnTrack: true,
      assignedOfficer: 'Sarah Banda',
      joinDate: '2022-07-01',
      programNotes: 'Excellent student with strong academic performance. Active in engineering society.',
      grades: [
        {
          id: '1',
          semester: 'Semester 1',
          year: 2024,
          courseName: 'Structural Analysis',
          courseCode: 'CE301',
          credits: 3,
          grade: 'A',
          gradePoints: 4.0,
          uploadedDate: '2024-02-15',
          uploadedBy: 'Grace Tembo',
          documentUrl: '#'
        },
        {
          id: '2',
          semester: 'Semester 1',
          year: 2024,
          courseName: 'Fluid Mechanics',
          courseCode: 'CE302',
          credits: 3,
          grade: 'B+',
          gradePoints: 3.5,
          uploadedDate: '2024-02-15',
          uploadedBy: 'Grace Tembo',
          documentUrl: '#'
        }
      ],
      semesterAverages: [
        {
          semester: 'Semester 1',
          year: 2024,
          gpa: 3.75,
          totalCredits: 6,
          status: 'completed'
        }
      ],
      overallGPA: 3.75,
      accommodation: {
        type: 'university_hostel',
        address: 'UNZA Main Campus, Block A, Room 205',
        landlordName: 'UNZA Accommodation Office',
        landlordContact: '+260 211 293 579',
        monthlyRent: 800,
        paymentMethod: 'direct_to_landlord',
        contractStartDate: '2022-08-01',
        contractEndDate: '2026-07-31',
        notes: 'University hostel accommodation with meal plan included'
      },
      notes: [
        {
          id: '1',
          studentId: '1',
          title: 'Academic Excellence',
          content: 'Grace has consistently maintained high grades and shows excellent understanding of engineering concepts.',
          category: 'academic',
          priority: 'medium',
          createdBy: 'Sarah Banda',
          createdDate: '2024-03-01',
          isPrivate: false,
          tags: ['academic', 'excellence', 'engineering'],
          attachments: []
        }
      ],
      chatMessages: [
        {
          id: '1',
          studentId: '1',
          message: 'Grace is doing exceptionally well in her studies. She might be a good candidate for the leadership program.',
          author: 'Sarah Banda',
          authorRole: 'program_officer',
          createdDate: '2024-03-01T10:30:00Z',
          isEdited: false,
          reactions: [
            {
              emoji: '👍',
              users: ['Michael Phiri'],
              count: 1
            }
          ]
        }
      ]
    },
    {
      id: '2',
      fullName: 'John Banda',
      firstName: 'John',
      lastName: 'Banda',
      profilePicture: 'https://images.pexels.com/photos/3785077/pexels-photo-3785077.jpeg?auto=compress&cs=tinysrgb&w=400',
      email: 'john.banda@student.cbu.ac.zm',
      contactNumber: '+260 955 234 567',
      community: 'Riverside',
      guardianFullName: 'Peter Banda',
      guardianCommunity: 'Riverside',
      guardianContactNumber: '+260 977 345 678',
      chlNumber: 'CHL2024002',
      schoolIdNumber: 'CBU2024002',
      nrcNumber: '234567/89/0',
      gender: 'male',
      dateOfBirth: '2000-11-22',
      age: 23,
      currentProgram: 'Bachelor of Business Administration',
      programLevel: 'university',
      programStatus: 'enrolled',
      academicStanding: 'probation',
      institutionName: 'Copperbelt University',
      institutionLocation: 'Kitwe',
      areaOfStudy: 'Business Administration',
      programLength: '4 years',
      startDate: '2021-08-15',
      expectedEndDate: '2025-07-15',
      actualGraduationDate: undefined,
      isOnTrack: false,
      assignedOfficer: 'Michael Phiri',
      joinDate: '2021-07-01',
      programNotes: 'Student facing academic challenges. Requires additional support and monitoring.',
      grades: [
        {
          id: '3',
          semester: 'Semester 1',
          year: 2024,
          courseName: 'Financial Management',
          courseCode: 'BBA301',
          credits: 3,
          grade: 'C',
          gradePoints: 2.0,
          uploadedDate: '2024-02-15',
          uploadedBy: 'John Banda',
          documentUrl: '#'
        }
      ],
      semesterAverages: [
        {
          semester: 'Semester 1',
          year: 2024,
          gpa: 2.0,
          totalCredits: 3,
          status: 'completed'
        }
      ],
      overallGPA: 2.3,
      accommodation: {
        type: 'private_rental',
        address: 'Plot 123, Riverside, Kitwe',
        landlordName: 'James Mwanza',
        landlordContact: '+260 966 123 456',
        monthlyRent: 1200,
        paymentMethod: 'student_stipend',
        contractStartDate: '2021-08-01',
        contractEndDate: '2025-07-31',
        notes: 'Private rental near campus. Student manages rent payments.'
      },
      notes: [
        {
          id: '2',
          studentId: '2',
          title: 'Academic Support Needed',
          content: 'John is struggling with his coursework. Arranged tutoring sessions and regular check-ins.',
          category: 'academic',
          priority: 'high',
          createdBy: 'Michael Phiri',
          createdDate: '2024-02-28',
          isPrivate: false,
          tags: ['academic', 'support', 'tutoring'],
          attachments: []
        }
      ],
      chatMessages: [
        {
          id: '2',
          studentId: '2',
          message: 'John needs more academic support. I\'ve arranged weekly tutoring sessions.',
          author: 'Michael Phiri',
          authorRole: 'deputy_manager',
          createdDate: '2024-02-28T14:20:00Z',
          isEdited: false,
          reactions: []
        }
      ]
    }
  ];

  const filteredStudents = students.filter(student => {
    const matchesSearch = student.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         student.chlNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         student.institutionName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         student.currentProgram.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = filterStatus === 'all' || student.programStatus === filterStatus;
    const matchesLevel = filterLevel === 'all' || student.programLevel === filterLevel;
    
    return matchesSearch && matchesStatus && matchesLevel;
  });

  const handleEditStudent = (student: Student) => {
    setEditingStudent({ ...student });
    setShowEditModal(true);
  };

  const handleSaveStudent = () => {
    if (editingStudent) {
      // Here you would typically save to backend
      console.log('Saving student:', editingStudent);
      setShowEditModal(false);
      setEditingStudent(null);
    }
  };

  const handleAddStudent = () => {
    // Add student logic here
    const studentToAdd = {
      ...newStudent,
      id: Math.random().toString(36).substr(2, 9),
      age: newStudent.dateOfBirth ? new Date().getFullYear() - new Date(newStudent.dateOfBirth).getFullYear() : 0,
      isOnTrack: true,
      joinDate: new Date().toISOString().split('T')[0],
      profilePicture: `https://images.pexels.com/photos/220453/pexels-photo-220453.jpeg?auto=compress&cs=tinysrgb&w=400`
    } as Student;
    
    console.log('Adding new student:', studentToAdd);
    setShowAddModal(false);
    setNewStudent({
      fullName: '',
      firstName: '',
      lastName: '',
      email: '',
      contactNumber: '',
      community: '',
      guardianFullName: '',
      guardianCommunity: '',
      guardianContactNumber: '',
      chlNumber: '',
      schoolIdNumber: '',
      nrcNumber: '',
      gender: 'male',
      dateOfBirth: '',
      currentProgram: '',
      programLevel: 'university',
      programStatus: 'enrolled',
      academicStanding: 'good',
      institutionName: '',
      institutionLocation: '',
      areaOfStudy: '',
      programLength: '',
      startDate: '',
      expectedEndDate: '',
      assignedOfficer: '',
      programNotes: '',
      grades: [],
      semesterAverages: [],
      overallGPA: 0,
      accommodation: {
        type: 'university_hostel',
        address: '',
        landlordName: '',
        landlordContact: '',
        monthlyRent: 0,
        paymentMethod: 'direct_to_landlord',
        contractStartDate: '',
        contractEndDate: '',
        notes: ''
      },
      notes: [],
      chatMessages: []
    });
  };

  const handleBulkUpload = () => {
    if (bulkFile) {
      // Process bulk upload file
      console.log('Processing bulk upload file:', bulkFile.name);
      // Here you would parse CSV/Excel file and add students
      setShowBulkModal(false);
      setBulkFile(null);
    }
  };

  const handleFileUpload = (file: File) => {
    if (selectedStudent) {
      const newFile = {
        id: Math.random().toString(36).substr(2, 9),
        studentId: selectedStudent.id,
        name: file.name,
        type: file.type,
        size: file.size,
        uploadedBy: user.name,
        uploadedDate: new Date().toISOString().split('T')[0],
        category: 'academic',
        url: URL.createObjectURL(file)
      };
      setStudentFiles([...studentFiles, newFile]);
      console.log('File uploaded:', newFile);
    }
  };

  const handleInputChange = (field: string, value: any) => {
    if (editingStudent) {
      if (field.includes('.')) {
        const [parent, child] = field.split('.');
        setEditingStudent({
          ...editingStudent,
          [parent]: {
            ...editingStudent[parent as keyof Student],
            [child]: value
          }
        });
      } else {
        setEditingStudent({
          ...editingStudent,
          [field]: value
        });
      }
    }
  };

  const handlePhotoUpload = (file: File) => {
    // Here you would typically upload to backend and get URL
    const photoUrl = URL.createObjectURL(file);
    if (selectedStudent) {
      // Update student photo
      console.log('Uploading photo for student:', selectedStudent.id, photoUrl);
    }
    setShowPhotoModal(false);
  };

  const handleAddNote = () => {
    if (selectedStudent && newNote.title && newNote.content) {
      const note: StudentNote = {
        id: Date.now().toString(),
        studentId: selectedStudent.id,
        title: newNote.title,
        content: newNote.content,
        category: newNote.category,
        priority: newNote.priority,
        createdBy: user.name,
        createdDate: new Date().toISOString(),
        isPrivate: newNote.isPrivate,
        tags: newNote.tags,
        attachments: []
      };
      
      // Add note to student (in real app, this would be API call)
      selectedStudent.notes.push(note);
      
      // Reset form
      setNewNote({
        title: '',
        content: '',
        category: 'general',
        priority: 'medium',
        tags: [],
        isPrivate: false
      });
    }
  };

  const handleSendMessage = () => {
    if (selectedStudent && newMessage.trim()) {
      const message: ChatMessage = {
        id: Date.now().toString(),
        studentId: selectedStudent.id,
        message: newMessage,
        author: user.name,
        authorRole: user.role,
        createdDate: new Date().toISOString(),
        isEdited: false,
        reactions: []
      };
      
      // Add message to student (in real app, this would be API call)
      selectedStudent.chatMessages.push(message);
      setNewMessage('');
    }
  };

  const handleAddTag = () => {
    if (newTag.trim() && !newNote.tags.includes(newTag.trim())) {
      setNewNote({
        ...newNote,
        tags: [...newNote.tags, newTag.trim()]
      });
      setNewTag('');
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    setNewNote({
      ...newNote,
      tags: newNote.tags.filter(tag => tag !== tagToRemove)
    });
  };

  const handleReaction = (messageId: string, emoji: string) => {
    if (selectedStudent) {
      const message = selectedStudent.chatMessages.find(m => m.id === messageId);
      if (message) {
        const existingReaction = message.reactions.find(r => r.emoji === emoji);
        if (existingReaction) {
          if (existingReaction.users.includes(user.name)) {
            // Remove reaction
            existingReaction.users = existingReaction.users.filter(u => u !== user.name);
            existingReaction.count = existingReaction.users.length;
            if (existingReaction.count === 0) {
              message.reactions = message.reactions.filter(r => r.emoji !== emoji);
            }
          } else {
            // Add reaction
            existingReaction.users.push(user.name);
            existingReaction.count = existingReaction.users.length;
          }
        } else {
          // Create new reaction
          message.reactions.push({
            emoji,
            users: [user.name],
            count: 1
          });
        }
      }
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'enrolled': return 'bg-green-100 text-green-800';
      case 'graduated': return 'bg-blue-100 text-blue-800';
      case 'discharged': return 'bg-red-100 text-red-800';
      case 'suspended': return 'bg-yellow-100 text-yellow-800';
      case 'transferred': return 'bg-purple-100 text-purple-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getAcademicStandingColor = (standing: string) => {
    switch (standing) {
      case 'excellent': return 'bg-emerald-100 text-emerald-800';
      case 'good': return 'bg-green-100 text-green-800';
      case 'probation': return 'bg-yellow-100 text-yellow-800';
      case 'warning': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'low': return 'bg-green-100 text-green-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'high': return 'bg-orange-100 text-orange-800';
      case 'urgent': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'academic': return 'bg-blue-100 text-blue-800';
      case 'financial': return 'bg-green-100 text-green-800';
      case 'health': return 'bg-red-100 text-red-800';
      case 'accommodation': return 'bg-purple-100 text-purple-800';
      case 'personal': return 'bg-gray-100 text-gray-800';
      default: return 'bg-indigo-100 text-indigo-800';
    }
  };

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'admin': return 'bg-red-100 text-red-800';
      case 'program_officer': return 'bg-blue-100 text-blue-800';
      case 'deputy_manager': return 'bg-purple-100 text-purple-800';
      case 'student': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-emerald-100 rounded-lg flex items-center justify-center">
            <Users className="w-6 h-6 text-emerald-600" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Student Management</h1>
            <p className="text-gray-600">Manage student profiles and academic progress</p>
          </div>
        </div>
        <button className="flex items-center space-x-2 px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 mt-4 sm:mt-0">
          <Plus className="w-4 h-4" />
          <span>Add Student</span>
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white rounded-xl shadow-sm p-6">
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 bg-emerald-100 rounded-lg flex items-center justify-center">
              <Users className="w-6 h-6 text-emerald-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{students.length}</p>
              <p className="text-sm text-gray-600">Total Students</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl shadow-sm p-6">
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
              <GraduationCap className="w-6 h-6 text-green-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{students.filter(s => s.programStatus === 'enrolled').length}</p>
              <p className="text-sm text-gray-600">Enrolled</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl shadow-sm p-6">
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
              <Award className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{students.filter(s => s.academicStanding === 'good' || s.academicStanding === 'excellent').length}</p>
              <p className="text-sm text-gray-600">Good Standing</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl shadow-sm p-6">
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center">
              <BookOpen className="w-6 h-6 text-yellow-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{students.filter(s => s.isOnTrack).length}</p>
              <p className="text-sm text-gray-600">On Track</p>
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
              placeholder="Search students..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 w-full lg:w-80"
            />
          </div>
          <div className="flex items-center space-x-3">
            <Filter className="w-5 h-5 text-gray-400" />
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
            >
              <option value="all">All Status</option>
              <option value="enrolled">Enrolled</option>
              <option value="graduated">Graduated</option>
              <option value="discharged">Discharged</option>
              <option value="suspended">Suspended</option>
              <option value="transferred">Transferred</option>
            </select>
            <select
              value={filterLevel}
              onChange={(e) => setFilterLevel(e.target.value)}
              className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
            >
              <option value="all">All Levels</option>
              <option value="university">University</option>
              <option value="diploma">Diploma</option>
              <option value="trade">Trade</option>
            </select>
          </div>
        </div>
      </div>

      {/* Students Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredStudents.map((student) => (
          <div key={student.id} className="bg-white rounded-xl shadow-sm hover:shadow-md transition-shadow p-6">
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center space-x-3">
                <div className="relative">
                  <img 
                    src={student.profilePicture} 
                    alt={student.fullName}
                    className="w-16 h-16 rounded-full object-cover"
                  />
                  <button 
                    onClick={() => {
                      setSelectedStudent(student);
                      setShowPhotoModal(true);
                    }}
                    className="absolute -bottom-1 -right-1 w-6 h-6 bg-emerald-600 text-white rounded-full flex items-center justify-center hover:bg-emerald-700"
                  >
                    <Camera className="w-3 h-3" />
                  </button>
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900">{student.fullName}</h3>
                  <p className="text-sm text-gray-600">{student.chlNumber}</p>
                  <div className="flex items-center space-x-2 mt-1">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(student.programStatus)}`}>
                      {student.programStatus}
                    </span>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getAcademicStandingColor(student.academicStanding)}`}>
                      {student.academicStanding}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            <div className="space-y-2 mb-4">
              <div className="flex items-center space-x-2 text-sm text-gray-600">
                <GraduationCap className="w-4 h-4" />
                <span className="truncate">{student.currentProgram}</span>
              </div>
              <div className="flex items-center space-x-2 text-sm text-gray-600">
                <MapPin className="w-4 h-4" />
                <span>{student.institutionName}</span>
              </div>
              <div className="flex items-center space-x-2 text-sm text-gray-600">
                <Award className="w-4 h-4" />
                <span>GPA: {student.overallGPA.toFixed(2)}</span>
              </div>
              <div className="flex items-center space-x-2 text-sm text-gray-600">
                <User className="w-4 h-4" />
                <span>{student.assignedOfficer}</span>
              </div>
            </div>

            <div className="flex items-center justify-between pt-4 border-t border-gray-100">
              <div className="flex items-center space-x-2">
                <button 
                  onClick={() => setSelectedStudent(student)}
                  className="p-2 text-gray-400 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg"
                >
                  <Eye className="w-4 h-4" />
                </button>
                <button 
                  onClick={() => handleEditStudent(student)}
                  className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg"
                >
                  <Edit className="w-4 h-4" />
                </button>
                <button 
                  onClick={() => {
                    setSelectedStudent(student);
                    setShowChatModal(true);
                  }}
                  className="p-2 text-gray-400 hover:text-purple-600 hover:bg-purple-50 rounded-lg relative"
                >
                  <MessageSquare className="w-4 h-4" />
                  {student.chatMessages.length > 0 && (
                    <span className="absolute -top-1 -right-1 w-4 h-4 bg-purple-600 text-white text-xs rounded-full flex items-center justify-center">
                      {student.chatMessages.length}
                    </span>
                  )}
                </button>
              </div>
              <div className="text-xs text-gray-500">
                {student.isOnTrack ? '✅ On Track' : '⚠️ Behind'}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Student Detail Modal */}
      {selectedStudent && !showEditModal && !showPhotoModal && !showChatModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <img 
                    src={selectedStudent.profilePicture} 
                    alt={selectedStudent.fullName}
                    className="w-20 h-20 rounded-full object-cover"
                  />
                  <div>
                    <h3 className="text-xl font-semibold text-gray-900">{selectedStudent.fullName}</h3>
                    <p className="text-gray-600">{selectedStudent.chlNumber}</p>
                    <div className="flex items-center space-x-2 mt-2">
                      <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(selectedStudent.programStatus)}`}>
                        {selectedStudent.programStatus}
                      </span>
                      <span className={`px-3 py-1 rounded-full text-sm font-medium ${getAcademicStandingColor(selectedStudent.academicStanding)}`}>
                        {selectedStudent.academicStanding}
                      </span>
                    </div>
                  </div>
                </div>
                <button 
                  onClick={() => setSelectedStudent(null)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>
            </div>
            
            <div className="p-6 space-y-6">
              {/* Personal Information */}
              <div>
                <h4 className="font-semibold text-gray-900 mb-3">Personal Information</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                  <div><span className="text-gray-600">Email:</span> {selectedStudent.email}</div>
                  <div><span className="text-gray-600">Phone:</span> {selectedStudent.contactNumber}</div>
                  <div><span className="text-gray-600">Community:</span> {selectedStudent.community}</div>
                  <div><span className="text-gray-600">Gender:</span> {selectedStudent.gender}</div>
                  <div><span className="text-gray-600">Date of Birth:</span> {selectedStudent.dateOfBirth}</div>
                  <div><span className="text-gray-600">Age:</span> {selectedStudent.age}</div>
                  <div><span className="text-gray-600">NRC:</span> {selectedStudent.nrcNumber}</div>
                  <div><span className="text-gray-600">School ID:</span> {selectedStudent.schoolIdNumber}</div>
                </div>
              </div>

              {/* Guardian Information */}
              <div>
                <h4 className="font-semibold text-gray-900 mb-3">Guardian Information</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                  <div><span className="text-gray-600">Name:</span> {selectedStudent.guardianFullName}</div>
                  <div><span className="text-gray-600">Community:</span> {selectedStudent.guardianCommunity}</div>
                  <div><span className="text-gray-600">Contact:</span> {selectedStudent.guardianContactNumber}</div>
                </div>
              </div>

              {/* Academic Information */}
              <div>
                <h4 className="font-semibold text-gray-900 mb-3">Academic Information</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                  <div><span className="text-gray-600">Program:</span> {selectedStudent.currentProgram}</div>
                  <div><span className="text-gray-600">Level:</span> {selectedStudent.programLevel}</div>
                  <div><span className="text-gray-600">Institution:</span> {selectedStudent.institutionName}</div>
                  <div><span className="text-gray-600">Location:</span> {selectedStudent.institutionLocation}</div>
                  <div><span className="text-gray-600">Area of Study:</span> {selectedStudent.areaOfStudy}</div>
                  <div><span className="text-gray-600">Program Length:</span> {selectedStudent.programLength}</div>
                  <div><span className="text-gray-600">Start Date:</span> {selectedStudent.startDate}</div>
                  <div><span className="text-gray-600">Expected End:</span> {selectedStudent.expectedEndDate}</div>
                  <div><span className="text-gray-600">Overall GPA:</span> {selectedStudent.overallGPA.toFixed(2)}</div>
                  <div><span className="text-gray-600">Assigned Officer:</span> {selectedStudent.assignedOfficer}</div>
                </div>
              </div>

              {/* Accommodation Information */}
              <div>
                <h4 className="font-semibold text-gray-900 mb-3">Accommodation Information</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                  <div><span className="text-gray-600">Type:</span> {selectedStudent.accommodation.type.replace('_', ' ')}</div>
                  <div><span className="text-gray-600">Monthly Rent:</span> ZMW {selectedStudent.accommodation.monthlyRent}</div>
                  <div><span className="text-gray-600">Payment Method:</span> {selectedStudent.accommodation.paymentMethod.replace('_', ' ')}</div>
                  <div className="md:col-span-2"><span className="text-gray-600">Address:</span> {selectedStudent.accommodation.address}</div>
                  {selectedStudent.accommodation.landlordName && (
                    <>
                      <div><span className="text-gray-600">Landlord:</span> {selectedStudent.accommodation.landlordName}</div>
                      <div><span className="text-gray-600">Landlord Contact:</span> {selectedStudent.accommodation.landlordContact}</div>
                    </>
                  )}
                </div>
              </div>

              {/* Program Notes */}
              {selectedStudent.programNotes && (
                <div>
                  <h4 className="font-semibold text-gray-900 mb-3">Program Notes</h4>
                  <p className="text-sm text-gray-700 bg-gray-50 p-3 rounded-lg">{selectedStudent.programNotes}</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Edit Student Modal */}
      {showEditModal && editingStudent && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h3 className="text-xl font-semibold text-gray-900">Edit Student Profile</h3>
                <button 
                  onClick={() => setShowEditModal(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>
            </div>
            
            <div className="p-6 space-y-6">
              {/* Personal Information */}
              <div>
                <h4 className="font-semibold text-gray-900 mb-3">Personal Information</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">First Name</label>
                    <input
                      type="text"
                      value={editingStudent.firstName}
                      onChange={(e) => handleInputChange('firstName', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Last Name</label>
                    <input
                      type="text"
                      value={editingStudent.lastName}
                      onChange={(e) => handleInputChange('lastName', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                    <input
                      type="email"
                      value={editingStudent.email}
                      onChange={(e) => handleInputChange('email', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Contact Number</label>
                    <input
                      type="tel"
                      value={editingStudent.contactNumber}
                      onChange={(e) => handleInputChange('contactNumber', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Community</label>
                    <input
                      type="text"
                      value={editingStudent.community}
                      onChange={(e) => handleInputChange('community', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Gender</label>
                    <select
                      value={editingStudent.gender}
                      onChange={(e) => handleInputChange('gender', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                    >
                      <option value="male">Male</option>
                      <option value="female">Female</option>
                      <option value="other">Other</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Date of Birth</label>
                    <input
                      type="date"
                      value={editingStudent.dateOfBirth}
                      onChange={(e) => handleInputChange('dateOfBirth', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">CHL Number</label>
                    <input
                      type="text"
                      value={editingStudent.chlNumber}
                      onChange={(e) => handleInputChange('chlNumber', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">School ID Number</label>
                    <input
                      type="text"
                      value={editingStudent.schoolIdNumber}
                      onChange={(e) => handleInputChange('schoolIdNumber', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">NRC Number</label>
                    <input
                      type="text"
                      value={editingStudent.nrcNumber}
                      onChange={(e) => handleInputChange('nrcNumber', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                    />
                  </div>
                </div>
              </div>

              {/* Guardian Information */}
              <div>
                <h4 className="font-semibold text-gray-900 mb-3">Guardian Information</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Guardian Full Name</label>
                    <input
                      type="text"
                      value={editingStudent.guardianFullName}
                      onChange={(e) => handleInputChange('guardianFullName', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Guardian Community</label>
                    <input
                      type="text"
                      value={editingStudent.guardianCommunity}
                      onChange={(e) => handleInputChange('guardianCommunity', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Guardian Contact Number</label>
                    <input
                      type="tel"
                      value={editingStudent.guardianContactNumber}
                      onChange={(e) => handleInputChange('guardianContactNumber', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                    />
                  </div>
                </div>
              </div>

              {/* Academic Information */}
              <div>
                <h4 className="font-semibold text-gray-900 mb-3">Academic Information</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Current Program</label>
                    <input
                      type="text"
                      value={editingStudent.currentProgram}
                      onChange={(e) => handleInputChange('currentProgram', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Program Level</label>
                    <select
                      value={editingStudent.programLevel}
                      onChange={(e) => handleInputChange('programLevel', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                    >
                      <option value="university">University</option>
                      <option value="diploma">Diploma</option>
                      <option value="trade">Trade</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Program Status</label>
                    <select
                      value={editingStudent.programStatus}
                      onChange={(e) => handleInputChange('programStatus', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                    >
                      <option value="enrolled">Enrolled</option>
                      <option value="graduated">Graduated</option>
                      <option value="discharged">Discharged</option>
                      <option value="suspended">Suspended</option>
                      <option value="transferred">Transferred</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Academic Standing</label>
                    <select
                      value={editingStudent.academicStanding}
                      onChange={(e) => handleInputChange('academicStanding', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                    >
                      <option value="excellent">Excellent</option>
                      <option value="good">Good</option>
                      <option value="probation">Probation</option>
                      <option value="warning">Warning</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Institution Name</label>
                    <input
                      type="text"
                      value={editingStudent.institutionName}
                      onChange={(e) => handleInputChange('institutionName', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Institution Location</label>
                    <input
                      type="text"
                      value={editingStudent.institutionLocation}
                      onChange={(e) => handleInputChange('institutionLocation', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Area of Study</label>
                    <input
                      type="text"
                      value={editingStudent.areaOfStudy}
                      onChange={(e) => handleInputChange('areaOfStudy', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Program Length</label>
                    <input
                      type="text"
                      value={editingStudent.programLength}
                      onChange={(e) => handleInputChange('programLength', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Start Date</label>
                    <input
                      type="date"
                      value={editingStudent.startDate}
                      onChange={(e) => handleInputChange('startDate', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Expected End Date</label>
                    <input
                      type="date"
                      value={editingStudent.expectedEndDate}
                      onChange={(e) => handleInputChange('expectedEndDate', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Assigned Officer</label>
                    <input
                      type="text"
                      value={editingStudent.assignedOfficer}
                      onChange={(e) => handleInputChange('assignedOfficer', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                    />
                  </div>
                </div>
              </div>

              {/* Accommodation Information */}
              <div>
                <h4 className="font-semibold text-gray-900 mb-3">Accommodation Information</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Accommodation Type</label>
                    <select
                      value={editingStudent.accommodation.type}
                      onChange={(e) => handleInputChange('accommodation.type', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                    >
                      <option value="university_hostel">University Hostel</option>
                      <option value="private_rental">Private Rental</option>
                      <option value="family_home">Family Home</option>
                      <option value="other">Other</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Monthly Rent (ZMW)</label>
                    <input
                      type="number"
                      value={editingStudent.accommodation.monthlyRent}
                      onChange={(e) => handleInputChange('accommodation.monthlyRent', parseInt(e.target.value))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Payment Method</label>
                    <select
                      value={editingStudent.accommodation.paymentMethod}
                      onChange={(e) => handleInputChange('accommodation.paymentMethod', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                    >
                      <option value="direct_to_landlord">Direct to Landlord</option>
                      <option value="student_stipend">Student Stipend</option>
                      <option value="mixed">Mixed</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Contract Start Date</label>
                    <input
                      type="date"
                      value={editingStudent.accommodation.contractStartDate}
                      onChange={(e) => handleInputChange('accommodation.contractStartDate', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Contract End Date</label>
                    <input
                      type="date"
                      value={editingStudent.accommodation.contractEndDate}
                      onChange={(e) => handleInputChange('accommodation.contractEndDate', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                    />
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1">Address</label>
                    <textarea
                      value={editingStudent.accommodation.address}
                      onChange={(e) => handleInputChange('accommodation.address', e.target.value)}
                      rows={2}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                    />
                  </div>
                  {editingStudent.accommodation.landlordName && (
                    <>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Landlord Name</label>
                        <input
                          type="text"
                          value={editingStudent.accommodation.landlordName}
                          onChange={(e) => handleInputChange('accommodation.landlordName', e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Landlord Contact</label>
                        <input
                          type="text"
                          value={editingStudent.accommodation.landlordContact || ''}
                          onChange={(e) => handleInputChange('accommodation.landlordContact', e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                        />
                      </div>
                    </>
                  )}
                </div>
              </div>

              {/* Program Notes */}
              <div>
                <h4 className="font-semibold text-gray-900 mb-3">Program Notes</h4>
                <textarea
                  value={editingStudent.programNotes}
                  onChange={(e) => handleInputChange('programNotes', e.target.value)}
                  rows={4}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                  placeholder="Add any notes about the student's program..."
                />
              </div>
            </div>

            <div className="p-6 border-t border-gray-200 flex justify-end space-x-3">
              <button
                onClick={() => setShowEditModal(false)}
                className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveStudent}
                className="px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700"
              >
                Save Changes
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Photo Upload Modal */}
      {showPhotoModal && selectedStudent && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-md w-full">
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-gray-900">Update Profile Photo</h3>
                <button 
                  onClick={() => setShowPhotoModal(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>
            </div>
            
            <div className="p-6">
              <div className="text-center">
                <img 
                  src={selectedStudent.profilePicture} 
                  alt={selectedStudent.fullName}
                  className="w-32 h-32 rounded-full object-cover mx-auto mb-4"
                />
                <p className="text-sm text-gray-600 mb-4">Current photo for {selectedStudent.fullName}</p>
                
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 hover:border-emerald-500 transition-colors">
                  <Upload className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                  <p className="text-sm text-gray-600 mb-2">Drop a new photo here or click to browse</p>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) handlePhotoUpload(file);
                    }}
                    className="hidden"
                    id="photo-upload"
                  />
                  <label
                    htmlFor="photo-upload"
                    className="inline-flex items-center px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 cursor-pointer"
                  >
                    Choose File
                  </label>
                  <p className="text-xs text-gray-500 mt-2">PNG, JPG up to 5MB</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Chat/Notes Modal */}
      {showChatModal && selectedStudent && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col">
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <img 
                    src={selectedStudent.profilePicture} 
                    alt={selectedStudent.fullName}
                    className="w-10 h-10 rounded-full object-cover"
                  />
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">{selectedStudent.fullName}</h3>
                    <p className="text-sm text-gray-600">Student Communication</p>
                  </div>
                </div>
                <button 
                  onClick={() => setShowChatModal(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>
              
              <div className="flex items-center space-x-1 mt-4">
                <button
                  onClick={() => setActiveTab('notes')}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                    activeTab === 'notes' 
                      ? 'bg-emerald-100 text-emerald-700' 
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  <div className="flex items-center space-x-2">
                    <StickyNote className="w-4 h-4" />
                    <span>Notes ({selectedStudent.notes.length})</span>
                  </div>
                </button>
                <button
                  onClick={() => setActiveTab('chat')}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                    activeTab === 'chat' 
                      ? 'bg-emerald-100 text-emerald-700' 
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  <div className="flex items-center space-x-2">
                    <MessageSquare className="w-4 h-4" />
                    <span>Chat ({selectedStudent.chatMessages.length})</span>
                  </div>
                </button>
              </div>
            </div>
            
            <div className="flex-1 overflow-hidden flex flex-col">
              {activeTab === 'notes' && (
                <>
                  <div className="flex-1 overflow-y-auto p-6">
                    <div className="space-y-4">
                      {selectedStudent.notes.map((note) => (
                        <div key={note.id} className="bg-gray-50 rounded-lg p-4">
                          <div className="flex items-start justify-between mb-2">
                            <div className="flex items-center space-x-2">
                              <h4 className="font-medium text-gray-900">{note.title}</h4>
                              <span className={`px-2 py-1 rounded-full text-xs font-medium ${getCategoryColor(note.category)}`}>
                                {note.category}
                              </span>
                              <span className={`px-2 py-1 rounded-full text-xs font-medium ${getPriorityColor(note.priority)}`}>
                                {note.priority}
                              </span>
                              {note.isPrivate && (
                                <Lock className="w-4 h-4 text-gray-400" />
                              )}
                            </div>
                            <span className="text-xs text-gray-500">
                              {new Date(note.createdDate).toLocaleDateString()}
                            </span>
                          </div>
                          <p className="text-gray-700 mb-3">{note.content}</p>
                          <div className="flex items-center justify-between">
                            <div className="flex flex-wrap gap-1">
                              {note.tags.map((tag, index) => (
                                <span key={index} className="inline-flex items-center space-x-1 px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-xs">
                                  <Tag className="w-3 h-3" />
                                  <span>{tag}</span>
                                </span>
                              ))}
                            </div>
                            <span className="text-xs text-gray-500">by {note.createdBy}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                  
                  <div className="border-t border-gray-200 p-6">
                    <div className="space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <input
                          type="text"
                          placeholder="Note title..."
                          value={newNote.title}
                          onChange={(e) => setNewNote({ ...newNote, title: e.target.value })}
                          className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                        />
                        <div className="flex space-x-2">
                          <select
                            value={newNote.category}
                            onChange={(e) => setNewNote({ ...newNote, category: e.target.value as any })}
                            className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                          >
                            <option value="general">General</option>
                            <option value="academic">Academic</option>
                            <option value="financial">Financial</option>
                            <option value="health">Health</option>
                            <option value="accommodation">Accommodation</option>
                            <option value="personal">Personal</option>
                          </select>
                          <select
                            value={newNote.priority}
                            onChange={(e) => setNewNote({ ...newNote, priority: e.target.value as any })}
                            className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                          >
                            <option value="low">Low</option>
                            <option value="medium">Medium</option>
                            <option value="high">High</option>
                            <option value="urgent">Urgent</option>
                          </select>
                        </div>
                      </div>
                      
                      <textarea
                        placeholder="Add your note here..."
                        value={newNote.content}
                        onChange={(e) => setNewNote({ ...newNote, content: e.target.value })}
                        rows={3}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                      />
                      
                      <div className="flex items-center space-x-4">
                        <div className="flex items-center space-x-2">
                          <input
                            type="text"
                            placeholder="Add tag..."
                            value={newTag}
                            onChange={(e) => setNewTag(e.target.value)}
                            onKeyPress={(e) => e.key === 'Enter' && handleAddTag()}
                            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                          />
                          <button
                            onClick={handleAddTag}
                            className="px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                          >
                            <Tag className="w-4 h-4" />
                          </button>
                        </div>
                        
                        <label className="flex items-center space-x-2">
                          <input
                            type="checkbox"
                            checked={newNote.isPrivate}
                            onChange={(e) => setNewNote({ ...newNote, isPrivate: e.target.checked })}
                            className="rounded border-gray-300 text-emerald-600 focus:ring-emerald-500"
                          />
                          <span className="text-sm text-gray-700">Private note</span>
                        </label>
                      </div>
                      
                      {newNote.tags.length > 0 && (
                        <div className="flex flex-wrap gap-2">
                          {newNote.tags.map((tag, index) => (
                            <span key={index} className="inline-flex items-center space-x-1 px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-xs">
                              <Tag className="w-3 h-3" />
                              <span>{tag}</span>
                              <button
                                onClick={() => handleRemoveTag(tag)}
                                className="text-blue-600 hover:text-blue-800"
                              >
                                <X className="w-3 h-3" />
                              </button>
                            </span>
                          ))}
                        </div>
                      )}
                      
                      <div className="flex justify-end">
                        <button
                          onClick={handleAddNote}
                          disabled={!newNote.title || !newNote.content}
                          className="px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          Add Note
                        </button>
                      </div>
                    </div>
                  </div>
                </>
              )}
              
              {activeTab === 'chat' && (
                <>
                  <div className="flex-1 overflow-y-auto p-6">
                    <div className="space-y-4">
                      {selectedStudent.chatMessages.map((message) => (
                        <div key={message.id} className="flex items-start space-x-3">
                          <div className="w-8 h-8 bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-full flex items-center justify-center">
                            <span className="text-white font-semibold text-xs">
                              {message.author.charAt(0)}
                            </span>
                          </div>
                          <div className="flex-1">
                            <div className="flex items-center space-x-2 mb-1">
                              <span className="font-medium text-gray-900">{message.author}</span>
                              <span className={`px-2 py-1 rounded-full text-xs font-medium ${getRoleColor(message.authorRole)}`}>
                                {message.authorRole.replace('_', ' ')}
                              </span>
                              <span className="text-xs text-gray-500">
                                {new Date(message.createdDate).toLocaleString()}
                              </span>
                            </div>
                            <p className="text-gray-700 mb-2">{message.message}</p>
                            <div className="flex items-center space-x-2">
                              {message.reactions.map((reaction, index) => (
                                <button
                                  key={index}
                                  onClick={() => handleReaction(message.id, reaction.emoji)}
                                  className={`inline-flex items-center space-x-1 px-2 py-1 rounded-full text-xs ${
                                    reaction.users.includes(user.name) 
                                      ? 'bg-emerald-100 text-emerald-800' 
                                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                                  }`}
                                >
                                  <span>{reaction.emoji}</span>
                                  <span>{reaction.count}</span>
                                </button>
                              ))}
                              <button
                                onClick={() => handleReaction(message.id, '👍')}
                                className="p-1 text-gray-400 hover:text-emerald-600 rounded"
                              >
                                <ThumbsUp className="w-4 h-4" />
                              </button>
                              <button
                                onClick={() => handleReaction(message.id, '❤️')}
                                className="p-1 text-gray-400 hover:text-red-600 rounded"
                              >
                                <Heart className="w-4 h-4" />
                              </button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                  
                  <div className="border-t border-gray-200 p-6">
                    <div className="flex items-center space-x-3">
                      <div className="flex-1">
                        <textarea
                          placeholder="Type your message..."
                          value={newMessage}
                          onChange={(e) => setNewMessage(e.target.value)}
                          onKeyPress={(e) => {
                            if (e.key === 'Enter' && !e.shiftKey) {
                              e.preventDefault();
                              handleSendMessage();
                            }
                          }}
                          rows={2}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 resize-none"
                        />
                      </div>
                      <div className="flex flex-col space-y-2">
                        <button className="p-2 text-gray-400 hover:text-gray-600 rounded-lg">
                          <Paperclip className="w-5 h-5" />
                        </button>
                        <button className="p-2 text-gray-400 hover:text-gray-600 rounded-lg">
                          <Smile className="w-5 h-5" />
                        </button>
                        <button
                          onClick={handleSendMessage}
                          disabled={!newMessage.trim()}
                          className="p-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          <Send className="w-5 h-5" />
                        </button>
                      </div>
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      )}

      {filteredStudents.length === 0 && (
        <div className="text-center py-12">
          <Users className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-600">No students found matching your criteria.</p>
        </div>
      )}

      {/* Add Student Modal */}
        {showAddModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
              <div className="p-6 border-b border-gray-200">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold text-gray-900">Add New Student</h3>
                  <button 
                    onClick={() => setShowAddModal(false)}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    <X className="w-6 h-6" />
                  </button>
                </div>
              </div>
              <div className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Personal Information */}
                  <div className="space-y-4">
                    <h4 className="font-medium text-gray-900">Personal Information</h4>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">First Name</label>
                        <input
                          type="text"
                          value={newStudent.firstName || ''}
                          onChange={(e) => setNewStudent({...newStudent, firstName: e.target.value, fullName: `${e.target.value} ${newStudent.lastName || ''}`})}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Last Name</label>
                        <input
                          type="text"
                          value={newStudent.lastName || ''}
                          onChange={(e) => setNewStudent({...newStudent, lastName: e.target.value, fullName: `${newStudent.firstName || ''} ${e.target.value}`})}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                      <input
                        type="email"
                        value={newStudent.email || ''}
                        onChange={(e) => setNewStudent({...newStudent, email: e.target.value})}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Contact Number</label>
                      <input
                        type="tel"
                        value={newStudent.contactNumber || ''}
                        onChange={(e) => setNewStudent({...newStudent, contactNumber: e.target.value})}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Community</label>
                      <input
                        type="text"
                        value={newStudent.community || ''}
                        onChange={(e) => setNewStudent({...newStudent, community: e.target.value})}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Gender</label>
                        <select
                          value={newStudent.gender || 'male'}
                          onChange={(e) => setNewStudent({...newStudent, gender: e.target.value as 'male' | 'female' | 'other'})}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                        >
                          <option value="male">Male</option>
                          <option value="female">Female</option>
                          <option value="other">Other</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Date of Birth</label>
                        <input
                          type="date"
                          value={newStudent.dateOfBirth || ''}
                          onChange={(e) => setNewStudent({...newStudent, dateOfBirth: e.target.value})}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                        />
                      </div>
                    </div>
                    <div className="grid grid-cols-1 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">CHL Number</label>
                        <input
                          type="text"
                          value={newStudent.chlNumber || ''}
                          onChange={(e) => setNewStudent({...newStudent, chlNumber: e.target.value})}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">School ID Number</label>
                        <input
                          type="text"
                          value={newStudent.schoolIdNumber || ''}
                          onChange={(e) => setNewStudent({...newStudent, schoolIdNumber: e.target.value})}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">NRC Number</label>
                        <input
                          type="text"
                          value={newStudent.nrcNumber || ''}
                          onChange={(e) => setNewStudent({...newStudent, nrcNumber: e.target.value})}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Guardian Information */}
                  <div className="space-y-4">
                    <h4 className="font-medium text-gray-900">Guardian Information</h4>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Guardian Full Name</label>
                      <input
                        type="text"
                        value={newStudent.guardianFullName || ''}
                        onChange={(e) => setNewStudent({...newStudent, guardianFullName: e.target.value})}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Guardian Community</label>
                      <input
                        type="text"
                        value={newStudent.guardianCommunity || ''}
                        onChange={(e) => setNewStudent({...newStudent, guardianCommunity: e.target.value})}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Guardian Contact Number</label>
                      <input
                        type="tel"
                        value={newStudent.guardianContactNumber || ''}
                        onChange={(e) => setNewStudent({...newStudent, guardianContactNumber: e.target.value})}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                      />
                    </div>

                    <h4 className="font-medium text-gray-900 mt-6">Academic Information</h4>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Current Program</label>
                      <input
                        type="text"
                        value={newStudent.currentProgram || ''}
                        onChange={(e) => setNewStudent({...newStudent, currentProgram: e.target.value})}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Program Level</label>
                        <select
                          value={newStudent.programLevel || 'university'}
                          onChange={(e) => setNewStudent({...newStudent, programLevel: e.target.value as 'university' | 'diploma' | 'trade'})}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                        >
                          <option value="university">University</option>
                          <option value="diploma">Diploma</option>
                          <option value="trade">Trade</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Program Status</label>
                        <select
                          value={newStudent.programStatus || 'enrolled'}
                          onChange={(e) => setNewStudent({...newStudent, programStatus: e.target.value as any})}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                        >
                          <option value="enrolled">Enrolled</option>
                          <option value="graduated">Graduated</option>
                          <option value="discharged">Discharged</option>
                          <option value="suspended">Suspended</option>
                          <option value="transferred">Transferred</option>
                        </select>
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Institution Name</label>
                      <input
                        type="text"
                        value={newStudent.institutionName || ''}
                        onChange={(e) => setNewStudent({...newStudent, institutionName: e.target.value})}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Institution Location</label>
                      <input
                        type="text"
                        value={newStudent.institutionLocation || ''}
                        onChange={(e) => setNewStudent({...newStudent, institutionLocation: e.target.value})}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Area of Study</label>
                      <input
                        type="text"
                        value={newStudent.areaOfStudy || ''}
                        onChange={(e) => setNewStudent({...newStudent, areaOfStudy: e.target.value})}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Assigned Officer</label>
                      <input
                        type="text"
                        value={newStudent.assignedOfficer || ''}
                        onChange={(e) => setNewStudent({...newStudent, assignedOfficer: e.target.value})}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                      />
                    </div>
                  </div>
                </div>

                <div className="mt-6 flex justify-end space-x-3">
                  <button
                    onClick={() => setShowAddModal(false)}
                    className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleAddStudent}
                    className="px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700"
                  >
                    Add Student
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Bulk Upload Modal */}
        {showBulkModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl max-w-2xl w-full">
              <div className="p-6 border-b border-gray-200">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold text-gray-900">Bulk Upload Students</h3>
                  <button 
                    onClick={() => setShowBulkModal(false)}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    <X className="w-6 h-6" />
                  </button>
                </div>
              </div>
              <div className="p-6">
                <div className="space-y-6">
                  <div>
                    <h4 className="font-medium text-gray-900 mb-3">Upload Instructions</h4>
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                      <ul className="text-sm text-blue-800 space-y-1">
                        <li>• Upload a CSV or Excel file with student information</li>
                        <li>• Required columns: First Name, Last Name, Email, CHL Number</li>
                        <li>• Optional columns: Contact Number, Community, Guardian Name, etc.</li>
                        <li>• Maximum file size: 10MB</li>
                      </ul>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Select File (CSV or Excel)
                    </label>
                    <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-emerald-400 transition-colors">
                      <input
                        type="file"
                        accept=".csv,.xlsx,.xls"
                        onChange={(e) => setBulkFile(e.target.files?.[0] || null)}
                        className="hidden"
                        id="bulk-upload"
                      />
                      <label htmlFor="bulk-upload" className="cursor-pointer">
                        <FileUp className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                        <p className="text-gray-600">
                          {bulkFile ? bulkFile.name : 'Click to select file or drag and drop'}
                        </p>
                        <p className="text-sm text-gray-500 mt-1">CSV, XLSX, XLS up to 10MB</p>
                      </label>
                    </div>
                  </div>

                  <div className="flex items-center space-x-3">
                    <button className="flex items-center space-x-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50">
                      <Download className="w-4 h-4" />
                      <span>Download Template</span>
                    </button>
                  </div>
                </div>

                <div className="mt-6 flex justify-end space-x-3">
                  <button
                    onClick={() => setShowBulkModal(false)}
                    className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleBulkUpload}
                    disabled={!bulkFile}
                    className="px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Upload Students
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Student Files Modal */}
        {showFilesModal && selectedStudent && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
              <div className="p-6 border-b border-gray-200">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">
                      {selectedStudent.fullName} - Files
                    </h3>
                    <p className="text-sm text-gray-600">CHL: {selectedStudent.chlNumber}</p>
                  </div>
                  <button 
                    onClick={() => setShowFilesModal(false)}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    <X className="w-6 h-6" />
                  </button>
                </div>
              </div>
              <div className="p-6">
                {/* File Upload Area */}
                <div className="mb-6">
                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-emerald-400 transition-colors">
                    <input
                      type="file"
                      multiple
                      onChange={(e) => {
                        const files = Array.from(e.target.files || []);
                        files.forEach(file => handleFileUpload(file));
                      }}
                      className="hidden"
                      id="file-upload"
                    />
                    <label htmlFor="file-upload" className="cursor-pointer">
                      <Upload className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                      <p className="text-gray-600">Click to upload files or drag and drop</p>
                      <p className="text-sm text-gray-500 mt-1">PDF, DOC, DOCX, JPG, PNG up to 10MB each</p>
                    </label>
                  </div>
                </div>

                {/* File Categories */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                  <div className="bg-blue-50 rounded-lg p-4 text-center">
                    <FileText className="w-8 h-8 text-blue-600 mx-auto mb-2" />
                    <h4 className="font-medium text-blue-900">Academic</h4>
                    <p className="text-sm text-blue-700">Transcripts, Certificates</p>
                  </div>
                  <div className="bg-green-50 rounded-lg p-4 text-center">
                    <DollarSign className="w-8 h-8 text-green-600 mx-auto mb-2" />
                    <h4 className="font-medium text-green-900">Financial</h4>
                    <p className="text-sm text-green-700">Bank Statements, Receipts</p>
                  </div>
                  <div className="bg-red-50 rounded-lg p-4 text-center">
                    <Heart className="w-8 h-8 text-red-600 mx-auto mb-2" />
                    <h4 className="font-medium text-red-900">Medical</h4>
                    <p className="text-sm text-red-700">Health Records, Reports</p>
                  </div>
                  <div className="bg-gray-50 rounded-lg p-4 text-center">
                    <UserIcon className="w-8 h-8 text-gray-600 mx-auto mb-2" />
                    <h4 className="font-medium text-gray-900">Personal</h4>
                    <p className="text-sm text-gray-700">ID Documents, Photos</p>
                  </div>
                </div>

                {/* Files List */}
                <div className="space-y-3">
                  <h4 className="font-medium text-gray-900">Uploaded Files ({studentFiles.filter(f => f.studentId === selectedStudent.id).length})</h4>
                  {studentFiles.filter(f => f.studentId === selectedStudent.id).length === 0 ? (
                    <div className="text-center py-8 text-gray-500">
                      <FolderOpen className="w-12 h-12 mx-auto mb-4 text-gray-400" />
                      <p>No files uploaded yet</p>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {studentFiles.filter(f => f.studentId === selectedStudent.id).map((file) => (
                        <div key={file.id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                          <div className="flex items-start justify-between">
                            <div className="flex items-center space-x-3">
                              <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                                <FileText className="w-5 h-5 text-blue-600" />
                              </div>
                              <div>
                                <p className="font-medium text-gray-900 text-sm">{file.name}</p>
                                <p className="text-xs text-gray-500">
                                  {(file.size / 1024 / 1024).toFixed(2)} MB • {file.uploadedDate}
                                </p>
                                <p className="text-xs text-gray-500">By {file.uploadedBy}</p>
                              </div>
                            </div>
                            <div className="flex items-center space-x-2">
                              <button className="p-1 text-gray-400 hover:text-blue-600">
                                <Eye className="w-4 h-4" />
                              </button>
                              <button className="p-1 text-gray-400 hover:text-green-600">
                                <Download className="w-4 h-4" />
                              </button>
                              <button className="p-1 text-gray-400 hover:text-red-600">
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}
    </div>
  );
};

export default StudentManagement;