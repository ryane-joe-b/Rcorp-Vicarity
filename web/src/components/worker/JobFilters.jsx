import React from 'react';

const SHIFT_TYPES = [
  { value: 'day', label: 'Day Shift' },
  { value: 'night', label: 'Night Shift' },
  { value: 'long_day', label: 'Long Day' },
  { value: 'waking_night', label: 'Waking Night' },
];

const JobFilters = ({ filters, onChange }) => {
  const handleShiftToggle = (value) => {
    const current = filters.shift_type || '';
    onChange({ ...filters, shift_type: current === value ? '' : value });
  };

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-5 space-y-5">
      <h3 className="font-semibold text-gray-900">Filters</h3>

      {/* Shift type */}
      <div>
        <p className="text-sm font-medium text-gray-700 mb-2">Shift Type</p>
        <div className="space-y-2">
          {SHIFT_TYPES.map((s) => (
            <label key={s.value} className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={filters.shift_type === s.value}
                onChange={() => handleShiftToggle(s.value)}
                className="w-4 h-4 text-sage-600 border-gray-300 rounded focus:ring-sage-500"
              />
              <span className="text-sm text-gray-700">{s.label}</span>
            </label>
          ))}
        </div>
      </div>

      {/* Location */}
      <div>
        <p className="text-sm font-medium text-gray-700 mb-2">Location</p>
        <input
          type="text"
          value={filters.location || ''}
          onChange={(e) => onChange({ ...filters, location: e.target.value })}
          placeholder="e.g. Brighton"
          className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-sage-400 focus:border-transparent"
        />
      </div>

      {/* Rate range */}
      <div>
        <p className="text-sm font-medium text-gray-700 mb-2">Hourly Rate (£)</p>
        <div className="flex gap-2 items-center">
          <input
            type="number"
            value={filters.min_rate || ''}
            onChange={(e) => onChange({ ...filters, min_rate: e.target.value ? Number(e.target.value) : '' })}
            placeholder="Min"
            min={0}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-sage-400 focus:border-transparent"
          />
          <span className="text-gray-400 text-sm">–</span>
          <input
            type="number"
            value={filters.max_rate || ''}
            onChange={(e) => onChange({ ...filters, max_rate: e.target.value ? Number(e.target.value) : '' })}
            placeholder="Max"
            min={0}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-sage-400 focus:border-transparent"
          />
        </div>
      </div>

      {/* Clear */}
      <button
        onClick={() => onChange({ shift_type: '', location: '', min_rate: '', max_rate: '' })}
        className="text-sm text-gray-500 hover:text-gray-700 underline"
      >
        Clear all filters
      </button>
    </div>
  );
};

export default JobFilters;
