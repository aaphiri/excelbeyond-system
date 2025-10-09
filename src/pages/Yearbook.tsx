import React, { useState, useEffect } from 'react';
import { BookOpen, Search, Filter, Download, MessageSquare, Award, Calendar, Quote, ChevronRight } from 'lucide-react';
import { User as UserType } from '../types';
import { supabase } from '../lib/supabase';

interface YearbookProps {
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
}

interface YearbookEntry {
  id: string;
  student_name: string;
  student_photo_url?: string;
  program?: string;
  quote?: string;
  achievements?: string;
  status: string;
}

interface MemoryWallPost {
  id: string;
  author_name: string;
  message: string;
  photo_url?: string;
  created_at: string;
}

const Yearbook: React.FC<YearbookProps> = ({ user }) => {
  const [yearbooks, setYearbooks] = useState<Yearbook[]>([]);
  const [selectedYearbook, setSelectedYearbook] = useState<Yearbook | null>(null);
  const [entries, setEntries] = useState<YearbookEntry[]>([]);
  const [memoryPosts, setMemoryPosts] = useState<MemoryWallPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterProgram, setFilterProgram] = useState('all');
  const [activeTab, setActiveTab] = useState<'graduates' | 'memory'>('graduates');
  const [showMemoryForm, setShowMemoryForm] = useState(false);
  const [newMessage, setNewMessage] = useState('');

  useEffect(() => {
    fetchYearbooks();
  }, []);

  useEffect(() => {
    if (selectedYearbook) {
      fetchEntries(selectedYearbook.id);
      fetchMemoryPosts(selectedYearbook.id);
    }
  }, [selectedYearbook]);

  const fetchYearbooks = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('yearbooks')
        .select('*')
        .eq('status', 'published')
        .order('year', { ascending: false });

      if (error) {
        console.error('Error fetching yearbooks:', error);
      } else if (data && data.length > 0) {
        setYearbooks(data);
        setSelectedYearbook(data[0]);
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
        .eq('status', 'approved')
        .order('student_name', { ascending: true });

      if (error) {
        console.error('Error fetching entries:', error);
      } else {
        setEntries(data || []);
      }
    } catch (error) {
      console.error('Error:', error);
    }
  };

  const fetchMemoryPosts = async (yearbookId: string) => {
    try {
      const { data, error } = await supabase
        .from('memory_wall_posts')
        .select('*')
        .eq('yearbook_id', yearbookId)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching memory posts:', error);
      } else {
        setMemoryPosts(data || []);
      }
    } catch (error) {
      console.error('Error:', error);
    }
  };

  const handleAddMemory = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || !selectedYearbook || !user) return;

    const { error } = await supabase.from('memory_wall_posts').insert([{
      yearbook_id: selectedYearbook.id,
      author_name: user.name,
      author_id: user.id,
      message: newMessage
    }]);

    if (error) {
      console.error('Error adding memory:', error);
      alert('Failed to add memory');
    } else {
      setNewMessage('');
      setShowMemoryForm(false);
      fetchMemoryPosts(selectedYearbook.id);
    }
  };

  const filteredEntries = entries.filter(entry => {
    const matchesSearch = entry.student_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         entry.program?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesProgram = filterProgram === 'all' || entry.program === filterProgram;
    return matchesSearch && matchesProgram;
  });

  const uniquePrograms = Array.from(new Set(entries.map(e => e.program).filter(Boolean)));

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (yearbooks.length === 0) {
    return (
      <div className="p-6 max-w-7xl mx-auto">
        <div className="text-center py-12">
          <BookOpen className="w-16 h-16 text-slate-400 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-slate-800 mb-2">No Yearbooks Available</h2>
          <p className="text-slate-600">Check back later for published yearbooks</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      <div className="max-w-7xl mx-auto p-6">
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-4">
            <BookOpen className="w-10 h-10 text-blue-600" />
            <div>
              <h1 className="text-4xl font-bold text-slate-800">Graduation Yearbook</h1>
              <p className="text-slate-600">Celebrating our graduates and memories</p>
            </div>
          </div>

          <div className="flex gap-2 flex-wrap mt-6">
            {yearbooks.map((yearbook) => (
              <button
                key={yearbook.id}
                onClick={() => setSelectedYearbook(yearbook)}
                className={`px-6 py-3 rounded-lg font-semibold transition-all duration-300 ${
                  selectedYearbook?.id === yearbook.id
                    ? 'bg-blue-600 text-white shadow-lg scale-105'
                    : 'bg-white text-slate-700 hover:bg-blue-50 border border-slate-200'
                }`}
              >
                Class of {yearbook.year}
              </button>
            ))}
          </div>
        </div>

        {selectedYearbook && (
          <>
            <div className="bg-gradient-to-r from-blue-600 to-blue-800 rounded-2xl p-8 mb-8 text-white shadow-xl">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-3xl font-bold mb-2">{selectedYearbook.title}</h2>
                  {selectedYearbook.theme && (
                    <p className="text-blue-100 text-lg italic">"{selectedYearbook.theme}"</p>
                  )}
                  <div className="flex items-center gap-4 mt-4 text-blue-100">
                    <div className="flex items-center gap-2">
                      <Award className="w-5 h-5" />
                      <span>{filteredEntries.length} Graduates</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <MessageSquare className="w-5 h-5" />
                      <span>{memoryPosts.length} Memories</span>
                    </div>
                  </div>
                </div>
                <Calendar className="w-20 h-20 text-blue-300 opacity-50" />
              </div>
            </div>

            <div className="mb-6">
              <div className="flex gap-4 border-b border-slate-200">
                <button
                  onClick={() => setActiveTab('graduates')}
                  className={`px-6 py-3 font-semibold transition-colors relative ${
                    activeTab === 'graduates'
                      ? 'text-blue-600'
                      : 'text-slate-600 hover:text-slate-800'
                  }`}
                >
                  Graduates
                  {activeTab === 'graduates' && (
                    <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-600"></div>
                  )}
                </button>
                <button
                  onClick={() => setActiveTab('memory')}
                  className={`px-6 py-3 font-semibold transition-colors relative ${
                    activeTab === 'memory'
                      ? 'text-blue-600'
                      : 'text-slate-600 hover:text-slate-800'
                  }`}
                >
                  Memory Wall
                  {activeTab === 'memory' && (
                    <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-600"></div>
                  )}
                </button>
              </div>
            </div>

            {activeTab === 'graduates' ? (
              <>
                <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 mb-6">
                  <div className="flex flex-col sm:flex-row gap-4">
                    <div className="flex-1 relative">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-5 h-5" />
                      <input
                        type="text"
                        placeholder="Search graduates..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pl-10 pr-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>

                    <select
                      value={filterProgram}
                      onChange={(e) => setFilterProgram(e.target.value)}
                      className="px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="all">All Programs</option>
                      {uniquePrograms.map((program) => (
                        <option key={program} value={program}>
                          {program}
                        </option>
                      ))}
                    </select>

                    <button className="flex items-center gap-2 px-4 py-2 bg-slate-600 text-white rounded-lg hover:bg-slate-700 transition-colors">
                      <Download className="w-5 h-5" />
                      <span>Download PDF</span>
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {filteredEntries.length === 0 ? (
                    <div className="col-span-full text-center py-12 text-slate-500">
                      No graduates found
                    </div>
                  ) : (
                    filteredEntries.map((entry) => (
                      <div
                        key={entry.id}
                        className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden hover:shadow-xl transition-all duration-300 hover:scale-105"
                      >
                        <div className="aspect-square bg-gradient-to-br from-slate-100 to-slate-200 flex items-center justify-center overflow-hidden">
                          {entry.student_photo_url ? (
                            <img
                              src={entry.student_photo_url}
                              alt={entry.student_name}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-blue-100 to-blue-200">
                              <span className="text-6xl font-bold text-blue-600">
                                {entry.student_name.split(' ').map(n => n[0]).join('')}
                              </span>
                            </div>
                          )}
                        </div>

                        <div className="p-6">
                          <h3 className="text-xl font-bold text-slate-800 mb-1">{entry.student_name}</h3>
                          <p className="text-sm text-slate-600 mb-4">{entry.program}</p>

                          {entry.quote && (
                            <div className="mb-4 p-3 bg-slate-50 rounded-lg border-l-4 border-blue-600">
                              <Quote className="w-4 h-4 text-blue-600 mb-2" />
                              <p className="text-sm text-slate-700 italic">"{entry.quote}"</p>
                            </div>
                          )}

                          {entry.achievements && (
                            <div className="space-y-1">
                              <div className="flex items-center gap-2 text-sm text-slate-600">
                                <Award className="w-4 h-4 text-amber-600" />
                                <span className="font-semibold">Achievements:</span>
                              </div>
                              <p className="text-sm text-slate-700">{entry.achievements}</p>
                            </div>
                          )}
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </>
            ) : (
              <div className="space-y-6">
                {user && (
                  <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
                    {!showMemoryForm ? (
                      <button
                        onClick={() => setShowMemoryForm(true)}
                        className="w-full py-3 px-4 border-2 border-dashed border-slate-300 rounded-lg text-slate-600 hover:border-blue-600 hover:text-blue-600 transition-colors"
                      >
                        + Share a Memory
                      </button>
                    ) : (
                      <form onSubmit={handleAddMemory} className="space-y-4">
                        <textarea
                          value={newMessage}
                          onChange={(e) => setNewMessage(e.target.value)}
                          placeholder="Share your favorite memory..."
                          rows={4}
                          className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                          required
                        />
                        <div className="flex gap-3">
                          <button
                            type="submit"
                            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                          >
                            Post Memory
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              setShowMemoryForm(false);
                              setNewMessage('');
                            }}
                            className="px-6 py-2 bg-slate-200 text-slate-700 rounded-lg hover:bg-slate-300 transition-colors"
                          >
                            Cancel
                          </button>
                        </div>
                      </form>
                    )}
                  </div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {memoryPosts.length === 0 ? (
                    <div className="col-span-full text-center py-12 text-slate-500">
                      <MessageSquare className="w-16 h-16 text-slate-400 mx-auto mb-4" />
                      <p>No memories yet. Be the first to share!</p>
                    </div>
                  ) : (
                    memoryPosts.map((post) => (
                      <div
                        key={post.id}
                        className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 hover:shadow-lg transition-shadow"
                      >
                        <div className="flex items-start gap-3 mb-4">
                          <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
                            <span className="text-blue-600 font-semibold">
                              {post.author_name.charAt(0)}
                            </span>
                          </div>
                          <div>
                            <p className="font-semibold text-slate-800">{post.author_name}</p>
                            <p className="text-xs text-slate-500">
                              {new Date(post.created_at).toLocaleDateString()}
                            </p>
                          </div>
                        </div>

                        <p className="text-slate-700 whitespace-pre-wrap">{post.message}</p>

                        {post.photo_url && (
                          <img
                            src={post.photo_url}
                            alt="Memory"
                            className="mt-4 rounded-lg w-full object-cover"
                          />
                        )}
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default Yearbook;
