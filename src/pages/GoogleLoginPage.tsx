import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { BookOpen, AlertCircle, Loader2, Shield, ChevronLeft, ChevronRight } from 'lucide-react';

const studentImages = [
  '/images/086A0045.jpg',
  'https://images.pexels.com/photos/8923122/pexels-photo-8923122.jpeg',
  'https://images.pexels.com/photos/5212345/pexels-photo-5212345.jpeg',
  'https://images.pexels.com/photos/3184291/pexels-photo-3184291.jpeg',
  'https://images.pexels.com/photos/3184306/pexels-photo-3184306.jpeg',
];

const GoogleLoginPage: React.FC = () => {
  const { signInWithGoogle, user, loading: authLoading } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [currentSlide, setCurrentSlide] = useState(0);
  const navigate = useNavigate();

  useEffect(() => {
    if (user && !authLoading) {
      navigate('/dashboard', { replace: true });
    }
  }, [user, authLoading, navigate]);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % studentImages.length);
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  const handleGoogleSignIn = async () => {
    setLoading(true);
    setError(null);

    try {
      await signInWithGoogle();
    } catch (error: any) {
      console.error('Sign in error:', error);
      setError(error.message || 'Failed to sign in. Please try again.');
      setLoading(false);
    }
  };

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % studentImages.length);
  };

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + studentImages.length) % studentImages.length);
  };

  if (authLoading || user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-50 via-white to-emerald-50">
        <div className="text-center">
          <Loader2 className="w-12 h-12 text-green-600 animate-spin mx-auto mb-4" />
          <p className="text-slate-600">{user ? 'Redirecting to dashboard...' : 'Loading...'}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex bg-white">
      <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden bg-gradient-to-br from-green-600 to-emerald-700">
        <div className="absolute inset-0">
          {studentImages.map((image, index) => (
            <div
              key={index}
              className={`absolute inset-0 transition-opacity duration-1000 ${
                index === currentSlide ? 'opacity-100' : 'opacity-0'
              }`}
            >
              <img
                src={image}
                alt={`Student ${index + 1}`}
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-green-900/90 via-green-900/40 to-transparent"></div>
            </div>
          ))}
        </div>

        <button
          onClick={prevSlide}
          className="absolute left-4 top-1/2 transform -translate-y-1/2 z-10 bg-white/20 hover:bg-white/30 backdrop-blur-sm text-white p-3 rounded-full transition-all"
        >
          <ChevronLeft className="w-6 h-6" />
        </button>

        <button
          onClick={nextSlide}
          className="absolute right-4 top-1/2 transform -translate-y-1/2 z-10 bg-white/20 hover:bg-white/30 backdrop-blur-sm text-white p-3 rounded-full transition-all"
        >
          <ChevronRight className="w-6 h-6" />
        </button>

        <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 flex gap-2 z-10">
          {studentImages.map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentSlide(index)}
              className={`w-2 h-2 rounded-full transition-all ${
                index === currentSlide ? 'bg-white w-8' : 'bg-white/50'
              }`}
            />
          ))}
        </div>

        <div className="relative z-10 flex flex-col justify-end p-12 text-white">
          <div className="mb-8">
            <div className="flex items-center gap-3 mb-6">
              <div className="bg-white/20 backdrop-blur-sm p-3 rounded-xl">
                <BookOpen className="w-10 h-10" />
              </div>
              <div>
                <h1 className="text-4xl font-bold">Excel Beyond</h1>
                <p className="text-green-100 text-lg">Empowering Zambian Students</p>
              </div>
            </div>

            <h2 className="text-3xl font-bold mb-4">
              Transforming Lives Through Education
            </h2>
            <p className="text-xl text-green-100 leading-relaxed max-w-md">
              Supporting students from disadvantaged backgrounds to achieve academic excellence
              and create lasting impact in their communities.
            </p>
          </div>

          <div className="grid grid-cols-3 gap-4 max-w-md">
            <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4">
              <p className="text-3xl font-bold mb-1">500+</p>
              <p className="text-sm text-green-100">Students Supported</p>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4">
              <p className="text-3xl font-bold mb-1">95%</p>
              <p className="text-sm text-green-100">Graduation Rate</p>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4">
              <p className="text-3xl font-bold mb-1">12+</p>
              <p className="text-sm text-green-100">Years Impact</p>
            </div>
          </div>
        </div>
      </div>

      <div className="flex-1 flex items-center justify-center p-8 bg-gradient-to-br from-green-50 via-white to-emerald-50">
        <div className="w-full max-w-md">
          <div className="lg:hidden text-center mb-8">
            <div className="flex items-center justify-center gap-3 mb-4">
              <div className="bg-green-600 p-3 rounded-xl">
                <BookOpen className="w-8 h-8 text-white" />
              </div>
            </div>
            <h1 className="text-3xl font-bold text-slate-800 mb-2">Excel Beyond</h1>
            <p className="text-green-600">Student Management System</p>
          </div>

          <div className="bg-white rounded-2xl shadow-2xl border border-green-100 overflow-hidden">
            <div className="bg-gradient-to-r from-green-600 to-emerald-600 p-8 text-white">
              <div className="hidden lg:block text-center">
                <h2 className="text-2xl font-bold mb-2">Welcome Back</h2>
                <p className="text-green-100">Sign in to continue your journey</p>
              </div>
              <div className="lg:hidden text-center">
                <h2 className="text-xl font-bold">Welcome</h2>
              </div>
            </div>

            <div className="p-8">
              <div className="text-center mb-8">
                <p className="text-slate-600">
                  Sign in with your Google account
                </p>
              </div>

              {error && (
                <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-start gap-3">
                  <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                  <div className="flex-1">
                    <p className="text-sm text-red-800 font-medium">Authentication Error</p>
                    <p className="text-sm text-red-700 mt-1">{error}</p>
                  </div>
                </div>
              )}

              <button
                onClick={handleGoogleSignIn}
                disabled={loading}
                className="w-full bg-white border-2 border-green-300 text-slate-700 font-semibold py-3 px-4 rounded-lg hover:bg-green-50 hover:border-green-400 transition-all duration-200 flex items-center justify-center gap-3 shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin text-green-600" />
                    <span>Signing in...</span>
                  </>
                ) : (
                  <>
                    <svg className="w-5 h-5" viewBox="0 0 24 24">
                      <path
                        fill="#4285F4"
                        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                      />
                      <path
                        fill="#34A853"
                        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                      />
                      <path
                        fill="#FBBC05"
                        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                      />
                      <path
                        fill="#EA4335"
                        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                      />
                    </svg>
                    <span>Sign in with Google</span>
                  </>
                )}
              </button>

              <div className="mt-6 flex items-center gap-4">
                <div className="flex-1 border-t border-slate-200"></div>
                <span className="text-sm text-slate-500">OR</span>
                <div className="flex-1 border-t border-slate-200"></div>
              </div>

              <button
                onClick={() => navigate('/staff-login')}
                className="mt-6 w-full bg-gradient-to-r from-green-600 to-emerald-600 text-white font-semibold py-3 px-4 rounded-lg hover:from-green-700 hover:to-emerald-700 transition-all duration-200 flex items-center justify-center gap-2 shadow-lg"
              >
                <Shield className="w-5 h-5" />
                <span>Staff Login with ID</span>
              </button>

              <div className="mt-8 p-4 bg-green-50 border border-green-200 rounded-lg">
                <div className="flex items-start gap-2">
                  <Shield className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="text-sm font-semibold text-green-900 mb-1">
                      Secure Access
                    </p>
                    <p className="text-xs text-green-800">
                      Sign in with your Google account to access the system.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-green-50 px-8 py-6 border-t border-green-100">
              <div className="flex flex-wrap items-center justify-center gap-4 text-sm text-green-700">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-green-600 rounded-full"></div>
                  <span>Secure Access</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-green-600 rounded-full"></div>
                  <span>Real-time Updates</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-green-600 rounded-full"></div>
                  <span>24/7 Support</span>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-6 text-center text-sm text-slate-500">
            <p>
              © {new Date().getFullYear()} Family Legacy Zambia. All rights reserved.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default GoogleLoginPage;
