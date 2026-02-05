import React from 'react';
import { Link } from 'react-router-dom';

/**
 * Error Boundary for Onboarding Flow
 *
 * Catches errors in onboarding components and provides a graceful fallback UI.
 * Allows users to retry or contact support.
 */
class OnboardingErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    console.error('Onboarding Error:', error, errorInfo);
    this.setState({
      error: error,
      errorInfo: errorInfo,
    });
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null, errorInfo: null });
    window.location.reload();
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-gradient-to-br from-sage-50 via-white to-warm-50 flex items-center justify-center p-4">
          <div className="max-w-lg w-full">
            <div className="bg-white rounded-2xl shadow-healthcare border border-gray-100 p-8 text-center">
              {/* Error Icon */}
              <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
              </div>

              {/* Error Message */}
              <h2 className="text-2xl font-bold text-charcoal-900 mb-3">
                Something Went Wrong
              </h2>
              <p className="text-gray-600 mb-6">
                We encountered an unexpected error while loading your profile. Don't worry, your progress has been saved.
              </p>

              {/* Actions */}
              <div className="space-y-3">
                <button
                  onClick={this.handleReset}
                  className="w-full px-6 py-3 bg-gradient-to-r from-sage-500 to-sage-600
                           hover:from-sage-600 hover:to-sage-700 text-white font-semibold
                           rounded-lg shadow-lg transition-all hover:scale-105 active:scale-95"
                >
                  Try Again
                </button>

                <Link
                  to="/"
                  className="block w-full px-6 py-3 bg-white hover:bg-gray-50
                           text-gray-700 font-semibold rounded-lg border border-gray-300
                           transition-all active:scale-95"
                >
                  Return to Home
                </Link>
              </div>

              {/* Support Info */}
              <div className="mt-6 pt-6 border-t border-gray-200">
                <p className="text-sm text-gray-500">
                  Need help?{' '}
                  <a href="mailto:hello@vicarity.co.uk" className="text-ocean-600 hover:text-ocean-700 font-medium">
                    Contact Support
                  </a>
                </p>
              </div>

              {/* Error Details (Development Only) */}
              {process.env.NODE_ENV === 'development' && this.state.error && (
                <details className="mt-6 text-left">
                  <summary className="text-sm text-gray-600 cursor-pointer hover:text-gray-900">
                    Error Details (Dev Only)
                  </summary>
                  <div className="mt-2 p-4 bg-red-50 rounded-lg text-xs font-mono text-red-900 overflow-auto max-h-40">
                    <div className="font-bold mb-2">{this.state.error.toString()}</div>
                    <div className="text-red-700 whitespace-pre-wrap">
                      {this.state.errorInfo?.componentStack}
                    </div>
                  </div>
                </details>
              )}
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default OnboardingErrorBoundary;
