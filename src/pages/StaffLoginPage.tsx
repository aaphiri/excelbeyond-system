import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  AlertCircle,
  Loader2,
  Lock,
  User,
  Eye,
  EyeOff,
  ArrowLeft,
  Shield,
  Mail,
  Building2,
  CheckCircle2
} from 'lucide-react';
import { staffLogin, staffRegister, RegisterRequest } from '../lib/staffAuth';

interface StaffLoginProps {
  onSwitchToGoogle: () => void;
}

const StaffLoginPage: React.FC<StaffLoginProps> = ({ onSwitchToGoogle }) => {
  const [mode, setMode] = useState<'login' | 'register'>('login');
  const [staffId, setStaffId] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [verificationToken, setVerificationToken] = useState<string | null>(null);

  const [registerData, setRegisterData] = useState<RegisterRequest>({
    staffId: '',
    email: '',
    password: '',
    name: '',
    role: 'user',
    department: '',
  });

  const navigate = useNavigate();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const result = await staffLogin(staffId, password, rememberMe);

      if (!result.success) {
        throw new Error(result.error || 'Login failed');
      }

      localStorage.setItem('staff_session_token', result.session_token!);
      localStorage.setItem('staff_user', JSON.stringify(result.user));

      window.dispatchEvent(new CustomEvent('staff-login', { detail: result.user }));

      navigate('/dashboard');
    } catch (error: any) {
      console.error('Login error:', error);
      setError(error.message || 'Failed to login. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      if (registerData.password.length < 6) {
        throw new Error('Password must be at least 6 characters long');
      }

      const result = await staffRegister(registerData);

      if (!result.success) {
        throw new Error(result.error || 'Registration failed');
      }

      if (result.verification_token) {
        setVerificationToken(result.verification_token);
      }

      setSuccess(result.message || 'Registration successful! Please verify your email to login.');
      setMode('login');
      setStaffId(registerData.staffId);
      setRegisterData({
        staffId: '',
        email: '',
        password: '',
        name: '',
        role: 'user',
        department: '',
      });
    } catch (error: any) {
      console.error('Registration error:', error);
      setError(error.message || 'Failed to register. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleForgotPassword = () => {
    navigate('/forgot-password');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-emerald-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <button
          onClick={onSwitchToGoogle}
          className="mb-6 flex items-center gap-2 text-green-700 hover:text-green-800 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span className="text-sm font-medium">Back to Google Sign-In</span>
        </button>

        <div className="bg-white rounded-2xl shadow-2xl border border-green-100 overflow-hidden">
          <div className="bg-gradient-to-r from-green-600 to-emerald-600 p-8 text-white">
            <div className="flex items-center gap-3 mb-4">
              <div className="bg-white/20 backdrop-blur-sm p-3 rounded-xl">
                <Shield className="w-8 h-8" />
              </div>
              <div>
                <h1 className="text-2xl font-bold">
                  {mode === 'login' ? 'Staff Login' : 'Staff Registration'}
                </h1>
                <p className="text-green-100 text-sm">Secure Access Portal</p>
              </div>
            </div>
          </div>

          <div className="p-8">
            {error && (
              <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                <div className="flex-1">
                  <p className="text-sm text-red-800 font-medium">
                    {mode === 'login' ? 'Login Failed' : 'Registration Failed'}
                  </p>
                  <p className="text-sm text-red-700 mt-1">{error}</p>
                </div>
              </div>
            )}

            {success && (
              <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg flex items-start gap-3">
                <CheckCircle2 className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                <div className="flex-1">
                  <p className="text-sm text-green-800 font-medium">Success!</p>
                  <p className="text-sm text-green-700 mt-1">{success}</p>
                  {verificationToken && (
                    <div className="mt-3 p-3 bg-blue-50 border border-blue-200 rounded">
                      <p className="text-xs font-semibold text-blue-900 mb-1">Development Mode - Verification Token:</p>
                      <code className="text-xs break-all text-blue-800 block mb-2">{verificationToken}</code>
                      <button
                        onClick={() => navigate(`/verify-email?token=${verificationToken}`)}
                        className="w-full bg-blue-600 text-white text-xs font-semibold py-2 px-3 rounded hover:bg-blue-700 transition-all"
                      >
                        Verify Email Now
                      </button>
                    </div>
                  )}
                </div>
              </div>
            )}

            {mode === 'login' ? (
              <form onSubmit={handleLogin} className="space-y-6">
                <div>
                  <label htmlFor="staffId" className="block text-sm font-semibold text-slate-700 mb-2">
                    Staff ID
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <User className="w-5 h-5 text-slate-400" />
                    </div>
                    <input
                      id="staffId"
                      type="text"
                      value={staffId}
                      onChange={(e) => setStaffId(e.target.value)}
                      placeholder="STAFF001"
                      required
                      className="w-full pl-10 pr-4 py-3 border-2 border-slate-200 rounded-lg focus:border-green-500 focus:ring-2 focus:ring-green-200 transition-all outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label htmlFor="password" className="block text-sm font-semibold text-slate-700 mb-2">
                    Password
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Lock className="w-5 h-5 text-slate-400" />
                    </div>
                    <input
                      id="password"
                      type={showPassword ? 'text' : 'password'}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="Enter your password"
                      required
                      className="w-full pl-10 pr-12 py-3 border-2 border-slate-200 rounded-lg focus:border-green-500 focus:ring-2 focus:ring-green-200 transition-all outline-none"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-600"
                    >
                      {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                    </button>
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={rememberMe}
                      onChange={(e) => setRememberMe(e.target.checked)}
                      className="w-4 h-4 text-green-600 border-slate-300 rounded focus:ring-green-500"
                    />
                    <span className="text-sm text-slate-600">Remember me</span>
                  </label>
                  <button
                    type="button"
                    onClick={handleForgotPassword}
                    className="text-sm text-green-600 hover:text-green-700 font-medium"
                  >
                    Forgot Password?
                  </button>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-gradient-to-r from-green-600 to-emerald-600 text-white font-semibold py-3 px-4 rounded-lg hover:from-green-700 hover:to-emerald-700 transition-all duration-200 flex items-center justify-center gap-2 shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      <span>Signing in...</span>
                    </>
                  ) : (
                    <>
                      <Shield className="w-5 h-5" />
                      <span>Sign In</span>
                    </>
                  )}
                </button>

                <div className="text-center">
                  <button
                    type="button"
                    onClick={() => {
                      setMode('register');
                      setError(null);
                      setSuccess(null);
                    }}
                    className="text-sm text-green-600 hover:text-green-700 font-medium"
                  >
                    Don't have an account? Register here
                  </button>
                </div>
              </form>
            ) : (
              <form onSubmit={handleRegister} className="space-y-4">
                <div>
                  <label htmlFor="reg-staffId" className="block text-sm font-semibold text-slate-700 mb-2">
                    Staff ID
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <User className="w-5 h-5 text-slate-400" />
                    </div>
                    <input
                      id="reg-staffId"
                      type="text"
                      value={registerData.staffId}
                      onChange={(e) => setRegisterData({ ...registerData, staffId: e.target.value })}
                      placeholder="STAFF001"
                      required
                      className="w-full pl-10 pr-4 py-3 border-2 border-slate-200 rounded-lg focus:border-green-500 focus:ring-2 focus:ring-green-200 transition-all outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label htmlFor="reg-name" className="block text-sm font-semibold text-slate-700 mb-2">
                    Full Name
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <User className="w-5 h-5 text-slate-400" />
                    </div>
                    <input
                      id="reg-name"
                      type="text"
                      value={registerData.name}
                      onChange={(e) => setRegisterData({ ...registerData, name: e.target.value })}
                      placeholder="John Doe"
                      required
                      className="w-full pl-10 pr-4 py-3 border-2 border-slate-200 rounded-lg focus:border-green-500 focus:ring-2 focus:ring-green-200 transition-all outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label htmlFor="reg-email" className="block text-sm font-semibold text-slate-700 mb-2">
                    Email
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Mail className="w-5 h-5 text-slate-400" />
                    </div>
                    <input
                      id="reg-email"
                      type="email"
                      value={registerData.email}
                      onChange={(e) => setRegisterData({ ...registerData, email: e.target.value })}
                      placeholder="john.doe@example.com"
                      required
                      className="w-full pl-10 pr-4 py-3 border-2 border-slate-200 rounded-lg focus:border-green-500 focus:ring-2 focus:ring-green-200 transition-all outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label htmlFor="reg-password" className="block text-sm font-semibold text-slate-700 mb-2">
                    Password
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Lock className="w-5 h-5 text-slate-400" />
                    </div>
                    <input
                      id="reg-password"
                      type={showPassword ? 'text' : 'password'}
                      value={registerData.password}
                      onChange={(e) => setRegisterData({ ...registerData, password: e.target.value })}
                      placeholder="Minimum 6 characters"
                      required
                      className="w-full pl-10 pr-12 py-3 border-2 border-slate-200 rounded-lg focus:border-green-500 focus:ring-2 focus:ring-green-200 transition-all outline-none"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-600"
                    >
                      {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                    </button>
                  </div>
                </div>

                <div>
                  <label htmlFor="reg-role" className="block text-sm font-semibold text-slate-700 mb-2">
                    Role
                  </label>
                  <select
                    id="reg-role"
                    value={registerData.role}
                    onChange={(e) => setRegisterData({ ...registerData, role: e.target.value })}
                    required
                    className="w-full px-4 py-3 border-2 border-slate-200 rounded-lg focus:border-green-500 focus:ring-2 focus:ring-green-200 transition-all outline-none"
                  >
                    <option value="user">User</option>
                    <option value="program_officer">Program Officer</option>
                    <option value="deputy_manager">Deputy Manager</option>
                    <option value="admin">Admin</option>
                  </select>
                </div>

                <div>
                  <label htmlFor="reg-department" className="block text-sm font-semibold text-slate-700 mb-2">
                    Department (Optional)
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Building2 className="w-5 h-5 text-slate-400" />
                    </div>
                    <input
                      id="reg-department"
                      type="text"
                      value={registerData.department}
                      onChange={(e) => setRegisterData({ ...registerData, department: e.target.value })}
                      placeholder="Programs"
                      className="w-full pl-10 pr-4 py-3 border-2 border-slate-200 rounded-lg focus:border-green-500 focus:ring-2 focus:ring-green-200 transition-all outline-none"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-gradient-to-r from-green-600 to-emerald-600 text-white font-semibold py-3 px-4 rounded-lg hover:from-green-700 hover:to-emerald-700 transition-all duration-200 flex items-center justify-center gap-2 shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      <span>Registering...</span>
                    </>
                  ) : (
                    <>
                      <Shield className="w-5 h-5" />
                      <span>Register</span>
                    </>
                  )}
                </button>

                <div className="text-center">
                  <button
                    type="button"
                    onClick={() => {
                      setMode('login');
                      setError(null);
                      setSuccess(null);
                    }}
                    className="text-sm text-green-600 hover:text-green-700 font-medium"
                  >
                    Already have an account? Sign in here
                  </button>
                </div>
              </form>
            )}
          </div>

          <div className="bg-green-50 px-8 py-6 border-t border-green-100">
            <div className="flex flex-wrap items-center justify-center gap-4 text-sm text-green-700">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-green-600 rounded-full"></div>
                <span>Secure Authentication</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-green-600 rounded-full"></div>
                <span>Encrypted Storage</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-green-600 rounded-full"></div>
                <span>Account Security</span>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-6 text-center text-sm text-slate-500">
          <p>© {new Date().getFullYear()} Family Legacy Zambia. All rights reserved.</p>
        </div>
      </div>
    </div>
  );
};

export default StaffLoginPage;
