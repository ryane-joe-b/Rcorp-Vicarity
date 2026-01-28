import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import Container from '../../components/shared/Container';

/**
 * Email Verification Page
 *
 * Features:
 * - Auto-verify if token in URL
 * - Manual verification option
 * - Resend verification email
 * - Success/error states
 */

const EmailVerification = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { verifyEmail, user } = useAuth();

  const [status, setStatus] = useState('pending'); // pending, verifying, success, error
  const [message, setMessage] = useState('');
  const [resendLoading, setResendLoading] = useState(false);

  // Auto-verify if token in URL
  useEffect(() => {
    const token = searchParams.get('token');
    if (token) {
      handleVerification(token);
    }
  }, [searchParams]);

  // Handle verification
  const handleVerification = async (token) => {
    setStatus('verifying');
    setMessage('Verifying your email...');

    const result = await verifyEmail(token);

    if (result.success) {
      setStatus('success');
      setMessage('Email verified successfully! Redirecting...');

      // Redirect after 2 seconds
      setTimeout(() => {
        if (user?.role === 'worker') {
          navigate('/complete-profile');
        } else {
          navigate('/dashboard');
        }
      }, 2000);
    } else {
      setStatus('error');
      setMessage(result.error || 'Verification failed. Please try again.');
    }
  };

  // Resend verification email
  const handleResend = async () => {
    setResendLoading(true);
    try {
      // TODO: Implement resend endpoint
      await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate API call
      setMessage('Verification email sent! Check your inbox.');
      setStatus('pending');
    } catch (error) {
      setMessage('Failed to resend email. Please try again.');
    } finally {
      setResendLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-sage-50 via-white to-ocean-50">
      {/* Header with logo */}
      <div className="bg-white border-b border-gray-200 shadow-sm">
        <Container>
          <div className="py-4">
            <Link to="/" className="text-2xl font-bold text-charcoal-900">
              Vicarity
            </Link>
          </div>
        </Container>
      </div>

      <Container className="py-8 md:py-12">
        <div className="max-w-md mx-auto">
          {/* Card */}
          <div className="bg-white rounded-2xl shadow-healthcare border border-gray-100 p-6 md:p-8">
            {/* Icon */}
            <div className="text-center mb-6">
              {status === 'pending' && (
                <div className="inline-flex items-center justify-center w-20 h-20 bg-ocean-100 rounded-full mb-4">
                  <svg className="w-10 h-10 text-ocean-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                </div>
              )}
              {status === 'verifying' && (
                <div className="inline-flex items-center justify-center w-20 h-20 bg-ocean-100 rounded-full mb-4">
                  <svg className="w-10 h-10 text-ocean-600 animate-spin" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                </div>
              )}
              {status === 'success' && (
                <div className="inline-flex items-center justify-center w-20 h-20 bg-green-100 rounded-full mb-4 animate-scaleIn">
                  <svg className="w-10 h-10 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
              )}
              {status === 'error' && (
                <div className="inline-flex items-center justify-center w-20 h-20 bg-red-100 rounded-full mb-4 animate-scaleIn">
                  <svg className="w-10 h-10 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
              )}

              {/* Title */}
              <h1 className="text-3xl font-bold text-charcoal-900 mb-2">
                {status === 'pending' && 'Check Your Email'}
                {status === 'verifying' && 'Verifying...'}
                {status === 'success' && 'Email Verified!'}
                {status === 'error' && 'Verification Failed'}
              </h1>

              {/* Message */}
              <p className="text-gray-600">
                {status === 'pending' && (
                  <>
                    We've sent a verification email to{' '}
                    <strong className="text-charcoal-900">{user?.email}</strong>
                  </>
                )}
                {status === 'verifying' && 'Please wait while we verify your email...'}
                {status === 'success' && 'You can now access all features'}
                {status === 'error' && message}
              </p>
            </div>

            {/* Content */}
            {status === 'pending' && (
              <div className="space-y-6">
                <div className="bg-ocean-50 rounded-lg p-6 border border-ocean-100">
                  <h3 className="font-semibold text-charcoal-900 mb-3">Next steps:</h3>
                  <ol className="space-y-2 text-sm text-gray-700">
                    <li className="flex items-start gap-2">
                      <span className="inline-flex items-center justify-center w-6 h-6 bg-ocean-500 text-white rounded-full text-xs font-bold flex-shrink-0">
                        1
                      </span>
                      <span>Check your inbox for an email from Vicarity</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="inline-flex items-center justify-center w-6 h-6 bg-ocean-500 text-white rounded-full text-xs font-bold flex-shrink-0">
                        2
                      </span>
                      <span>Click the verification link in the email</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="inline-flex items-center justify-center w-6 h-6 bg-ocean-500 text-white rounded-full text-xs font-bold flex-shrink-0">
                        3
                      </span>
                      <span>Complete your profile and start working</span>
                    </li>
                  </ol>
                </div>

                <div className="text-center">
                  <p className="text-sm text-gray-600 mb-4">
                    Didn't receive the email? Check your spam folder or
                  </p>
                  <button
                    onClick={handleResend}
                    disabled={resendLoading}
                    className="min-h-[44px] px-6 py-3 bg-ocean-500 hover:bg-ocean-600
                             text-white font-semibold rounded-lg shadow-lg
                             transition-all hover:scale-105 active:scale-95
                             disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {resendLoading ? 'Sending...' : 'Resend Verification Email'}
                  </button>
                </div>
              </div>
            )}

            {status === 'success' && (
              <div className="text-center space-y-4">
                <div className="inline-flex items-center gap-2 bg-green-50 text-green-700 px-4 py-2 rounded-lg border border-green-200">
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  <span className="font-medium">Redirecting you now...</span>
                </div>
              </div>
            )}

            {status === 'error' && (
              <div className="space-y-4">
                <button
                  onClick={handleResend}
                  disabled={resendLoading}
                  className="w-full min-h-[44px] px-6 py-3 bg-ocean-500 hover:bg-ocean-600
                           text-white font-semibold rounded-lg shadow-lg
                           transition-all hover:scale-105 active:scale-95
                           disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {resendLoading ? 'Sending...' : 'Resend Verification Email'}
                </button>

                <Link
                  to="/login"
                  className="block text-center text-ocean-600 hover:text-ocean-700 font-semibold"
                >
                  Back to Login
                </Link>
              </div>
            )}
          </div>

          {/* Help Text */}
          <div className="mt-8 text-center text-sm text-gray-600">
            Need help?{' '}
            <a
              href="mailto:hello@vicarity.co.uk"
              className="text-ocean-600 hover:text-ocean-700 font-semibold"
            >
              Contact Support
            </a>
          </div>
        </div>
      </Container>
    </div>
  );
};

export default EmailVerification;
