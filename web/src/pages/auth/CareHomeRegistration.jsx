import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import Container from '../../components/shared/Container';

/**
 * Care Home Registration - Single Form
 *
 * Fields:
 * - Business name
 * - CQC registration number
 * - Email + Password
 * - Contact details
 *
 * Features:
 * - Real-time validation
 * - Mobile-optimized
 * - Trust-building design
 */

const CareHomeRegistration = () => {
  const navigate = useNavigate();
  const { register, loading, error: authError } = useAuth();

  const [formData, setFormData] = useState({
    business_name: '',
    cqc_number: '',
    email: '',
    password: '',
    confirmPassword: '',
    phone: '',
    postcode: '',
  });

  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});

  // Handle input change
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));

    // Clear error when user types
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  // Handle blur
  const handleBlur = (e) => {
    setTouched(prev => ({ ...prev, [e.target.name]: true }));
    validateField(e.target.name, e.target.value);
  };

  // Validate individual field
  const validateField = (name, value) => {
    let error = '';

    switch (name) {
      case 'business_name':
        if (!value) error = 'Business name is required';
        else if (value.length < 3) error = 'Business name must be at least 3 characters';
        break;
      case 'cqc_number':
        if (!value) error = 'CQC number is required';
        else if (!/^[A-Z0-9-]+$/i.test(value)) error = 'Please enter a valid CQC number';
        break;
      case 'email':
        if (!value) error = 'Email is required';
        else if (!/\S+@\S+\.\S+/.test(value)) error = 'Email is invalid';
        break;
      case 'password':
        if (!value) error = 'Password is required';
        else if (value.length < 8) error = 'Password must be at least 8 characters';
        else if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(value)) {
          error = 'Password must contain uppercase, lowercase, and number';
        }
        break;
      case 'confirmPassword':
        if (!value) error = 'Please confirm password';
        else if (value !== formData.password) error = 'Passwords do not match';
        break;
      case 'phone':
        if (!value) error = 'Phone number is required';
        else if (!/^(\+44|0)[0-9]{10}$/.test(value.replace(/\s/g, ''))) {
          error = 'Please enter a valid UK phone number';
        }
        break;
      case 'postcode':
        if (!value) error = 'Postcode is required';
        else if (!/^[A-Z]{1,2}[0-9]{1,2}[A-Z]?\s?[0-9][A-Z]{2}$/i.test(value)) {
          error = 'Please enter a valid UK postcode';
        }
        break;
      default:
        break;
    }

    if (error) {
      setErrors(prev => ({ ...prev, [name]: error }));
    } else {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }

    return !error;
  };

  // Validate all fields
  const validateForm = () => {
    const fieldsToValidate = [
      'business_name',
      'cqc_number',
      'email',
      'password',
      'confirmPassword',
      'phone',
      'postcode',
    ];

    let formErrors = {};
    fieldsToValidate.forEach(field => {
      if (!validateField(field, formData[field])) {
        formErrors[field] = errors[field] || 'Required';
      }
    });

    setErrors(formErrors);
    return Object.keys(formErrors).length === 0;
  };

  // Submit form
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) return;

    // Backend only expects email, password, and user_type for registration
    // Profile details will be saved later in profile completion
    const submitData = {
      email: formData.email,
      password: formData.password,
      user_type: 'care_home', // Backend expects 'user_type' not 'role'
    };

    const result = await register(submitData);

    if (result.success) {
      // Store profile data in localStorage to use in profile completion
      localStorage.setItem('pending_care_home_profile', JSON.stringify({
        business_name: formData.business_name,
        cqc_number: formData.cqc_number,
        phone: formData.phone,
        postcode: formData.postcode,
      }));
      navigate('/verify-email');
    }
  };

  // Password strength indicator
  const getPasswordStrength = (password) => {
    let strength = 0;
    if (password.length >= 8) strength++;
    if (/[a-z]/.test(password)) strength++;
    if (/[A-Z]/.test(password)) strength++;
    if (/\d/.test(password)) strength++;
    if (/[^a-zA-Z\d]/.test(password)) strength++;
    return strength;
  };

  const passwordStrength = getPasswordStrength(formData.password);
  const strengthLabel = ['', 'Weak', 'Fair', 'Good', 'Strong', 'Excellent'][passwordStrength];
  const strengthColor = ['', 'bg-red-500', 'bg-orange-500', 'bg-yellow-500', 'bg-terracotta-500', 'bg-green-600'][passwordStrength];

  return (
    <div className="min-h-screen bg-gradient-to-br from-terracotta-50 via-white to-warm-50">
      {/* Header with logo */}
      <div className="bg-white border-b border-gray-200 shadow-sm">
        <Container>
          <div className="py-4 flex items-center justify-between">
            <Link to="/" className="text-2xl font-bold text-charcoal-900">
              Vicarity
            </Link>
            <div className="text-sm text-gray-600">
              Already have an account?{' '}
              <Link to="/login" className="text-ocean-600 hover:text-ocean-700 font-semibold">
                Log in
              </Link>
            </div>
          </div>
        </Container>
      </div>

      <Container className="py-8 md:py-12">
        <div className="max-w-2xl mx-auto">
          {/* Card */}
          <div className="bg-white rounded-2xl shadow-healthcare border border-gray-100 p-6 md:p-8">
            {/* Title */}
            <div className="text-center mb-8">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-terracotta-100 rounded-full mb-4">
                <svg className="w-8 h-8 text-terracotta-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                </svg>
              </div>
              <h1 className="text-3xl font-bold text-charcoal-900 mb-2">
                Register Your Care Home
              </h1>
              <p className="text-gray-600">
                Join hundreds of care providers finding staff faster
              </p>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Business Information */}
              <div className="bg-terracotta-50 rounded-lg p-6 space-y-6">
                <h2 className="font-semibold text-charcoal-900 flex items-center gap-2">
                  <svg className="w-5 h-5 text-terracotta-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                  </svg>
                  Business Information
                </h2>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Care Home Name *
                  </label>
                  <input
                    type="text"
                    name="business_name"
                    value={formData.business_name}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-terracotta-500 focus:border-transparent transition-all ${
                      errors.business_name && touched.business_name ? 'border-red-500' : 'border-gray-300'
                    }`}
                    placeholder="Sunshine Care Home"
                  />
                  {errors.business_name && touched.business_name && (
                    <p className="mt-1 text-sm text-red-600">{errors.business_name}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    CQC Registration Number *
                  </label>
                  <input
                    type="text"
                    name="cqc_number"
                    value={formData.cqc_number}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-terracotta-500 focus:border-transparent transition-all ${
                      errors.cqc_number && touched.cqc_number ? 'border-red-500' : 'border-gray-300'
                    }`}
                    placeholder="1-123456789"
                  />
                  {errors.cqc_number && touched.cqc_number && (
                    <p className="mt-1 text-sm text-red-600">{errors.cqc_number}</p>
                  )}
                  <p className="mt-1 text-xs text-gray-500">
                    Find your CQC number on the{' '}
                    <a
                      href="https://www.cqc.org.uk/search/services/all"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-terracotta-600 hover:text-terracotta-700 underline"
                    >
                      CQC website
                    </a>
                  </p>
                </div>
              </div>

              {/* Account Security */}
              <div className="space-y-6">
                <h2 className="font-semibold text-charcoal-900 flex items-center gap-2">
                  <svg className="w-5 h-5 text-ocean-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                  </svg>
                  Account Security
                </h2>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Email Address *
                  </label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-terracotta-500 focus:border-transparent transition-all ${
                      errors.email && touched.email ? 'border-red-500' : 'border-gray-300'
                    }`}
                    placeholder="manager@carehome.com"
                  />
                  {errors.email && touched.email && (
                    <p className="mt-1 text-sm text-red-600">{errors.email}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Password *
                  </label>
                  <input
                    type="password"
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-terracotta-500 focus:border-transparent transition-all ${
                      errors.password && touched.password ? 'border-red-500' : 'border-gray-300'
                    }`}
                    placeholder="••••••••"
                  />
                  {formData.password && (
                    <div className="mt-2">
                      <div className="flex items-center gap-2 mb-1">
                        <div className="flex-1 h-2 bg-gray-200 rounded-full overflow-hidden">
                          <div
                            className={`h-full transition-all duration-300 ${strengthColor}`}
                            style={{ width: `${(passwordStrength / 5) * 100}%` }}
                          />
                        </div>
                        <span className={`text-xs font-medium ${strengthColor.replace('bg-', 'text-')}`}>
                          {strengthLabel}
                        </span>
                      </div>
                    </div>
                  )}
                  {errors.password && touched.password && (
                    <p className="mt-1 text-sm text-red-600">{errors.password}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Confirm Password *
                  </label>
                  <input
                    type="password"
                    name="confirmPassword"
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-terracotta-500 focus:border-transparent transition-all ${
                      errors.confirmPassword && touched.confirmPassword ? 'border-red-500' : 'border-gray-300'
                    }`}
                    placeholder="••••••••"
                  />
                  {errors.confirmPassword && touched.confirmPassword && (
                    <p className="mt-1 text-sm text-red-600">{errors.confirmPassword}</p>
                  )}
                </div>
              </div>

              {/* Contact Information */}
              <div className="space-y-6">
                <h2 className="font-semibold text-charcoal-900 flex items-center gap-2">
                  <svg className="w-5 h-5 text-ocean-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                  </svg>
                  Contact Information
                </h2>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Phone Number *
                  </label>
                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-terracotta-500 focus:border-transparent transition-all ${
                      errors.phone && touched.phone ? 'border-red-500' : 'border-gray-300'
                    }`}
                    placeholder="020 1234 5678"
                  />
                  {errors.phone && touched.phone && (
                    <p className="mt-1 text-sm text-red-600">{errors.phone}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Postcode *
                  </label>
                  <input
                    type="text"
                    name="postcode"
                    value={formData.postcode}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-terracotta-500 focus:border-transparent transition-all ${
                      errors.postcode && touched.postcode ? 'border-red-500' : 'border-gray-300'
                    }`}
                    placeholder="SW1A 1AA"
                  />
                  {errors.postcode && touched.postcode && (
                    <p className="mt-1 text-sm text-red-600">{errors.postcode}</p>
                  )}
                </div>
              </div>

              {/* Terms */}
              <div className="flex items-start gap-3">
                <input
                  type="checkbox"
                  id="terms"
                  className="mt-1 w-4 h-4 text-terracotta-600 border-gray-300 rounded focus:ring-terracotta-500"
                  required
                />
                <label htmlFor="terms" className="text-sm text-gray-600">
                  I agree to the{' '}
                  <Link to="/terms" className="text-ocean-600 hover:text-ocean-700 underline">
                    Terms of Service
                  </Link>
                  {' '}and{' '}
                  <Link to="/privacy" className="text-ocean-600 hover:text-ocean-700 underline">
                    Privacy Policy
                  </Link>
                </label>
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
                className="w-full min-h-[44px] px-6 py-3 bg-gradient-to-r from-terracotta-500 to-terracotta-600
                         hover:from-terracotta-600 hover:to-terracotta-700 text-white font-semibold
                         rounded-lg shadow-lg transition-all hover:scale-105 active:scale-95
                         disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? 'Creating Account...' : 'Create Care Home Account'}
              </button>
            </form>
          </div>

          {/* Trust Badges */}
          <div className="mt-8 flex flex-wrap justify-center gap-6 text-sm text-gray-500">
            <div className="flex items-center gap-2">
              <svg className="w-5 h-5 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              <span>CQC Verified</span>
            </div>
            <div className="flex items-center gap-2">
              <svg className="w-5 h-5 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              <span>256-bit SSL</span>
            </div>
            <div className="flex items-center gap-2">
              <svg className="w-5 h-5 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              <span>GDPR Compliant</span>
            </div>
          </div>
        </div>
      </Container>
    </div>
  );
};

export default CareHomeRegistration;
