import React, { useState, useEffect, useCallback } from 'react';
import { debounce } from 'lodash';
import { workerApi } from '../../../services/api';
import CameraUpload from '../CameraUpload';
import PostcodeLookup from '../PostcodeLookup';

/**
 * Step 1: Personal Details (20% weight)
 *
 * Collects:
 * - First name, Last name
 * - Phone number (UK format)
 * - Date of birth (18+ validation)
 * - Profile photo (optional)
 * - Address (postcode lookup)
 * - Emergency contact (optional)
 *
 * Features:
 * - Real-time validation with visual feedback
 * - Auto-save on blur (debounced)
 * - Profile photo with webcam/upload
 * - UK postcode lookup with auto-fill
 * - Mobile-optimized with 44px+ touch targets
 * - Accessibility with ARIA labels
 */

const Step1Personal = ({ initialData = {}, onComplete, onBack, updateCompletion, onPercentageChange }) => {
  const [formData, setFormData] = useState({
    first_name: initialData.first_name || '',
    last_name: initialData.last_name || '',
    phone: initialData.phone || '',
    date_of_birth: initialData.date_of_birth || '',
    profile_picture_url: initialData.profile_picture_url || '',
    postcode: initialData.postcode || '',
    address_line_1: initialData.address_line_1 || '',
    address_line_2: initialData.address_line_2 || '',
    city: initialData.city || '',
    county: initialData.county || '',
    emergency_contact_name: initialData.emergency_contact_name || '',
    emergency_contact_phone: initialData.emergency_contact_phone || '',
    emergency_contact_relationship: initialData.emergency_contact_relationship || '',
  });

  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});
  const [saving, setSaving] = useState(false);
  const [showEmergencyContact, setShowEmergencyContact] = useState(false);

  // Calculate age from date of birth
  const calculateAge = (dob) => {
    if (!dob) return 0;
    const today = new Date();
    const birthDate = new Date(dob);
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    return age;
  };

  // Validate individual field
  const validateField = (name, value) => {
    let error = '';

    switch (name) {
      case 'first_name':
      case 'last_name':
        if (!value) error = `${name === 'first_name' ? 'First' : 'Last'} name is required`;
        else if (value.length < 2) error = 'Name must be at least 2 characters';
        else if (!/^[a-zA-Z\s'-]+$/.test(value)) error = 'Name contains invalid characters';
        break;

      case 'phone':
        if (!value) error = 'Phone number is required';
        else if (!/^(\+44\s?[1-9]\d{1,4}\s?\d{3,4}\s?\d{3,4}|0[1-9]\d{8,9})$/.test(value.replace(/\s/g, ''))) {
          error = 'Please enter a valid UK phone number';
        }
        break;

      case 'date_of_birth':
        if (!value) error = 'Date of birth is required';
        else {
          const age = calculateAge(value);
          if (age < 18) error = 'You must be at least 18 years old to register';
          if (age > 100) error = 'Please enter a valid date of birth';
        }
        break;

      case 'postcode':
        if (!value) error = 'Postcode is required';
        else if (!/^[A-Z]{1,2}\d[A-Z\d]?\s?\d[A-Z]{2}$/i.test(value)) {
          error = 'Please enter a valid UK postcode';
        }
        break;

      case 'address_line_1':
        if (!value) error = 'Address is required';
        break;

      case 'city':
        if (!value) error = 'City is required';
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

  // Handle blur - mark as touched and validate
  const handleBlur = (e) => {
    const { name, value } = e.target;
    setTouched(prev => ({ ...prev, [name]: true }));

    const error = validateField(name, value);
    if (error) {
      setErrors(prev => ({ ...prev, [name]: error }));
    }

    // Auto-save on blur (debounced)
    debouncedSave();
  };

  // Auto-format phone number as user types
  useEffect(() => {
    if (formData.phone && formData.phone.length > 0) {
      const cleaned = formData.phone.replace(/\D/g, '');
      if (cleaned.startsWith('44')) {
        // Format +44 7xxx xxx xxx
        const formatted = cleaned.replace(/^44(\d{4})(\d{3})(\d{3}).*/, '+44 $1 $2 $3');
        if (formatted !== formData.phone && formatted.includes('+44')) {
          setFormData(prev => ({ ...prev, phone: formatted }));
        }
      } else if (cleaned.startsWith('0')) {
        // Format 07xxx xxx xxx
        const formatted = cleaned.replace(/^0(\d{4})(\d{3})(\d{3}).*/, '0$1 $2 $3');
        if (formatted !== formData.phone && formatted.startsWith('0')) {
          setFormData(prev => ({ ...prev, phone: formatted }));
        }
      }
    }
  }, [formData.phone]);

  // Calculate completion percentage for this step
  const calculateStepCompletion = useCallback(() => {
    const requiredFields = [
      'first_name',
      'last_name',
      'phone',
      'date_of_birth',
      'postcode',
      'address_line_1',
      'city',
    ];

    const completed = requiredFields.filter(field => {
      const value = formData[field];
      const error = validateField(field, value);
      return value && !error;
    }).length;

    const percentage = Math.round((completed / requiredFields.length) * 20); // 20% weight for Step 1
    return percentage;
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
    localStorage.setItem('worker_profile_step1', JSON.stringify(formData));
  };

  // Debounced save to backend
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const debouncedSave = useCallback(
    debounce(async () => {
      setSaving(true);

      // Filter out empty strings for date fields to avoid validation errors
      const dataToSave = { ...formData };
      if (dataToSave.date_of_birth === '') delete dataToSave.date_of_birth;

      try {
        // Save to backend
        await workerApi.updateProfile(dataToSave);
        // Also save to localStorage as backup
        saveToLocalStorage();
        console.log('Auto-saved to backend and localStorage');
      } catch (err) {
        console.error('Auto-save failed:', err);
        console.error('Error details:', err.response?.data);
        // Still save to localStorage even if API fails
        saveToLocalStorage();

        // Handle specific error cases
        if (err.response?.status === 401) {
          console.warn('Session expired, data saved locally only');
        } else if (err.response?.status === 404) {
          console.error('Worker profile not found');
        }
      } finally {
        setSaving(false);
      }
    }, 1000),
    [formData]
  );

  // Handle address selection from postcode lookup
  const handleAddressSelect = (address) => {
    setFormData(prev => ({
      ...prev,
      // Only update fields that are actually provided in the address object
      // This prevents overwriting existing values with empty strings
      ...(address.address_line_1 !== undefined && { address_line_1: address.address_line_1 }),
      ...(address.address_line_2 !== undefined && { address_line_2: address.address_line_2 }),
      ...(address.city !== undefined && { city: address.city }),
      ...(address.county !== undefined && { county: address.county }),
      ...(address.postcode !== undefined && { postcode: address.postcode }),
    }));
  };

  // Handle photo upload
  const handlePhotoUpload = (photoUrl) => {
    setFormData(prev => ({ ...prev, profile_picture_url: photoUrl }));
  };

  // Validate all required fields
  const validateForm = () => {
    const requiredFields = [
      'first_name',
      'last_name',
      'phone',
      'date_of_birth',
      'postcode',
      'address_line_1',
      'city',
    ];

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
        {/* Profile Photo Section */}
        <div className="mb-8">
          <h3 className="text-lg font-semibold text-charcoal-900 mb-4 flex items-center gap-2">
            <span className="text-2xl">📸</span>
            Profile Photo
            <span className="ml-auto text-xs text-gray-500 font-normal">(Optional)</span>
          </h3>
          <CameraUpload
            currentPhoto={formData.profile_picture_url}
            onPhotoChange={handlePhotoUpload}
          />
        </div>

        <div className="h-px bg-gray-200 my-8" />

        {/* Personal Details */}
        <div className="space-y-6">
          <h3 className="text-lg font-semibold text-charcoal-900 flex items-center gap-2">
            <span className="text-2xl">👤</span>
            Personal Details
          </h3>

          {/* Name Fields */}
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label htmlFor="first_name" className="block text-sm font-medium text-gray-700 mb-2">
                First Name *
              </label>
              <div className="relative">
                <input
                  type="text"
                  id="first_name"
                  name="first_name"
                  value={formData.first_name}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-sage-500 focus:border-transparent transition-all ${
                    errors.first_name && touched.first_name
                      ? 'border-red-500'
                      : formData.first_name && !errors.first_name
                      ? 'border-green-500'
                      : 'border-gray-300'
                  }`}
                  placeholder="John"
                />
                {formData.first_name && !errors.first_name && (
                  <div className="absolute right-3 top-3.5 text-green-500">
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                  </div>
                )}
              </div>
              {errors.first_name && touched.first_name && (
                <p className="mt-1 text-sm text-red-600">{errors.first_name}</p>
              )}
            </div>

            <div>
              <label htmlFor="last_name" className="block text-sm font-medium text-gray-700 mb-2">
                Last Name *
              </label>
              <div className="relative">
                <input
                  type="text"
                  id="last_name"
                  name="last_name"
                  value={formData.last_name}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-sage-500 focus:border-transparent transition-all ${
                    errors.last_name && touched.last_name
                      ? 'border-red-500'
                      : formData.last_name && !errors.last_name
                      ? 'border-green-500'
                      : 'border-gray-300'
                  }`}
                  placeholder="Smith"
                />
                {formData.last_name && !errors.last_name && (
                  <div className="absolute right-3 top-3.5 text-green-500">
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                  </div>
                )}
              </div>
              {errors.last_name && touched.last_name && (
                <p className="mt-1 text-sm text-red-600">{errors.last_name}</p>
              )}
            </div>
          </div>

          {/* Phone */}
          <div>
            <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-2">
              Phone Number *
              <span className="ml-2 text-xs text-gray-500">(UK mobile)</span>
            </label>
            <div className="relative">
              <input
                type="tel"
                id="phone"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                onBlur={handleBlur}
                className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-sage-500 focus:border-transparent transition-all ${
                  errors.phone && touched.phone
                    ? 'border-red-500'
                    : formData.phone && !errors.phone
                    ? 'border-green-500'
                    : 'border-gray-300'
                }`}
                placeholder="07123 456 789"
              />
              {formData.phone && !errors.phone && (
                <div className="absolute right-3 top-3.5 text-green-500">
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                </div>
              )}
            </div>
            {errors.phone && touched.phone && (
              <p className="mt-1 text-sm text-red-600">{errors.phone}</p>
            )}
          </div>

          {/* Date of Birth */}
          <div>
            <label htmlFor="date_of_birth" className="block text-sm font-medium text-gray-700 mb-2">
              Date of Birth *
              <span className="ml-2 text-xs text-gray-500">(Must be 18+)</span>
            </label>
            <div className="relative">
              <input
                type="date"
                id="date_of_birth"
                name="date_of_birth"
                value={formData.date_of_birth}
                onChange={handleChange}
                onBlur={handleBlur}
                max={new Date(new Date().setFullYear(new Date().getFullYear() - 18)).toISOString().split('T')[0]}
                className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-sage-500 focus:border-transparent transition-all ${
                  errors.date_of_birth && touched.date_of_birth
                    ? 'border-red-500'
                    : formData.date_of_birth && !errors.date_of_birth
                    ? 'border-green-500'
                    : 'border-gray-300'
                }`}
              />
              {formData.date_of_birth && !errors.date_of_birth && (
                <div className="absolute right-3 top-3.5 text-green-500">
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                </div>
              )}
            </div>
            {errors.date_of_birth && touched.date_of_birth && (
              <p className="mt-1 text-sm text-red-600">{errors.date_of_birth}</p>
            )}
            {formData.date_of_birth && !errors.date_of_birth && (
              <p className="mt-1 text-sm text-green-600">
                Age: {calculateAge(formData.date_of_birth)} years old ✓
              </p>
            )}
          </div>
        </div>

        <div className="h-px bg-gray-200 my-8" />

        {/* Address Section */}
        <div className="space-y-6">
          <h3 className="text-lg font-semibold text-charcoal-900 flex items-center gap-2">
            <span className="text-2xl">🏠</span>
            Address
          </h3>

          <PostcodeLookup
            postcode={formData.postcode}
            onPostcodeChange={(value) => setFormData(prev => ({ ...prev, postcode: value }))}
            onAddressSelect={handleAddressSelect}
            error={errors.postcode}
            touched={touched.postcode}
            onBlur={() => {
              setTouched(prev => ({ ...prev, postcode: true }));
              const error = validateField('postcode', formData.postcode);
              if (error) {
                setErrors(prev => ({ ...prev, postcode: error }));
              }
            }}
          />

          {/* Address Fields */}
          <div className="space-y-4">
            <div>
              <label htmlFor="address_line_1" className="block text-sm font-medium text-gray-700 mb-2">
                Address Line 1 *
              </label>
              <input
                type="text"
                id="address_line_1"
                name="address_line_1"
                value={formData.address_line_1}
                onChange={handleChange}
                onBlur={handleBlur}
                className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-sage-500 focus:border-transparent transition-all ${
                  errors.address_line_1 && touched.address_line_1
                    ? 'border-red-500'
                    : formData.address_line_1 && !errors.address_line_1
                    ? 'border-green-500'
                    : 'border-gray-300'
                }`}
                placeholder="123 High Street"
              />
              {errors.address_line_1 && touched.address_line_1 && (
                <p className="mt-1 text-sm text-red-600">{errors.address_line_1}</p>
              )}
            </div>

            <div>
              <label htmlFor="address_line_2" className="block text-sm font-medium text-gray-700 mb-2">
                Address Line 2
                <span className="ml-2 text-xs text-gray-500">(Optional)</span>
              </label>
              <input
                type="text"
                id="address_line_2"
                name="address_line_2"
                value={formData.address_line_2}
                onChange={handleChange}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-sage-500 focus:border-transparent transition-all"
                placeholder="Apartment 4B"
              />
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label htmlFor="city" className="block text-sm font-medium text-gray-700 mb-2">
                  City *
                </label>
                <input
                  type="text"
                  id="city"
                  name="city"
                  value={formData.city}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-sage-500 focus:border-transparent transition-all ${
                    errors.city && touched.city
                      ? 'border-red-500'
                      : formData.city && !errors.city
                      ? 'border-green-500'
                      : 'border-gray-300'
                  }`}
                  placeholder="London"
                />
                {errors.city && touched.city && (
                  <p className="mt-1 text-sm text-red-600">{errors.city}</p>
                )}
              </div>

              <div>
                <label htmlFor="county" className="block text-sm font-medium text-gray-700 mb-2">
                  County
                  <span className="ml-2 text-xs text-gray-500">(Optional)</span>
                </label>
                <input
                  type="text"
                  id="county"
                  name="county"
                  value={formData.county}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-sage-500 focus:border-transparent transition-all"
                  placeholder="Greater London"
                />
              </div>
            </div>
          </div>
        </div>

        <div className="h-px bg-gray-200 my-8" />

        {/* Emergency Contact Section */}
        <div>
          <button
            type="button"
            onClick={() => setShowEmergencyContact(!showEmergencyContact)}
            className="flex items-center gap-2 text-sage-600 hover:text-sage-700 font-medium"
          >
            <span className="text-2xl">🚨</span>
            <span>Emergency Contact</span>
            <span className="text-xs text-gray-500 font-normal">(Optional)</span>
            <svg
              className={`w-5 h-5 transition-transform ${showEmergencyContact ? 'rotate-180' : ''}`}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </button>

          {showEmergencyContact && (
            <div className="mt-6 space-y-4 animate-fadeIn">
              <div>
                <label htmlFor="emergency_contact_name" className="block text-sm font-medium text-gray-700 mb-2">
                  Emergency Contact Name
                </label>
                <input
                  type="text"
                  id="emergency_contact_name"
                  name="emergency_contact_name"
                  value={formData.emergency_contact_name}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-sage-500 focus:border-transparent transition-all"
                  placeholder="Jane Smith"
                />
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="emergency_contact_phone" className="block text-sm font-medium text-gray-700 mb-2">
                    Emergency Contact Phone
                  </label>
                  <input
                    type="tel"
                    id="emergency_contact_phone"
                    name="emergency_contact_phone"
                    value={formData.emergency_contact_phone}
                    onChange={handleChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-sage-500 focus:border-transparent transition-all"
                    placeholder="07123 456 789"
                  />
                </div>

                <div>
                  <label htmlFor="emergency_contact_relationship" className="block text-sm font-medium text-gray-700 mb-2">
                    Relationship
                  </label>
                  <input
                    type="text"
                    id="emergency_contact_relationship"
                    name="emergency_contact_relationship"
                    value={formData.emergency_contact_relationship}
                    onChange={handleChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-sage-500 focus:border-transparent transition-all"
                    placeholder="Mother"
                  />
                </div>
              </div>
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

export default Step1Personal;
