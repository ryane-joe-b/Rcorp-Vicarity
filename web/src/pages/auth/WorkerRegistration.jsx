import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import Container from '../../components/shared/Container';

/**
 * Worker Registration - 3-Step Wizard
 *
 * Step 1: Personal Details (email, password, name)
 * Step 2: Contact Details (phone, DOB)
 * Step 3: Final Review & Submit
 *
 * Features:
 * - Real-time validation
 * - Progress indicator
 * - Smooth animations
 * - Mobile-optimized
 */

const WorkerRegistration = () => {
  const navigate = useNavigate();
  const { register, loading, error: authError } = useAuth();

  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
  });

  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});

  // Calculate progress
  const progress = (step / 2) * 100;

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

  // Validate step
  const validateStep = () => {
    let stepErrors = {};

    if (step === 1) {
      ['email', 'password', 'confirmPassword'].forEach(field => {
        if (!validateField(field, formData[field])) {
          stepErrors[field] = errors[field] || 'Required';
        }
      });
    }
    // Step 2 is just review/terms, no validation needed

    setErrors(stepErrors);
    return Object.keys(stepErrors).length === 0;
  };

  // Next step
  const nextStep = () => {
    if (validateStep()) {
      setStep(prev => Math.min(prev + 1, 2));
    }
  };

  // Previous step
  const prevStep = () => {
    setStep(prev => Math.max(prev - 1, 1));
  };

  // Submit form
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateStep()) return;

    // Backend only expects email, password, and user_type for registration
    // Profile details will be saved later in profile completion
    const submitData = {
      email: formData.email,
      password: formData.password,
      user_type: 'worker', // Backend expects 'user_type' not 'role'
    };

    const result = await register(submitData);

    if (result.success) {
      // User will complete their profile after email verification
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
  const strengthColor = ['', 'bg-red-500', 'bg-orange-500', 'bg-yellow-500', 'bg-sage-500', 'bg-green-600'][passwordStrength];

  return (
    <div className="min-h-screen bg-gradient-to-br from-sage-50 via-white to-warm-50">
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
          {/* Progress Bar */}
          <div className="mb-8">
            <div className="flex justify-between mb-2">
              <span className="text-sm font-medium text-sage-700">
                Step {step} of 3
              </span>
              <span className="text-sm font-medium text-sage-700">
                {Math.round(progress)}% Complete
              </span>
            </div>
            <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-sage-500 to-sage-600 transition-all duration-500 ease-out"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>

          {/* Card */}
          <div className="bg-white rounded-2xl shadow-healthcare border border-gray-100 p-6 md:p-8">
            {/* Title */}
            <div className="text-center mb-8">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-sage-100 rounded-full mb-4">
                <svg className="w-8 h-8 text-sage-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
              </div>
              <h1 className="text-3xl font-bold text-charcoal-900 mb-2">
                {step === 1 && "Let's get started"}
                {step === 2 && "Contact details"}
                {step === 3 && "Review & confirm"}
              </h1>
              <p className="text-gray-600">
                {step === 1 && "Create your care worker account"}
                {step === 2 && "Help us reach you"}
                {step === 3 && "Almost there!"}
              </p>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit}>
              {/* Step 1: Personal Details */}
              {step === 1 && (
                <div className="space-y-6 animate-fadeIn">
                  {/* Name Fields */}
                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        First Name *
                      </label>
                      <input
                        type="text"
                        name="first_name"
                        value={formData.first_name}
                        onChange={handleChange}
                        onBlur={handleBlur}
                        className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-sage-500 focus:border-transparent transition-all ${
                          errors.first_name && touched.first_name ? 'border-red-500' : 'border-gray-300'
                        }`}
                        placeholder="John"
                      />
                      {errors.first_name && touched.first_name && (
                        <p className="mt-1 text-sm text-red-600">{errors.first_name}</p>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Last Name *
                      </label>
                      <input
                        type="text"
                        name="last_name"
                        value={formData.last_name}
                        onChange={handleChange}
                        onBlur={handleBlur}
                        className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-sage-500 focus:border-transparent transition-all ${
                          errors.last_name && touched.last_name ? 'border-red-500' : 'border-gray-300'
                        }`}
                        placeholder="Smith"
                      />
                      {errors.last_name && touched.last_name && (
                        <p className="mt-1 text-sm text-red-600">{errors.last_name}</p>
                      )}
                    </div>
                  </div>

                  {/* Email */}
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
                      className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-sage-500 focus:border-transparent transition-all ${
                        errors.email && touched.email ? 'border-red-500' : 'border-gray-300'
                      }`}
                      placeholder="john.smith@example.com"
                    />
                    {errors.email && touched.email && (
                      <p className="mt-1 text-sm text-red-600">{errors.email}</p>
                    )}
                  </div>

                  {/* Password */}
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
                      className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-sage-500 focus:border-transparent transition-all ${
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
                        <p className="text-xs text-gray-500">
                          Use 8+ characters with uppercase, lowercase, and numbers
                        </p>
                      </div>
                    )}
                    {errors.password && touched.password && (
                      <p className="mt-1 text-sm text-red-600">{errors.password}</p>
                    )}
                  </div>

                  {/* Confirm Password */}
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
                      className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-sage-500 focus:border-transparent transition-all ${
                        errors.confirmPassword && touched.confirmPassword ? 'border-red-500' : 'border-gray-300'
                      }`}
                      placeholder="••••••••"
                    />
                    {errors.confirmPassword && touched.confirmPassword && (
                      <p className="mt-1 text-sm text-red-600">{errors.confirmPassword}</p>
                    )}
                  </div>
                </div>
              )}

              {/* Step 2: Review & Terms */}
              {step === 2 && (
                <div className="space-y-6 animate-fadeIn">
                  <div className="bg-sage-50 rounded-lg p-6">
                    <h3 className="font-semibold text-charcoal-900 mb-4">Review Your Information</h3>
                    <div>
                      <p className="text-sm text-gray-500">Email</p>
                      <p className="font-medium text-charcoal-900">{formData.email}</p>
                    </div>
                    <p className="text-sm text-gray-500 italic mt-4">
                      You'll complete your personal details (name, phone, DOB, address) during profile setup after email verification
                    </p>
                  </div>

                  {/* Terms */}
                  <div className="flex items-start gap-3">
                    <input
                      type="checkbox"
                      id="terms"
                      className="mt-1 w-4 h-4 text-sage-600 border-gray-300 rounded focus:ring-sage-500"
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
                </div>
              )}

              {/* Error Message */}
              {authError && (
                <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
                  {authError}
                </div>
              )}

              {/* Navigation Buttons */}
              <div className="flex gap-4 mt-8">
                {step > 1 && (
                  <button
                    type="button"
                    onClick={prevStep}
                    className="flex-1 min-h-[44px] px-6 py-3 bg-white hover:bg-gray-50
                             text-gray-700 font-semibold rounded-lg border border-gray-300
                             transition-all active:scale-95"
                  >
                    Back
                  </button>
                )}

                {step < 3 ? (
                  <button
                    type="button"
                    onClick={nextStep}
                    className="flex-1 min-h-[44px] px-6 py-3 bg-sage-500 hover:bg-sage-600
                             text-white font-semibold rounded-lg shadow-lg
                             transition-all hover:scale-105 active:scale-95"
                  >
                    Continue
                  </button>
                ) : (
                  <button
                    type="submit"
                    disabled={loading}
                    className="flex-1 min-h-[44px] px-6 py-3 bg-gradient-to-r from-sage-500 to-sage-600
                             hover:from-sage-600 hover:to-sage-700 text-white font-semibold
                             rounded-lg shadow-lg transition-all hover:scale-105 active:scale-95
                             disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {loading ? 'Creating Account...' : 'Create Account'}
                  </button>
                )}
              </div>
            </form>
          </div>

          {/* Trust Badges */}
          <div className="mt-8 flex flex-wrap justify-center gap-6 text-sm text-gray-500">
            <div className="flex items-center gap-2">
              <svg className="w-5 h-5 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              <span>256-bit SSL Encrypted</span>
            </div>
            <div className="flex items-center gap-2">
              <svg className="w-5 h-5 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              <span>GDPR Compliant</span>
            </div>
            <div className="flex items-center gap-2">
              <svg className="w-5 h-5 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              <span>DBS Verified Workers</span>
            </div>
          </div>
        </div>
      </Container>
    </div>
  );
};

export default WorkerRegistration;
