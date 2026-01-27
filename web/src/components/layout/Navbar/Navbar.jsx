import React, { useState, useEffect } from 'react';
import Container from '../../shared/Container';
import PrimaryButton from '../../ui/buttons/PrimaryButton';
import SecondaryButton from '../../ui/buttons/SecondaryButton';

/**
 * Sticky navigation bar with mobile menu
 * Corporate professionalism with clear CTAs
 */
const Navbar = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);

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

          {/* Desktop CTAs */}
          <div className="hidden lg:flex items-center space-x-4">
            <SecondaryButton
              variant="ocean"
              size="sm"
              onClick={() => console.log('Login clicked')}
            >
              Login
            </SecondaryButton>
            <PrimaryButton
              variant="terracotta"
              size="sm"
              onClick={() => console.log('Get Started clicked')}
            >
              Get Started
            </PrimaryButton>
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

              {/* Mobile CTAs */}
              <div className="space-y-3">
                <SecondaryButton
                  variant="ocean"
                  fullWidth
                  onClick={() => {
                    console.log('Login clicked');
                    setIsMenuOpen(false);
                  }}
                >
                  Login
                </SecondaryButton>
                <PrimaryButton
                  variant="terracotta"
                  fullWidth
                  onClick={() => {
                    console.log('Get Started clicked');
                    setIsMenuOpen(false);
                  }}
                >
                  Get Started
                </PrimaryButton>
              </div>

              {/* Mobile Footer Info */}
              <div className="pt-6 border-t border-gray-200">
                <div className="text-sm text-gray-600 space-y-2">
                  <p className="font-medium">Need help?</p>
                  <a
                    href="mailto:hello@vicarity.com"
                    className="text-ocean-600 hover:underline block"
                  >
                    hello@vicarity.com
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
