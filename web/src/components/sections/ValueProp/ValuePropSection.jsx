import React from 'react';
import Container from '../../shared/Container';

/**
 * Value Proposition Matrix
 * Dual-column layout showing benefits for both user types
 */
const ValuePropSection = () => {
  const workerBenefits = [
    {
      icon: (
        <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 20 20">
          <path d="M8.433 7.418c.155-.103.346-.196.567-.267v1.698a2.305 2.305 0 01-.567-.267C8.07 8.34 8 8.114 8 8c0-.114.07-.34.433-.582zM11 12.849v-1.698c.22.071.412.164.567.267.364.243.433.468.433.582 0 .114-.07.34-.433.582a2.305 2.305 0 01-.567.267z" />
          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-13a1 1 0 10-2 0v.092a4.535 4.535 0 00-1.676.662C6.602 6.234 6 7.009 6 8c0 .99.602 1.765 1.324 2.246.48.32 1.054.545 1.676.662v1.941c-.391-.127-.68-.317-.843-.504a1 1 0 10-1.51 1.31c.562.649 1.413 1.076 2.353 1.253V15a1 1 0 102 0v-.092a4.535 4.535 0 001.676-.662C13.398 13.766 14 12.991 14 12c0-.99-.602-1.765-1.324-2.246A4.535 4.535 0 0011 9.092V7.151c.391.127.68.317.843.504a1 1 0 101.511-1.31c-.563-.649-1.413-1.076-2.354-1.253V5z" clipRule="evenodd" />
        </svg>
      ),
      title: 'Earn What You\'re Worth',
      description: '20-40% above agency rates with transparent pricing',
      highlight: 'Average £3,200 more per year',
    },
    {
      icon: (
        <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 20 20">
          <path d="M10.394 2.08a1 1 0 00-.788 0l-7 3a1 1 0 000 1.84L5.25 8.051a.999.999 0 01.356-.257l4-1.714a1 1 0 11.788 1.838L7.667 9.088l1.94.831a1 1 0 00.787 0l7-3a1 1 0 000-1.838l-7-3zM3.31 9.397L5 10.12v4.102a8.969 8.969 0 00-1.05-.174 1 1 0 01-.89-.89 11.115 11.115 0 01.25-3.762zM9.3 16.573A9.026 9.026 0 007 14.935v-3.957l1.818.78a3 3 0 002.364 0l5.508-2.361a11.026 11.026 0 01.25 3.762 1 1 0 01-.89.89 8.968 8.968 0 00-5.35 2.524 1 1 0 01-1.4 0zM6 18a1 1 0 001-1v-2.065a8.935 8.935 0 00-2-.712V17a1 1 0 001 1z" />
        </svg>
      ),
      title: 'Build Your Career',
      description: 'Track qualifications, access training, grow professionally',
      highlight: 'Free CPD tracking included',
    },
    {
      icon: (
        <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 20 20">
          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
        </svg>
      ),
      title: 'Work On Your Terms',
      description: 'Choose shifts, set availability, control your schedule',
      highlight: 'True flexibility, no lock-ins',
    },
    {
      icon: (
        <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 20 20">
          <path fillRule="evenodd" d="M4 4a2 2 0 00-2 2v4a2 2 0 002 2V6h10a2 2 0 00-2-2H4zm2 6a2 2 0 012-2h8a2 2 0 012 2v4a2 2 0 01-2 2H8a2 2 0 01-2-2v-4zm6 4a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
        </svg>
      ),
      title: 'Get Paid Faster',
      description: 'Same-day payments available, no hidden fees',
      highlight: 'Paid within 24 hours',
    },
  ];

  const careHomeBenefits = [
    {
      icon: (
        <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 20 20">
          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
        </svg>
      ),
      title: 'Fill Shifts, Not Headaches',
      description: 'Average 2.3 hour fill time with instant notifications',
      highlight: '95% of shifts filled same-day',
    },
    {
      icon: (
        <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 20 20">
          <path d="M8.433 7.418c.155-.103.346-.196.567-.267v1.698a2.305 2.305 0 01-.567-.267C8.07 8.34 8 8.114 8 8c0-.114.07-.34.433-.582zM11 12.849v-1.698c.22.071.412.164.567.267.364.243.433.468.433.582 0 .114-.07.34-.433.582a2.305 2.305 0 01-.567.267z" />
          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-13a1 1 0 10-2 0v.092a4.535 4.535 0 00-1.676.662C6.602 6.234 6 7.009 6 8c0 .99.602 1.765 1.324 2.246.48.32 1.054.545 1.676.662v1.941c-.391-.127-.68-.317-.843-.504a1 1 0 10-1.51 1.31c.562.649 1.413 1.076 2.353 1.253V15a1 1 0 102 0v-.092a4.535 4.535 0 001.676-.662C13.398 13.766 14 12.991 14 12c0-.99-.602-1.765-1.324-2.246A4.535 4.535 0 0011 9.092V7.151c.391.127.68.317.843.504a1 1 0 101.511-1.31c-.563-.649-1.413-1.076-2.354-1.253V5z" clipRule="evenodd" />
        </svg>
      ),
      title: 'Save 30% vs Agencies',
      description: 'No hidden fees, transparent pricing, fair rates',
      highlight: 'Average £12,000 saved annually',
    },
    {
      icon: (
        <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 20 20">
          <path fillRule="evenodd" d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
        </svg>
      ),
      title: 'CQC Compliance Built-In',
      description: 'Automated reporting, audit trails, inspection-ready',
      highlight: 'KLOE tracking included',
    },
    {
      icon: (
        <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 20 20">
          <path d="M9 6a3 3 0 11-6 0 3 3 0 016 0zM17 6a3 3 0 11-6 0 3 3 0 016 0zM12.93 17c.046-.327.07-.66.07-1a6.97 6.97 0 00-1.5-4.33A5 5 0 0119 16v1h-6.07zM6 11a5 5 0 015 5v1H1v-1a5 5 0 015-5z" />
        </svg>
      ),
      title: 'Verified, Qualified Staff',
      description: 'DBS checked, skills verified, reference checked',
      highlight: 'Multi-step vetting process',
    },
  ];

  return (
    <section className="py-16 md:py-24 bg-white">
      <Container>
        {/* Section Header */}
        <div className="text-center mb-16">
          <h2 className="text-h2-mobile md:text-h2-desktop text-charcoal mb-4">
            Why Choose Vicarity?
          </h2>
          <p className="text-body-mobile md:text-body-desktop text-gray-600 max-w-2xl mx-auto">
            Whether you're a care professional or a care provider, we've built the platform you deserve
          </p>
        </div>

        {/* Two-Column Layout */}
        <div className="grid lg:grid-cols-2 gap-8 lg:gap-12">
          {/* Column A: For Care Workers */}
          <div className="space-y-6">
            <div className="inline-flex items-center px-4 py-2 bg-sage-100 rounded-full mb-4">
              <span className="text-sage-700 font-semibold text-sm">For Care Workers</span>
            </div>

            {workerBenefits.map((benefit, index) => (
              <div
                key={index}
                className="bg-gradient-to-br from-sage-50 to-white p-6 rounded-2xl border border-sage-100 hover:border-sage-300 hover:shadow-healthcare transition-all duration-300 group"
              >
                <div className="flex items-start space-x-4">
                  <div className="flex-shrink-0 w-12 h-12 bg-sage-100 rounded-xl flex items-center justify-center text-sage-600 group-hover:scale-110 transition-transform duration-300">
                    {benefit.icon}
                  </div>
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-charcoal mb-2">
                      {benefit.title}
                    </h3>
                    <p className="text-gray-600 text-sm mb-2">
                      {benefit.description}
                    </p>
                    <p className="text-sage-600 font-medium text-sm">
                      {benefit.highlight}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Column B: For Care Homes */}
          <div className="space-y-6">
            <div className="inline-flex items-center px-4 py-2 bg-terracotta-100 rounded-full mb-4">
              <span className="text-terracotta-700 font-semibold text-sm">For Care Homes</span>
            </div>

            {careHomeBenefits.map((benefit, index) => (
              <div
                key={index}
                className="bg-gradient-to-br from-terracotta-50 to-white p-6 rounded-2xl border border-terracotta-100 hover:border-terracotta-300 hover:shadow-trust transition-all duration-300 group"
              >
                <div className="flex items-start space-x-4">
                  <div className="flex-shrink-0 w-12 h-12 bg-terracotta-100 rounded-xl flex items-center justify-center text-terracotta-600 group-hover:scale-110 transition-transform duration-300">
                    {benefit.icon}
                  </div>
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-charcoal mb-2">
                      {benefit.title}
                    </h3>
                    <p className="text-gray-600 text-sm mb-2">
                      {benefit.description}
                    </p>
                    <p className="text-terracotta-600 font-medium text-sm">
                      {benefit.highlight}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </Container>
    </section>
  );
};

export default ValuePropSection;
