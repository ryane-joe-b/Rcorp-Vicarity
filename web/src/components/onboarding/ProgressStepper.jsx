import React from 'react';

/**
 * Progress Stepper Component
 *
 * Visual progress indicator showing:
 * - Current step
 * - Completed steps
 * - Overall completion percentage
 *
 * Mobile-optimized with responsive layout
 */

const ProgressStepper = ({ steps, currentStep, completionPercentage }) => {
  return (
    <div className="bg-white rounded-2xl shadow-healthcare border border-gray-100 p-6">
      {/* Overall Progress Bar */}
      <div className="mb-6">
        <div className="flex justify-between items-center mb-2">
          <span className="text-sm font-semibold text-sage-700">
            Overall Progress
          </span>
          <span className="text-sm font-bold text-sage-700">
            {completionPercentage}%
          </span>
        </div>
        <div className="h-3 bg-gray-200 rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-sage-500 to-sage-600 transition-all duration-500 ease-out"
            style={{ width: `${completionPercentage}%` }}
          />
        </div>
      </div>

      {/* Steps */}
      <div className="relative">
        {/* Connector Line */}
        <div className="absolute top-6 left-6 right-6 h-0.5 bg-gray-200 hidden md:block" />

        {/* Steps Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 relative">
          {steps.map((step, index) => {
            const isCompleted = index + 1 < currentStep;
            const isCurrent = index + 1 === currentStep;

            return (
              <div
                key={step.id}
                className={`flex flex-col items-center text-center transition-all duration-300 ${
                  isCurrent ? 'transform scale-105' : ''
                }`}
              >
                {/* Step Circle */}
                <div
                  className={`relative z-10 w-12 h-12 rounded-full flex items-center justify-center
                             text-xl font-bold transition-all duration-300 mb-2
                             ${
                               isCompleted
                                 ? 'bg-sage-500 text-white shadow-lg'
                                 : isCurrent
                                 ? 'bg-ocean-500 text-white shadow-xl animate-pulse'
                                 : 'bg-gray-200 text-gray-500'
                             }`}
                >
                  {isCompleted ? (
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                    </svg>
                  ) : (
                    <span>{step.icon}</span>
                  )}
                </div>

                {/* Step Name */}
                <div className="w-full">
                  <p
                    className={`text-xs md:text-sm font-semibold ${
                      isCurrent ? 'text-ocean-700' : isCompleted ? 'text-sage-700' : 'text-gray-500'
                    }`}
                  >
                    {step.name}
                  </p>
                  <p className="text-xs text-gray-400 mt-0.5">
                    {step.weight}%
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Current Step Description */}
      <div className="mt-6 bg-ocean-50 rounded-lg p-4 border border-ocean-100">
        <div className="flex items-start gap-3">
          <div className="flex-shrink-0 w-8 h-8 bg-ocean-500 rounded-full flex items-center justify-center text-white font-bold">
            {currentStep}
          </div>
          <div>
            <h3 className="font-semibold text-ocean-900">
              {steps[currentStep - 1]?.name}
            </h3>
            <p className="text-sm text-ocean-700 mt-1">
              {currentStep === 1 && "Let's start with your personal details"}
              {currentStep === 2 && "Tell us about your qualifications"}
              {currentStep === 3 && "Share your skills and experience"}
              {currentStep === 4 && "Set your availability preferences"}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProgressStepper;
