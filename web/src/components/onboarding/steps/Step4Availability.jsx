import React, { useState, useEffect, useCallback } from 'react';
import { debounce } from 'lodash';
import { workerApi } from '../../../services/api';

/**
 * Worker Onboarding - Step 4: Availability & Preferences
 *
 * Weight: 25% of total profile completion
 *
 * Completion Calculation:
 * - Base: 15% (for any input)
 * - +5% for selecting at least one shift type
 * - +5% for selecting at least 3 available days
 * - +5% for providing hourly rate range
 * - +5% for providing travel radius
 * - Total possible: 35% (capped at 25%)
 *
 * Features:
 * - Preferred shift types selection
 * - Available days of week
 * - Hours per week seeking
 * - Travel radius
 * - Hourly rate range
 * - Own transport
 * - Available start date
 * - Auto-save functionality
 * - Real-time validation
 */

const Step4Availability = ({ onComplete, onPercentageChange, flushSaveRef }) => {
  const [formData, setFormData] = useState({
    // Shift preferences
    shift_types: [], // day, night, twilight, weekend
    available_days: [], // monday, tuesday, wednesday, thursday, friday, saturday, sunday
    hours_per_week: '',

    // Location & Travel
    travel_radius_miles: '',
    has_own_transport: null,

    // Compensation
    hourly_rate_min_pence: '',
    hourly_rate_max_pence: '',

    // Start date
    available_start_date: '',
  });

  const [errors, setErrors] = useState({});
  const [saving, setSaving] = useState(false);
  const [lastSaved, setLastSaved] = useState(null);

  // Shift type options
  const shiftTypes = [
    { id: 'day', label: 'Day Shifts', description: '7am - 7pm', icon: '☀️' },
    { id: 'night', label: 'Night Shifts', description: '7pm - 7am', icon: '🌙' },
    { id: 'twilight', label: 'Twilight Shifts', description: '2pm - 10pm', icon: '🌆' },
    { id: 'weekend', label: 'Weekends', description: 'Saturday & Sunday', icon: '📅' },
  ];

  // Days of week
  const daysOfWeek = [
    { id: 'monday', label: 'Mon' },
    { id: 'tuesday', label: 'Tue' },
    { id: 'wednesday', label: 'Wed' },
    { id: 'thursday', label: 'Thu' },
    { id: 'friday', label: 'Fri' },
    { id: 'saturday', label: 'Sat' },
    { id: 'sunday', label: 'Sun' },
  ];

  // Load saved data from backend on mount
  useEffect(() => {
    loadSavedData();
  }, []);

  const loadSavedData = async () => {
    try {
      const profile = await workerApi.getProfile();
      if (profile) {
        setFormData({
          shift_types: profile.shift_types || [],
          available_days: profile.available_days || [],
          hours_per_week: profile.hours_per_week || '',
          travel_radius_miles: profile.travel_radius_miles || '',
          has_own_transport: profile.has_own_transport,
          hourly_rate_min_pence: profile.hourly_rate_min_pence || '',
          hourly_rate_max_pence: profile.hourly_rate_max_pence || '',
          available_start_date: profile.available_start_date || '',
        });
      }
    } catch (err) {
      console.error('Failed to load profile data:', err);
      // Try localStorage as fallback
      const saved = localStorage.getItem('onboarding_step4');
      if (saved) {
        setFormData(JSON.parse(saved));
      }
    }
  };

  // Calculate completion percentage
  const calculateCompletion = useCallback((data) => {
    let completion = 0;

    // Base completion for any input
    const hasAnyInput = data.shift_types.length > 0 ||
                       data.available_days.length > 0 ||
                       data.hours_per_week ||
                       data.travel_radius_miles ||
                       data.hourly_rate_min_pence ||
                       data.available_start_date;

    if (hasAnyInput) {
      completion += 15;
    }

    // +5% for shift types
    if (data.shift_types.length > 0) {
      completion += 5;
    }

    // +5% for at least 3 available days
    if (data.available_days.length >= 3) {
      completion += 5;
    }

    // +5% for hourly rate range
    if (data.hourly_rate_min_pence && data.hourly_rate_max_pence) {
      completion += 5;
    }

    // +5% for travel radius
    if (data.travel_radius_miles) {
      completion += 5;
    }

    // Cap at 25% (this step's weight)
    return Math.min(completion, 25);
  }, []);

  // Save to localStorage
  const saveToLocalStorage = useCallback(() => {
    localStorage.setItem('onboarding_step4', JSON.stringify(formData));
  }, [formData]);

  // Immediate save function (no debounce)
  const saveImmediately = useCallback(async (data) => {
    setSaving(true);

    // Filter out empty strings for number and date fields to avoid validation errors
    const dataToSave = { ...data };
    if (dataToSave.hours_per_week === '') delete dataToSave.hours_per_week;
    if (dataToSave.travel_radius_miles === '') delete dataToSave.travel_radius_miles;
    if (dataToSave.hourly_rate_min_pence === '') delete dataToSave.hourly_rate_min_pence;
    if (dataToSave.hourly_rate_max_pence === '') delete dataToSave.hourly_rate_max_pence;
    if (dataToSave.available_start_date === '') delete dataToSave.available_start_date;

    console.log('Step 4: Saving data to backend (immediate):', dataToSave);
    try {
      const response = await workerApi.updateProfile(dataToSave);
      saveToLocalStorage();
      setLastSaved(new Date());
      console.log('✅ Step 4 saved successfully:', response);
    } catch (err) {
      console.error('Save failed:', err);
      console.error('Error details:', err.response?.data);
      saveToLocalStorage(); // Fallback to localStorage
      if (err.response?.status === 401) {
        console.warn('Session expired, data saved locally only');
      }
    } finally {
      setSaving(false);
    }
  }, [saveToLocalStorage]);

  // Auto-save to backend (debounced)
  const debouncedSave = useCallback(
    debounce(async (data) => {
      await saveImmediately(data);
    }, 1000),
    [saveImmediately]
  );

  // Expose flush function to parent via ref
  useEffect(() => {
    if (flushSaveRef) {
      flushSaveRef.current = async () => {
        // Cancel any pending debounced save
        debouncedSave.cancel();
        // Save immediately
        await saveImmediately(formData);
      };
    }
  }, [flushSaveRef, debouncedSave, saveImmediately, formData]);

  // Update form data and trigger auto-save
  useEffect(() => {
    const completion = calculateCompletion(formData);
    onPercentageChange?.(completion);
    debouncedSave(formData);
  }, [formData, calculateCompletion, onPercentageChange, debouncedSave]);

  // Validation
  const validate = (data) => {
    const newErrors = {};

    // Hourly rate validation
    if (data.hourly_rate_min_pence && data.hourly_rate_max_pence) {
      const min = parseInt(data.hourly_rate_min_pence);
      const max = parseInt(data.hourly_rate_max_pence);

      if (min >= max) {
        newErrors.hourly_rate = 'Maximum rate must be higher than minimum rate';
      }

      if (min < 1100) { // £11.00 minimum wage
        newErrors.hourly_rate_min_pence = 'Minimum rate should be at least £11.00';
      }

      if (max > 5000) { // £50.00 reasonable maximum
        newErrors.hourly_rate_max_pence = 'Maximum rate seems unusually high';
      }
    }

    // Hours per week validation
    if (data.hours_per_week) {
      const hours = parseInt(data.hours_per_week);
      if (hours < 1) {
        newErrors.hours_per_week = 'Must be at least 1 hour';
      }
      if (hours > 70) {
        newErrors.hours_per_week = 'Cannot exceed 70 hours per week';
      }
    }

    // Travel radius validation
    if (data.travel_radius_miles) {
      const radius = parseInt(data.travel_radius_miles);
      if (radius < 1) {
        newErrors.travel_radius_miles = 'Must be at least 1 mile';
      }
      if (radius > 100) {
        newErrors.travel_radius_miles = 'Cannot exceed 100 miles';
      }
    }

    // Start date validation
    if (data.available_start_date) {
      const selectedDate = new Date(data.available_start_date);
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      if (selectedDate < today) {
        newErrors.available_start_date = 'Start date cannot be in the past';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Handle shift type toggle
  const handleShiftTypeToggle = (shiftTypeId) => {
    setFormData(prev => {
      const newShiftTypes = prev.shift_types.includes(shiftTypeId)
        ? prev.shift_types.filter(id => id !== shiftTypeId)
        : [...prev.shift_types, shiftTypeId];

      const updated = { ...prev, shift_types: newShiftTypes };
      validate(updated);
      return updated;
    });
  };

  // Handle day toggle
  const handleDayToggle = (dayId) => {
    setFormData(prev => {
      const newDays = prev.available_days.includes(dayId)
        ? prev.available_days.filter(id => id !== dayId)
        : [...prev.available_days, dayId];

      const updated = { ...prev, available_days: newDays };
      validate(updated);
      return updated;
    });
  };

  // Handle input change
  const handleChange = (field, value) => {
    setFormData(prev => {
      const updated = { ...prev, [field]: value };
      validate(updated);
      return updated;
    });
  };

  // Format pence to pounds for display
  const formatPounds = (pence) => {
    if (!pence) return '';
    return (parseInt(pence) / 100).toFixed(2);
  };

  // Convert pounds input to pence
  const handlePoundsChange = (field, value) => {
    if (value === '') {
      handleChange(field, '');
      return;
    }
    const pence = Math.round(parseFloat(value) * 100);
    if (!isNaN(pence)) {
      handleChange(field, pence.toString());
    }
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold text-charcoal-900 mb-2">
          Availability & Preferences
        </h2>
        <p className="text-gray-600">
          Let care homes know when you're available and what you're looking for
        </p>
      </div>

      {/* Auto-save indicator */}
      {saving && (
        <div className="flex items-center gap-2 text-sm text-gray-500">
          <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
          </svg>
          <span>Saving...</span>
        </div>
      )}

      {/* Shift Types */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-3">
          Preferred Shift Types <span className="text-gray-400">(Select all that apply)</span>
        </label>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {shiftTypes.map((shift) => (
            <button
              key={shift.id}
              type="button"
              onClick={() => handleShiftTypeToggle(shift.id)}
              className={`p-4 rounded-lg border-2 transition-all text-left ${
                formData.shift_types.includes(shift.id)
                  ? 'border-ocean-500 bg-ocean-50'
                  : 'border-gray-200 hover:border-ocean-300'
              }`}
            >
              <div className="flex items-start gap-3">
                <span className="text-2xl flex-shrink-0">{shift.icon}</span>
                <div className="flex-1 min-w-0">
                  <div className="font-semibold text-charcoal-900">{shift.label}</div>
                  <div className="text-sm text-gray-600">{shift.description}</div>
                </div>
                {formData.shift_types.includes(shift.id) && (
                  <svg className="w-5 h-5 text-ocean-600 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                )}
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Available Days */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-3">
          Available Days <span className="text-gray-400">(Select all that apply)</span>
        </label>
        <div className="flex flex-wrap gap-2">
          {daysOfWeek.map((day) => (
            <button
              key={day.id}
              type="button"
              onClick={() => handleDayToggle(day.id)}
              className={`px-4 py-2 rounded-lg border-2 font-medium transition-all ${
                formData.available_days.includes(day.id)
                  ? 'border-ocean-500 bg-ocean-500 text-white'
                  : 'border-gray-300 text-gray-700 hover:border-ocean-300'
              }`}
            >
              {day.label}
            </button>
          ))}
        </div>
      </div>

      {/* Hours Per Week & Travel Radius */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Hours Per Week */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Hours Per Week Seeking <span className="text-gray-400">(Optional)</span>
          </label>
          <input
            type="number"
            min="1"
            max="70"
            value={formData.hours_per_week}
            onChange={(e) => handleChange('hours_per_week', e.target.value)}
            className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-ocean-500 focus:border-transparent transition-all ${
              errors.hours_per_week ? 'border-red-500' : 'border-gray-300'
            }`}
            placeholder="e.g., 40"
          />
          {errors.hours_per_week && (
            <p className="mt-1 text-sm text-red-600">{errors.hours_per_week}</p>
          )}
          <p className="mt-1 text-xs text-gray-500">How many hours per week are you looking for?</p>
        </div>

        {/* Travel Radius */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Travel Radius (miles) <span className="text-gray-400">(Optional)</span>
          </label>
          <input
            type="number"
            min="1"
            max="100"
            value={formData.travel_radius_miles}
            onChange={(e) => handleChange('travel_radius_miles', e.target.value)}
            className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-ocean-500 focus:border-transparent transition-all ${
              errors.travel_radius_miles ? 'border-red-500' : 'border-gray-300'
            }`}
            placeholder="e.g., 10"
          />
          {errors.travel_radius_miles && (
            <p className="mt-1 text-sm text-red-600">{errors.travel_radius_miles}</p>
          )}
          <p className="mt-1 text-xs text-gray-500">Maximum distance you're willing to travel</p>
        </div>
      </div>

      {/* Hourly Rate Range */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-3">
          Desired Hourly Rate Range <span className="text-gray-400">(Optional)</span>
        </label>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs text-gray-600 mb-1">Minimum (£)</label>
            <input
              type="number"
              step="0.01"
              min="11.00"
              max="50.00"
              value={formatPounds(formData.hourly_rate_min_pence)}
              onChange={(e) => handlePoundsChange('hourly_rate_min_pence', e.target.value)}
              className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-ocean-500 focus:border-transparent transition-all ${
                errors.hourly_rate_min_pence ? 'border-red-500' : 'border-gray-300'
              }`}
              placeholder="e.g., 12.50"
            />
            {errors.hourly_rate_min_pence && (
              <p className="mt-1 text-sm text-red-600">{errors.hourly_rate_min_pence}</p>
            )}
          </div>
          <div>
            <label className="block text-xs text-gray-600 mb-1">Maximum (£)</label>
            <input
              type="number"
              step="0.01"
              min="11.00"
              max="50.00"
              value={formatPounds(formData.hourly_rate_max_pence)}
              onChange={(e) => handlePoundsChange('hourly_rate_max_pence', e.target.value)}
              className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-ocean-500 focus:border-transparent transition-all ${
                errors.hourly_rate_max_pence ? 'border-red-500' : 'border-gray-300'
              }`}
              placeholder="e.g., 18.00"
            />
            {errors.hourly_rate_max_pence && (
              <p className="mt-1 text-sm text-red-600">{errors.hourly_rate_max_pence}</p>
            )}
          </div>
        </div>
        {errors.hourly_rate && (
          <p className="mt-1 text-sm text-red-600">{errors.hourly_rate}</p>
        )}
        <p className="mt-1 text-xs text-gray-500">National Living Wage is £11.44/hour (2024)</p>
      </div>

      {/* Own Transport */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-3">
          Do you have your own transport? <span className="text-gray-400">(Optional)</span>
        </label>
        <div className="flex gap-4">
          <button
            type="button"
            onClick={() => handleChange('has_own_transport', true)}
            className={`flex-1 px-6 py-3 rounded-lg border-2 font-medium transition-all ${
              formData.has_own_transport === true
                ? 'border-ocean-500 bg-ocean-50 text-ocean-700'
                : 'border-gray-300 text-gray-700 hover:border-ocean-300'
            }`}
          >
            Yes, I have a car
          </button>
          <button
            type="button"
            onClick={() => handleChange('has_own_transport', false)}
            className={`flex-1 px-6 py-3 rounded-lg border-2 font-medium transition-all ${
              formData.has_own_transport === false
                ? 'border-ocean-500 bg-ocean-50 text-ocean-700'
                : 'border-gray-300 text-gray-700 hover:border-ocean-300'
            }`}
          >
            No, I use public transport
          </button>
        </div>
      </div>

      {/* Available Start Date */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Available Start Date <span className="text-gray-400">(Optional)</span>
        </label>
        <input
          type="date"
          value={formData.available_start_date}
          onChange={(e) => handleChange('available_start_date', e.target.value)}
          min={new Date().toISOString().split('T')[0]}
          className={`w-full md:w-1/2 px-4 py-3 border rounded-lg focus:ring-2 focus:ring-ocean-500 focus:border-transparent transition-all ${
            errors.available_start_date ? 'border-red-500' : 'border-gray-300'
          }`}
        />
        {errors.available_start_date && (
          <p className="mt-1 text-sm text-red-600">{errors.available_start_date}</p>
        )}
        <p className="mt-1 text-xs text-gray-500">When can you start working?</p>
      </div>

      {/* Helpful Tips */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <div className="flex gap-3">
          <svg className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
          </svg>
          <div className="flex-1">
            <h4 className="font-semibold text-blue-900 mb-1">💡 Tips for Getting More Shifts</h4>
            <ul className="text-sm text-blue-700 space-y-1">
              <li>• Being flexible with shift types increases your opportunities</li>
              <li>• Having your own transport opens up more locations</li>
              <li>• Weekend availability is highly valued by care homes</li>
              <li>• Competitive rates help you stand out</li>
            </ul>
          </div>
        </div>
      </div>

      {/* Last Saved */}
      {lastSaved && (
        <p className="text-xs text-gray-500 text-center">
          Last saved at {lastSaved.toLocaleTimeString()}
        </p>
      )}
    </div>
  );
};

export default Step4Availability;
