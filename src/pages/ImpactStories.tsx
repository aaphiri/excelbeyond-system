import React, { useState, useEffect } from 'react';
import { Heart, Search, Filter, Eye, Calendar, User, ChevronRight, Star, Grid, List, X } from 'lucide-react';
import { User as UserType } from '../types';
import { supabase } from '../lib/supabase';

interface ImpactStoriesProps {
  user?: UserType;
}

interface Category {
  id: string;
  name: string;
  slug: string;
  description: string;
  color: string;
}

interface Story {
  id: string;
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

const ImpactStories: React.FC<ImpactStoriesProps> = ({ user }) => {
  const [stories, setStories] = useState<StoryWithCategory[]>([]);
  const [featuredStories, setFeaturedStories] = useState<StoryWithCategory[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [viewMode, setViewMode] = useState<'grid' | 'timeline'>('grid');
  const [selectedStory, setSelectedStory] = useState<StoryWithCategory | null>(null);

  useEffect(() => {
    fetchCategories();
    fetchStories();
  }, []);

  const fetchCategories = async () => {
    try {
      const { data, error } = await supabase
        .from('story_categories')
        .select('*')
        .order('name');

      if (error) {
        console.error('Error fetching categories:', error);
      } else {
        setCategories(data || []);
      }
    } catch (error) {
      console.error('Error:', error);
    }
  };

  const fetchStories = async () => {
    setLoading(true);
    try {
      const { data: storiesData, error } = await supabase
        .from('impact_stories')
        .select('*, category:story_categories(*)')
        .eq('approved', true)
        .order('date_posted', { ascending: false });

      if (error) {
        console.error('Error fetching stories:', error);
      } else {
        const formattedStories = (storiesData || []).map(story => ({
          ...story,
          category: story.category as Category | undefined
        }));

        setStories(formattedStories);
        setFeaturedStories(formattedStories.filter(s => s.featured).slice(0, 3));
      }
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleStoryClick = async (story: StoryWithCategory) => {
    setSelectedStory(story);

    const { error } = await supabase
      .from('impact_stories')
      .update({ views_count: story.views_count + 1 })
      .eq('id', story.id);

    if (!error) {
      setStories(prev => prev.map(s =>
        s.id === story.id ? { ...s, views_count: s.views_count + 1 } : s
      ));
    }
  };

  const filteredStories = stories.filter(story => {
    const matchesSearch = story.student_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         story.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         story.excerpt?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || story.category_id === selectedCategory;
    return matchesSearch && matchesCategory && !story.featured;
  });

  const getCategoryColor = (color: string) => {
    const colors: Record<string, string> = {
      blue: 'bg-blue-100 text-blue-700 border-blue-200',
      green: 'bg-green-100 text-green-700 border-green-200',
      purple: 'bg-purple-100 text-purple-700 border-purple-200',
      orange: 'bg-orange-100 text-orange-700 border-orange-200',
      pink: 'bg-pink-100 text-pink-700 border-pink-200'
    };
    return colors[color] || colors.blue;
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      <div className="relative bg-gradient-to-r from-blue-600 to-purple-600 text-white py-20 px-6 overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-10 left-10 w-64 h-64 bg-white rounded-full blur-3xl"></div>
          <div className="absolute bottom-10 right-10 w-96 h-96 bg-white rounded-full blur-3xl"></div>
        </div>

        <div className="relative max-w-7xl mx-auto text-center">
          <div className="flex items-center justify-center gap-3 mb-4">
            <Heart className="w-12 h-12" />
            <h1 className="text-5xl font-bold">Real Stories. Real Impact.</h1>
          </div>
          <p className="text-xl text-blue-100 max-w-3xl mx-auto">
            Discover inspiring stories of transformation, resilience, and success from Excel Beyond scholars
            who are making a difference in their lives and communities.
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 -mt-12 relative z-10">
        {featuredStories.length > 0 && (
          <div className="mb-16">
            <div className="flex items-center gap-2 mb-6">
              <Star className="w-6 h-6 text-yellow-500 fill-yellow-500" />
              <h2 className="text-2xl font-bold text-slate-800">Featured Stories</h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {featuredStories.map((story) => (
                <div
                  key={story.id}
                  onClick={() => handleStoryClick(story)}
                  className="bg-white rounded-2xl shadow-xl overflow-hidden hover:shadow-2xl transition-all duration-300 hover:scale-105 cursor-pointer"
                >
                  <div className="h-64 relative overflow-hidden">
                    {story.image_url ? (
                      <img
                        src={story.image_url}
                        alt={story.title}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full bg-gradient-to-br from-blue-400 to-purple-500"></div>
                    )}
                    <div className="absolute top-4 right-4">
                      <span className={`px-3 py-1 rounded-full text-sm font-semibold border ${getCategoryColor(story.category?.color || 'blue')}`}>
                        {story.category?.name}
                      </span>
                    </div>
                  </div>

                  <div className="p-6">
                    <div className="flex items-center gap-3 mb-3">
                      <div className="w-12 h-12 rounded-full bg-slate-200 overflow-hidden">
                        {story.student_photo_url ? (
                          <img src={story.student_photo_url} alt={story.student_name} className="w-full h-full object-cover" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-blue-400 to-purple-500 text-white font-bold">
                            {story.student_name.charAt(0)}
                          </div>
                        )}
                      </div>
                      <div>
                        <p className="font-semibold text-slate-800">{story.student_name}</p>
                        <p className="text-sm text-slate-500">{story.program} · {story.year}</p>
                      </div>
                    </div>

                    <h3 className="text-xl font-bold text-slate-800 mb-2 line-clamp-2">{story.title}</h3>
                    <p className="text-slate-600 line-clamp-3 mb-4">{story.excerpt}</p>

                    <div className="flex items-center justify-between text-sm text-slate-500">
                      <div className="flex items-center gap-1">
                        <Eye className="w-4 h-4" />
                        <span>{story.views_count} views</span>
                      </div>
                      <ChevronRight className="w-5 h-5 text-blue-600" />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 mb-8">
          <div className="flex flex-col lg:flex-row gap-4 items-center">
            <div className="flex-1 relative w-full">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Search stories by name, title, or keyword..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div className="flex gap-2 items-center">
              <Filter className="w-5 h-5 text-slate-500" />
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="px-4 py-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">All Categories</option>
                {categories.map((cat) => (
                  <option key={cat.id} value={cat.id}>{cat.name}</option>
                ))}
              </select>

              <div className="flex gap-1 ml-2 bg-slate-100 rounded-lg p-1">
                <button
                  onClick={() => setViewMode('grid')}
                  className={`p-2 rounded ${viewMode === 'grid' ? 'bg-white shadow' : 'text-slate-500'}`}
                >
                  <Grid className="w-5 h-5" />
                </button>
                <button
                  onClick={() => setViewMode('timeline')}
                  className={`p-2 rounded ${viewMode === 'timeline' ? 'bg-white shadow' : 'text-slate-500'}`}
                >
                  <List className="w-5 h-5" />
                </button>
              </div>
            </div>
          </div>

          <div className="flex gap-2 mt-4 flex-wrap">
            {categories.map((cat) => (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id === selectedCategory ? 'all' : cat.id)}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                  selectedCategory === cat.id
                    ? getCategoryColor(cat.color)
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200 border border-slate-200'
                }`}
              >
                {cat.name}
              </button>
            ))}
          </div>
        </div>

        {viewMode === 'grid' ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 pb-12">
            {filteredStories.length === 0 ? (
              <div className="col-span-full text-center py-12">
                <Heart className="w-16 h-16 text-slate-300 mx-auto mb-4" />
                <p className="text-slate-500 text-lg">No stories found matching your criteria</p>
              </div>
            ) : (
              filteredStories.map((story) => (
                <div
                  key={story.id}
                  onClick={() => handleStoryClick(story)}
                  className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden hover:shadow-lg transition-all duration-300 hover:scale-102 cursor-pointer"
                >
                  <div className="h-48 relative overflow-hidden">
                    {story.image_url ? (
                      <img
                        src={story.image_url}
                        alt={story.title}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full bg-gradient-to-br from-slate-200 to-slate-300"></div>
                    )}
                    <div className="absolute top-3 right-3">
                      <span className={`px-2 py-1 rounded-full text-xs font-semibold border ${getCategoryColor(story.category?.color || 'blue')}`}>
                        {story.category?.name}
                      </span>
                    </div>
                  </div>

                  <div className="p-5">
                    <div className="flex items-center gap-2 mb-3">
                      <div className="w-10 h-10 rounded-full bg-slate-200 overflow-hidden flex-shrink-0">
                        {story.student_photo_url ? (
                          <img src={story.student_photo_url} alt={story.student_name} className="w-full h-full object-cover" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-blue-400 to-purple-500 text-white font-bold text-sm">
                            {story.student_name.charAt(0)}
                          </div>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold text-slate-800 truncate">{story.student_name}</p>
                        <p className="text-xs text-slate-500 truncate">{story.program} · {story.year}</p>
                      </div>
                    </div>

                    <h3 className="text-lg font-bold text-slate-800 mb-2 line-clamp-2">{story.title}</h3>
                    <p className="text-slate-600 text-sm line-clamp-3 mb-3">{story.excerpt}</p>

                    <div className="flex items-center justify-between text-xs text-slate-500">
                      <div className="flex items-center gap-1">
                        <Eye className="w-3 h-3" />
                        <span>{story.views_count}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Calendar className="w-3 h-3" />
                        <span>{new Date(story.date_posted).toLocaleDateString()}</span>
                      </div>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        ) : (
          <div className="space-y-6 pb-12">
            {filteredStories.length === 0 ? (
              <div className="text-center py-12">
                <Heart className="w-16 h-16 text-slate-300 mx-auto mb-4" />
                <p className="text-slate-500 text-lg">No stories found matching your criteria</p>
              </div>
            ) : (
              filteredStories.map((story, index) => (
                <div key={story.id} className="relative">
                  {index !== 0 && (
                    <div className="absolute left-8 top-0 bottom-0 w-0.5 bg-slate-200 -z-10"></div>
                  )}

                  <div className="flex gap-6 bg-white rounded-xl shadow-sm border border-slate-200 p-6 hover:shadow-lg transition-shadow cursor-pointer"
                       onClick={() => handleStoryClick(story)}>
                    <div className="flex-shrink-0">
                      <div className="w-16 h-16 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold text-xl">
                        {story.year}
                      </div>
                    </div>

                    <div className="flex-1">
                      <div className="flex items-start gap-4">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <span className={`px-2 py-1 rounded-full text-xs font-semibold border ${getCategoryColor(story.category?.color || 'blue')}`}>
                              {story.category?.name}
                            </span>
                            <span className="text-sm text-slate-500">{new Date(story.date_posted).toLocaleDateString()}</span>
                          </div>

                          <h3 className="text-xl font-bold text-slate-800 mb-2">{story.title}</h3>

                          <div className="flex items-center gap-2 mb-3">
                            <User className="w-4 h-4 text-slate-400" />
                            <span className="text-sm text-slate-600">{story.student_name} · {story.program}</span>
                          </div>

                          <p className="text-slate-600 mb-3">{story.excerpt}</p>

                          <div className="flex items-center gap-1 text-sm text-slate-500">
                            <Eye className="w-4 h-4" />
                            <span>{story.views_count} views</span>
                          </div>
                        </div>

                        {story.image_url && (
                          <img
                            src={story.image_url}
                            alt={story.title}
                            className="w-32 h-32 rounded-lg object-cover"
                          />
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        )}
      </div>

      {selectedStory && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full my-8 max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b border-slate-200 px-6 py-4 flex justify-between items-center z-10">
              <span className={`px-3 py-1 rounded-full text-sm font-semibold border ${getCategoryColor(selectedStory.category?.color || 'blue')}`}>
                {selectedStory.category?.name}
              </span>
              <button
                onClick={() => setSelectedStory(null)}
                className="text-slate-400 hover:text-slate-600 transition-colors"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="p-8">
              {selectedStory.image_url && (
                <img
                  src={selectedStory.image_url}
                  alt={selectedStory.title}
                  className="w-full h-96 object-cover rounded-xl mb-6"
                />
              )}

              <div className="flex items-center gap-4 mb-6">
                <div className="w-16 h-16 rounded-full bg-slate-200 overflow-hidden">
                  {selectedStory.student_photo_url ? (
                    <img src={selectedStory.student_photo_url} alt={selectedStory.student_name} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-blue-400 to-purple-500 text-white font-bold text-xl">
                      {selectedStory.student_name.charAt(0)}
                    </div>
                  )}
                </div>
                <div>
                  <h3 className="text-xl font-bold text-slate-800">{selectedStory.student_name}</h3>
                  <p className="text-slate-600">{selectedStory.program} · Class of {selectedStory.year}</p>
                </div>
              </div>

              <h1 className="text-4xl font-bold text-slate-800 mb-4">{selectedStory.title}</h1>

              <div className="flex items-center gap-4 text-sm text-slate-500 mb-8">
                <div className="flex items-center gap-1">
                  <Calendar className="w-4 h-4" />
                  <span>{new Date(selectedStory.date_posted).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</span>
                </div>
                <div className="flex items-center gap-1">
                  <Eye className="w-4 h-4" />
                  <span>{selectedStory.views_count} views</span>
                </div>
              </div>

              <div className="prose prose-lg max-w-none">
                <p className="text-slate-700 leading-relaxed whitespace-pre-wrap">{selectedStory.content}</p>
              </div>

              {selectedStory.video_url && (
                <div className="mt-8">
                  <h3 className="text-xl font-bold text-slate-800 mb-4">Video</h3>
                  <div className="aspect-video bg-slate-900 rounded-xl overflow-hidden">
                    <iframe
                      src={selectedStory.video_url}
                      className="w-full h-full"
                      allowFullScreen
                    ></iframe>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ImpactStories;
