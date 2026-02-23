import React from 'react';

const ICONS = {
  star: (
    <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
      <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
    </svg>
  ),
  bird: (
    <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
    </svg>
  ),
  search: (
    <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
    </svg>
  ),
  certificate: (
    <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  ),
  check_circle: (
    <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
    </svg>
  ),
};

const BADGE_COLORS = {
  star: 'bg-yellow-100 text-yellow-600 border-yellow-300',
  bird: 'bg-sky-100 text-sky-600 border-sky-300',
  search: 'bg-ocean-100 text-ocean-600 border-ocean-300',
  certificate: 'bg-sage-100 text-sage-600 border-sage-200',
  check_circle: 'bg-green-100 text-green-600 border-green-300',
};

const BadgesRow = ({ badges = [] }) => {
  return (
    <div className="bg-white rounded-xl border border-gray-200 p-5">
      <p className="font-semibold text-gray-900 mb-3">Badges</p>
      <div className="flex items-center gap-3 flex-wrap">
        {badges.map((badge) => (
          <div key={badge.id} className="relative group" title={`${badge.name}: ${badge.description}`}>
            <div
              className={`
                w-12 h-12 rounded-full border-2 flex items-center justify-center transition-all
                ${badge.earned
                  ? BADGE_COLORS[badge.icon_key] || 'bg-gray-100 text-gray-500 border-gray-200'
                  : 'bg-gray-50 text-gray-300 border-gray-200 opacity-50'
                }
              `}
            >
              {ICONS[badge.icon_key] || ICONS.star}
              {/* Lock overlay for unearned */}
              {!badge.earned && (
                <span className="absolute inset-0 flex items-center justify-center">
                  <svg className="w-4 h-4 text-gray-400" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M18 8h-1V6c0-2.76-2.24-5-5-5S7 3.24 7 6v2H6c-1.1 0-2 .9-2 2v10c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V10c0-1.1-.9-2-2-2zm-6 9c-1.1 0-2-.9-2-2s.9-2 2-2 2 .9 2 2-.9 2-2 2zm3.1-9H8.9V6c0-1.71 1.39-3.1 3.1-3.1 1.71 0 3.1 1.39 3.1 3.1v2z" />
                  </svg>
                </span>
              )}
            </div>
            {/* Tooltip */}
            <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2 py-1 bg-gray-800 text-white text-xs rounded whitespace-nowrap opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity z-10">
              {badge.name}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default BadgesRow;
