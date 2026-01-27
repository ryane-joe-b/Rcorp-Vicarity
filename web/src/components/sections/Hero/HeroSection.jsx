import React from 'react';
import Container from '../../shared/Container';
import PrimaryButton from '../../ui/buttons/PrimaryButton';
import SecondaryButton from '../../ui/buttons/SecondaryButton';
import usePublicStats from '../../../hooks/usePublicStats';

/**
 * Hero Section - The Conversion Engine
 * Mobile-first, dual-path CTAs, instant trust establishment
 */
const HeroSection = () => {
  const { stats } = usePublicStats();
  return (
    <section className="relative bg-gradient-to-br from-background via-white to-sage-50 pt-20 pb-16 md:pt-28 md:pb-24 overflow-hidden">
      {/* Decorative background elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 right-0 w-96 h-96 bg-sage-200 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse"></div>
        <div className="absolute bottom-20 left-0 w-96 h-96 bg-terracotta-200 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse" style={{ animationDelay: '1s' }}></div>
      </div>

      <Container className="relative z-10">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Left Column - Content */}
          <div className="text-center lg:text-left animate-slide-up">
            {/* Trust badge above headline (mobile) */}
            <div className="inline-flex items-center px-4 py-2 bg-ocean-50 border border-ocean-200 rounded-full text-ocean-700 text-sm font-medium mb-6 lg:mb-8">
              <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M2.166 4.999A11.954 11.954 0 0010 1.944 11.954 11.954 0 0017.834 5c.11.65.166 1.32.166 2.001 0 5.225-3.34 9.67-8 11.317C5.34 16.67 2 12.225 2 7c0-.682.057-1.35.166-2.001zm11.541 3.708a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              <span>Trusted by {stats.total_workers > 0 ? stats.display?.workers : stats.total_workers} care professionals</span>
            </div>

            {/* Main Headline - Conversion-optimized */}
            <h1 className="text-h1-mobile md:text-h1-desktop text-charcoal mb-4 md:mb-6 leading-tight">
              The Smarter Way to{' '}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-sage-400 to-terracotta-400">
                Work in Care
              </span>
            </h1>

            {/* Subheadline - Value proposition */}
            <p className="text-body-mobile md:text-body-desktop text-gray-600 mb-8 md:mb-10 max-w-2xl mx-auto lg:mx-0">
              For care professionals who want <strong className="text-sage-600">flexibility</strong>, and care providers who need <strong className="text-terracotta-600">reliability</strong>
            </p>

            {/* Dual CTAs - Mobile stacked, Desktop side-by-side */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start mb-8">
              <PrimaryButton
                variant="terracotta"
                size="lg"
                href="/register?role=worker"
                icon={
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                  </svg>
                }
                iconPosition="right"
                ariaLabel="Find care work - Register as a care worker"
              >
                Find Care Work
              </PrimaryButton>

              <SecondaryButton
                variant="sage"
                size="lg"
                href="/register?role=care_home"
                icon={
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                  </svg>
                }
                iconPosition="right"
                ariaLabel="Hire care staff - Register your care home"
              >
                Hire Care Staff
              </SecondaryButton>
            </div>

            {/* Trust Indicators Strip */}
            <div className="flex flex-wrap items-center justify-center lg:justify-start gap-6 text-sm text-gray-500">
              <div className="flex items-center">
                <svg className="w-5 h-5 mr-2 text-sage-500" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                <span className="font-medium">DBS Verified</span>
              </div>
              <div className="flex items-center">
                <svg className="w-5 h-5 mr-2 text-sage-500" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                <span className="font-medium">CQC Compliant</span>
              </div>
              <div className="flex items-center">
                <svg className="w-5 h-5 mr-2 text-sage-500" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M2.166 4.999A11.954 11.954 0 0010 1.944 11.954 11.954 0 0017.834 5c.11.65.166 1.32.166 2.001 0 5.225-3.34 9.67-8 11.317C5.34 16.67 2 12.225 2 7c0-.682.057-1.35.166-2.001zm11.541 3.708a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                <span className="font-medium">Secure Payments</span>
              </div>
            </div>
          </div>

          {/* Right Column - Visual/Illustration */}
          <div className="relative hidden lg:block animate-fade-in" style={{ animationDelay: '0.3s' }}>
            {/* Placeholder for hero illustration */}
            <div className="relative aspect-square bg-gradient-to-br from-sage-100 via-white to-terracotta-100 rounded-3xl shadow-healthcare p-8">
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="text-center">
                  {/* Placeholder - Replace with actual illustration */}
                  <div className="w-full h-full flex flex-col items-center justify-center space-y-4">
                    <div className="w-32 h-32 bg-sage-200 rounded-full flex items-center justify-center">
                      <svg className="w-16 h-16 text-sage-600" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M9 6a3 3 0 11-6 0 3 3 0 016 0zM17 6a3 3 0 11-6 0 3 3 0 016 0zM12.93 17c.046-.327.07-.66.07-1a6.97 6.97 0 00-1.5-4.33A5 5 0 0119 16v1h-6.07zM6 11a5 5 0 015 5v1H1v-1a5 5 0 015-5z" />
                      </svg>
                    </div>
                    <p className="text-gray-400 text-sm">Hero Illustration Area</p>
                    <p className="text-xs text-gray-400 max-w-xs">Add your custom healthcare illustration showing both care workers and care home managers in a split-screen design</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Floating stats cards - Social proof */}
            <div className="absolute -bottom-6 -left-6 bg-white rounded-xl shadow-trust p-4 animate-slide-up" style={{ animationDelay: '0.6s' }}>
              <div className="flex items-center space-x-3">
                <div className="flex -space-x-2">
                  <div className="w-8 h-8 rounded-full bg-sage-300 border-2 border-white"></div>
                  <div className="w-8 h-8 rounded-full bg-terracotta-300 border-2 border-white"></div>
                  <div className="w-8 h-8 rounded-full bg-ocean-300 border-2 border-white"></div>
                </div>
                <div>
                  <p className="text-sm font-semibold text-charcoal">{stats.total_workers > 0 ? stats.display?.workers : stats.total_workers} Workers</p>
                  <p className="text-xs text-gray-500">Active this week</p>
                </div>
              </div>
            </div>

            <div className="absolute -top-6 -right-6 bg-white rounded-xl shadow-trust p-4 animate-scale-in" style={{ animationDelay: '0.9s' }}>
              <div className="text-center">
                <p className="text-2xl font-bold text-terracotta-500">2.3hrs</p>
                <p className="text-xs text-gray-500">Avg. Fill Time</p>
              </div>
            </div>
          </div>
        </div>
      </Container>
    </section>
  );
};

export default HeroSection;
