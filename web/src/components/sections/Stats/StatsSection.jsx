import React from 'react';
import Container from '../../shared/Container';
import AnimatedCounter from './AnimatedCounter';
import usePublicStats from '../../../hooks/usePublicStats';

/**
 * Live Statistics Dashboard
 * Displays real-time stats from database with animated counters
 */
const StatsSection = () => {
  const { stats, loading, error } = usePublicStats();

  if (loading && !stats) {
    return (
      <section className="py-12 bg-white">
        <Container>
          <div className="text-center text-gray-500">Loading statistics...</div>
        </Container>
      </section>
    );
  }

  return (
    <section className="py-16 md:py-20 bg-gradient-to-b from-white to-sage-50">
      <Container>
        {/* Section Header */}
        <div className="text-center mb-12">
          <h2 className="text-h2-mobile md:text-h2-desktop text-charcoal mb-4">
            Trusted by Healthcare Professionals Across the UK
          </h2>
          <p className="text-body-mobile md:text-body-desktop text-gray-600 max-w-2xl mx-auto">
            Join thousands of care workers and care homes already using Vicarity
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-8">
          {/* Stat Card 1 - Care Workers */}
          <div className="bg-white rounded-2xl p-6 shadow-soft hover:shadow-healthcare transition-shadow duration-300 group">
            <div className="flex flex-col items-center text-center">
              <div className="w-12 h-12 md:w-16 md:h-16 rounded-full bg-sage-100 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300">
                <svg className="w-6 h-6 md:w-8 md:h-8 text-sage-600" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M9 6a3 3 0 11-6 0 3 3 0 016 0zM17 6a3 3 0 11-6 0 3 3 0 016 0zM12.93 17c.046-.327.07-.66.07-1a6.97 6.97 0 00-1.5-4.33A5 5 0 0119 16v1h-6.07zM6 11a5 5 0 015 5v1H1v-1a5 5 0 015-5z" />
                </svg>
              </div>
              <div className="text-3xl md:text-4xl font-bold text-sage-600 mb-2">
                {stats ? (
                  <AnimatedCounter end={stats.total_workers} suffix="+" />
                ) : (
                  '0+'
                )}
              </div>
              <div className="text-sm md:text-base text-gray-600 font-medium">
                Care Workers
              </div>
              <div className="text-xs text-gray-400 mt-1">
                Active on platform
              </div>
            </div>
          </div>

          {/* Stat Card 2 - Care Homes */}
          <div className="bg-white rounded-2xl p-6 shadow-soft hover:shadow-trust transition-shadow duration-300 group">
            <div className="flex flex-col items-center text-center">
              <div className="w-12 h-12 md:w-16 md:h-16 rounded-full bg-terracotta-100 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300">
                <svg className="w-6 h-6 md:w-8 md:h-8 text-terracotta-600" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M4 4a2 2 0 012-2h8a2 2 0 012 2v12a1 1 0 110 2h-3a1 1 0 01-1-1v-2a1 1 0 00-1-1H9a1 1 0 00-1 1v2a1 1 0 01-1 1H4a1 1 0 110-2V4zm3 1h2v2H7V5zm2 4H7v2h2V9zm2-4h2v2h-2V5zm2 4h-2v2h2V9z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="text-3xl md:text-4xl font-bold text-terracotta-600 mb-2">
                {stats ? (
                  <AnimatedCounter end={stats.total_care_homes} suffix="+" />
                ) : (
                  '0+'
                )}
              </div>
              <div className="text-sm md:text-base text-gray-600 font-medium">
                Care Homes
              </div>
              <div className="text-xs text-gray-400 mt-1">
                Registered providers
              </div>
            </div>
          </div>

          {/* Stat Card 3 - Completed Profiles */}
          <div className="bg-white rounded-2xl p-6 shadow-soft hover:shadow-healthcare transition-shadow duration-300 group">
            <div className="flex flex-col items-center text-center">
              <div className="w-12 h-12 md:w-16 md:h-16 rounded-full bg-ocean-100 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300">
                <svg className="w-6 h-6 md:w-8 md:h-8 text-ocean-600" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="text-3xl md:text-4xl font-bold text-ocean-600 mb-2">
                {stats ? (
                  <AnimatedCounter end={stats.completed_profiles} />
                ) : (
                  '0'
                )}
              </div>
              <div className="text-sm md:text-base text-gray-600 font-medium">
                Verified Profiles
              </div>
              <div className="text-xs text-gray-400 mt-1">
                100% complete
              </div>
            </div>
          </div>

          {/* Stat Card 4 - Verified Care Homes */}
          <div className="bg-white rounded-2xl p-6 shadow-soft hover:shadow-trust transition-shadow duration-300 group">
            <div className="flex flex-col items-center text-center">
              <div className="w-12 h-12 md:w-16 md:h-16 rounded-full bg-sage-100 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300">
                <svg className="w-6 h-6 md:w-8 md:h-8 text-sage-600" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M2.166 4.999A11.954 11.954 0 0010 1.944 11.954 11.954 0 0017.834 5c.11.65.166 1.32.166 2.001 0 5.225-3.34 9.67-8 11.317C5.34 16.67 2 12.225 2 7c0-.682.057-1.35.166-2.001zm11.541 3.708a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="text-3xl md:text-4xl font-bold text-sage-600 mb-2">
                {stats ? (
                  <AnimatedCounter end={stats.verified_care_homes} />
                ) : (
                  '0'
                )}
              </div>
              <div className="text-sm md:text-base text-gray-600 font-medium">
                CQC Verified
              </div>
              <div className="text-xs text-gray-400 mt-1">
                Care providers
              </div>
            </div>
          </div>
        </div>

        {/* Error state (shown at bottom if present) */}
        {error && (
          <div className="mt-6 text-center text-sm text-gray-400">
            <p>Live stats temporarily unavailable</p>
          </div>
        )}

        {/* Update timestamp */}
        {stats?.updated_at && (
          <div className="mt-8 text-center text-xs text-gray-400">
            Last updated: {new Date(stats.updated_at).toLocaleTimeString()}
          </div>
        )}
      </Container>
    </section>
  );
};

export default StatsSection;
