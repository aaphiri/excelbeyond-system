import React, { useState, useEffect } from 'react';
import {
  Users,
  DollarSign,
  AlertTriangle,
  CheckSquare,
  TrendingUp,
  Calendar,
  GraduationCap,
  FileText
} from 'lucide-react';
import { User } from '../types';
import { supabase } from '../lib/supabase';
import DashboardCard from '../components/Dashboard/DashboardCard';
import RecentActivities from '../components/Dashboard/RecentActivities';
import StudentProgress from '../components/Dashboard/StudentProgress';
import AllowanceChart from '../components/Dashboard/AllowanceChart';

interface DashboardProps {
  user: User;
}

const Dashboard: React.FC<DashboardProps> = ({ user }) => {
  const [totalStudents, setTotalStudents] = useState(0);
  const [categoryStats, setCategoryStats] = useState({
    university: 0,
    diploma: 0,
    launch_year: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStudentStats();
  }, [user]);

  const fetchStudentStats = async () => {
    try {
      let query = supabase.from('students').select('id, program_level');

      if (user.role === 'program_officer') {
        query = query.eq('assigned_officer_id', user.id);
      }

      const { data, error } = await query;

      if (error) {
        console.error('Error fetching student stats:', error);
      } else if (data) {
        setTotalStudents(data.length);
        setCategoryStats({
          university: data.filter(s => s.program_level === 'university').length,
          diploma: data.filter(s => s.program_level === 'diploma').length,
          launch_year: data.filter(s => s.program_level === 'launch_year').length
        });
      }
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  const stats = [
    {
      title: user.role === 'program_officer' ? 'My Students' : 'Total Students',
      value: loading ? '...' : totalStudents.toString(),
      change: '+12%',
      changeType: 'positive' as const,
      icon: Users,
      color: 'emerald',
    },
    {
      title: 'Active Allowances',
      value: 'ZMW 45,670',
      change: '+8%',
      changeType: 'positive' as const,
      icon: DollarSign,
      color: 'blue',
    },
    {
      title: 'Open Issues',
      value: '23',
      change: '-15%',
      changeType: 'positive' as const,
      icon: AlertTriangle,
      color: 'orange',
    },
    {
      title: 'Pending Tasks',
      value: '18',
      change: '-5%',
      changeType: 'positive' as const,
      icon: CheckSquare,
      color: 'purple',
    },
    {
      title: 'Graduation Rate',
      value: '94%',
      change: '+3%',
      changeType: 'positive' as const,
      icon: GraduationCap,
      color: 'green',
    },
    {
      title: 'Forms Completed',
      value: '156',
      change: '+22%',
      changeType: 'positive' as const,
      icon: FileText,
      color: 'indigo',
    },
  ];

  return (
    <div className="space-y-6">
      {/* Welcome Header */}
      <div className="bg-gradient-to-r from-emerald-600 to-teal-600 rounded-xl p-6 text-white">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold mb-2">Welcome back, {user.name}!</h1>
            <p className="text-emerald-100">
              {user.role === 'admin' ? 'System Overview Dashboard' : 
               user.role === 'program_officer' ? 'Your Students Dashboard' :
               user.role === 'deputy_manager' ? 'Management Dashboard' :
               'Your Academic Progress'}
            </p>
          </div>
          <div className="flex items-center space-x-2">
            <Calendar className="w-5 h-5" />
            <span className="text-emerald-100">
              {new Date().toLocaleDateString('en-GB', { 
                weekday: 'long', 
                year: 'numeric', 
                month: 'long', 
                day: 'numeric' 
              })}
            </span>
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-6">
        {stats.map((stat, index) => (
          <DashboardCard key={index} {...stat} />
        ))}
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
        {/* Recent Activities */}
        <div className="xl:col-span-1">
          <RecentActivities user={user} />
        </div>

        {/* Student Progress */}
        <div className="xl:col-span-1">
          <StudentProgress user={user} />
        </div>

        {/* Allowance Chart */}
        <div className="xl:col-span-1">
          <AllowanceChart user={user} />
        </div>
      </div>

      {/* Student Category Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl shadow-sm p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            {user.role === 'program_officer' ? 'My Students by Category' : 'Students by Category'}
          </h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 bg-blue-50 rounded-lg">
              <div>
                <p className="font-medium text-gray-900">University</p>
                <p className="text-sm text-gray-600">Degree programs</p>
              </div>
              <div className="text-right">
                <p className="text-lg font-semibold text-blue-600">{loading ? '...' : categoryStats.university}</p>
                <p className="text-xs text-gray-500">students</p>
              </div>
            </div>
            <div className="flex items-center justify-between p-4 bg-green-50 rounded-lg">
              <div>
                <p className="font-medium text-gray-900">College/Diploma</p>
                <p className="text-sm text-gray-600">Diploma & certificate programs</p>
              </div>
              <div className="text-right">
                <p className="text-lg font-semibold text-green-600">{loading ? '...' : categoryStats.diploma}</p>
                <p className="text-xs text-gray-500">students</p>
              </div>
            </div>
            <div className="flex items-center justify-between p-4 bg-orange-50 rounded-lg">
              <div>
                <p className="font-medium text-gray-900">Launch Year</p>
                <p className="text-sm text-gray-600">Foundation programs</p>
              </div>
              <div className="text-right">
                <p className="text-lg font-semibold text-orange-600">{loading ? '...' : categoryStats.launch_year}</p>
                <p className="text-xs text-gray-500">students</p>
              </div>
            </div>
          </div>
        </div>

      {user.role === 'admin' && (
        <>
          {/* Performance Metrics */}
          <div className="bg-white rounded-xl shadow-sm p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Performance Metrics</h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-gray-600">Student Retention Rate</span>
                <div className="flex items-center space-x-2">
                  <div className="w-32 bg-gray-200 rounded-full h-2">
                    <div className="bg-emerald-600 h-2 rounded-full" style={{ width: '96%' }}></div>
                  </div>
                  <span className="text-sm font-semibold text-emerald-600">96%</span>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-600">On-time Allowance Distribution</span>
                <div className="flex items-center space-x-2">
                  <div className="w-32 bg-gray-200 rounded-full h-2">
                    <div className="bg-blue-600 h-2 rounded-full" style={{ width: '89%' }}></div>
                  </div>
                  <span className="text-sm font-semibold text-blue-600">89%</span>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-600">Issue Resolution Rate</span>
                <div className="flex items-center space-x-2">
                  <div className="w-32 bg-gray-200 rounded-full h-2">
                    <div className="bg-orange-600 h-2 rounded-full" style={{ width: '92%' }}></div>
                  </div>
                  <span className="text-sm font-semibold text-orange-600">92%</span>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-600">Form Completion Rate</span>
                <div className="flex items-center space-x-2">
                  <div className="w-32 bg-gray-200 rounded-full h-2">
                    <div className="bg-purple-600 h-2 rounded-full" style={{ width: '88%' }}></div>
                  </div>
                  <span className="text-sm font-semibold text-purple-600">88%</span>
                </div>
              </div>
            </div>
          </div>
        </>
      )}
      </div>
    </div>
  );
};

export default Dashboard;