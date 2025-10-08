import React, { useState } from 'react';
import { GraduationCap, Users, Award, Globe } from 'lucide-react';
import { User, UserRole } from '../types';

interface LoginPageProps {
  onLogin: (user: User) => void;
}

const LoginPage: React.FC<LoginPageProps> = ({ onLogin }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // Demo users for testing
  const demoUsers = [
    { email: 'admin@familylegacy.zm', password: 'admin123', role: 'admin' as UserRole, name: 'John Mwanza', department: 'Administration' },
    { email: 'officer@familylegacy.zm', password: 'officer123', role: 'program_officer' as UserRole, name: 'Sarah Banda', department: 'Student Affairs' },
    { email: 'deputy@familylegacy.zm', password: 'deputy123', role: 'deputy_manager' as UserRole, name: 'Michael Phiri', department: 'Management' },
    { email: 'student@familylegacy.zm', password: 'student123', role: 'student' as UserRole, name: 'Grace Tembo', department: 'Engineering' },
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    // Simulate API call
    setTimeout(() => {
      const user = demoUsers.find(u => u.email === email && u.password === password);
      
      if (user) {
        const userData: User = {
          id: Math.random().toString(36).substr(2, 9),
          name: user.name,
          email: user.email,
          role: user.role,
          department: user.department,
        };
        onLogin(userData);
      } else {
        alert('Invalid credentials. Please try one of the demo accounts.');
      }
      setIsLoading(false);
    }, 1500);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-900 via-emerald-800 to-teal-900 relative overflow-hidden"
         style={{
           backgroundImage: `linear-gradient(rgba(6, 78, 59, 0.8), rgba(6, 78, 59, 0.8)), url('https://images.pexels.com/photos/5212317/pexels-photo-5212317.jpeg?auto=compress&cs=tinysrgb&w=1920')`,
           backgroundSize: 'cover',
           backgroundPosition: 'center',
           backgroundAttachment: 'fixed'
         }}>
      {/* Animated background elements */}
      <div className="absolute inset-0">
        <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-emerald-600 rounded-full opacity-10 animate-pulse"></div>
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-teal-600 rounded-full opacity-10 animate-bounce" style={{ animationDuration: '3s' }}></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-32 h-32 bg-emerald-400 rounded-full opacity-20 animate-ping"></div>
      </div>

      <div className="relative z-10 flex flex-col lg:flex-row min-h-screen">
        {/* Left Panel - Branding & Info */}
        <div className="lg:w-1/2 flex flex-col justify-center px-8 lg:px-16 py-12">
          <div className="max-w-md mx-auto lg:mx-0">
            <div className="flex items-center space-x-3 mb-8">
              <div className="w-12 h-12 bg-emerald-500 rounded-xl flex items-center justify-center">
                <GraduationCap className="w-8 h-8 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-white">ExcelHub</h1>
                <p className="text-emerald-200">Family Legacy Student Management</p>
              </div>
            </div>

            <h2 className="text-4xl font-bold text-white mb-6 leading-tight">
              Empowering Family Legacy Students Through Redemptive Child Development
            </h2>
            
            <p className="text-emerald-100 text-lg mb-8 leading-relaxed">
              Comprehensive student management system designed to track, support, and nurture students 
              throughout their academic journey.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
              <div className="text-center">
                <div className="w-16 h-16 bg-emerald-600 rounded-full flex items-center justify-center mx-auto mb-3">
                  <Users className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-white font-semibold">Student Tracking</h3>
                <p className="text-emerald-200 text-sm">Comprehensive monitoring</p>
              </div>
              <div className="text-center">
                <div className="w-16 h-16 bg-emerald-600 rounded-full flex items-center justify-center mx-auto mb-3">
                  <Award className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-white font-semibold">Excellence Focus</h3>
                <p className="text-emerald-200 text-sm">Academic achievement</p>
              </div>
              <div className="text-center">
                <div className="w-16 h-16 bg-emerald-600 rounded-full flex items-center justify-center mx-auto mb-3">
                  <Globe className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-white font-semibold">Global Impact</h3>
                <p className="text-emerald-200 text-sm">Worldwide reach</p>
              </div>
            </div>
          </div>
        </div>

        {/* Right Panel - Login Form */}
        <div className="lg:w-1/2 flex items-center justify-center px-8 py-12">
          <div className="w-full max-w-md">
            <div className="bg-white rounded-2xl shadow-2xl p-8">
              <div className="text-center mb-8">
                <h3 className="text-2xl font-bold text-gray-900">Welcome Back</h3>
                <p className="text-gray-600 mt-2">Sign in to your ExcelHub account</p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Email Address
                  </label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-colors"
                    placeholder="Enter your email"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Password
                  </label>
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-colors"
                    placeholder="Enter your password"
                    required
                  />
                </div>

                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full bg-gradient-to-r from-emerald-600 to-emerald-700 text-white py-3 px-4 rounded-lg font-semibold hover:from-emerald-700 hover:to-emerald-800 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2 transition-all duration-200 disabled:opacity-50"
                >
                  {isLoading ? (
                    <div className="flex items-center justify-center">
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                      Signing In...
                    </div>
                  ) : (
                    'Sign In'
                  )}
                </button>
              </form>

              <div className="mt-8 pt-6 border-t border-gray-200">
                <h4 className="text-sm font-semibold text-gray-900 mb-3">Demo Accounts:</h4>
                <div className="space-y-2 text-xs text-gray-600">
                  <div><strong>Admin:</strong> admin@familylegacy.zm / admin123</div>
                  <div><strong>Officer:</strong> officer@familylegacy.zm / officer123</div>
                  <div><strong>Deputy:</strong> deputy@familylegacy.zm / deputy123</div>
                  <div><strong>Student:</strong> student@familylegacy.zm / student123</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;