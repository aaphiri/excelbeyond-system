import React, { useState, useEffect } from 'react';
import { BookOpen, Plus, Edit, Trash2, Check, X, Eye, Users, Calendar, Award } from 'lucide-react';
import { User as UserType } from '../types';
import { supabase } from '../lib/supabase';

interface YearbookAdminProps {
  user?: UserType;
}

interface Yearbook {
  id: string;
  year: number;
  title: string;
  theme?: string;
  cover_image_url?: string;
  status: string;
  published_date?: string;
  created_at: string;
}

interface YearbookEntry {
  id: string;
  yearbook_id: string;
  student_id: string;
  student_name: string;
  student_photo_url?: string;
  program?: string;
  quote?: string;
  achievements?: string;
  status: string;
  created_at: string;
}

interface Student {
  id: string;
  full_name: string;
  program_level: string;
  current_program?: string;
  profile_photo_url?: string;
  program_status: string;
}

const YearbookAdmin: React.FC<YearbookAdminProps> = ({ user }) => {
  const [yearbooks, setYearbooks] = useState<Yearbook[]>([]);
  const [selectedYearbook, setSelectedYearbook] = useState<Yearbook | null>(null);
  const [entries, setEntries] = useState<YearbookEntry[]>([]);
  const [graduatingStudents, setGraduatingStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'yearbooks' | 'entries' | 'students'>('yearbooks');
  const [showYearbookForm, setShowYearbookForm] = useState(false);
  const [showEntryForm, setShowEntryForm] = useState(false);
  const [editingYearbook, setEditingYearbook] = useState<Yearbook | null>(null);
  const [editingEntry, setEditingEntry] = useState<YearbookEntry | null>(null);

  const [yearbookForm, setYearbookForm] = useState({
    year: new Date().getFullYear(),
    title: '',
    theme: '',
    cover_image_url: '',
    status: 'draft'
  });

  const [entryForm, setEntryForm] = useState({
    student_id: '',
    quote: '',
    achievements: ''
  });

  useEffect(() => {
    fetchYearbooks();
    fetchGraduatingStudents();
  }, []);

  useEffect(() => {
    if (selectedYearbook) {
      fetchEntries(selectedYearbook.id);
    }
  }, [selectedYearbook]);

  const fetchYearbooks = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('yearbooks')
        .select('*')
        .order('year', { ascending: false });

      if (error) {
        console.error('Error fetching yearbooks:', error);
      } else {
        setYearbooks(data || []);
        if (data && data.length > 0) {
          setSelectedYearbook(data[0]);
        }
      }
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchEntries = async (yearbookId: string) => {
    try {
      const { data, error } = await supabase
        .from('yearbook_entries')
        .select('*')
        .eq('yearbook_id', yearbookId)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching entries:', error);
      } else {
        setEntries(data || []);
      }
    } catch (error) {
      console.error('Error:', error);
    }
  };

  const fetchGraduatingStudents = async () => {
    try {
      const { data, error } = await supabase
        .from('students')
        .select('*')
        .eq('program_status', 'graduated')
        .order('full_name', { ascending: true });

      if (error) {
        console.error('Error fetching students:', error);
      } else {
        setGraduatingStudents(data || []);
      }
    } catch (error) {
      console.error('Error:', error);
    }
  };

  const handleCreateYearbook = async (e: React.FormEvent) => {
    e.preventDefault();

    const data = {
      ...yearbookForm,
      created_by: user?.id
    };

    if (editingYearbook) {
      const { error } = await supabase
        .from('yearbooks')
        .update(data)
        .eq('id', editingYearbook.id);

      if (error) {
        console.error('Error updating yearbook:', error);
        alert('Failed to update yearbook');
        return;
      }
    } else {
      const { error } = await supabase.from('yearbooks').insert([data]);

      if (error) {
        console.error('Error creating yearbook:', error);
        alert('Failed to create yearbook');
        return;
      }
    }

    setShowYearbookForm(false);
    setEditingYearbook(null);
    setYearbookForm({
      year: new Date().getFullYear(),
      title: '',
      theme: '',
      cover_image_url: '',
      status: 'draft'
    });
    fetchYearbooks();
  };

  const handleDeleteYearbook = async (id: string) => {
    if (!confirm('Are you sure you want to delete this yearbook? This will also delete all entries.')) return;

    const { error } = await supabase.from('yearbooks').delete().eq('id', id);

    if (error) {
      console.error('Error deleting yearbook:', error);
      alert('Failed to delete yearbook');
    } else {
      fetchYearbooks();
    }
  };

  const handleAddEntry = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedYearbook) return;

    const student = graduatingStudents.find(s => s.id === entryForm.student_id);
    if (!student) return;

    const data = {
      yearbook_id: selectedYearbook.id,
      student_id: entryForm.student_id,
      student_name: student.full_name,
      student_photo_url: student.profile_photo_url,
      program: student.current_program,
      quote: entryForm.quote,
      achievements: entryForm.achievements,
      status: 'approved'
    };

    if (editingEntry) {
      const { error } = await supabase
        .from('yearbook_entries')
        .update({ quote: entryForm.quote, achievements: entryForm.achievements })
        .eq('id', editingEntry.id);

      if (error) {
        console.error('Error updating entry:', error);
        alert('Failed to update entry');
        return;
      }
    } else {
      const { error } = await supabase.from('yearbook_entries').insert([data]);

      if (error) {
        console.error('Error adding entry:', error);
        alert('Failed to add entry');
        return;
      }
    }

    setShowEntryForm(false);
    setEditingEntry(null);
    setEntryForm({ student_id: '', quote: '', achievements: '' });
    fetchEntries(selectedYearbook.id);
  };

  const handleApproveEntry = async (entryId: string) => {
    const { error } = await supabase
      .from('yearbook_entries')
      .update({
        status: 'approved',
        approved_by: user?.id,
        approved_date: new Date().toISOString().split('T')[0]
      })
      .eq('id', entryId);

    if (error) {
      console.error('Error approving entry:', error);
      alert('Failed to approve entry');
    } else {
      if (selectedYearbook) {
        fetchEntries(selectedYearbook.id);
      }
    }
  };

  const handleRejectEntry = async (entryId: string) => {
    if (!confirm('Are you sure you want to reject this entry?')) return;

    const { error } = await supabase
      .from('yearbook_entries')
      .update({ status: 'rejected' })
      .eq('id', entryId);

    if (error) {
      console.error('Error rejecting entry:', error);
      alert('Failed to reject entry');
    } else {
      if (selectedYearbook) {
        fetchEntries(selectedYearbook.id);
      }
    }
  };

  const handleDeleteEntry = async (id: string) => {
    if (!confirm('Are you sure you want to delete this entry?')) return;

    const { error } = await supabase.from('yearbook_entries').delete().eq('id', id);

    if (error) {
      console.error('Error deleting entry:', error);
      alert('Failed to delete entry');
    } else {
      if (selectedYearbook) {
        fetchEntries(selectedYearbook.id);
      }
    }
  };

  const handlePublishYearbook = async (id: string) => {
    if (!confirm('Are you sure you want to publish this yearbook? It will be visible to everyone.')) return;

    const { error } = await supabase
      .from('yearbooks')
      .update({
        status: 'published',
        published_date: new Date().toISOString().split('T')[0]
      })
      .eq('id', id);

    if (error) {
      console.error('Error publishing yearbook:', error);
      alert('Failed to publish yearbook');
    } else {
      fetchYearbooks();
    }
  };

  const getStatusBadge = (status: string) => {
    const styles = {
      draft: 'bg-gray-100 text-gray-700',
      published: 'bg-green-100 text-green-700',
      archived: 'bg-blue-100 text-blue-700',
      pending: 'bg-yellow-100 text-yellow-700',
      approved: 'bg-green-100 text-green-700',
      rejected: 'bg-red-100 text-red-700'
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

  const getStats = () => {
    const totalEntries = entries.length;
    const approvedEntries = entries.filter(e => e.status === 'approved').length;
    const pendingEntries = entries.filter(e => e.status === 'pending').length;
    const rejectedEntries = entries.filter(e => e.status === 'rejected').length;

    return { totalEntries, approvedEntries, pendingEntries, rejectedEntries };
  };

  const stats = selectedYearbook ? getStats() : null;

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-slate-800 mb-2">Yearbook Management</h1>
        <p className="text-slate-600">Create and manage graduation yearbooks</p>
      </div>

      {selectedYearbook && stats && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-600">Total Entries</p>
                <p className="text-3xl font-bold text-slate-800">{stats.totalEntries}</p>
              </div>
              <Users className="w-10 h-10 text-blue-600 opacity-50" />
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-600">Approved</p>
                <p className="text-3xl font-bold text-green-600">{stats.approvedEntries}</p>
              </div>
              <Check className="w-10 h-10 text-green-600 opacity-50" />
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-600">Pending Review</p>
                <p className="text-3xl font-bold text-yellow-600">{stats.pendingEntries}</p>
              </div>
              <Calendar className="w-10 h-10 text-yellow-600 opacity-50" />
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-600">Rejected</p>
                <p className="text-3xl font-bold text-red-600">{stats.rejectedEntries}</p>
              </div>
              <X className="w-10 h-10 text-red-600 opacity-50" />
            </div>
          </div>
        </div>
      )}

      <div className="mb-6">
        <div className="flex gap-4 border-b border-slate-200">
          <button
            onClick={() => setActiveTab('yearbooks')}
            className={`px-6 py-3 font-semibold transition-colors relative ${
              activeTab === 'yearbooks' ? 'text-blue-600' : 'text-slate-600 hover:text-slate-800'
            }`}
          >
            Yearbooks
            {activeTab === 'yearbooks' && (
              <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-600"></div>
            )}
          </button>
          <button
            onClick={() => setActiveTab('entries')}
            className={`px-6 py-3 font-semibold transition-colors relative ${
              activeTab === 'entries' ? 'text-blue-600' : 'text-slate-600 hover:text-slate-800'
            }`}
          >
            Entries
            {activeTab === 'entries' && (
              <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-600"></div>
            )}
          </button>
          <button
            onClick={() => setActiveTab('students')}
            className={`px-6 py-3 font-semibold transition-colors relative ${
              activeTab === 'students' ? 'text-blue-600' : 'text-slate-600 hover:text-slate-800'
            }`}
          >
            Graduating Students
            {activeTab === 'students' && (
              <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-600"></div>
            )}
          </button>
        </div>
      </div>

      {activeTab === 'yearbooks' && (
        <>
          <div className="mb-6 flex justify-end">
            <button
              onClick={() => {
                setEditingYearbook(null);
                setYearbookForm({
                  year: new Date().getFullYear(),
                  title: '',
                  theme: '',
                  cover_image_url: '',
                  status: 'draft'
                });
                setShowYearbookForm(true);
              }}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <Plus className="w-5 h-5" />
              <span>Create Yearbook</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {yearbooks.map((yearbook) => (
              <div key={yearbook.id} className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h3 className="text-xl font-bold text-slate-800">Class of {yearbook.year}</h3>
                    <p className="text-sm text-slate-600">{yearbook.title}</p>
                  </div>
                  {getStatusBadge(yearbook.status)}
                </div>

                {yearbook.theme && (
                  <p className="text-sm text-slate-600 italic mb-4">"{yearbook.theme}"</p>
                )}

                <div className="flex flex-wrap gap-2">
                  <button
                    onClick={() => {
                      setEditingYearbook(yearbook);
                      setYearbookForm({
                        year: yearbook.year,
                        title: yearbook.title,
                        theme: yearbook.theme || '',
                        cover_image_url: yearbook.cover_image_url || '',
                        status: yearbook.status
                      });
                      setShowYearbookForm(true);
                    }}
                    className="px-3 py-1 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition-colors text-sm"
                  >
                    <Edit className="w-4 h-4" />
                  </button>
                  {yearbook.status === 'draft' && (
                    <button
                      onClick={() => handlePublishYearbook(yearbook.id)}
                      className="px-3 py-1 bg-green-50 text-green-600 rounded-lg hover:bg-green-100 transition-colors text-sm"
                    >
                      <Check className="w-4 h-4" />
                    </button>
                  )}
                  <button
                    onClick={() => handleDeleteYearbook(yearbook.id)}
                    className="px-3 py-1 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition-colors text-sm"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </>
      )}

      {activeTab === 'entries' && selectedYearbook && (
        <>
          <div className="mb-6 flex items-center justify-between">
            <div>
              <h2 className="text-xl font-semibold text-slate-800">
                Entries for Class of {selectedYearbook.year}
              </h2>
              <p className="text-sm text-slate-600">{entries.length} entries</p>
            </div>
            <button
              onClick={() => {
                setEditingEntry(null);
                setEntryForm({ student_id: '', quote: '', achievements: '' });
                setShowEntryForm(true);
              }}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <Plus className="w-5 h-5" />
              <span>Add Entry</span>
            </button>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
            <table className="w-full">
              <thead className="bg-slate-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase">Student</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase">Program</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {entries.map((entry) => (
                  <tr key={entry.id} className="hover:bg-slate-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="w-10 h-10 rounded-full bg-slate-200 flex items-center justify-center">
                          {entry.student_photo_url ? (
                            <img src={entry.student_photo_url} alt={entry.student_name} className="w-full h-full rounded-full object-cover" />
                          ) : (
                            <span className="text-slate-600 font-semibold text-sm">
                              {entry.student_name.split(' ').map(n => n[0]).join('')}
                            </span>
                          )}
                        </div>
                        <div className="ml-3">
                          <div className="text-sm font-medium text-slate-800">{entry.student_name}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-600">
                      {entry.program || 'N/A'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {getStatusBadge(entry.status)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      <div className="flex gap-2">
                        {entry.status === 'pending' && (
                          <>
                            <button
                              onClick={() => handleApproveEntry(entry.id)}
                              className="text-green-600 hover:text-green-900"
                            >
                              <Check className="w-5 h-5" />
                            </button>
                            <button
                              onClick={() => handleRejectEntry(entry.id)}
                              className="text-red-600 hover:text-red-900"
                            >
                              <X className="w-5 h-5" />
                            </button>
                          </>
                        )}
                        <button
                          onClick={() => {
                            setEditingEntry(entry);
                            setEntryForm({
                              student_id: entry.student_id,
                              quote: entry.quote || '',
                              achievements: entry.achievements || ''
                            });
                            setShowEntryForm(true);
                          }}
                          className="text-blue-600 hover:text-blue-900"
                        >
                          <Edit className="w-5 h-5" />
                        </button>
                        <button
                          onClick={() => handleDeleteEntry(entry.id)}
                          className="text-red-600 hover:text-red-900"
                        >
                          <Trash2 className="w-5 h-5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}

      {activeTab === 'students' && (
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
          <h2 className="text-xl font-semibold text-slate-800 mb-4">
            Graduated Students ({graduatingStudents.length})
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {graduatingStudents.map((student) => (
              <div key={student.id} className="flex items-center gap-3 p-3 border border-slate-200 rounded-lg">
                <div className="w-12 h-12 rounded-full bg-slate-200 flex items-center justify-center">
                  {student.profile_photo_url ? (
                    <img src={student.profile_photo_url} alt={student.full_name} className="w-full h-full rounded-full object-cover" />
                  ) : (
                    <span className="text-slate-600 font-semibold">
                      {student.full_name.split(' ').map(n => n[0]).join('')}
                    </span>
                  )}
                </div>
                <div className="flex-1">
                  <p className="font-medium text-slate-800 text-sm">{student.full_name}</p>
                  <p className="text-xs text-slate-600">{student.current_program || 'N/A'}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {showYearbookForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-2xl w-full">
            <div className="p-6 border-b border-slate-200">
              <h2 className="text-2xl font-bold text-slate-800">
                {editingYearbook ? 'Edit Yearbook' : 'Create Yearbook'}
              </h2>
            </div>

            <form onSubmit={handleCreateYearbook} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Year *</label>
                <input
                  type="number"
                  required
                  value={yearbookForm.year}
                  onChange={(e) => setYearbookForm({ ...yearbookForm, year: parseInt(e.target.value) })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Title *</label>
                <input
                  type="text"
                  required
                  value={yearbookForm.title}
                  onChange={(e) => setYearbookForm({ ...yearbookForm, title: e.target.value })}
                  placeholder="e.g., Excellence in Education"
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Theme</label>
                <input
                  type="text"
                  value={yearbookForm.theme}
                  onChange={(e) => setYearbookForm({ ...yearbookForm, theme: e.target.value })}
                  placeholder="e.g., Rising Above, Reaching Beyond"
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Cover Image URL</label>
                <input
                  type="url"
                  value={yearbookForm.cover_image_url}
                  onChange={(e) => setYearbookForm({ ...yearbookForm, cover_image_url: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Status</label>
                <select
                  value={yearbookForm.status}
                  onChange={(e) => setYearbookForm({ ...yearbookForm, status: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="draft">Draft</option>
                  <option value="published">Published</option>
                  <option value="archived">Archived</option>
                </select>
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="submit"
                  className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  {editingYearbook ? 'Update' : 'Create'} Yearbook
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowYearbookForm(false);
                    setEditingYearbook(null);
                  }}
                  className="px-6 py-2 bg-slate-200 text-slate-700 rounded-lg hover:bg-slate-300 transition-colors"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {showEntryForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-2xl w-full">
            <div className="p-6 border-b border-slate-200">
              <h2 className="text-2xl font-bold text-slate-800">
                {editingEntry ? 'Edit Entry' : 'Add Entry'}
              </h2>
            </div>

            <form onSubmit={handleAddEntry} className="p-6 space-y-4">
              {!editingEntry && (
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Student *</label>
                  <select
                    required
                    value={entryForm.student_id}
                    onChange={(e) => setEntryForm({ ...entryForm, student_id: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">Select a student</option>
                    {graduatingStudents.map((student) => (
                      <option key={student.id} value={student.id}>
                        {student.full_name} - {student.current_program}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Quote</label>
                <textarea
                  value={entryForm.quote}
                  onChange={(e) => setEntryForm({ ...entryForm, quote: e.target.value })}
                  rows={3}
                  placeholder="Personal quote or message..."
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Achievements</label>
                <textarea
                  value={entryForm.achievements}
                  onChange={(e) => setEntryForm({ ...entryForm, achievements: e.target.value })}
                  rows={3}
                  placeholder="Notable achievements or highlights..."
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="submit"
                  className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  {editingEntry ? 'Update' : 'Add'} Entry
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowEntryForm(false);
                    setEditingEntry(null);
                  }}
                  className="px-6 py-2 bg-slate-200 text-slate-700 rounded-lg hover:bg-slate-300 transition-colors"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default YearbookAdmin;
