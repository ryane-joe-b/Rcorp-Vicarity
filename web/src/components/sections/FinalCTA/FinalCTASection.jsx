import React from 'react';
import Container from '../../shared/Container';
import PrimaryButton from '../../ui/buttons/PrimaryButton';
import usePublicStats from '../../../hooks/usePublicStats';

/**
 * Final CTA Section - Last conversion opportunity
 */
const FinalCTASection = () => {
  const { stats } = usePublicStats();
  return (
    <section className="py-20 md:py-28 bg-gradient-to-br from-sage-400 via-ocean-500 to-terracotta-400 relative overflow-hidden">
      {/* Decorative elements */}
      <div className="absolute inset-0">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-white/10 rounded-full filter blur-3xl"></div>
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-white/10 rounded-full filter blur-3xl"></div>
      </div>

      <Container className="relative z-10">
        <div className="max-w-4xl mx-auto text-center">
          {/* Headline */}
          <h2 className="text-h2-mobile md:text-h2-desktop text-white mb-6">
            Ready to Transform Care Staffing?
          </h2>

          {/* Subheadline */}
          <p className="text-lg md:text-xl text-white/90 mb-8 md:mb-10 max-w-2xl mx-auto">
            Join hundreds of satisfied care professionals and providers across the UK
          </p>

          {/* CTAs */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-10">
            <PrimaryButton
              variant="terracotta"
              size="xl"
              className="bg-white text-terracotta-600 hover:bg-gray-50 shadow-2xl"
              onClick={() => console.log('Worker CTA clicked')}
              icon={
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                </svg>
              }
            >
              Start Earning More Today
            </PrimaryButton>

            <PrimaryButton
              variant="sage"
              size="xl"
              className="bg-white text-sage-600 hover:bg-gray-50 shadow-2xl"
              onClick={() => console.log('Care home CTA clicked')}
              icon={
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                </svg>
              }
            >
              Start Saving Today
            </PrimaryButton>
          </div>

          {/* Social Proof */}
          <div className="flex flex-wrap items-center justify-center gap-6 text-white/90 text-sm mb-6">
            <div className="flex items-center">
              <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
              </svg>
              <span>{stats.total_workers > 0 ? stats.display?.workers : stats.total_workers} care professionals trust us</span>
            </div>
            <div className="flex items-center">
              <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M2.166 4.999A11.954 11.954 0 0010 1.944 11.954 11.954 0 0017.834 5c.11.65.166 1.32.166 2.001 0 5.225-3.34 9.67-8 11.317C5.34 16.67 2 12.225 2 7c0-.682.057-1.35.166-2.001zm11.541 3.708a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              <span>100% DBS verified</span>
            </div>
          </div>

          {/* Risk Reversal */}
          <p className="text-white/80 text-sm">
            No upfront fees • Cancel anytime • 30-day money-back guarantee
          </p>
        </div>
      </Container>
    </section>
  );
};

export default FinalCTASection;
