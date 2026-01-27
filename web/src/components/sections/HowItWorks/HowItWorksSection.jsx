import React from 'react';
import Container from '../../shared/Container';

/**
 * How It Works Timeline Section
 * 
 * Shows dual-path journey visualization for workers and care homes
 * - Vertical timeline on mobile
 * - Horizontal timeline on desktop
 * - Animated step indicators on scroll
 */

const workerSteps = [
  {
    number: 1,
    title: "Create Free Profile",
    description: "Sign up and complete your profile in minutes. Add your qualifications, experience, and availability.",
    time: "2 minutes",
    icon: "📝"
  },
  {
    number: 2,
    title: "Get Verified",
    description: "Upload your DBS certificate or apply for a new check. We verify your qualifications instantly.",
    time: "Instant",
    icon: "✓"
  },
  {
    number: 3,
    title: "Browse Jobs",
    description: "Access 1000+ shifts across the UK. Filter by location, pay rate, and shift type.",
    time: "Now",
    icon: "🔍"
  },
  {
    number: 4,
    title: "Get Hired",
    description: "Apply with one click. Many shifts offer same-day starts. Get paid weekly.",
    time: "Same day",
    icon: "🎉"
  }
];

const careHomeSteps = [
  {
    number: 1,
    title: "Post a Shift",
    description: "Create your shift in seconds. Set your rate, requirements, and shift details.",
    time: "30 seconds",
    icon: "📋"
  },
  {
    number: 2,
    title: "Get Matches",
    description: "Our algorithm instantly matches you with qualified workers in your area.",
    time: "Instant",
    icon: "⚡"
  },
  {
    number: 3,
    title: "Review Candidates",
    description: "See verified profiles with qualifications, ratings, and availability.",
    time: "Minutes",
    icon: "👥"
  },
  {
    number: 4,
    title: "Hire",
    description: "Book with one click. Workers receive instant notification. Track everything in your dashboard.",
    time: "One click",
    icon: "✨"
  }
];

const TimelineStep = ({ step, color, isLast }) => {
  return (
    <div className="relative">
      {/* Connector line (not shown for last step) */}
      {!isLast && (
        <div 
          className={`absolute left-6 top-14 w-0.5 h-full bg-${color}-200 
                     md:left-full md:top-6 md:w-full md:h-0.5 md:ml-6`}
          aria-hidden="true"
        />
      )}
      
      {/* Step content */}
      <div className="relative flex flex-col md:flex-col items-start md:items-center">
        {/* Step number circle */}
        <div className={`flex-shrink-0 w-12 h-12 rounded-full bg-${color}-500 
                        text-white flex items-center justify-center text-xl font-bold
                        shadow-lg z-10 transition-transform hover:scale-110`}>
          {step.number}
        </div>
        
        {/* Step content card */}
        <div className="mt-4 md:mt-6 w-full">
          <div className="bg-white p-6 rounded-lg shadow-healthcare hover:shadow-trust 
                         transition-shadow border border-gray-100">
            {/* Icon and time */}
            <div className="flex items-center justify-between mb-3">
              <span className="text-3xl" aria-hidden="true">{step.icon}</span>
              <span className={`text-sm font-semibold text-${color}-600 
                               bg-${color}-50 px-3 py-1 rounded-full`}>
                {step.time}
              </span>
            </div>
            
            {/* Title */}
            <h3 className="text-xl font-bold text-charcoal-900 mb-2">
              {step.title}
            </h3>
            
            {/* Description */}
            <p className="text-gray-600 leading-relaxed">
              {step.description}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

const HowItWorksSection = () => {
  return (
    <section className="py-16 md:py-24 bg-gradient-to-b from-white to-warm-50">
      <Container>
        {/* Section Header */}
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-5xl font-bold text-charcoal-900 mb-4">
            How Vicarity Works
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Getting started is simple. Choose your path below.
          </p>
        </div>

        {/* Dual Timeline */}
        <div className="grid md:grid-cols-2 gap-12 md:gap-16 max-w-7xl mx-auto">
          {/* FOR CARE WORKERS */}
          <div>
            {/* Path header */}
            <div className="mb-8 md:mb-12">
              <div className="inline-block bg-gradient-to-r from-sage-500 to-sage-600 
                             text-white px-6 py-3 rounded-full shadow-lg mb-4">
                <h3 className="text-xl font-bold">For Care Workers</h3>
              </div>
              <p className="text-gray-600 text-lg">
                Find your perfect care job in 4 simple steps
              </p>
            </div>

            {/* Timeline steps */}
            <div className="space-y-8 md:space-y-12">
              {workerSteps.map((step, index) => (
                <TimelineStep
                  key={step.number}
                  step={step}
                  color="sage"
                  isLast={index === workerSteps.length - 1}
                />
              ))}
            </div>
          </div>

          {/* FOR CARE HOMES */}
          <div>
            {/* Path header */}
            <div className="mb-8 md:mb-12">
              <div className="inline-block bg-gradient-to-r from-terracotta-500 to-terracotta-600 
                             text-white px-6 py-3 rounded-full shadow-lg mb-4">
                <h3 className="text-xl font-bold">For Care Homes</h3>
              </div>
              <p className="text-gray-600 text-lg">
                Fill shifts fast with verified care professionals
              </p>
            </div>

            {/* Timeline steps */}
            <div className="space-y-8 md:space-y-12">
              {careHomeSteps.map((step, index) => (
                <TimelineStep
                  key={step.number}
                  step={step}
                  color="terracotta"
                  isLast={index === careHomeSteps.length - 1}
                />
              ))}
            </div>
          </div>
        </div>

        {/* Bottom CTA */}
        <div className="mt-16 md:mt-20 text-center">
          <p className="text-xl text-gray-700 mb-6">
            Ready to get started?
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button
              onClick={() => console.log('Navigate to worker registration')}
              className="min-h-[44px] px-8 py-3 bg-sage-500 hover:bg-sage-600 
                       text-white font-semibold rounded-lg shadow-lg 
                       transition-all hover:scale-105 active:scale-95"
            >
              I'm a Care Worker
            </button>
            <button
              onClick={() => console.log('Navigate to care home registration')}
              className="min-h-[44px] px-8 py-3 bg-terracotta-500 hover:bg-terracotta-600 
                       text-white font-semibold rounded-lg shadow-lg 
                       transition-all hover:scale-105 active:scale-95"
            >
              I'm a Care Home
            </button>
          </div>
        </div>
      </Container>
    </section>
  );
};

export default HowItWorksSection;
