import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import Container from '../../components/shared/Container';
import ProgressStepper from '../../components/onboarding/ProgressStepper';
import Step1Personal from '../../components/onboarding/steps/Step1Personal';

/**
 * Worker Onboarding Wizard
 *
 * 4-step profile completion process for care workers:
 * Step 1: Personal Details (20% weight)
 * Step 2: Qualifications (30% weight)
 * Step 3: Skills & Experience (25% weight)
 * Step 4: Availability & Preferences (25% weight)
 *
 * Features:
 * - Progress tracking with visual stepper
 * - Auto-save on field blur
 * - LocalStorage backup
 * - Mobile-first design
 * - Real-time validation
 */

const STEPS = [
  { id: 1, name: 'Personal Details', weight: 20, icon: '👤' },
  { id: 2, name: 'Qualifications', weight: 30, icon: '📋' },
  { id: 3, name: 'Skills & Experience', weight: 25, icon: '💼' },
  { id: 4, name: 'Availability', weight: 25, icon: '📅' },
];

const WorkerOnboarding = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [currentStep, setCurrentStep] = useState(1);
  const [profileData, setProfileData] = useState({});
  const [completionPercentage, setCompletionPercentage] = useState(0);

  // Redirect if not authenticated or not a worker
  useEffect(() => {
    if (!user) {
      navigate('/login');
    } else if (user.role !== 'worker') {
      navigate('/dashboard');
    }
  }, [user, navigate]);

  // Load any pending profile data from registration
  useEffect(() => {
    const pendingData = localStorage.getItem('pending_worker_profile');
    if (pendingData) {
      try {
        const data = JSON.parse(pendingData);
        setProfileData(data);
        // Clear after loading
        localStorage.removeItem('pending_worker_profile');
      } catch (err) {
        console.error('Failed to load pending profile data:', err);
      }
    }
  }, []);

  const handleStepComplete = (stepData) => {
    setProfileData(prev => ({ ...prev, ...stepData }));

    // Move to next step
    if (currentStep < 4) {
      setCurrentStep(prev => prev + 1);
    } else {
      // All steps complete - redirect to dashboard
      navigate('/dashboard/worker');
    }
  };

  // Render current step component
  const renderStep = () => {
    switch (currentStep) {
      case 1:
        return (
          <Step1Personal
            initialData={profileData}
            onComplete={handleStepComplete}
            onBack={() => navigate('/dashboard/worker')}
            updateCompletion={setCompletionPercentage}
          />
        );
      case 2:
        // TODO: Build Step 2
        return <div className="text-center py-12">Step 2 - Qualifications (Coming soon)</div>;
      case 3:
        // TODO: Build Step 3
        return <div className="text-center py-12">Step 3 - Skills & Experience (Coming soon)</div>;
      case 4:
        // TODO: Build Step 4
        return <div className="text-center py-12">Step 4 - Availability (Coming soon)</div>;
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-sage-50 via-white to-warm-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 shadow-sm">
        <Container>
          <div className="py-4">
            <h1 className="text-2xl font-bold text-charcoal-900">
              Complete Your Profile
            </h1>
            <p className="text-sm text-gray-600 mt-1">
              {completionPercentage}% complete • Step {currentStep} of 4
            </p>
          </div>
        </Container>
      </div>

      <Container className="py-8 md:py-12">
        <div className="max-w-3xl mx-auto">
          {/* Progress Stepper */}
          <ProgressStepper
            steps={STEPS}
            currentStep={currentStep}
            completionPercentage={completionPercentage}
          />

          {/* Current Step Content */}
          <div className="mt-8">
            {renderStep()}
          </div>

          {/* Trust Badges */}
          <div className="mt-8 flex flex-wrap justify-center gap-6 text-sm text-gray-500">
            <div className="flex items-center gap-2">
              <svg className="w-5 h-5 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              <span>Data Encrypted</span>
            </div>
            <div className="flex items-center gap-2">
              <svg className="w-5 h-5 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              <span>GDPR Compliant</span>
            </div>
            <div className="flex items-center gap-2">
              <svg className="w-5 h-5 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              <span>Auto-Saved</span>
            </div>
          </div>
        </div>
      </Container>
    </div>
  );
};

export default WorkerOnboarding;
