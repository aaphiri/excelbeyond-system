import React, { useState, useEffect } from 'react';
import { Heart, Plus, Edit, Trash2, Check, X, Eye, Star, Image as ImageIcon, Video, FileText } from 'lucide-react';
import { User as UserType } from '../types';
import { supabase } from '../lib/supabase';

interface ImpactStoriesAdminProps {
  user?: UserType;
}

interface Category {
  id: string;
  name: string;
  slug: string;
  color: string;
}

interface Story {
  id: string;
  student_id?: string;
  student_name: string;
  student_photo_url?: string;
  program?: string;
  year: number;
  title: string;
  excerpt: string;
  content: string;
  category_id: string;
  image_url?: string;
  video_url?: string;
  featured: boolean;
  approved: boolean;
  views_count: number;
  date_posted: string;
  created_at: string;
}

interface StoryWithCategory extends Story {
  category?: Category;
}

const ImpactStoriesAdmin: React.FC<ImpactStoriesAdminProps> = ({ user }) => {
  const [stories, setStories] = useState<StoryWithCategory[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [students, setStudents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingStory, setEditingStory] = useState<Story | null>(null);
  const [filterStatus, setFilterStatus] = useState<'all' | 'approved' | 'pending'>('all');

  const [storyForm, setStoryForm] = useState({
    student_id: '',
    student_name: '',
    student_photo_url: '',
    program: '',
    year: new Date().getFullYear(),
    title: '',
    excerpt: '',
    content: '',
    category_id: '',
    image_url: '',
    video_url: '',
    featured: false,
    approved: false
  });

  useEffect(() => {
    fetchCategories();
    fetchStories();
    fetchStudents();
  }, []);

  const fetchCategories = async () => {
    try {
      const { data, error } = await supabase
        .from('story_categories')
        .select('*')
        .order('name');

      if (!error && data) {
        setCategories(data);
      }
    } catch (error) {
      console.error('Error:', error);
    }
  };

  const fetchStories = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('impact_stories')
        .select('*, category:story_categories(*)')
        .order('created_at', { ascending: false });

      if (!error && data) {
        const formattedStories = data.map(story => ({
          ...story,
          category: story.category as Category | undefined
        }));
        setStories(formattedStories);
      }
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchStudents = async () => {
    try {
      const { data, error } = await supabase
        .from('students')
        .select('id, full_name, current_program, profile_photo_url')
        .order('full_name');

      if (!error && data) {
        setStudents(data);
      }
    } catch (error) {
      console.error('Error:', error);
    }
  };

  const handleStudentSelect = (studentId: string) => {
    const student = students.find(s => s.id === studentId);
    if (student) {
      setStoryForm({
        ...storyForm,
        student_id: studentId,
        student_name: student.full_name,
        student_photo_url: student.profile_photo_url || '',
        program: student.current_program || ''
      });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const data = {
      ...storyForm,
      approved_by: storyForm.approved ? user?.id : null,
      approved_date: storyForm.approved ? new Date().toISOString().split('T')[0] : null,
      updated_at: new Date().toISOString()
    };

    if (editingStory) {
      const { error } = await supabase
        .from('impact_stories')
        .update(data)
        .eq('id', editingStory.id);

      if (error) {
        console.error('Error updating story:', error);
        alert('Failed to update story');
        return;
      }
    } else {
      const { error } = await supabase.from('impact_stories').insert([data]);

      if (error) {
        console.error('Error creating story:', error);
        alert('Failed to create story');
        return;
      }
    }

    setShowForm(false);
    setEditingStory(null);
    resetForm();
    fetchStories();
  };

  const resetForm = () => {
    setStoryForm({
      student_id: '',
      student_name: '',
      student_photo_url: '',
      program: '',
      year: new Date().getFullYear(),
      title: '',
      excerpt: '',
      content: '',
      category_id: '',
      image_url: '',
      video_url: '',
      featured: false,
      approved: false
    });
  };

  const handleEdit = (story: Story) => {
    setEditingStory(story);
    setStoryForm({
      student_id: story.student_id || '',
      student_name: story.student_name,
      student_photo_url: story.student_photo_url || '',
      program: story.program || '',
      year: story.year,
      title: story.title,
      excerpt: story.excerpt,
      content: story.content,
      category_id: story.category_id,
      image_url: story.image_url || '',
      video_url: story.video_url || '',
      featured: story.featured,
      approved: story.approved
    });
    setShowForm(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this story?')) return;

    const { error } = await supabase.from('impact_stories').delete().eq('id', id);

    if (error) {
      console.error('Error deleting story:', error);
      alert('Failed to delete story');
    } else {
      fetchStories();
    }
  };

  const handleApprove = async (id: string) => {
    const { error } = await supabase
      .from('impact_stories')
      .update({
        approved: true,
        approved_by: user?.id,
        approved_date: new Date().toISOString().split('T')[0]
      })
      .eq('id', id);

    if (error) {
      console.error('Error approving story:', error);
      alert('Failed to approve story');
    } else {
      fetchStories();
    }
  };

  const handleToggleFeatured = async (id: string, currentValue: boolean) => {
    const { error } = await supabase
      .from('impact_stories')
      .update({ featured: !currentValue })
      .eq('id', id);

    if (error) {
      console.error('Error toggling featured:', error);
      alert('Failed to update story');
    } else {
      fetchStories();
    }
  };

  const filteredStories = stories.filter(story => {
    if (filterStatus === 'approved') return story.approved;
    if (filterStatus === 'pending') return !story.approved;
    return true;
  });

  const stats = {
    total: stories.length,
    approved: stories.filter(s => s.approved).length,
    pending: stories.filter(s => !s.approved).length,
    featured: stories.filter(s => s.featured).length
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
        <h1 className="text-3xl font-bold text-slate-800 mb-2">Impact Stories Management</h1>
        <p className="text-slate-600">Create and manage inspiring success stories</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-600">Total Stories</p>
              <p className="text-3xl font-bold text-slate-800">{stats.total}</p>
            </div>
            <Heart className="w-10 h-10 text-blue-600 opacity-50" />
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-600">Approved</p>
              <p className="text-3xl font-bold text-green-600">{stats.approved}</p>
            </div>
            <Check className="w-10 h-10 text-green-600 opacity-50" />
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-600">Pending Review</p>
              <p className="text-3xl font-bold text-yellow-600">{stats.pending}</p>
            </div>
            <Eye className="w-10 h-10 text-yellow-600 opacity-50" />
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-600">Featured</p>
              <p className="text-3xl font-bold text-purple-600">{stats.featured}</p>
            </div>
            <Star className="w-10 h-10 text-purple-600 opacity-50" />
          </div>
        </div>
      </div>

      <div className="mb-6 flex items-center justify-between">
        <div className="flex gap-2">
          <button
            onClick={() => setFilterStatus('all')}
            className={`px-4 py-2 rounded-lg font-medium ${
              filterStatus === 'all'
                ? 'bg-blue-600 text-white'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            All ({stats.total})
          </button>
          <button
            onClick={() => setFilterStatus('approved')}
            className={`px-4 py-2 rounded-lg font-medium ${
              filterStatus === 'approved'
                ? 'bg-green-600 text-white'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            Approved ({stats.approved})
          </button>
          <button
            onClick={() => setFilterStatus('pending')}
            className={`px-4 py-2 rounded-lg font-medium ${
              filterStatus === 'pending'
                ? 'bg-yellow-600 text-white'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            Pending ({stats.pending})
          </button>
        </div>

        <button
          onClick={() => {
            setEditingStory(null);
            resetForm();
            setShowForm(true);
          }}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          <Plus className="w-5 h-5" />
          <span>Add Story</span>
        </button>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        <table className="w-full">
          <thead className="bg-slate-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase">Story</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase">Category</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase">Student</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase">Status</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase">Views</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200">
            {filteredStories.map((story) => (
              <tr key={story.id} className="hover:bg-slate-50">
                <td className="px-6 py-4">
                  <div className="flex items-center gap-3">
                    {story.image_url && (
                      <img src={story.image_url} alt={story.title} className="w-12 h-12 rounded object-cover" />
                    )}
                    <div>
                      <div className="flex items-center gap-2">
                        <p className="font-medium text-slate-800">{story.title}</p>
                        {story.featured && (
                          <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
                        )}
                      </div>
                      <p className="text-sm text-slate-500">{story.year}</p>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <span className="px-2 py-1 bg-blue-100 text-blue-700 text-xs rounded-full">
                    {story.category?.name}
                  </span>
                </td>
                <td className="px-6 py-4 text-sm text-slate-600">{story.student_name}</td>
                <td className="px-6 py-4">
                  <span className={`px-2 py-1 text-xs rounded-full ${
                    story.approved
                      ? 'bg-green-100 text-green-700'
                      : 'bg-yellow-100 text-yellow-700'
                  }`}>
                    {story.approved ? 'Approved' : 'Pending'}
                  </span>
                </td>
                <td className="px-6 py-4 text-sm text-slate-600">{story.views_count}</td>
                <td className="px-6 py-4">
                  <div className="flex gap-2">
                    {!story.approved && (
                      <button
                        onClick={() => handleApprove(story.id)}
                        className="text-green-600 hover:text-green-900"
                        title="Approve"
                      >
                        <Check className="w-5 h-5" />
                      </button>
                    )}
                    <button
                      onClick={() => handleToggleFeatured(story.id, story.featured)}
                      className={story.featured ? 'text-yellow-500' : 'text-slate-400 hover:text-yellow-500'}
                      title={story.featured ? 'Remove from featured' : 'Make featured'}
                    >
                      <Star className={`w-5 h-5 ${story.featured ? 'fill-yellow-500' : ''}`} />
                    </button>
                    <button
                      onClick={() => handleEdit(story)}
                      className="text-blue-600 hover:text-blue-900"
                      title="Edit"
                    >
                      <Edit className="w-5 h-5" />
                    </button>
                    <button
                      onClick={() => handleDelete(story.id)}
                      className="text-red-600 hover:text-red-900"
                      title="Delete"
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

      {showForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 overflow-y-auto">
          <div className="bg-white rounded-xl shadow-xl max-w-4xl w-full my-8">
            <div className="p-6 border-b border-slate-200">
              <h2 className="text-2xl font-bold text-slate-800">
                {editingStory ? 'Edit Story' : 'Add New Story'}
              </h2>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-6 max-h-[calc(100vh-200px)] overflow-y-auto">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Select Student</label>
                  <select
                    value={storyForm.student_id}
                    onChange={(e) => handleStudentSelect(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">Select a student</option>
                    {students.map((student) => (
                      <option key={student.id} value={student.id}>
                        {student.full_name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Or Enter Name Manually</label>
                  <input
                    type="text"
                    value={storyForm.student_name}
                    onChange={(e) => setStoryForm({ ...storyForm, student_name: e.target.value })}
                    placeholder="Student name"
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Program</label>
                  <input
                    type="text"
                    value={storyForm.program}
                    onChange={(e) => setStoryForm({ ...storyForm, program: e.target.value })}
                    placeholder="e.g., Computer Science"
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Year *</label>
                  <input
                    type="number"
                    value={storyForm.year}
                    onChange={(e) => setStoryForm({ ...storyForm, year: parseInt(e.target.value) })}
                    required
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-slate-700 mb-1">Category *</label>
                  <select
                    value={storyForm.category_id}
                    onChange={(e) => setStoryForm({ ...storyForm, category_id: e.target.value })}
                    required
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">Select a category</option>
                    {categories.map((cat) => (
                      <option key={cat.id} value={cat.id}>{cat.name}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Story Title *</label>
                <input
                  type="text"
                  value={storyForm.title}
                  onChange={(e) => setStoryForm({ ...storyForm, title: e.target.value })}
                  placeholder="Enter compelling title"
                  required
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  <div className="flex items-center gap-2">
                    <FileText className="w-4 h-4" />
                    <span>Short Excerpt *</span>
                  </div>
                </label>
                <textarea
                  value={storyForm.excerpt}
                  onChange={(e) => setStoryForm({ ...storyForm, excerpt: e.target.value })}
                  rows={2}
                  placeholder="Brief summary for story cards (150-200 characters)"
                  maxLength={200}
                  required
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <p className="text-xs text-slate-500 mt-1">{storyForm.excerpt.length}/200 characters</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Full Story Content *</label>
                <textarea
                  value={storyForm.content}
                  onChange={(e) => setStoryForm({ ...storyForm, content: e.target.value })}
                  rows={8}
                  placeholder="Tell the complete story of transformation and impact..."
                  required
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    <div className="flex items-center gap-2">
                      <ImageIcon className="w-4 h-4" />
                      <span>Image URL</span>
                    </div>
                  </label>
                  <input
                    type="url"
                    value={storyForm.image_url}
                    onChange={(e) => setStoryForm({ ...storyForm, image_url: e.target.value })}
                    placeholder="https://example.com/image.jpg"
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    <div className="flex items-center gap-2">
                      <Video className="w-4 h-4" />
                      <span>Video URL (optional)</span>
                    </div>
                  </label>
                  <input
                    type="url"
                    value={storyForm.video_url}
                    onChange={(e) => setStoryForm({ ...storyForm, video_url: e.target.value })}
                    placeholder="YouTube embed URL"
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Student Photo URL</label>
                  <input
                    type="url"
                    value={storyForm.student_photo_url}
                    onChange={(e) => setStoryForm({ ...storyForm, student_photo_url: e.target.value })}
                    placeholder="Student profile photo"
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              <div className="flex items-center gap-6">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={storyForm.featured}
                    onChange={(e) => setStoryForm({ ...storyForm, featured: e.target.checked })}
                    className="w-4 h-4 text-blue-600 border-slate-300 rounded focus:ring-2 focus:ring-blue-500"
                  />
                  <span className="text-sm font-medium text-slate-700">Featured Story</span>
                </label>

                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={storyForm.approved}
                    onChange={(e) => setStoryForm({ ...storyForm, approved: e.target.checked })}
                    className="w-4 h-4 text-blue-600 border-slate-300 rounded focus:ring-2 focus:ring-blue-500"
                  />
                  <span className="text-sm font-medium text-slate-700">Approved for Publishing</span>
                </label>
              </div>

              <div className="flex gap-3 pt-4 border-t border-slate-200">
                <button
                  type="submit"
                  className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-semibold"
                >
                  {editingStory ? 'Update Story' : 'Create Story'}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowForm(false);
                    setEditingStory(null);
                    resetForm();
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

export default ImpactStoriesAdmin;
