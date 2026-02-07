import React, { useState, useEffect, useCallback } from 'react';
import { debounce } from 'lodash';
import { workerApi } from '../../../services/api';

/**
 * Step 2: Qualifications (30% weight)
 *
 * Collects:
 * - DBS check status and details
 * - Right to work in UK
 * - Professional qualifications
 * - Registration numbers
 *
 * Features:
 * - Real-time validation
 * - Auto-save on blur
 * - DBS-specific validation
 * - Document upload placeholders
 */

const Step2Qualifications = ({ initialData = {}, onComplete, onBack, updateCompletion, onPercentageChange }) => {
  const [formData, setFormData] = useState({
    dbs_status: initialData.dbs_status || 'not_checked',
    dbs_certificate_number: initialData.dbs_certificate_number || '',
    dbs_issue_date: initialData.dbs_issue_date || '',
    dbs_expiry_date: initialData.dbs_expiry_date || '',
    dbs_document_url: initialData.dbs_document_url || '',
    right_to_work_status: initialData.right_to_work_status || '',
    right_to_work_document_url: initialData.right_to_work_document_url || '',
    qualifications: initialData.qualifications || [],
  });

  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});
  const [saving, setSaving] = useState(false);
  const [availableQualifications, setAvailableQualifications] = useState([]);
  const [loadingQualifications, setLoadingQualifications] = useState(true);

  // DBS status options
  const dbsStatusOptions = [
    { value: 'not_checked', label: 'Not Checked', description: 'No DBS check yet' },
    { value: 'basic', label: 'Basic DBS', description: 'Basic criminal record check' },
    { value: 'standard', label: 'Standard DBS', description: 'Standard check with barred lists' },
    { value: 'enhanced', label: 'Enhanced DBS', description: 'Enhanced check for care work' },
    { value: 'enhanced_barred', label: 'Enhanced with Barred Lists', description: 'Full enhanced check' },
    { value: 'pending', label: 'Pending', description: 'Application submitted' },
    { value: 'expired', label: 'Expired', description: 'Needs renewal' },
  ];

  // Right to work options
  const rightToWorkOptions = [
    { value: 'uk_passport', label: 'UK Passport', description: 'British citizen' },
    { value: 'eu_settled', label: 'EU Settled Status', description: 'Pre/settled status' },
    { value: 'visa', label: 'Work Visa', description: 'Valid work visa' },
    { value: 'indefinite_leave', label: 'Indefinite Leave to Remain', description: 'ILR status' },
    { value: 'other', label: 'Other', description: 'Other documentation' },
  ];

  // Load available qualifications on mount
  useEffect(() => {
    const loadQualifications = async () => {
      try {
        // TODO: Replace with actual API call
        // const response = await publicApi.getQualifications();
        // setAvailableQualifications(response.qualifications);

        // Mock data for now
        setAvailableQualifications([
          { code: 'NVQ_LEVEL_2', name: 'NVQ Level 2 in Health & Social Care' },
          { code: 'NVQ_LEVEL_3', name: 'NVQ Level 3 in Health & Social Care' },
          { code: 'NVQ_LEVEL_4', name: 'NVQ Level 4 in Health & Social Care' },
          { code: 'CARE_CERTIFICATE', name: 'Care Certificate' },
          { code: 'FIRST_AID_LEVEL_3', name: 'First Aid at Work Level 3' },
          { code: 'MEDICATION_ADMIN', name: 'Safe Administration of Medication' },
          { code: 'DEMENTIA_AWARENESS', name: 'Dementia Awareness' },
          { code: 'MOVING_HANDLING', name: 'Moving and Handling' },
          { code: 'SAFEGUARDING_ADULTS', name: 'Safeguarding Vulnerable Adults' },
          { code: 'FOOD_HYGIENE', name: 'Food Safety & Hygiene Level 2' },
        ]);
      } catch (err) {
        console.error('Failed to load qualifications:', err);
      } finally {
        setLoadingQualifications(false);
      }
    };

    loadQualifications();
  }, []);

  // Validate individual field
  const validateField = (name, value) => {
    let error = '';

    switch (name) {
      case 'dbs_status':
        if (!value || value === 'not_checked') {
          error = 'DBS check is required for care work';
        }
        break;

      case 'dbs_certificate_number':
        if (formData.dbs_status !== 'not_checked' && formData.dbs_status !== 'pending' && !value) {
          error = 'DBS certificate number is required';
        } else if (value && value.length < 10) {
          error = 'Please enter a valid DBS certificate number';
        }
        break;

      case 'dbs_issue_date':
        if (formData.dbs_status !== 'not_checked' && formData.dbs_status !== 'pending' && !value) {
          error = 'DBS issue date is required';
        }
        break;

      case 'dbs_expiry_date':
        if (value && formData.dbs_issue_date && new Date(value) <= new Date(formData.dbs_issue_date)) {
          error = 'Expiry date must be after issue date';
        }
        break;

      case 'right_to_work_status':
        if (!value) {
          error = 'Right to work verification is required';
        }
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

    // Clear error when user types
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }

    // Validate on change for better UX
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

    // Auto-save on blur
    debouncedSave();
  };

  // Handle qualification toggle
  const handleQualificationToggle = (qualCode) => {
    setFormData(prev => {
      const quals = prev.qualifications || [];
      const exists = quals.find(q => q.code === qualCode);

      if (exists) {
        // Remove qualification
        return {
          ...prev,
          qualifications: quals.filter(q => q.code !== qualCode),
        };
      } else {
        // Add qualification
        return {
          ...prev,
          qualifications: [...quals, { code: qualCode }],
        };
      }
    });

    debouncedSave();
  };

  // Calculate completion percentage for this step
  const calculateStepCompletion = useCallback(() => {
    const requiredFields = [
      'dbs_status',
      'right_to_work_status',
    ];

    // DBS details required if status is set
    if (formData.dbs_status !== 'not_checked' && formData.dbs_status !== 'pending') {
      requiredFields.push('dbs_certificate_number', 'dbs_issue_date');
    }

    const completed = requiredFields.filter(field => {
      const value = formData[field];
      const error = validateField(field, value);
      return value && !error;
    }).length;

    // Bonus points for having qualifications
    const hasQualifications = formData.qualifications && formData.qualifications.length > 0;

    const basePercentage = (completed / requiredFields.length) * 25; // 25% of 30%
    const qualBonus = hasQualifications ? 5 : 0; // 5% bonus

    return Math.min(Math.round(basePercentage + qualBonus), 30); // 30% weight for Step 2
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [formData]);

  // Update completion percentage
  useEffect(() => {
    const completion = calculateStepCompletion();
    updateCompletion?.(completion);
    onPercentageChange?.(completion);
  }, [formData, calculateStepCompletion, updateCompletion, onPercentageChange]);

  // Auto-save to localStorage
  const saveToLocalStorage = () => {
    localStorage.setItem('worker_profile_step2', JSON.stringify(formData));
  };

  // Debounced save to backend
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const debouncedSave = useCallback(
    debounce(async () => {
      setSaving(true);
      try {
        await workerApi.updateProfile({ ...formData, current_step: 2 });
        saveToLocalStorage();
        console.log('Step 2 auto-saved to backend');
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
    const requiredFields = ['dbs_status', 'right_to_work_status'];

    if (formData.dbs_status !== 'not_checked' && formData.dbs_status !== 'pending') {
      requiredFields.push('dbs_certificate_number', 'dbs_issue_date');
    }

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
        {/* DBS Check Section */}
        <div className="space-y-6">
          <h3 className="text-lg font-semibold text-charcoal-900 flex items-center gap-2">
            <span className="text-2xl">🛡️</span>
            DBS Check (Disclosure and Barring Service)
          </h3>

          {/* DBS Status */}
          <div>
            <label htmlFor="dbs_status" className="block text-sm font-medium text-gray-700 mb-3">
              DBS Check Status *
            </label>
            <div className="grid md:grid-cols-2 gap-3">
              {dbsStatusOptions.map(option => (
                <label
                  key={option.value}
                  className={`relative flex items-start p-4 border-2 rounded-lg cursor-pointer transition-all ${
                    formData.dbs_status === option.value
                      ? 'border-sage-500 bg-sage-50'
                      : 'border-gray-200 hover:border-sage-300'
                  }`}
                >
                  <input
                    type="radio"
                    name="dbs_status"
                    value={option.value}
                    checked={formData.dbs_status === option.value}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    className="mt-0.5 h-4 w-4 text-sage-600 border-gray-300 focus:ring-sage-500"
                  />
                  <div className="ml-3 flex-1">
                    <div className="font-medium text-charcoal-900">{option.label}</div>
                    <div className="text-xs text-gray-500">{option.description}</div>
                  </div>
                  {formData.dbs_status === option.value && (
                    <svg className="w-5 h-5 text-sage-600" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                  )}
                </label>
              ))}
            </div>
            {errors.dbs_status && touched.dbs_status && (
              <p className="mt-2 text-sm text-red-600">{errors.dbs_status}</p>
            )}
          </div>

          {/* DBS Details - Show only if DBS is not "not_checked" or "pending" */}
          {formData.dbs_status !== 'not_checked' && formData.dbs_status !== 'pending' && (
            <div className="space-y-4 animate-fadeIn">
              {/* DBS Certificate Number */}
              <div>
                <label htmlFor="dbs_certificate_number" className="block text-sm font-medium text-gray-700 mb-2">
                  DBS Certificate Number *
                </label>
                <input
                  type="text"
                  id="dbs_certificate_number"
                  name="dbs_certificate_number"
                  value={formData.dbs_certificate_number}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-sage-500 focus:border-transparent transition-all ${
                    errors.dbs_certificate_number && touched.dbs_certificate_number
                      ? 'border-red-500'
                      : formData.dbs_certificate_number && !errors.dbs_certificate_number
                      ? 'border-green-500'
                      : 'border-gray-300'
                  }`}
                  placeholder="001234567890"
                />
                {errors.dbs_certificate_number && touched.dbs_certificate_number && (
                  <p className="mt-1 text-sm text-red-600">{errors.dbs_certificate_number}</p>
                )}
              </div>

              {/* DBS Dates */}
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="dbs_issue_date" className="block text-sm font-medium text-gray-700 mb-2">
                    Issue Date *
                  </label>
                  <input
                    type="date"
                    id="dbs_issue_date"
                    name="dbs_issue_date"
                    value={formData.dbs_issue_date}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    max={new Date().toISOString().split('T')[0]}
                    className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-sage-500 focus:border-transparent transition-all ${
                      errors.dbs_issue_date && touched.dbs_issue_date
                        ? 'border-red-500'
                        : formData.dbs_issue_date && !errors.dbs_issue_date
                        ? 'border-green-500'
                        : 'border-gray-300'
                    }`}
                  />
                  {errors.dbs_issue_date && touched.dbs_issue_date && (
                    <p className="mt-1 text-sm text-red-600">{errors.dbs_issue_date}</p>
                  )}
                </div>

                <div>
                  <label htmlFor="dbs_expiry_date" className="block text-sm font-medium text-gray-700 mb-2">
                    Renewal Date
                    <span className="ml-2 text-xs text-gray-500">(Optional - typically 3 years)</span>
                  </label>
                  <input
                    type="date"
                    id="dbs_expiry_date"
                    name="dbs_expiry_date"
                    value={formData.dbs_expiry_date}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-sage-500 focus:border-transparent transition-all ${
                      errors.dbs_expiry_date && touched.dbs_expiry_date
                        ? 'border-red-500'
                        : 'border-gray-300'
                    }`}
                  />
                  {errors.dbs_expiry_date && touched.dbs_expiry_date && (
                    <p className="mt-1 text-sm text-red-600">{errors.dbs_expiry_date}</p>
                  )}
                </div>
              </div>

              {/* DBS Document Upload Placeholder */}
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                </svg>
                <p className="mt-2 text-sm text-gray-600">DBS Certificate Upload</p>
                <p className="text-xs text-gray-500">Coming soon - document verification</p>
              </div>
            </div>
          )}
        </div>

        <div className="h-px bg-gray-200 my-8" />

        {/* Right to Work Section */}
        <div className="space-y-6">
          <h3 className="text-lg font-semibold text-charcoal-900 flex items-center gap-2">
            <span className="text-2xl">🇬🇧</span>
            Right to Work in the UK
          </h3>

          <div>
            <label htmlFor="right_to_work_status" className="block text-sm font-medium text-gray-700 mb-3">
              Right to Work Status *
            </label>
            <div className="grid md:grid-cols-2 gap-3">
              {rightToWorkOptions.map(option => (
                <label
                  key={option.value}
                  className={`relative flex items-start p-4 border-2 rounded-lg cursor-pointer transition-all ${
                    formData.right_to_work_status === option.value
                      ? 'border-sage-500 bg-sage-50'
                      : 'border-gray-200 hover:border-sage-300'
                  }`}
                >
                  <input
                    type="radio"
                    name="right_to_work_status"
                    value={option.value}
                    checked={formData.right_to_work_status === option.value}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    className="mt-0.5 h-4 w-4 text-sage-600 border-gray-300 focus:ring-sage-500"
                  />
                  <div className="ml-3 flex-1">
                    <div className="font-medium text-charcoal-900">{option.label}</div>
                    <div className="text-xs text-gray-500">{option.description}</div>
                  </div>
                  {formData.right_to_work_status === option.value && (
                    <svg className="w-5 h-5 text-sage-600" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                  )}
                </label>
              ))}
            </div>
            {errors.right_to_work_status && touched.right_to_work_status && (
              <p className="mt-2 text-sm text-red-600">{errors.right_to_work_status}</p>
            )}
          </div>
        </div>

        <div className="h-px bg-gray-200 my-8" />

        {/* Qualifications Section */}
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-charcoal-900 flex items-center gap-2">
              <span className="text-2xl">📋</span>
              Care Qualifications
              <span className="ml-2 text-xs text-gray-500 font-normal">(Optional but recommended)</span>
            </h3>
            {formData.qualifications && formData.qualifications.length > 0 && (
              <span className="px-3 py-1 bg-sage-100 text-sage-700 text-sm font-medium rounded-full">
                {formData.qualifications.length} selected
              </span>
            )}
          </div>

          {loadingQualifications ? (
            <div className="text-center py-8">
              <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-sage-600"></div>
              <p className="mt-2 text-sm text-gray-600">Loading qualifications...</p>
            </div>
          ) : (
            <div className="grid md:grid-cols-2 gap-3">
              {availableQualifications.map(qual => {
                const isSelected = formData.qualifications?.some(q => q.code === qual.code);
                return (
                  <label
                    key={qual.code}
                    className={`flex items-center p-4 border-2 rounded-lg cursor-pointer transition-all ${
                      isSelected
                        ? 'border-sage-500 bg-sage-50'
                        : 'border-gray-200 hover:border-sage-300'
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={isSelected}
                      onChange={() => handleQualificationToggle(qual.code)}
                      className="h-4 w-4 text-sage-600 border-gray-300 rounded focus:ring-sage-500"
                    />
                    <div className="ml-3 flex-1">
                      <div className="font-medium text-sm text-charcoal-900">{qual.name}</div>
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
          )}
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

export default Step2Qualifications;
