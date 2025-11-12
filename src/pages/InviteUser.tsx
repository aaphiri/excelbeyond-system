import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';
import {
  UserPlus,
  Mail,
  Shield,
  Briefcase,
  Send,
  Copy,
  CheckCircle,
  AlertCircle,
  Clock,
  X,
  RefreshCw,
  Trash2
} from 'lucide-react';
import { User } from '../types';

interface InviteUserProps {
  user: User;
}

interface Invitation {
  id: string;
  email: string;
  staff_id: string;
  role: string;
  department: string | null;
  invitation_token: string;
  status: string;
  expires_at: string;
  created_at: string;
  invited_by: string;
}

const InviteUser: React.FC<InviteUserProps> = ({ user }) => {
  const [loading, setLoading] = useState(false);
  const [invitations, setInvitations] = useState<Invitation[]>([]);
  const [loadingInvitations, setLoadingInvitations] = useState(true);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [copiedToken, setCopiedToken] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    email: '',
    staff_id: '',
    role: 'user',
    department: '',
  });

  useEffect(() => {
    loadInvitations();
  }, []);

  const loadInvitations = async () => {
    try {
      setLoadingInvitations(true);
      const { data, error } = await supabase
        .from('user_invitations')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setInvitations(data || []);
    } catch (error: any) {
      console.error('Error loading invitations:', error);
    } finally {
      setLoadingInvitations(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const generateStaffId = () => {
    const prefix = 'STAFF';
    const random = Math.floor(10000 + Math.random() * 90000);
    setFormData(prev => ({ ...prev, staff_id: `${prefix}${random}` }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage(null);

    try {
      const { data: staffData, error: staffError } = await supabase
        .from('staff')
        .select('id')
        .eq('email', user.email)
        .maybeSingle();

      if (staffError || !staffData) {
        throw new Error('Unable to verify your account');
      }

      const response = await supabase.rpc('create_user_invitation', {
        p_email: formData.email,
        p_staff_id: formData.staff_id,
        p_role: formData.role,
        p_department: formData.department || null,
        p_invited_by: staffData.id,
      });

      if (response.error) throw response.error;

      const result = response.data;

      if (!result.success) {
        setMessage({ type: 'error', text: result.error });
        return;
      }

      setMessage({ type: 'success', text: 'Invitation created successfully!' });

      setFormData({
        email: '',
        staff_id: '',
        role: 'user',
        department: '',
      });

      await loadInvitations();
      await sendInvitationEmail(result.invitation);
    } catch (error: any) {
      console.error('Error creating invitation:', error);
      setMessage({ type: 'error', text: error.message || 'Failed to create invitation' });
    } finally {
      setLoading(false);
    }
  };

  const sendInvitationEmail = async (invitation: any) => {
    try {
      const inviteUrl = `${window.location.origin}/accept-invite?token=${invitation.invitation_token}`;

      const apiUrl = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/send-invitation`;

      await fetch(apiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
        },
        body: JSON.stringify({
          email: invitation.email,
          staff_id: invitation.staff_id,
          role: invitation.role,
          invite_url: inviteUrl,
          expires_at: invitation.expires_at,
        }),
      });
    } catch (error) {
      console.error('Error sending email:', error);
    }
  };

  const copyInviteLink = async (token: string) => {
    const inviteUrl = `${window.location.origin}/accept-invite?token=${token}`;
    try {
      await navigator.clipboard.writeText(inviteUrl);
      setCopiedToken(token);
      setTimeout(() => setCopiedToken(null), 2000);
    } catch (error) {
      console.error('Failed to copy:', error);
    }
  };

  const resendInvitation = async (invitation: Invitation) => {
    try {
      await sendInvitationEmail(invitation);
      setMessage({ type: 'success', text: 'Invitation email resent!' });
    } catch (error) {
      setMessage({ type: 'error', text: 'Failed to resend invitation' });
    }
  };

  const cancelInvitation = async (invitationId: string) => {
    if (!confirm('Are you sure you want to cancel this invitation?')) return;

    try {
      const response = await supabase.rpc('cancel_invitation', {
        p_invitation_id: invitationId,
      });

      if (response.error) throw response.error;

      const result = response.data;
      if (result.success) {
        setMessage({ type: 'success', text: 'Invitation cancelled' });
        await loadInvitations();
      } else {
        setMessage({ type: 'error', text: result.error });
      }
    } catch (error: any) {
      console.error('Error cancelling invitation:', error);
      setMessage({ type: 'error', text: 'Failed to cancel invitation' });
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'accepted':
        return 'bg-green-100 text-green-800';
      case 'expired':
        return 'bg-gray-100 text-gray-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="bg-white rounded-lg shadow-lg p-6">
        <div className="flex items-center space-x-3">
          <div className="p-3 bg-emerald-100 rounded-lg">
            <UserPlus className="w-6 h-6 text-emerald-600" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Invite New User</h1>
            <p className="text-gray-600">Send email invitations to new staff members</p>
          </div>
        </div>
      </div>

      {/* Message */}
      {message && (
        <div className={`p-4 rounded-lg flex items-start space-x-3 ${
          message.type === 'success'
            ? 'bg-green-50 border border-green-200'
            : 'bg-red-50 border border-red-200'
        }`}>
          {message.type === 'success' ? (
            <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
          ) : (
            <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
          )}
          <p className={message.type === 'success' ? 'text-green-800' : 'text-red-800'}>
            {message.text}
          </p>
        </div>
      )}

      {/* Invitation Form */}
      <div className="bg-white rounded-lg shadow-lg p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-6">Create Invitation</h2>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Email */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <Mail className="w-4 h-4 inline mr-1" />
              Email Address
            </label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleInputChange}
              required
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
              placeholder="user@example.com"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Staff ID */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Staff ID
              </label>
              <div className="flex space-x-2">
                <input
                  type="text"
                  name="staff_id"
                  value={formData.staff_id}
                  onChange={handleInputChange}
                  required
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                  placeholder="STAFF12345"
                />
                <button
                  type="button"
                  onClick={generateStaffId}
                  className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
                  title="Generate Staff ID"
                >
                  <RefreshCw className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Role */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <Shield className="w-4 h-4 inline mr-1" />
                Role
              </label>
              <select
                name="role"
                value={formData.role}
                onChange={handleInputChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
              >
                <option value="user">User</option>
                <option value="program_officer">Program Officer</option>
                <option value="deputy_manager">Deputy Manager</option>
                <option value="admin">Admin</option>
              </select>
            </div>
          </div>

          {/* Department */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <Briefcase className="w-4 h-4 inline mr-1" />
              Department (Optional)
            </label>
            <input
              type="text"
              name="department"
              value={formData.department}
              onChange={handleInputChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
              placeholder="e.g., Excel Beyond"
            />
          </div>

          {/* Submit Button */}
          <div className="flex justify-end">
            <button
              type="submit"
              disabled={loading}
              className="px-6 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
            >
              {loading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  <span>Sending...</span>
                </>
              ) : (
                <>
                  <Send className="w-4 h-4" />
                  <span>Send Invitation</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>

      {/* Invitations List */}
      <div className="bg-white rounded-lg shadow-lg p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold text-gray-900">Recent Invitations</h2>
          <button
            onClick={loadInvitations}
            className="text-emerald-600 hover:text-emerald-700 flex items-center space-x-1"
          >
            <RefreshCw className="w-4 h-4" />
            <span>Refresh</span>
          </button>
        </div>

        {loadingInvitations ? (
          <div className="flex justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-600"></div>
          </div>
        ) : invitations.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <Mail className="w-12 h-12 mx-auto mb-3 text-gray-400" />
            <p>No invitations yet</p>
          </div>
        ) : (
          <div className="space-y-4">
            {invitations.map((invitation) => (
              <div
                key={invitation.id}
                className="border border-gray-200 rounded-lg p-4 hover:border-emerald-300 transition-colors"
              >
                <div className="flex flex-col md:flex-row md:items-center md:justify-between space-y-3 md:space-y-0">
                  <div className="flex-1 space-y-2">
                    <div className="flex items-center space-x-3">
                      <span className="font-medium text-gray-900">{invitation.email}</span>
                      <span className={`px-2 py-1 rounded text-xs font-medium ${getStatusColor(invitation.status)}`}>
                        {invitation.status}
                      </span>
                    </div>
                    <div className="flex flex-wrap gap-3 text-sm text-gray-600">
                      <span>Staff ID: {invitation.staff_id}</span>
                      <span>•</span>
                      <span className="capitalize">{invitation.role.replace('_', ' ')}</span>
                      {invitation.department && (
                        <>
                          <span>•</span>
                          <span>{invitation.department}</span>
                        </>
                      )}
                    </div>
                    <div className="flex items-center space-x-2 text-xs text-gray-500">
                      <Clock className="w-3 h-3" />
                      <span>Expires: {new Date(invitation.expires_at).toLocaleString()}</span>
                    </div>
                  </div>

                  {invitation.status === 'pending' && (
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => copyInviteLink(invitation.invitation_token)}
                        className="p-2 text-gray-600 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors"
                        title="Copy invite link"
                      >
                        {copiedToken === invitation.invitation_token ? (
                          <CheckCircle className="w-5 h-5 text-green-600" />
                        ) : (
                          <Copy className="w-5 h-5" />
                        )}
                      </button>
                      <button
                        onClick={() => resendInvitation(invitation)}
                        className="p-2 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                        title="Resend invitation"
                      >
                        <Send className="w-5 h-5" />
                      </button>
                      <button
                        onClick={() => cancelInvitation(invitation.id)}
                        className="p-2 text-gray-600 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                        title="Cancel invitation"
                      >
                        <Trash2 className="w-5 h-5" />
                      </button>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default InviteUser;
