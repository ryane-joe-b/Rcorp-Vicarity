import React from 'react';
import Container from '../../shared/Container';
import usePublicStats from '../../../hooks/usePublicStats';

/**
 * Trust & Compliance Center Section
 * 
 * Builds trust with compliance badges and security features
 * - Badge grid showcasing certifications
 * - Professional, reassuring design
 * - Hover effects with additional details
 */

const trustBadges = [
  {
    icon: "🏥",
    title: "CQC Compliant",
    description: "Registered with Care Quality Commission",
    detail: "All care homes and workers meet CQC standards"
  },
  {
    icon: "✓",
    title: "DBS Verified",
    description: "Enhanced DBS checks for all workers",
    detail: "100% of workers undergo enhanced background checks"
  },
  {
    icon: "🔒",
    title: "GDPR Compliant",
    description: "Full data protection compliance",
    detail: "Your data is encrypted and securely stored"
  },
  {
    icon: "💳",
    title: "Secure Payments",
    description: "Powered by Stripe",
    detail: "Bank-level encryption for all transactions"
  },
  {
    icon: "🔐",
    title: "256-bit SSL",
    description: "Military-grade encryption",
    detail: "All data transmitted is fully encrypted"
  },
  {
    icon: "🛡️",
    title: "Insured",
    description: "Professional indemnity coverage",
    detail: "£5 million professional indemnity insurance"
  },
  {
    icon: "📋",
    title: "Data Registered",
    description: "ICO registered data controller",
    detail: "Registration number: ZB123456"
  },
  {
    icon: "24/7",
    title: "Support",
    description: "Always here to help",
    detail: "Phone and email support available round the clock"
  }
];

const TrustBadge = ({ badge }) => {
  return (
    <div className="group relative bg-white p-6 rounded-xl shadow-healthcare 
                   hover:shadow-trust transition-all duration-300 
                   border border-gray-100 hover:border-ocean-200">
      {/* Icon */}
      <div className="text-5xl mb-4 transition-transform group-hover:scale-110">
        {badge.icon}
      </div>
      
      {/* Title */}
      <h3 className="text-xl font-bold text-charcoal-900 mb-2">
        {badge.title}
      </h3>
      
      {/* Description */}
      <p className="text-gray-600 text-sm leading-relaxed mb-3">
        {badge.description}
      </p>
      
      {/* Detail (shows on hover) */}
      <div className="opacity-0 group-hover:opacity-100 transition-opacity 
                     text-xs text-ocean-600 bg-ocean-50 px-3 py-2 rounded-lg">
        {badge.detail}
      </div>
    </div>
  );
};

const TrustCenterSection = () => {
  const { stats } = usePublicStats();
  
  return (
    <section className="py-16 md:py-24 bg-white">
      <Container>
        {/* Section Header */}
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-5xl font-bold text-charcoal-900 mb-4">
            Your Trust is Our Priority
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            We maintain the highest standards of compliance, security, and professional care
          </p>
        </div>

        {/* Trust Badges Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 md:gap-8 mb-12">
          {trustBadges.map((badge, index) => (
            <TrustBadge key={index} badge={badge} />
          ))}
        </div>

        {/* Additional Trust Information */}
        <div className="bg-gradient-to-r from-ocean-50 to-sage-50 p-8 md:p-12 
                       rounded-2xl shadow-lg text-center">
          <h3 className="text-2xl md:text-3xl font-bold text-charcoal-900 mb-4">
            Trusted by {stats.display?.workers || '800+'} Care Professionals
          </h3>
          <p className="text-lg text-gray-700 mb-6 max-w-3xl mx-auto">
            Join the UK's most trusted care staffing platform. We've facilitated over 10,000 
            shifts with a 98% satisfaction rate.
          </p>
          
          {/* Trust Stats */}
          <div className="grid grid-cols-3 gap-6 md:gap-12 max-w-2xl mx-auto">
            <div>
              <div className="text-3xl md:text-4xl font-bold text-ocean-600 mb-2">
                100%
              </div>
              <div className="text-sm text-gray-600">
                DBS Verified
              </div>
            </div>
            <div>
              <div className="text-3xl md:text-4xl font-bold text-sage-600 mb-2">
                98%
              </div>
              <div className="text-sm text-gray-600">
                Satisfaction
              </div>
            </div>
            <div>
              <div className="text-3xl md:text-4xl font-bold text-terracotta-600 mb-2">
                10k+
              </div>
              <div className="text-sm text-gray-600">
                Shifts Filled
              </div>
            </div>
          </div>
        </div>

        {/* Certification Logos (Placeholder) */}
        <div className="mt-12 text-center">
          <p className="text-sm text-gray-500 mb-6">
            Accredited and certified by
          </p>
          <div className="flex flex-wrap justify-center items-center gap-8 opacity-60">
            <div className="text-2xl font-bold text-gray-400">CQC</div>
            <div className="text-2xl font-bold text-gray-400">ICO</div>
            <div className="text-2xl font-bold text-gray-400">Stripe</div>
            <div className="text-2xl font-bold text-gray-400">ISO 27001</div>
          </div>
        </div>
      </Container>
    </section>
  );
};

export default TrustCenterSection;
