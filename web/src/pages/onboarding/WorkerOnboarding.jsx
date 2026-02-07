import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { workerApi } from '../../services/api';
import Container from '../../components/shared/Container';
import ProgressStepper from '../../components/onboarding/ProgressStepper';
import Step1Personal from '../../components/onboarding/steps/Step1Personal';
import Step2Qualifications from '../../components/onboarding/steps/Step2Qualifications';
import Step3Experience from '../../components/onboarding/steps/Step3Experience';
import Step4Availability from '../../components/onboarding/steps/Step4Availability';

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
  const [currentStep, setCurrentStep] = useState(1);
  const [profileData, setProfileData] = useState({});
  const [completionPercentage, setCompletionPercentage] = useState(0);

  // Ref to flush pending saves before navigation
  const step4FlushSaveRef = useRef(null);

  // Determine which step to show based on profile completion
  // MUST MATCH backend calculation in worker_profile.py
  const determineStartingStep = (profile) => {
    console.log('🔍 Checking profile completion:', profile);

    // Check Step 1 fields (20%) - All required
    const step1Complete = profile.first_name && profile.last_name &&
                         profile.phone && profile.date_of_birth;
    console.log('Step 1 complete?', step1Complete, {
      first_name: !!profile.first_name,
      last_name: !!profile.last_name,
      phone: !!profile.phone,
      date_of_birth: !!profile.date_of_birth
    });

    if (!step1Complete) return 1;

    // Check Step 2 fields (30%) - DBS status + Right to work
    const step2Complete =
      profile.dbs_status &&
      profile.dbs_status !== 'not_checked' &&
      profile.right_to_work_status;
    console.log('Step 2 complete?', step2Complete, {
      dbs_status: profile.dbs_status,
      right_to_work_status: profile.right_to_work_status
    });

    if (!step2Complete) return 2;

    // Check Step 3 fields (25%) - Years experience + Bio (50+ chars)
    const step3Complete =
      profile.years_experience &&
      profile.bio &&
      profile.bio.length >= 50;
    console.log('Step 3 complete?', step3Complete, {
      years_experience: profile.years_experience,
      bio_length: profile.bio?.length || 0,
      bio_sample: profile.bio?.substring(0, 50)
    });

    if (!step3Complete) return 3;

    // Check Step 4 fields (25%) - Shift types + Available days
    const step4Complete =
      profile.shift_types &&
      profile.shift_types.length > 0 &&
      profile.available_days &&
      profile.available_days.length > 0;
    console.log('Step 4 complete?', step4Complete, {
      shift_types: profile.shift_types,
      available_days: profile.available_days
    });

    if (!step4Complete) return 4;

    // All steps complete - redirect to dashboard
    console.log('✅ ALL STEPS COMPLETE! Redirecting to dashboard...');
    return null; // Signal that onboarding is complete
  };

  // Load profile data from backend and localStorage
  useEffect(() => {
    const loadProfileData = async () => {
      try {
        // Try to load from backend first
        const profile = await workerApi.getProfile();

        if (profile) {
          setProfileData(profile);
          setCompletionPercentage(profile.profile_completion_percentage || 0);

          // Auto-navigate to first incomplete step (or dashboard if complete)
          const startStep = determineStartingStep(profile);

          if (startStep === null) {
            // Profile is 100% complete - redirect to dashboard
            console.log('Profile complete! Redirecting to dashboard...');
            navigate('/dashboard/worker');
          } else {
            // Show the incomplete step
            setCurrentStep(startStep);
          }
        }
      } catch (err) {
        console.error('Failed to load profile from backend:', err);

        // Profile doesn't exist yet (new user) - that's okay, start at step 1
        if (err.response?.status === 404) {
          console.log('No profile found, starting fresh at step 1');
          setCurrentStep(1);
          setCompletionPercentage(0);
        } else {
          // For other errors, try localStorage
          const pendingData = localStorage.getItem('pending_worker_profile');
          if (pendingData) {
            try {
              const data = JSON.parse(pendingData);
              setProfileData(data);
              localStorage.removeItem('pending_worker_profile');
            } catch (parseErr) {
              console.error('Failed to parse pending profile data:', parseErr);
            }
          }
        }
      }
    };

    loadProfileData();
  }, [navigate]);

  // Refresh completion percentage when step changes
  useEffect(() => {
    const refreshCompletion = async () => {
      try {
        const profile = await workerApi.getProfile();
        setCompletionPercentage(profile.profile_completion_percentage || 0);
      } catch (err) {
        console.error('Failed to refresh completion percentage:', err);
      }
    };

    // Small delay to allow auto-save to complete
    const timer = setTimeout(refreshCompletion, 1500);
    return () => clearTimeout(timer);
  }, [currentStep]);

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

  // Handle percentage update from individual steps
  const handlePercentageChange = (stepPercentage) => {
    // Each step reports its own completion, which is automatically calculated
    // The backend calculates the total based on all steps
    console.log(`Step ${currentStep} completion:`, stepPercentage);
  };

  // Navigate between steps
  const handleNext = async () => {
    if (currentStep < 4) {
      setCurrentStep(prev => prev + 1);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else {
      // Step 4 - flush any pending saves before redirecting
      if (step4FlushSaveRef.current) {
        console.log('🔄 Flushing pending saves before navigation...');
        try {
          await step4FlushSaveRef.current();
          console.log('✅ All changes saved');
        } catch (err) {
          console.error('Failed to save changes:', err);
        }
      }

      // All steps complete - redirect to dashboard
      navigate('/dashboard/worker');
    }
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(prev => prev - 1);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else {
      navigate('/dashboard/worker');
    }
  };

  // Render current step component
  const renderStep = () => {
    switch (currentStep) {
      case 1:
        return (
          <Step1Personal
            onPercentageChange={handlePercentageChange}
          />
        );
      case 2:
        return (
          <Step2Qualifications
            onPercentageChange={handlePercentageChange}
          />
        );
      case 3:
        return (
          <Step3Experience
            onPercentageChange={handlePercentageChange}
          />
        );
      case 4:
        return (
          <Step4Availability
            onPercentageChange={handlePercentageChange}
            flushSaveRef={step4FlushSaveRef}
          />
        );
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
          <div className="mt-8 bg-white rounded-2xl shadow-healthcare border border-gray-100 p-6 md:p-8">
            {renderStep()}

            {/* Navigation Buttons */}
            <div className="mt-8 pt-6 border-t border-gray-200 flex items-center justify-between gap-4">
              <button
                type="button"
                onClick={handleBack}
                className="px-6 py-3 border-2 border-gray-300 text-gray-700 font-semibold rounded-lg
                         hover:border-gray-400 hover:bg-gray-50 transition-all"
              >
                {currentStep === 1 ? 'Back to Dashboard' : 'Back'}
              </button>

              <div className="flex-1 text-center text-sm text-gray-500">
                Step {currentStep} of 4
              </div>

              <button
                type="button"
                onClick={handleNext}
                className="px-6 py-3 bg-gradient-to-r from-ocean-500 to-ocean-600
                         hover:from-ocean-600 hover:to-ocean-700 text-white font-semibold
                         rounded-lg shadow-lg transition-all hover:scale-105 active:scale-95"
              >
                {currentStep === 4 ? 'Finish & Go to Dashboard' : 'Next Step'}
              </button>
            </div>
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
