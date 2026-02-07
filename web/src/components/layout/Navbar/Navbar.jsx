import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../../contexts/AuthContext';
import Container from '../../shared/Container';
import PrimaryButton from '../../ui/buttons/PrimaryButton';
import SecondaryButton from '../../ui/buttons/SecondaryButton';

/**
 * Sticky navigation bar with smart auth-aware CTAs
 *
 * Shows different buttons based on user state:
 * - Not logged in: Login + Get Started
 * - Logged in, incomplete profile: Continue Onboarding
 * - Logged in, complete profile: Go to Dashboard (with user name)
 */
const Navbar = () => {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);

  // Handle scroll for sticky nav styling
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Prevent body scroll when mobile menu is open
  useEffect(() => {
    if (isMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
  }, [isMenuOpen]);

  // Close user menu when clicking outside
  useEffect(() => {
    const handleClickOutside = () => setShowUserMenu(false);
    if (showUserMenu) {
      document.addEventListener('click', handleClickOutside);
    }
    return () => document.removeEventListener('click', handleClickOutside);
  }, [showUserMenu]);

  const navigation = [
    { name: 'For Care Workers', href: '#workers' },
    { name: 'For Care Homes', href: '#care-homes' },
    { name: 'How It Works', href: '#how-it-works' },
    { name: 'Pricing', href: '#pricing' },
  ];

  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        isScrolled
          ? 'bg-white/95 backdrop-blur-md shadow-soft'
          : 'bg-transparent'
      }`}
    >
      <Container>
        <div className="flex items-center justify-between h-16 md:h-20">
          {/* Logo */}
          <div className="flex-shrink-0">
            <a
              href="/"
              className="flex items-center space-x-2 group"
              aria-label="Vicarity - Home"
            >
              {/* Logo placeholder - replace with actual SVG */}
              <div className="w-10 h-10 bg-gradient-to-br from-sage-400 to-terracotta-400 rounded-lg flex items-center justify-center group-hover:scale-105 transition-transform">
                <span className="text-white font-bold text-xl">V</span>
              </div>
              <span className="text-xl font-bold text-charcoal">
                Vicarity
              </span>
            </a>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden lg:flex items-center space-x-8">
            {navigation.map((item) => (
              <a
                key={item.name}
                href={item.href}
                className="text-gray-700 hover:text-sage-600 font-medium transition-colors duration-200"
              >
                {item.name}
              </a>
            ))}
          </div>

          {/* Desktop CTAs - Auth-Aware */}
          <div className="hidden lg:flex items-center space-x-4">
            {user ? (
              // User is logged in
              <>
                {user.profile_completion_percentage >= 100 || user.profile_complete ? (
                  // Profile complete - Show dashboard link with user menu
                  <div className="relative">
                    <button
                      onClick={() => setShowUserMenu(!showUserMenu)}
                      className="flex items-center space-x-3 px-4 py-2 rounded-lg bg-gradient-to-r from-ocean-50 to-sage-50 hover:from-ocean-100 hover:to-sage-100 transition-all duration-200 border border-ocean-200"
                    >
                      <div className="flex items-center space-x-2">
                        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-ocean-500 to-sage-500 flex items-center justify-center text-white font-semibold text-sm">
                          {(user.worker_profile?.first_name?.[0] || user.email[0]).toUpperCase()}
                        </div>
                        <span className="font-medium text-gray-700">
                          {user.worker_profile?.first_name || 'Dashboard'}
                        </span>
                      </div>
                      <svg className={`w-4 h-4 text-gray-500 transition-transform ${showUserMenu ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                      </svg>
                    </button>

                    {/* Dropdown menu */}
                    {showUserMenu && (
                      <>
                        <div className="fixed inset-0 z-10" onClick={() => setShowUserMenu(false)} />
                        <div className="absolute right-0 mt-2 w-56 bg-white rounded-lg shadow-xl border border-gray-200 py-2 z-20">
                          <button
                            onClick={() => {
                              navigate(user.role === 'worker' ? '/dashboard/worker' : '/dashboard/care-home');
                              setShowUserMenu(false);
                            }}
                            className="w-full px-4 py-2 text-left text-gray-700 hover:bg-sage-50 flex items-center space-x-2"
                          >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                            </svg>
                            <span>Go to Dashboard</span>
                          </button>
                          <div className="border-t border-gray-100 my-1"></div>
                          <button
                            onClick={async () => {
                              await logout();
                              setShowUserMenu(false);
                              navigate('/');
                            }}
                            className="w-full px-4 py-2 text-left text-red-600 hover:bg-red-50 flex items-center space-x-2"
                          >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                            </svg>
                            <span>Logout</span>
                          </button>
                        </div>
                      </>
                    )}
                  </div>
                ) : (
                  // Profile incomplete - Show Continue Onboarding button
                  <PrimaryButton
                    variant="ocean"
                    size="sm"
                    onClick={() => navigate('/onboarding/worker')}
                  >
                    Continue Onboarding
                    <span className="ml-2 text-xs bg-white/20 px-2 py-0.5 rounded-full">
                      {user.profile_completion_percentage}%
                    </span>
                  </PrimaryButton>
                )}
              </>
            ) : (
              // Not logged in - Show Login + Get Started
              <>
                <SecondaryButton
                  variant="ocean"
                  size="sm"
                  onClick={() => navigate('/auth/login')}
                >
                  Login
                </SecondaryButton>
                <PrimaryButton
                  variant="terracotta"
                  size="sm"
                  onClick={() => navigate('/auth/register')}
                >
                  Get Started
                </PrimaryButton>
              </>
            )}
          </div>

          {/* Mobile menu button */}
          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="lg:hidden p-2 rounded-lg text-gray-700 hover:bg-sage-50 focus:outline-none focus:ring-2 focus:ring-sage-400 transition-colors"
            aria-label="Toggle menu"
            aria-expanded={isMenuOpen}
          >
            {isMenuOpen ? (
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            ) : (
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            )}
          </button>
        </div>
      </Container>

      {/* Mobile Menu */}
      {isMenuOpen && (
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-charcoal/50 backdrop-blur-sm z-40 lg:hidden"
            onClick={() => setIsMenuOpen(false)}
            aria-hidden="true"
          />

          {/* Menu Panel */}
          <div className="fixed top-16 md:top-20 right-0 bottom-0 w-full max-w-sm bg-white shadow-2xl z-50 lg:hidden overflow-y-auto animate-slide-down">
            <div className="p-6 space-y-6">
              {/* Navigation Links */}
              <div className="space-y-4">
                {navigation.map((item) => (
                  <a
                    key={item.name}
                    href={item.href}
                    className="block py-3 px-4 text-gray-700 hover:text-sage-600 hover:bg-sage-50 rounded-lg font-medium transition-all duration-200"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    {item.name}
                  </a>
                ))}
              </div>

              {/* Divider */}
              <div className="border-t border-gray-200"></div>

              {/* Mobile CTAs - Auth-Aware */}
              <div className="space-y-3">
                {user ? (
                  // User is logged in
                  <>
                    {/* User info */}
                    <div className="px-4 py-3 bg-gradient-to-r from-ocean-50 to-sage-50 rounded-lg border border-ocean-200">
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-ocean-500 to-sage-500 flex items-center justify-center text-white font-semibold">
                          {(user.worker_profile?.first_name?.[0] || user.email[0]).toUpperCase()}
                        </div>
                        <div className="flex-1">
                          <p className="font-semibold text-gray-900">
                            {user.worker_profile?.first_name || 'Welcome'}
                          </p>
                          <p className="text-xs text-gray-600">{user.email}</p>
                        </div>
                      </div>
                    </div>

                    {user.profile_completion_percentage >= 100 || user.profile_complete ? (
                      // Profile complete - Dashboard button
                      <PrimaryButton
                        variant="ocean"
                        fullWidth
                        onClick={() => {
                          navigate(user.role === 'worker' ? '/dashboard/worker' : '/dashboard/care-home');
                          setIsMenuOpen(false);
                        }}
                      >
                        Go to Dashboard
                      </PrimaryButton>
                    ) : (
                      // Profile incomplete - Continue Onboarding
                      <PrimaryButton
                        variant="ocean"
                        fullWidth
                        onClick={() => {
                          navigate('/onboarding/worker');
                          setIsMenuOpen(false);
                        }}
                      >
                        Continue Onboarding ({user.profile_completion_percentage}%)
                      </PrimaryButton>
                    )}

                    {/* Logout button */}
                    <SecondaryButton
                      variant="ocean"
                      fullWidth
                      onClick={async () => {
                        await logout();
                        setIsMenuOpen(false);
                        navigate('/');
                      }}
                    >
                      Logout
                    </SecondaryButton>
                  </>
                ) : (
                  // Not logged in
                  <>
                    <SecondaryButton
                      variant="ocean"
                      fullWidth
                      onClick={() => {
                        navigate('/auth/login');
                        setIsMenuOpen(false);
                      }}
                    >
                      Login
                    </SecondaryButton>
                    <PrimaryButton
                      variant="terracotta"
                      fullWidth
                      onClick={() => {
                        navigate('/auth/register');
                        setIsMenuOpen(false);
                      }}
                    >
                      Get Started
                    </PrimaryButton>
                  </>
                )}
              </div>

              {/* Mobile Footer Info */}
              <div className="pt-6 border-t border-gray-200">
                <div className="text-sm text-gray-600 space-y-2">
                  <p className="font-medium">Need help?</p>
                  <a
                    href="mailto:hello@vicarity.co.uk"
                    className="text-ocean-600 hover:underline block"
                  >
                    hello@vicarity.co.uk
                  </a>
                  <a
                    href="tel:+447887141400"
                    className="text-ocean-600 hover:underline block"
                  >
                    +44 7887 141400
                  </a>
                </div>
              </div>
            </div>
          </div>
        </>
      )}
    </nav>
  );
};

export default Navbar;
