import React, { useState, useEffect, useCallback } from 'react';
import { debounce } from 'lodash';
import { workerApi } from '../../../services/api';

/**
 * Step 3: Skills & Experience (25% weight)
 *
 * Collects:
 * - Years of experience
 * - Care settings worked in
 * - Specializations
 * - Languages spoken
 * - Soft skills
 * - Bio
 *
 * Features:
 * - Real-time validation
 * - Auto-save on blur
 * - Character counter for bio
 * - Multi-select checkboxes
 */

const Step3Experience = ({ initialData = {}, onComplete, onBack, updateCompletion, onPercentageChange }) => {
  const [formData, setFormData] = useState({
    years_experience: initialData.years_experience || '',
    specializations: initialData.specializations || [],
    languages: initialData.languages || [],
    soft_skills: initialData.soft_skills || [],
    bio: initialData.bio || '',
  });

  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});
  const [saving, setSaving] = useState(false);

  // Experience options
  const experienceOptions = [
    { value: '0-1', label: 'Less than 1 year', description: 'Just starting out' },
    { value: '1-3', label: '1-3 years', description: 'Building experience' },
    { value: '3-5', label: '3-5 years', description: 'Experienced professional' },
    { value: '5-10', label: '5-10 years', description: 'Highly experienced' },
    { value: '10+', label: '10+ years', description: 'Veteran care worker' },
  ];

  // Specialization options
  const specializationOptions = [
    { value: 'elderly_care', label: 'Elderly Care', icon: '👴' },
    { value: 'dementia', label: 'Dementia Care', icon: '🧠' },
    { value: 'learning_disabilities', label: 'Learning Disabilities', icon: '📚' },
    { value: 'physical_disabilities', label: 'Physical Disabilities', icon: '♿' },
    { value: 'mental_health', label: 'Mental Health', icon: '💚' },
    { value: 'palliative_care', label: 'Palliative/End of Life', icon: '🕊️' },
    { value: 'children', label: 'Children & Young People', icon: '👶' },
    { value: 'rehabilitation', label: 'Rehabilitation', icon: '🏥' },
  ];

  // Language options (common in UK care sector)
  const languageOptions = [
    'English',
    'Polish',
    'Romanian',
    'Spanish',
    'Portuguese',
    'French',
    'Urdu',
    'Hindi',
    'Bengali',
    'Gujarati',
    'Arabic',
    'Somali',
    'Other',
  ];

  // Soft skills options
  const softSkillOptions = [
    { value: 'patient', label: 'Patient', icon: '⏳' },
    { value: 'compassionate', label: 'Compassionate', icon: '❤️' },
    { value: 'reliable', label: 'Reliable', icon: '✅' },
    { value: 'empathetic', label: 'Empathetic', icon: '🤝' },
    { value: 'communicator', label: 'Good Communicator', icon: '💬' },
    { value: 'team_player', label: 'Team Player', icon: '👥' },
    { value: 'adaptable', label: 'Adaptable', icon: '🔄' },
    { value: 'detail_oriented', label: 'Detail-Oriented', icon: '🔍' },
  ];

  // Validate individual field
  const validateField = (name, value) => {
    let error = '';

    switch (name) {
      case 'years_experience':
        if (!value) error = 'Please select your experience level';
        break;

      case 'bio':
        if (!value) error = 'Please write a brief bio';
        else if (value.length < 50) error = 'Bio must be at least 50 characters';
        else if (value.length > 500) error = 'Bio must not exceed 500 characters';
        break;

      default:
        break;
    }

    return error;
  };

  // Handle input change
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));

    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }

    if (touched[name]) {
      const error = validateField(name, value);
      if (error) {
        setErrors(prev => ({ ...prev, [name]: error }));
      }
    }
  };

  // Handle blur
  const handleBlur = (e) => {
    const { name, value } = e.target;
    setTouched(prev => ({ ...prev, [name]: true }));

    const error = validateField(name, value);
    if (error) {
      setErrors(prev => ({ ...prev, [name]: error }));
    }

    debouncedSave();
  };

  // Handle array toggle (specializations, soft_skills)
  const handleArrayToggle = (fieldName, value) => {
    setFormData(prev => {
      const currentArray = prev[fieldName] || [];
      const exists = currentArray.includes(value);

      return {
        ...prev,
        [fieldName]: exists
          ? currentArray.filter(item => item !== value)
          : [...currentArray, value],
      };
    });

    debouncedSave();
  };

  // Handle language selection
  const handleLanguageChange = (e) => {
    const value = e.target.value;
    if (value && !formData.languages.includes(value)) {
      setFormData(prev => ({
        ...prev,
        languages: [...prev.languages, value],
      }));
      e.target.value = '';
      debouncedSave();
    }
  };

  // Remove language
  const removeLanguage = (lang) => {
    setFormData(prev => ({
      ...prev,
      languages: prev.languages.filter(l => l !== lang),
    }));
    debouncedSave();
  };

  // Calculate completion percentage for this step
  const calculateStepCompletion = useCallback(() => {
    const requiredFields = ['years_experience', 'bio'];

    const completed = requiredFields.filter(field => {
      const value = formData[field];
      const error = validateField(field, value);
      return value && !error;
    }).length;

    // Bonus points for specializations and languages
    const hasSpecializations = formData.specializations && formData.specializations.length > 0;
    const hasLanguages = formData.languages && formData.languages.length > 0;

    const basePercentage = (completed / requiredFields.length) * 18; // 18% of 25%
    const specBonus = hasSpecializations ? 4 : 0;
    const langBonus = hasLanguages ? 3 : 0;

    return Math.min(Math.round(basePercentage + specBonus + langBonus), 25); // 25% weight for Step 3
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [formData]);

  // Update completion percentage
  useEffect(() => {
    const completion = calculateStepCompletion();
    updateCompletion?.(completion);
    onPercentageChange?.(completion);
  }, [formData, calculateStepCompletion, updateCompletion, onPercentageChange]);

  // Auto-save when formData changes
  useEffect(() => {
    debouncedSave();
  }, [formData, debouncedSave]);

  // Auto-save to localStorage
  const saveToLocalStorage = () => {
    localStorage.setItem('worker_profile_step3', JSON.stringify(formData));
  };

  // Debounced save to backend
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const debouncedSave = useCallback(
    debounce(async () => {
      setSaving(true);
      try {
        await workerApi.updateProfile({ ...formData, current_step: 3 });
        saveToLocalStorage();
        console.log('Step 3 auto-saved to backend');
      } catch (err) {
        console.error('Auto-save failed:', err);
        saveToLocalStorage();
      } finally {
        setSaving(false);
      }
    }, 1000),
    [formData]
  );

  // Validate all required fields
  const validateForm = () => {
    const requiredFields = ['years_experience', 'bio'];

    const newErrors = {};
    requiredFields.forEach(field => {
      const error = validateField(field, formData[field]);
      if (error) {
        newErrors[field] = error;
      }
    });

    setErrors(newErrors);
    setTouched(
      requiredFields.reduce((acc, field) => ({ ...acc, [field]: true }), {})
    );

    return Object.keys(newErrors).length === 0;
  };

  return (
    <div className="space-y-8">
      {/* Main Card */}
      <div className="bg-white rounded-2xl shadow-healthcare border border-gray-100 p-6 md:p-8">
        {/* Experience Level */}
        <div className="space-y-6 mb-8">
          <h3 className="text-lg font-semibold text-charcoal-900 flex items-center gap-2">
            <span className="text-2xl">💼</span>
            Experience Level
          </h3>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">
              Years of Care Experience *
            </label>
            <div className="space-y-2">
              {experienceOptions.map(option => (
                <label
                  key={option.value}
                  className={`flex items-center p-4 border-2 rounded-lg cursor-pointer transition-all ${
                    formData.years_experience === option.value
                      ? 'border-sage-500 bg-sage-50'
                      : 'border-gray-200 hover:border-sage-300'
                  }`}
                >
                  <input
                    type="radio"
                    name="years_experience"
                    value={option.value}
                    checked={formData.years_experience === option.value}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    className="h-4 w-4 text-sage-600 border-gray-300 focus:ring-sage-500"
                  />
                  <div className="ml-3 flex-1">
                    <div className="flex items-center justify-between">
                      <span className="font-medium text-charcoal-900">{option.label}</span>
                      <span className="text-xs text-gray-500">{option.description}</span>
                    </div>
                  </div>
                  {formData.years_experience === option.value && (
                    <svg className="w-5 h-5 text-sage-600 ml-2" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                  )}
                </label>
              ))}
            </div>
            {errors.years_experience && touched.years_experience && (
              <p className="mt-2 text-sm text-red-600">{errors.years_experience}</p>
            )}
          </div>
        </div>

        <div className="h-px bg-gray-200 my-8" />

        {/* Specializations */}
        <div className="space-y-6 mb-8">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-charcoal-900 flex items-center gap-2">
              <span className="text-2xl">🎯</span>
              Care Specializations
              <span className="ml-2 text-xs text-gray-500 font-normal">(Select all that apply)</span>
            </h3>
            {formData.specializations.length > 0 && (
              <span className="px-3 py-1 bg-sage-100 text-sage-700 text-sm font-medium rounded-full">
                {formData.specializations.length} selected
              </span>
            )}
          </div>

          <div className="grid md:grid-cols-2 gap-3">
            {specializationOptions.map(spec => {
              const isSelected = formData.specializations.includes(spec.value);
              return (
                <label
                  key={spec.value}
                  className={`flex items-center p-4 border-2 rounded-lg cursor-pointer transition-all ${
                    isSelected
                      ? 'border-sage-500 bg-sage-50'
                      : 'border-gray-200 hover:border-sage-300'
                  }`}
                >
                  <input
                    type="checkbox"
                    checked={isSelected}
                    onChange={() => handleArrayToggle('specializations', spec.value)}
                    className="h-4 w-4 text-sage-600 border-gray-300 rounded focus:ring-sage-500"
                  />
                  <div className="ml-3 flex-1 flex items-center gap-2">
                    <span className="text-xl">{spec.icon}</span>
                    <span className="font-medium text-sm text-charcoal-900">{spec.label}</span>
                  </div>
                  {isSelected && (
                    <svg className="w-5 h-5 text-sage-600" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                  )}
                </label>
              );
            })}
          </div>
        </div>

        <div className="h-px bg-gray-200 my-8" />

        {/* Languages */}
        <div className="space-y-6 mb-8">
          <h3 className="text-lg font-semibold text-charcoal-900 flex items-center gap-2">
            <span className="text-2xl">🗣️</span>
            Languages Spoken
          </h3>

          <div>
            <label htmlFor="language_select" className="block text-sm font-medium text-gray-700 mb-2">
              Add Languages
            </label>
            <select
              id="language_select"
              onChange={handleLanguageChange}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-sage-500 focus:border-transparent"
            >
              <option value="">Select a language...</option>
              {languageOptions.filter(lang => !formData.languages.includes(lang)).map(lang => (
                <option key={lang} value={lang}>{lang}</option>
              ))}
            </select>
          </div>

          {formData.languages.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {formData.languages.map(lang => (
                <span
                  key={lang}
                  className="inline-flex items-center gap-2 px-3 py-2 bg-sage-100 text-sage-700 rounded-full text-sm font-medium"
                >
                  {lang}
                  <button
                    type="button"
                    onClick={() => removeLanguage(lang)}
                    className="hover:text-sage-900"
                  >
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                    </svg>
                  </button>
                </span>
              ))}
            </div>
          )}
        </div>

        <div className="h-px bg-gray-200 my-8" />

        {/* Soft Skills */}
        <div className="space-y-6 mb-8">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-charcoal-900 flex items-center gap-2">
              <span className="text-2xl">⭐</span>
              Key Strengths
              <span className="ml-2 text-xs text-gray-500 font-normal">(Select your top skills)</span>
            </h3>
            {formData.soft_skills.length > 0 && (
              <span className="px-3 py-1 bg-sage-100 text-sage-700 text-sm font-medium rounded-full">
                {formData.soft_skills.length} selected
              </span>
            )}
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {softSkillOptions.map(skill => {
              const isSelected = formData.soft_skills.includes(skill.value);
              return (
                <label
                  key={skill.value}
                  className={`flex flex-col items-center p-4 border-2 rounded-lg cursor-pointer transition-all ${
                    isSelected
                      ? 'border-sage-500 bg-sage-50'
                      : 'border-gray-200 hover:border-sage-300'
                  }`}
                >
                  <input
                    type="checkbox"
                    checked={isSelected}
                    onChange={() => handleArrayToggle('soft_skills', skill.value)}
                    className="sr-only"
                  />
                  <span className="text-2xl mb-2">{skill.icon}</span>
                  <span className="text-xs font-medium text-center text-charcoal-900">{skill.label}</span>
                  {isSelected && (
                    <svg className="w-4 h-4 text-sage-600 mt-1" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                  )}
                </label>
              );
            })}
          </div>
        </div>

        <div className="h-px bg-gray-200 my-8" />

        {/* Bio */}
        <div className="space-y-6">
          <h3 className="text-lg font-semibold text-charcoal-900 flex items-center gap-2">
            <span className="text-2xl">✍️</span>
            About You
          </h3>

          <div>
            <label htmlFor="bio" className="block text-sm font-medium text-gray-700 mb-2">
              Professional Bio *
              <span className="ml-2 text-xs text-gray-500">(50-500 characters)</span>
            </label>
            <textarea
              id="bio"
              name="bio"
              value={formData.bio}
              onChange={handleChange}
              onBlur={handleBlur}
              rows={5}
              maxLength={500}
              className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-sage-500 focus:border-transparent transition-all resize-none ${
                errors.bio && touched.bio
                  ? 'border-red-500'
                  : formData.bio && formData.bio.length >= 50 && !errors.bio
                  ? 'border-green-500'
                  : 'border-gray-300'
              }`}
              placeholder="Write a brief introduction about yourself, your experience, and what you enjoy about care work. Care homes will see this on your profile..."
            />
            <div className="flex items-center justify-between mt-2">
              {errors.bio && touched.bio ? (
                <p className="text-sm text-red-600">{errors.bio}</p>
              ) : (
                <p className="text-sm text-gray-500">
                  Tell care homes about your passion for care work and what makes you a great care worker.
                </p>
              )}
              <span className={`text-sm ${
                formData.bio.length >= 50 && formData.bio.length <= 500
                  ? 'text-green-600'
                  : formData.bio.length > 500
                  ? 'text-red-600'
                  : 'text-gray-500'
              }`}>
                {formData.bio.length}/500
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Auto-save indicator */}
      {saving && (
        <div className="flex items-center justify-center gap-2 text-sm text-sage-600">
          <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          <span>Saving...</span>
        </div>
      )}
    </div>
  );
};

export default Step3Experience;
