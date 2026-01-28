import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import Container from '../../components/shared/Container';

/**
 * Login Page
 *
 * Features:
 * - Email + Password login
 * - Remember me
 * - Forgot password link
 * - Beautiful, trust-building design
 */

const Login = () => {
  const navigate = useNavigate();
  const { login, loading, error: authError } = useAuth();

  const [formData, setFormData] = useState({
    email: '',
    password: '',
    rememberMe: false,
  });

  const [errors, setErrors] = useState({});

  // Handle input change
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));

    // Clear error when user types
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  // Validate form
  const validateForm = () => {
    const newErrors = {};

    if (!formData.email) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Email is invalid';
    }

    if (!formData.password) {
      newErrors.password = 'Password is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Submit form
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) return;

    const result = await login(formData.email, formData.password);

    if (result.success) {
      // Redirect based on user role and profile completion
      const user = result.user;

      if (!user.email_verified) {
        navigate('/verify-email');
      } else if (user.role === 'worker') {
        // Check if profile is complete
        if (user.profile_completion_percentage < 100) {
          navigate('/complete-profile');
        } else {
          navigate('/dashboard/worker');
        }
      } else if (user.role === 'care_home_admin' || user.role === 'care_home_staff') {
        navigate('/dashboard/care-home');
      } else {
        navigate('/dashboard');
      }
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-ocean-50 via-white to-sage-50">
      {/* Header with logo */}
      <div className="bg-white border-b border-gray-200 shadow-sm">
        <Container>
          <div className="py-4 flex items-center justify-between">
            <Link to="/" className="text-2xl font-bold text-charcoal-900">
              Vicarity
            </Link>
            <div className="text-sm text-gray-600">
              New to Vicarity?{' '}
              <Link to="/register" className="text-ocean-600 hover:text-ocean-700 font-semibold">
                Sign up
              </Link>
            </div>
          </div>
        </Container>
      </div>

      <Container className="py-8 md:py-12">
        <div className="max-w-md mx-auto">
          {/* Card */}
          <div className="bg-white rounded-2xl shadow-healthcare border border-gray-100 p-6 md:p-8">
            {/* Title */}
            <div className="text-center mb-8">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-ocean-100 rounded-full mb-4">
                <svg className="w-8 h-8 text-ocean-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" />
                </svg>
              </div>
              <h1 className="text-3xl font-bold text-charcoal-900 mb-2">
                Welcome Back
              </h1>
              <p className="text-gray-600">
                Log in to your Vicarity account
              </p>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Email */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Email Address
                </label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-ocean-500 focus:border-transparent transition-all ${
                    errors.email ? 'border-red-500' : 'border-gray-300'
                  }`}
                  placeholder="you@example.com"
                  autoComplete="email"
                />
                {errors.email && (
                  <p className="mt-1 text-sm text-red-600">{errors.email}</p>
                )}
              </div>

              {/* Password */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Password
                </label>
                <input
                  type="password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-ocean-500 focus:border-transparent transition-all ${
                    errors.password ? 'border-red-500' : 'border-gray-300'
                  }`}
                  placeholder="••••••••"
                  autoComplete="current-password"
                />
                {errors.password && (
                  <p className="mt-1 text-sm text-red-600">{errors.password}</p>
                )}
              </div>

              {/* Remember Me & Forgot Password */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    name="rememberMe"
                    id="rememberMe"
                    checked={formData.rememberMe}
                    onChange={handleChange}
                    className="w-4 h-4 text-ocean-600 border-gray-300 rounded focus:ring-ocean-500"
                  />
                  <label htmlFor="rememberMe" className="text-sm text-gray-600">
                    Remember me
                  </label>
                </div>
                <Link
                  to="/forgot-password"
                  className="text-sm text-ocean-600 hover:text-ocean-700 font-semibold"
                >
                  Forgot password?
                </Link>
              </div>

              {/* Error Message */}
              {authError && (
                <div className="p-4 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
                  {authError}
                </div>
              )}

              {/* Submit Button */}
              <button
                type="submit"
                disabled={loading}
                className="w-full min-h-[44px] px-6 py-3 bg-gradient-to-r from-ocean-500 to-ocean-600
                         hover:from-ocean-600 hover:to-ocean-700 text-white font-semibold
                         rounded-lg shadow-lg transition-all hover:scale-105 active:scale-95
                         disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? 'Logging in...' : 'Log In'}
              </button>

              {/* Divider */}
              <div className="relative my-6">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-gray-300"></div>
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-2 bg-white text-gray-500">Or continue with</span>
                </div>
              </div>

              {/* Sign Up Links */}
              <div className="grid grid-cols-2 gap-4">
                <Link
                  to="/register?role=worker"
                  className="min-h-[44px] px-4 py-3 bg-sage-50 hover:bg-sage-100 border border-sage-200
                           text-sage-700 font-medium rounded-lg transition-all text-center"
                >
                  Sign up as Worker
                </Link>
                <Link
                  to="/register/care-home"
                  className="min-h-[44px] px-4 py-3 bg-terracotta-50 hover:bg-terracotta-100 border border-terracotta-200
                           text-terracotta-700 font-medium rounded-lg transition-all text-center"
                >
                  Sign up as Care Home
                </Link>
              </div>
            </form>
          </div>

          {/* Trust Badges */}
          <div className="mt-8 flex flex-wrap justify-center gap-6 text-sm text-gray-500">
            <div className="flex items-center gap-2">
              <svg className="w-5 h-5 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              <span>Secure Login</span>
            </div>
            <div className="flex items-center gap-2">
              <svg className="w-5 h-5 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              <span>Data Protected</span>
            </div>
          </div>
        </div>
      </Container>
    </div>
  );
};

export default Login;
