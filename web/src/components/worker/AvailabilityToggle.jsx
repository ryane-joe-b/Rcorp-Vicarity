import React from 'react';

const AvailabilityToggle = ({ isAvailable, onChange, loading }) => {
  return (
    <button
      onClick={() => !loading && onChange(!isAvailable)}
      disabled={loading}
      className={`
        animate-scale-in flex items-center gap-3 px-4 py-2.5 rounded-full border-2 font-medium text-sm
        transition-all duration-200 select-none
        ${isAvailable
          ? 'bg-green-50 border-green-400 text-green-700 hover:bg-green-100'
          : 'bg-gray-50 border-gray-300 text-gray-500 hover:bg-gray-100'
        }
        ${loading ? 'opacity-60 cursor-not-allowed' : 'cursor-pointer'}
      `}
      aria-pressed={isAvailable}
      aria-label="Toggle availability"
    >
      {/* Pill indicator */}
      <span
        className={`
          relative inline-flex w-10 h-5 rounded-full transition-colors duration-200 flex-shrink-0
          ${isAvailable ? 'bg-green-400' : 'bg-gray-300'}
        `}
      >
        <span
          className={`
            absolute top-0.5 left-0.5 w-4 h-4 rounded-full bg-white shadow-sm
            transition-transform duration-200
            ${isAvailable ? 'translate-x-5' : 'translate-x-0'}
          `}
        />
      </span>
      <span className="whitespace-nowrap">
        {loading
          ? 'Updating…'
          : isAvailable
            ? "You're visible to employers"
            : 'Hidden from searches'
        }
      </span>
    </button>
  );
};

export default AvailabilityToggle;
