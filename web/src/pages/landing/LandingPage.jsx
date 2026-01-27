import React from 'react';
import Navbar from '../../components/layout/Navbar/Navbar';
import HeroSection from '../../components/sections/Hero/HeroSection';
import StatsSection from '../../components/sections/Stats/StatsSection';
import ValuePropSection from '../../components/sections/ValueProp/ValuePropSection';
import HowItWorksSection from '../../components/sections/HowItWorks/HowItWorksSection';
import TrustCenterSection from '../../components/sections/Trust/TrustCenterSection';
import FinalCTASection from '../../components/sections/FinalCTA/FinalCTASection';
import Footer from '../../components/layout/Footer/Footer';

/**
 * Landing Page - The Conversion Machine
 * 
 * Mobile-first, conversion-optimized landing page for Vicarity
 * Dual-path user journeys for care workers and care homes
 * 
 * Deployment test: Workflow fixed and simplified - Jan 26, 2026
 */
const LandingPage = () => {
  return (
    <div className="min-h-screen bg-white">
      {/* Sticky Navigation */}
      <Navbar />

      {/* Main Content */}
      <main>
        {/* Hero Section - Above the fold */}
        <HeroSection />

        {/* Live Statistics Dashboard */}
        <StatsSection />

        {/* Value Propositions */}
        <ValuePropSection />

        {/* How It Works Timeline */}
        <HowItWorksSection />

        {/* Trust & Compliance Center */}
        <TrustCenterSection />}

        {/* TODO: Add Testimonials Carousel */}
        {/* <TestimonialsSection /> */}

        {/* TODO: Add FAQ Section */}
        {/* <FAQSection /> */}

        {/* Final CTA */}
        <FinalCTASection />
      </main>

      {/* Footer */}
      <Footer />
    </div>
  );
};

export default LandingPage;
