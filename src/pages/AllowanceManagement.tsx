import React, { useState, useEffect } from 'react';
import {
  DollarSign,
  Plus,
  Search,
  Filter,
  Download,
  Eye,
  Check,
  X,
  Clock,
  AlertCircle,
  Send,
  Upload,
  FileText,
  MessageSquare,
  ChevronRight
} from 'lucide-react';
import { User, Allowance, AllowanceComment } from '../types';
import { supabase } from '../lib/supabase';
import {
  parseCSVFile,
  processBulkAllowances,
  downloadCSVTemplate,
  getApprovalStageLabel,
  getApprovalStageColor,
  getUserRoleFromUserRole,
  BulkUploadResult
} from '../lib/allowanceHelpers';

interface AllowanceManagementProps {
  user: User;
}

const AllowanceManagement: React.FC<AllowanceManagementProps> = ({ user }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStage, setFilterStage] = useState('all');
  const [showBulkModal, setShowBulkModal] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [showApprovalModal, setShowApprovalModal] = useState(false);
  const [selectedAllowance, setSelectedAllowance] = useState<Allowance | null>(null);
  const [allowances, setAllowances] = useState<Allowance[]>([]);
  const [comments, setComments] = useState<AllowanceComment[]>([]);
  const [loading, setLoading] = useState(true);
  const [bulkFile, setBulkFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [uploadResult, setUploadResult] = useState<BulkUploadResult | null>(null);
  const [approvalAction, setApprovalAction] = useState<'approve' | 'deny'>('approve');
  const [approvalComment, setApprovalComment] = useState('');
  const [newAllowance, setNewAllowance] = useState({
    studentId: '',
    studentName: '',
    month: '',
    year: new Date().getFullYear(),
    programLevel: 'university' as 'launch_year' | 'university' | 'college',
    stipend: 0,
    medical: 0,
    transportation: 0,
    schoolSupplies: 0,
    accommodation: 0,
    flmiComments: ''
  });

  useEffect(() => {
    fetchAllowances();
  }, []);

  const fetchAllowances = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('allowances')
        .select('*')
        .order('submitted_date', { ascending: false });

      if (error) throw error;

      const formattedData: Allowance[] = (data || []).map(item => ({
        id: item.id,
        studentId: item.student_id,
        studentName: item.student_name,
        month: item.month,
        year: item.year,
        programLevel: item.program_level || 'university',
        stipend: parseFloat(item.stipend || 0),
        medical: parseFloat(item.medical || 0),
        transportation: parseFloat(item.transportation || 0),
        schoolSupplies: parseFloat(item.school_supplies || 0),
        accommodation: parseFloat(item.accommodation || 0),
        total: parseFloat(item.total || 0),
        approvalStage: item.approval_stage || 'pending_dpm',
        submittedBy: item.submitted_by,
        submittedById: item.submitted_by_id,
        submittedDate: new Date(item.submitted_date).toISOString().split('T')[0],
        dpmApprovedBy: item.dpm_approved_by,
        dpmApprovedById: item.dpm_approved_by_id,
        dpmApprovedDate: item.dpm_approved_date ? new Date(item.dpm_approved_date).toISOString().split('T')[0] : undefined,
        dpmStatus: item.dpm_status,
        dpmComments: item.dpm_comments,
        flmiApprovedBy: item.flmi_approved_by,
        flmiApprovedById: item.flmi_approved_by_id,
        flmiApprovedDate: item.flmi_approved_date ? new Date(item.flmi_approved_date).toISOString().split('T')[0] : undefined,
        flmiStatus: item.flmi_status,
        flmiComments: item.flmi_comments,
        pmApprovedBy: item.pm_approved_by,
        pmApprovedById: item.pm_approved_by_id,
        pmApprovedDate: item.pm_approved_date ? new Date(item.pm_approved_date).toISOString().split('T')[0] : undefined,
        pmStatus: item.pm_status,
        pmComments: item.pm_comments,
        rejectionReason: item.rejection_reason,
        rejectedAtStage: item.rejected_at_stage,
        rejectedBy: item.rejected_by,
        rejectedDate: item.rejected_date ? new Date(item.rejected_date).toISOString().split('T')[0] : undefined,
        flmzComments: item.flmz_comments
      }));

      setAllowances(formattedData);
    } catch (error) {
      console.error('Error fetching allowances:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchComments = async (allowanceId: string) => {
    try {
      const { data, error } = await supabase
        .from('allowance_comments')
        .select('*')
        .eq('allowance_id', allowanceId)
        .order('created_at', { ascending: true });

      if (error) throw error;

      const formattedComments: AllowanceComment[] = (data || []).map(item => ({
        id: item.id,
        allowanceId: item.allowance_id,
        userId: item.user_id,
        userName: item.user_name,
        userRole: item.user_role,
        action: item.action,
        commentText: item.comment_text,
        stage: item.stage,
        createdAt: item.created_at
      }));

      setComments(formattedComments);
    } catch (error) {
      console.error('Error fetching comments:', error);
    }
  };

  const handleAddAllowance = async () => {
    try {
      const isLaunchYear = newAllowance.programLevel === 'launch_year';
      const medical = isLaunchYear ? 0 : newAllowance.medical;
      const transportation = isLaunchYear ? 0 : newAllowance.transportation;
      const schoolSupplies = isLaunchYear ? 0 : newAllowance.schoolSupplies;
      const accommodation = isLaunchYear ? 0 : newAllowance.accommodation;

      const total = newAllowance.stipend + medical + transportation + schoolSupplies + accommodation;

      const { error } = await supabase
        .from('allowances')
        .insert([{
          student_id: newAllowance.studentId,
          student_name: newAllowance.studentName,
          month: newAllowance.month,
          year: newAllowance.year,
          program_level: newAllowance.programLevel,
          stipend: newAllowance.stipend,
          medical,
          transportation,
          school_supplies: schoolSupplies,
          accommodation,
          total,
          approval_stage: 'pending_dpm',
          submitted_by: user.name,
          submitted_by_id: user.id,
          flmi_comments: newAllowance.flmiComments || null
        }]);

      if (error) throw error;

      setShowAddModal(false);
      setNewAllowance({
        studentId: '',
        studentName: '',
        month: '',
        year: new Date().getFullYear(),
        programLevel: 'university',
        stipend: 0,
        medical: 0,
        transportation: 0,
        schoolSupplies: 0,
        accommodation: 0,
        flmiComments: ''
      });
      fetchAllowances();
      alert('Allowance submitted successfully!');
    } catch (error) {
      console.error('Error adding allowance:', error);
      alert('Failed to add allowance. Please try again.');
    }
  };

  const handleApproval = async () => {
    if (!selectedAllowance || !approvalComment.trim()) {
      alert('Please provide a comment for your decision.');
      return;
    }

    try {
      const currentStage = selectedAllowance.approvalStage;
      let updateData: any = {};
      let nextStage = '';
      let commentStage: AllowanceComment['stage'] = 'submission';
      let userRoleForComment = getUserRoleFromUserRole(user.role);

      if (currentStage === 'pending_dpm' && user.role === 'deputy_manager') {
        updateData = {
          dpm_approved_by: user.name,
          dpm_approved_by_id: user.id,
          dpm_approved_date: new Date().toISOString(),
          dpm_status: approvalAction === 'approve' ? 'approved' : 'denied',
          dpm_comments: approvalComment,
          approval_stage: approvalAction === 'approve' ? 'pending_flmi' : 'rejected'
        };
        nextStage = approvalAction === 'approve' ? 'pending_flmi' : 'rejected';
        commentStage = 'dpm_review';
        if (approvalAction === 'deny') {
          updateData.rejection_reason = approvalComment;
          updateData.rejected_at_stage = 'dpm_review';
          updateData.rejected_by = user.name;
          updateData.rejected_date = new Date().toISOString();
        }
      } else if (currentStage === 'pending_flmi' && (user.role === 'admin' || user.role === 'program_officer')) {
        updateData = {
          flmi_approved_by: user.name,
          flmi_approved_by_id: user.id,
          flmi_approved_date: new Date().toISOString(),
          flmi_status: approvalAction === 'approve' ? 'approved' : 'denied',
          flmi_comments: approvalComment,
          approval_stage: approvalAction === 'approve' ? 'pending_pm' : 'rejected'
        };
        nextStage = approvalAction === 'approve' ? 'pending_pm' : 'rejected';
        commentStage = 'flmi_review';
        userRoleForComment = 'flmi_advisor';
        if (approvalAction === 'deny') {
          updateData.rejection_reason = approvalComment;
          updateData.rejected_at_stage = 'flmi_review';
          updateData.rejected_by = user.name;
          updateData.rejected_date = new Date().toISOString();
        }
      } else if (currentStage === 'pending_pm' && (user.role === 'admin' || user.role === 'program_officer')) {
        updateData = {
          pm_approved_by: user.name,
          pm_approved_by_id: user.id,
          pm_approved_date: new Date().toISOString(),
          pm_status: approvalAction === 'approve' ? 'approved' : 'denied',
          pm_comments: approvalComment,
          approval_stage: approvalAction === 'approve' ? 'approved' : 'rejected'
        };
        nextStage = approvalAction === 'approve' ? 'approved' : 'rejected';
        commentStage = 'pm_review';
        userRoleForComment = 'program_manager';
        if (approvalAction === 'deny') {
          updateData.rejection_reason = approvalComment;
          updateData.rejected_at_stage = 'pm_review';
          updateData.rejected_by = user.name;
          updateData.rejected_date = new Date().toISOString();
        }
      } else {
        alert('You do not have permission to approve at this stage.');
        return;
      }

      const { error: updateError } = await supabase
        .from('allowances')
        .update(updateData)
        .eq('id', selectedAllowance.id);

      if (updateError) throw updateError;

      const { error: commentError } = await supabase
        .from('allowance_comments')
        .insert([{
          allowance_id: selectedAllowance.id,
          user_id: user.id,
          user_name: user.name,
          user_role: userRoleForComment,
          action: approvalAction === 'approve' ? 'approved' : 'denied',
          comment_text: approvalComment,
          stage: commentStage
        }]);

      if (commentError) throw commentError;

      setShowApprovalModal(false);
      setApprovalComment('');
      setSelectedAllowance(null);
      fetchAllowances();
      alert(`Allowance ${approvalAction === 'approve' ? 'approved' : 'denied'} successfully!`);
    } catch (error) {
      console.error('Error processing approval:', error);
      alert('Failed to process approval. Please try again.');
    }
  };

  const handleMarkAsPaid = async (allowanceId: string) => {
    try {
      const { error } = await supabase
        .from('allowances')
        .update({ approval_stage: 'paid' })
        .eq('id', allowanceId);

      if (error) throw error;

      const { error: commentError } = await supabase
        .from('allowance_comments')
        .insert([{
          allowance_id: allowanceId,
          user_id: user.id,
          user_name: user.name,
          user_role: getUserRoleFromUserRole(user.role),
          action: 'paid',
          comment_text: 'Payment processed',
          stage: 'payment'
        }]);

      if (commentError) console.error('Error adding comment:', commentError);

      fetchAllowances();
      alert('Allowance marked as paid successfully!');
    } catch (error) {
      console.error('Error marking as paid:', error);
      alert('Failed to mark allowance as paid. Please try again.');
    }
  };

  const handleBulkUpload = async () => {
    if (!bulkFile) {
      alert('Please select a file to upload.');
      return;
    }

    try {
      setUploading(true);
      setUploadResult(null);

      const rows = await parseCSVFile(bulkFile);
      const result = await processBulkAllowances(rows, user.id, user.name);

      setUploadResult(result);

      if (result.success > 0) {
        fetchAllowances();
      }

      if (result.failed === 0) {
        alert(`Successfully uploaded ${result.success} allowances!`);
        setShowBulkModal(false);
        setBulkFile(null);
      }
    } catch (error) {
      console.error('Error during bulk upload:', error);
      alert('Failed to process bulk upload. Please check your file and try again.');
    } finally {
      setUploading(false);
    }
  };

  const viewAllowanceDetails = (allowance: Allowance) => {
    setSelectedAllowance(allowance);
    fetchComments(allowance.id);
    setShowDetailModal(true);
  };

  const openApprovalModal = (allowance: Allowance, action: 'approve' | 'deny') => {
    setSelectedAllowance(allowance);
    setApprovalAction(action);
    setApprovalComment('');
    setShowApprovalModal(true);
  };

  const filteredAllowances = allowances.filter(allowance => {
    const matchesSearch = allowance.studentName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         allowance.month.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesFilter = filterStage === 'all' || allowance.approvalStage === filterStage;

    return matchesSearch && matchesFilter;
  });

  const getStageIcon = (stage: string) => {
    switch (stage) {
      case 'pending_dpm':
      case 'pending_flmi':
      case 'pending_pm':
        return <Clock className="w-4 h-4" />;
      case 'approved':
        return <Check className="w-4 h-4" />;
      case 'rejected':
        return <X className="w-4 h-4" />;
      case 'paid':
        return <DollarSign className="w-4 h-4" />;
      default:
        return <AlertCircle className="w-4 h-4" />;
    }
  };

  const canApprove = (allowance: Allowance): boolean => {
    if (allowance.approvalStage === 'pending_dpm' && user.role === 'deputy_manager') return true;
    if (allowance.approvalStage === 'pending_flmi' && (user.role === 'admin' || user.role === 'program_officer')) return true;
    if (allowance.approvalStage === 'pending_pm' && (user.role === 'admin' || user.role === 'program_officer')) return true;
    return false;
  };

  const totalPendingDPM = allowances.filter(a => a.approvalStage === 'pending_dpm').reduce((sum, a) => sum + a.total, 0);
  const totalPendingFLMI = allowances.filter(a => a.approvalStage === 'pending_flmi').reduce((sum, a) => sum + a.total, 0);
  const totalPendingPM = allowances.filter(a => a.approvalStage === 'pending_pm').reduce((sum, a) => sum + a.total, 0);
  const totalApproved = allowances.filter(a => a.approvalStage === 'approved').reduce((sum, a) => sum + a.total, 0);
  const totalPaid = allowances.filter(a => a.approvalStage === 'paid').reduce((sum, a) => sum + a.total, 0);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-emerald-100 rounded-lg flex items-center justify-center">
            <DollarSign className="w-6 h-6 text-emerald-600" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Allowance Management</h1>
            <p className="text-gray-600">Manage student allowances and multi-stage approvals</p>
          </div>
        </div>
        <div className="flex items-center space-x-3 mt-4 sm:mt-0">
          <button
            onClick={() => setShowAddModal(true)}
            className="flex items-center space-x-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
          >
            <Plus className="w-4 h-4" />
            <span className="hidden sm:inline">Add Allowance</span>
          </button>
          <button
            onClick={() => setShowBulkModal(true)}
            className="flex items-center space-x-2 px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700"
          >
            <Upload className="w-4 h-4" />
            <span className="hidden sm:inline">Bulk Upload</span>
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        <div className="bg-white rounded-xl shadow-sm p-4">
          <div className="flex items-center space-x-2">
            <div className="w-10 h-10 bg-yellow-100 rounded-lg flex items-center justify-center">
              <Clock className="w-5 h-5 text-yellow-600" />
            </div>
            <div>
              <p className="text-lg font-bold text-gray-900">ZMW {totalPendingDPM.toLocaleString()}</p>
              <p className="text-xs text-gray-600">Pending DPM</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl shadow-sm p-4">
          <div className="flex items-center space-x-2">
            <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center">
              <Clock className="w-5 h-5 text-orange-600" />
            </div>
            <div>
              <p className="text-lg font-bold text-gray-900">ZMW {totalPendingFLMI.toLocaleString()}</p>
              <p className="text-xs text-gray-600">Pending FLMI</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl shadow-sm p-4">
          <div className="flex items-center space-x-2">
            <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
              <Clock className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <p className="text-lg font-bold text-gray-900">ZMW {totalPendingPM.toLocaleString()}</p>
              <p className="text-xs text-gray-600">Pending PM</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl shadow-sm p-4">
          <div className="flex items-center space-x-2">
            <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
              <Check className="w-5 h-5 text-green-600" />
            </div>
            <div>
              <p className="text-lg font-bold text-gray-900">ZMW {totalApproved.toLocaleString()}</p>
              <p className="text-xs text-gray-600">Approved</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl shadow-sm p-4">
          <div className="flex items-center space-x-2">
            <div className="w-10 h-10 bg-emerald-100 rounded-lg flex items-center justify-center">
              <DollarSign className="w-5 h-5 text-emerald-600" />
            </div>
            <div>
              <p className="text-lg font-bold text-gray-900">ZMW {totalPaid.toLocaleString()}</p>
              <p className="text-xs text-gray-600">Paid</p>
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
              placeholder="Search allowances..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 w-full sm:w-80"
            />
          </div>
          <div className="flex items-center space-x-3">
            <Filter className="w-5 h-5 text-gray-400" />
            <select
              value={filterStage}
              onChange={(e) => setFilterStage(e.target.value)}
              className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
            >
              <option value="all">All Stages</option>
              <option value="pending_dpm">Pending Deputy Manager</option>
              <option value="pending_flmi">Pending FLMI</option>
              <option value="pending_pm">Pending Program Manager</option>
              <option value="approved">Approved</option>
              <option value="rejected">Rejected</option>
              <option value="paid">Paid</option>
            </select>
          </div>
        </div>
      </div>

      {/* Allowances Table */}
      {loading ? (
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600 mx-auto"></div>
          <p className="text-gray-600 mt-4">Loading allowances...</p>
        </div>
      ) : filteredAllowances.length === 0 ? (
        <div className="text-center py-12">
          <DollarSign className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-600">No allowances found matching your criteria.</p>
        </div>
      ) : (
        <div className="bg-white rounded-xl shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="text-left px-6 py-4 font-medium text-gray-900">Student</th>
                  <th className="text-left px-6 py-4 font-medium text-gray-900">Period</th>
                  <th className="text-left px-6 py-4 font-medium text-gray-900">Program</th>
                  <th className="text-left px-6 py-4 font-medium text-gray-900">Total</th>
                  <th className="text-left px-6 py-4 font-medium text-gray-900">Stage</th>
                  <th className="text-left px-6 py-4 font-medium text-gray-900">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {filteredAllowances.map((allowance) => (
                  <tr key={allowance.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <div className="flex items-center space-x-3">
                        <div className="w-8 h-8 bg-emerald-100 rounded-full flex items-center justify-center">
                          <span className="text-emerald-600 font-semibold text-sm">
                            {allowance.studentName.split(' ').map(n => n[0]).join('')}
                          </span>
                        </div>
                        <div>
                          <p className="font-medium text-gray-900">{allowance.studentName}</p>
                          <p className="text-sm text-gray-500">ID: {allowance.studentId}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div>
                        <p className="font-medium text-gray-900">{allowance.month} {allowance.year}</p>
                        <p className="text-sm text-gray-500">Submitted: {allowance.submittedDate}</p>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-sm capitalize text-gray-700">
                        {allowance.programLevel.replace('_', ' ')}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <p className="text-lg font-bold text-gray-900">ZMW {allowance.total.toLocaleString()}</p>
                    </td>
                    <td className="px-6 py-4">
                      <div className={`inline-flex items-center space-x-2 px-3 py-1 rounded-full text-sm font-medium border ${getApprovalStageColor(allowance.approvalStage)}`}>
                        {getStageIcon(allowance.approvalStage)}
                        <span>{getApprovalStageLabel(allowance.approvalStage)}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => viewAllowanceDetails(allowance)}
                          className="p-2 text-gray-400 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg"
                          title="View Details"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        {canApprove(allowance) && (
                          <>
                            <button
                              onClick={() => openApprovalModal(allowance, 'approve')}
                              className="p-2 text-gray-400 hover:text-green-600 hover:bg-green-50 rounded-lg"
                              title="Approve"
                            >
                              <Check className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => openApprovalModal(allowance, 'deny')}
                              className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg"
                              title="Deny"
                            >
                              <X className="w-4 h-4" />
                            </button>
                          </>
                        )}
                        {allowance.approvalStage === 'approved' && user.role === 'admin' && (
                          <button
                            onClick={() => handleMarkAsPaid(allowance.id)}
                            className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg"
                            title="Mark as Paid"
                          >
                            <Send className="w-4 h-4" />
                          </button>
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

      {/* Add Allowance Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-gray-900">Add New Allowance</h3>
                <button
                  onClick={() => setShowAddModal(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>
            </div>
            <div className="p-6">
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Student ID</label>
                    <input
                      type="text"
                      value={newAllowance.studentId}
                      onChange={(e) => setNewAllowance({...newAllowance, studentId: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                      placeholder="Enter student ID"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Student Name</label>
                    <input
                      type="text"
                      value={newAllowance.studentName}
                      onChange={(e) => setNewAllowance({...newAllowance, studentName: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                      placeholder="Enter student name"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Month</label>
                    <select
                      value={newAllowance.month}
                      onChange={(e) => setNewAllowance({...newAllowance, month: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                    >
                      <option value="">Select Month</option>
                      {['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'].map(m => (
                        <option key={m} value={m}>{m}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Year</label>
                    <input
                      type="number"
                      value={newAllowance.year}
                      onChange={(e) => setNewAllowance({...newAllowance, year: parseInt(e.target.value)})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Program Level</label>
                    <select
                      value={newAllowance.programLevel}
                      onChange={(e) => setNewAllowance({...newAllowance, programLevel: e.target.value as any})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                    >
                      <option value="university">University</option>
                      <option value="college">College</option>
                      <option value="launch_year">Launch Year</option>
                    </select>
                  </div>
                </div>

                <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                  <p className="text-sm text-blue-800">
                    <strong>Note:</strong> Launch Year programs only receive stipend. University and College programs receive all allowance types.
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Stipend (ZMW)</label>
                    <input
                      type="number"
                      value={newAllowance.stipend}
                      onChange={(e) => setNewAllowance({...newAllowance, stipend: parseFloat(e.target.value) || 0})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                    />
                  </div>
                  {newAllowance.programLevel !== 'launch_year' && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Medical (ZMW)</label>
                      <input
                        type="number"
                        value={newAllowance.medical}
                        onChange={(e) => setNewAllowance({...newAllowance, medical: parseFloat(e.target.value) || 0})}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                      />
                    </div>
                  )}
                </div>

                {newAllowance.programLevel !== 'launch_year' && (
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Transportation (ZMW)</label>
                      <input
                        type="number"
                        value={newAllowance.transportation}
                        onChange={(e) => setNewAllowance({...newAllowance, transportation: parseFloat(e.target.value) || 0})}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">School Supplies (ZMW)</label>
                      <input
                        type="number"
                        value={newAllowance.schoolSupplies}
                        onChange={(e) => setNewAllowance({...newAllowance, schoolSupplies: parseFloat(e.target.value) || 0})}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                      />
                    </div>
                  </div>
                )}

                {newAllowance.programLevel !== 'launch_year' && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Accommodation (ZMW)</label>
                    <input
                      type="number"
                      value={newAllowance.accommodation}
                      onChange={(e) => setNewAllowance({...newAllowance, accommodation: parseFloat(e.target.value) || 0})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                    />
                  </div>
                )}

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">FLMI Comments</label>
                  <textarea
                    value={newAllowance.flmiComments}
                    onChange={(e) => setNewAllowance({...newAllowance, flmiComments: e.target.value})}
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                    placeholder="Add any comments about this allowance..."
                  />
                </div>

                <div className="bg-gray-50 rounded-lg p-4">
                  <div className="flex justify-between items-center">
                    <span className="font-medium text-gray-900">Total Amount:</span>
                    <span className="text-xl font-bold text-emerald-600">
                      ZMW {(
                        newAllowance.stipend +
                        (newAllowance.programLevel !== 'launch_year' ? newAllowance.medical : 0) +
                        (newAllowance.programLevel !== 'launch_year' ? newAllowance.transportation : 0) +
                        (newAllowance.programLevel !== 'launch_year' ? newAllowance.schoolSupplies : 0) +
                        (newAllowance.programLevel !== 'launch_year' ? newAllowance.accommodation : 0)
                      ).toLocaleString()}
                    </span>
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
                  onClick={handleAddAllowance}
                  className="px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700"
                >
                  Submit Allowance
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Bulk Upload Modal */}
      {showBulkModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-gray-900">Bulk Upload Allowances</h3>
                <button
                  onClick={() => {
                    setShowBulkModal(false);
                    setBulkFile(null);
                    setUploadResult(null);
                  }}
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
                  <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-4">
                    <ul className="text-sm text-emerald-800 space-y-1">
                      <li>• Upload a CSV file with allowance information</li>
                      <li>• Required columns: student_id, student_name, month, year, program_level, stipend</li>
                      <li>• Program levels: launch_year (stipend only), university, college (all allowances)</li>
                      <li>• Optional columns: medical, transportation, school_supplies, accommodation, flmi_comments</li>
                      <li>• Launch Year programs: Only stipend is processed, other fields ignored</li>
                      <li>• University/College: All allowance types can be provided</li>
                      <li>• Maximum file size: 10MB</li>
                    </ul>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Select CSV File
                  </label>
                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-emerald-400 transition-colors">
                    <input
                      type="file"
                      accept=".csv"
                      onChange={(e) => setBulkFile(e.target.files?.[0] || null)}
                      className="hidden"
                      id="bulk-allowance-upload"
                    />
                    <label htmlFor="bulk-allowance-upload" className="cursor-pointer">
                      <FileText className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                      <p className="text-gray-600">
                        {bulkFile ? bulkFile.name : 'Click to select CSV file or drag and drop'}
                      </p>
                      <p className="text-sm text-gray-500 mt-1">CSV up to 10MB</p>
                    </label>
                  </div>
                </div>

                <div className="flex items-center space-x-3">
                  <button
                    onClick={downloadCSVTemplate}
                    className="flex items-center space-x-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
                  >
                    <Download className="w-4 h-4" />
                    <span>Download Template</span>
                  </button>
                </div>

                {uploadResult && (
                  <div className={`rounded-lg p-4 ${uploadResult.failed === 0 ? 'bg-green-50 border border-green-200' : 'bg-yellow-50 border border-yellow-200'}`}>
                    <h4 className="font-medium mb-2">Upload Results</h4>
                    <p className="text-sm mb-2">
                      <strong>Success:</strong> {uploadResult.success} allowances uploaded
                    </p>
                    <p className="text-sm mb-2">
                      <strong>Failed:</strong> {uploadResult.failed} allowances
                    </p>
                    {uploadResult.errors.length > 0 && (
                      <div className="mt-3 max-h-40 overflow-y-auto">
                        <p className="text-sm font-medium mb-1">Errors:</p>
                        <ul className="text-sm space-y-1">
                          {uploadResult.errors.slice(0, 10).map((err, idx) => (
                            <li key={idx} className="text-red-700">
                              Row {err.row}: {err.error}
                            </li>
                          ))}
                          {uploadResult.errors.length > 10 && (
                            <li className="text-gray-600">... and {uploadResult.errors.length - 10} more errors</li>
                          )}
                        </ul>
                      </div>
                    )}
                  </div>
                )}
              </div>

              <div className="mt-6 flex justify-end space-x-3">
                <button
                  onClick={() => {
                    setShowBulkModal(false);
                    setBulkFile(null);
                    setUploadResult(null);
                  }}
                  className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  onClick={handleBulkUpload}
                  disabled={!bulkFile || uploading}
                  className="px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
                >
                  {uploading ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                      <span>Uploading...</span>
                    </>
                  ) : (
                    <>
                      <Upload className="w-4 h-4" />
                      <span>Upload Allowances</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Detail Modal */}
      {showDetailModal && selectedAllowance && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-gray-900">Allowance Details</h3>
                <button
                  onClick={() => {
                    setShowDetailModal(false);
                    setSelectedAllowance(null);
                  }}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>
            </div>
            <div className="p-6">
              <div className="grid grid-cols-2 gap-6 mb-6">
                <div>
                  <h4 className="font-medium text-gray-900 mb-3">Student Information</h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Name:</span>
                      <span className="font-medium">{selectedAllowance.studentName}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">ID:</span>
                      <span className="font-medium">{selectedAllowance.studentId}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Period:</span>
                      <span className="font-medium">{selectedAllowance.month} {selectedAllowance.year}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Program:</span>
                      <span className="font-medium capitalize">{selectedAllowance.programLevel.replace('_', ' ')}</span>
                    </div>
                  </div>
                </div>
                <div>
                  <h4 className="font-medium text-gray-900 mb-3">Allowance Breakdown</h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Stipend:</span>
                      <span className="font-medium">ZMW {selectedAllowance.stipend.toLocaleString()}</span>
                    </div>
                    {selectedAllowance.programLevel !== 'launch_year' && (
                      <>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Medical:</span>
                          <span className="font-medium">ZMW {selectedAllowance.medical.toLocaleString()}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Transportation:</span>
                          <span className="font-medium">ZMW {selectedAllowance.transportation.toLocaleString()}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">School Supplies:</span>
                          <span className="font-medium">ZMW {selectedAllowance.schoolSupplies.toLocaleString()}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Accommodation:</span>
                          <span className="font-medium">ZMW {selectedAllowance.accommodation.toLocaleString()}</span>
                        </div>
                      </>
                    )}
                    <div className="flex justify-between pt-2 border-t">
                      <span className="text-gray-900 font-medium">Total:</span>
                      <span className="font-bold text-emerald-600">ZMW {selectedAllowance.total.toLocaleString()}</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="mb-6">
                <h4 className="font-medium text-gray-900 mb-3">Approval Timeline</h4>
                <div className="space-y-3">
                  <div className="flex items-start space-x-3">
                    <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                      <Check className="w-4 h-4 text-blue-600" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <p className="font-medium text-gray-900">Submitted</p>
                        <span className="text-sm text-gray-500">{selectedAllowance.submittedDate}</span>
                      </div>
                      <p className="text-sm text-gray-600">By {selectedAllowance.submittedBy}</p>
                    </div>
                  </div>

                  <div className="flex items-start space-x-3">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                      selectedAllowance.dpmStatus ? 'bg-green-100' : 'bg-gray-100'
                    }`}>
                      {selectedAllowance.dpmStatus === 'approved' ? (
                        <Check className="w-4 h-4 text-green-600" />
                      ) : selectedAllowance.dpmStatus === 'denied' ? (
                        <X className="w-4 h-4 text-red-600" />
                      ) : (
                        <Clock className="w-4 h-4 text-gray-400" />
                      )}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <p className="font-medium text-gray-900">Deputy Program Manager</p>
                        {selectedAllowance.dpmApprovedDate && (
                          <span className="text-sm text-gray-500">{selectedAllowance.dpmApprovedDate}</span>
                        )}
                      </div>
                      {selectedAllowance.dpmApprovedBy && (
                        <p className="text-sm text-gray-600">By {selectedAllowance.dpmApprovedBy}</p>
                      )}
                      {selectedAllowance.dpmComments && (
                        <p className="text-sm text-gray-600 mt-1 italic">{selectedAllowance.dpmComments}</p>
                      )}
                    </div>
                  </div>

                  {selectedAllowance.dpmStatus === 'approved' && (
                    <div className="flex items-start space-x-3">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                        selectedAllowance.flmiStatus ? 'bg-green-100' : 'bg-gray-100'
                      }`}>
                        {selectedAllowance.flmiStatus === 'approved' ? (
                          <Check className="w-4 h-4 text-green-600" />
                        ) : selectedAllowance.flmiStatus === 'denied' ? (
                          <X className="w-4 h-4 text-red-600" />
                        ) : (
                          <Clock className="w-4 h-4 text-gray-400" />
                        )}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center justify-between">
                          <p className="font-medium text-gray-900">FLMI Senior Advisor</p>
                          {selectedAllowance.flmiApprovedDate && (
                            <span className="text-sm text-gray-500">{selectedAllowance.flmiApprovedDate}</span>
                          )}
                        </div>
                        {selectedAllowance.flmiApprovedBy && (
                          <p className="text-sm text-gray-600">By {selectedAllowance.flmiApprovedBy}</p>
                        )}
                        {selectedAllowance.flmiComments && (
                          <p className="text-sm text-gray-600 mt-1 italic">{selectedAllowance.flmiComments}</p>
                        )}
                      </div>
                    </div>
                  )}

                  {selectedAllowance.flmiStatus === 'approved' && (
                    <div className="flex items-start space-x-3">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                        selectedAllowance.pmStatus ? 'bg-green-100' : 'bg-gray-100'
                      }`}>
                        {selectedAllowance.pmStatus === 'approved' ? (
                          <Check className="w-4 h-4 text-green-600" />
                        ) : selectedAllowance.pmStatus === 'denied' ? (
                          <X className="w-4 h-4 text-red-600" />
                        ) : (
                          <Clock className="w-4 h-4 text-gray-400" />
                        )}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center justify-between">
                          <p className="font-medium text-gray-900">Program Manager</p>
                          {selectedAllowance.pmApprovedDate && (
                            <span className="text-sm text-gray-500">{selectedAllowance.pmApprovedDate}</span>
                          )}
                        </div>
                        {selectedAllowance.pmApprovedBy && (
                          <p className="text-sm text-gray-600">By {selectedAllowance.pmApprovedBy}</p>
                        )}
                        {selectedAllowance.pmComments && (
                          <p className="text-sm text-gray-600 mt-1 italic">{selectedAllowance.pmComments}</p>
                        )}
                      </div>
                    </div>
                  )}

                  {selectedAllowance.approvalStage === 'rejected' && (
                    <div className="mt-3 p-3 bg-red-50 border border-red-200 rounded-lg">
                      <p className="text-sm font-medium text-red-800">Rejected at: {selectedAllowance.rejectedAtStage}</p>
                      <p className="text-sm text-red-700">Reason: {selectedAllowance.rejectionReason}</p>
                    </div>
                  )}
                </div>
              </div>

              <div className="flex justify-end">
                <button
                  onClick={() => {
                    setShowDetailModal(false);
                    setSelectedAllowance(null);
                  }}
                  className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Approval Modal */}
      {showApprovalModal && selectedAllowance && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-lg w-full">
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-gray-900">
                  {approvalAction === 'approve' ? 'Approve' : 'Deny'} Allowance
                </h3>
                <button
                  onClick={() => {
                    setShowApprovalModal(false);
                    setApprovalComment('');
                    setSelectedAllowance(null);
                  }}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>
            </div>
            <div className="p-6">
              <div className="mb-4">
                <p className="text-sm text-gray-600 mb-2">
                  Student: <strong>{selectedAllowance.studentName}</strong>
                </p>
                <p className="text-sm text-gray-600 mb-2">
                  Period: <strong>{selectedAllowance.month} {selectedAllowance.year}</strong>
                </p>
                <p className="text-sm text-gray-600">
                  Amount: <strong>ZMW {selectedAllowance.total.toLocaleString()}</strong>
                </p>
              </div>

              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Comment <span className="text-red-500">*</span>
                </label>
                <textarea
                  value={approvalComment}
                  onChange={(e) => setApprovalComment(e.target.value)}
                  rows={4}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                  placeholder={`Please provide a reason for ${approvalAction === 'approve' ? 'approval' : 'denial'}...`}
                />
              </div>

              <div className="flex justify-end space-x-3">
                <button
                  onClick={() => {
                    setShowApprovalModal(false);
                    setApprovalComment('');
                    setSelectedAllowance(null);
                  }}
                  className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  onClick={handleApproval}
                  className={`px-4 py-2 rounded-lg text-white ${
                    approvalAction === 'approve'
                      ? 'bg-green-600 hover:bg-green-700'
                      : 'bg-red-600 hover:bg-red-700'
                  }`}
                >
                  {approvalAction === 'approve' ? 'Approve' : 'Deny'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AllowanceManagement;
