import React, { useState } from 'react';
import { 
  FolderOpen, 
  Plus, 
  Search, 
  Filter,
  File,
  Download,
  Eye,
  Trash2,
  Upload,
  FileText,
  Image,
  FileVideo,
  Archive
} from 'lucide-react';
import { User, StudentFile } from '../types';

interface StudentFilesProps {
  user: User;
}

const StudentFiles: React.FC<StudentFilesProps> = ({ user }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState('all');
  const [selectedStudent, setSelectedStudent] = useState('all');

  // Mock file data
  const files: StudentFile[] = [
    {
      id: '1',
      studentId: '1',
      name: 'Academic_Transcript_2024.pdf',
      type: 'application/pdf',
      size: 2.5 * 1024 * 1024, // 2.5MB
      uploadedBy: 'Grace Tembo',
      uploadedDate: '2024-03-01',
      category: 'academic',
      url: '#'
    },
    {
      id: '2',
      studentId: '1',
      name: 'Medical_Certificate.pdf',
      type: 'application/pdf',
      size: 1.2 * 1024 * 1024, // 1.2MB
      uploadedBy: 'Sarah Banda',
      uploadedDate: '2024-02-28',
      category: 'medical',
      url: '#'
    },
    {
      id: '3',
      studentId: '2',
      name: 'Bank_Statement_Feb2024.pdf',
      type: 'application/pdf',
      size: 800 * 1024, // 800KB
      uploadedBy: 'John Banda',
      uploadedDate: '2024-03-02',
      category: 'financial',
      url: '#'
    },
    {
      id: '4',
      studentId: '2',
      name: 'Profile_Photo.jpg',
      type: 'image/jpeg',
      size: 500 * 1024, // 500KB
      uploadedBy: 'John Banda',
      uploadedDate: '2024-01-15',
      category: 'personal',
      url: '#'
    },
    {
      id: '5',
      studentId: '3',
      name: 'Research_Proposal.docx',
      type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      size: 3.2 * 1024 * 1024, // 3.2MB
      uploadedBy: 'Mercy Mwanza',
      uploadedDate: '2024-02-25',
      category: 'academic',
      url: '#'
    },
    {
      id: '6',
      studentId: '4',
      name: 'Identity_Document.pdf',
      type: 'application/pdf',
      size: 1.8 * 1024 * 1024, // 1.8MB
      uploadedBy: 'David Phiri',
      uploadedDate: '2024-01-10',
      category: 'personal',
      url: '#'
    },
    {
      id: '7',
      studentId: '3',
      name: 'Lab_Report_Videos.zip',
      type: 'application/zip',
      size: 15.5 * 1024 * 1024, // 15.5MB
      uploadedBy: 'Mercy Mwanza',
      uploadedDate: '2024-03-03',
      category: 'academic',
      url: '#'
    },
    {
      id: '8',
      studentId: '1',
      name: 'Insurance_Documents.pdf',
      type: 'application/pdf',
      size: 950 * 1024, // 950KB
      uploadedBy: 'Sarah Banda',
      uploadedDate: '2024-02-20',
      category: 'financial',
      url: '#'
    },
  ];

  // Mock student names
  const studentNames: { [key: string]: string } = {
    '1': 'Grace Tembo',
    '2': 'John Banda',
    '3': 'Mercy Mwanza',
    '4': 'David Phiri',
  };

  const filteredFiles = files.filter(file => {
    const matchesSearch = file.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         studentNames[file.studentId]?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesCategory = filterCategory === 'all' || file.category === filterCategory;
    const matchesStudent = selectedStudent === 'all' || file.studentId === selectedStudent;
    
    return matchesSearch && matchesCategory && matchesStudent;
  });

  const getFileIcon = (type: string) => {
    if (type.startsWith('image/')) return <Image className="w-5 h-5" />;
    if (type.startsWith('video/')) return <FileVideo className="w-5 h-5" />;
    if (type.includes('pdf')) return <FileText className="w-5 h-5" />;
    if (type.includes('zip') || type.includes('archive')) return <Archive className="w-5 h-5" />;
    return <File className="w-5 h-5" />;
  };

  const getFileColor = (type: string) => {
    if (type.startsWith('image/')) return 'bg-green-100 text-green-600';
    if (type.startsWith('video/')) return 'bg-purple-100 text-purple-600';
    if (type.includes('pdf')) return 'bg-red-100 text-red-600';
    if (type.includes('zip') || type.includes('archive')) return 'bg-yellow-100 text-yellow-600';
    return 'bg-blue-100 text-blue-600';
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'academic': return 'bg-blue-100 text-blue-800';
      case 'personal': return 'bg-gray-100 text-gray-800';
      case 'financial': return 'bg-green-100 text-green-800';
      case 'medical': return 'bg-red-100 text-red-800';
      case 'other': return 'bg-purple-100 text-purple-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const categoryStats = {
    academic: files.filter(f => f.category === 'academic').length,
    personal: files.filter(f => f.category === 'personal').length,
    financial: files.filter(f => f.category === 'financial').length,
    medical: files.filter(f => f.category === 'medical').length,
    total: files.length,
  };

  const totalSize = files.reduce((sum, file) => sum + file.size, 0);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-emerald-100 rounded-lg flex items-center justify-center">
            <FolderOpen className="w-6 h-6 text-emerald-600" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Student Files</h1>
            <p className="text-gray-600">Manage student documents and files</p>
          </div>
        </div>
        <button className="flex items-center space-x-2 px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 mt-4 sm:mt-0">
          <Upload className="w-4 h-4" />
          <span>Upload File</span>
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-6">
        <div className="bg-white rounded-xl shadow-sm p-6">
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
              <FileText className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{categoryStats.academic}</p>
              <p className="text-sm text-gray-600">Academic</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl shadow-sm p-6">
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center">
              <File className="w-6 h-6 text-gray-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{categoryStats.personal}</p>
              <p className="text-sm text-gray-600">Personal</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl shadow-sm p-6">
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
              <FileText className="w-6 h-6 text-green-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{categoryStats.financial}</p>
              <p className="text-sm text-gray-600">Financial</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl shadow-sm p-6">
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center">
              <FileText className="w-6 h-6 text-red-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{categoryStats.medical}</p>
              <p className="text-sm text-gray-600">Medical</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl shadow-sm p-6">
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 bg-emerald-100 rounded-lg flex items-center justify-center">
              <FolderOpen className="w-6 h-6 text-emerald-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{categoryStats.total}</p>
              <p className="text-sm text-gray-600">Total Files</p>
              <p className="text-xs text-gray-500">{formatFileSize(totalSize)}</p>
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
              placeholder="Search files and students..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 w-full lg:w-80"
            />
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <Filter className="w-5 h-5 text-gray-400" />
            <select
              value={selectedStudent}
              onChange={(e) => setSelectedStudent(e.target.value)}
              className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
            >
              <option value="all">All Students</option>
              {Object.entries(studentNames).map(([id, name]) => (
                <option key={id} value={id}>{name}</option>
              ))}
            </select>
            <select
              value={filterCategory}
              onChange={(e) => setFilterCategory(e.target.value)}
              className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
            >
              <option value="all">All Categories</option>
              <option value="academic">Academic</option>
              <option value="personal">Personal</option>
              <option value="financial">Financial</option>
              <option value="medical">Medical</option>
              <option value="other">Other</option>
            </select>
          </div>
        </div>
      </div>

      {/* Files Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {filteredFiles.map((file) => (
          <div key={file.id} className="bg-white rounded-xl shadow-sm hover:shadow-md transition-shadow p-6">
            <div className="flex items-start justify-between mb-4">
              <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${getFileColor(file.type)}`}>
                {getFileIcon(file.type)}
              </div>
              <span className={`px-2 py-1 rounded-full text-xs font-medium ${getCategoryColor(file.category)}`}>
                {file.category}
              </span>
            </div>

            <div className="mb-4">
              <h3 className="font-medium text-gray-900 mb-1 line-clamp-2" title={file.name}>
                {file.name}
              </h3>
              <p className="text-sm text-gray-600">
                Student: {studentNames[file.studentId]}
              </p>
            </div>

            <div className="space-y-2 mb-4">
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Size:</span>
                <span className="font-medium text-gray-900">{formatFileSize(file.size)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Type:</span>
                <span className="font-medium text-gray-900">
                  {file.type.split('/')[1]?.toUpperCase() || 'Unknown'}
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Uploaded:</span>
                <span className="font-medium text-gray-900">
                  {new Date(file.uploadedDate).toLocaleDateString()}
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">By:</span>
                <span className="font-medium text-gray-900">{file.uploadedBy}</span>
              </div>
            </div>

            <div className="flex items-center justify-between pt-4 border-t border-gray-100">
              <div className="flex items-center space-x-2">
                <button className="p-2 text-gray-400 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg">
                  <Eye className="w-4 h-4" />
                </button>
                <button className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg">
                  <Download className="w-4 h-4" />
                </button>
              </div>
              <button className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg">
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </div>
        ))}
      </div>

      {filteredFiles.length === 0 && (
        <div className="text-center py-12">
          <FolderOpen className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-600">No files found matching your criteria.</p>
        </div>
      )}
    </div>
  );
};

export default StudentFiles;