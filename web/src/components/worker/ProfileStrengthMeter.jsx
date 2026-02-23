import React from 'react';

const getLabel = (pct) => {
  if (pct >= 90) return 'Strong profile';
  if (pct >= 70) return 'Almost there';
  if (pct >= 40) return 'Building up';
  return 'Getting started';
};

const getLabelColor = (pct) => {
  if (pct >= 90) return 'text-green-600';
  if (pct >= 70) return 'text-ocean-600';
  if (pct >= 40) return 'text-yellow-600';
  return 'text-gray-500';
};

const ProfileStrengthMeter = ({ percentage, tips = [] }) => {
  const label = getLabel(percentage);
  const labelColor = getLabelColor(percentage);

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-5">
      <div className="flex items-center justify-between mb-3">
        <div>
          <p className="font-semibold text-gray-900">Profile strength</p>
          <p className={`text-sm font-medium ${labelColor}`}>{label}</p>
        </div>
        <div className="text-right">
          <span className="text-2xl font-bold text-gray-900">{percentage}</span>
          <span className="text-gray-400 text-sm">%</span>
        </div>
      </div>

      {/* Gradient bar */}
      <div className="w-full bg-gray-100 rounded-full h-3 overflow-hidden">
        <div
          className="h-3 rounded-full transition-all duration-700"
          style={{
            width: `${percentage}%`,
            background: 'linear-gradient(90deg, #8BAF9A 0%, #5B8FA8 55%, #C4724A 100%)',
          }}
        />
      </div>

      {/* Boost tips */}
      {tips.length > 0 && (
        <div className="mt-3 flex flex-wrap gap-2">
          {tips.slice(0, 3).map((tip, i) => (
            <span
              key={i}
              className="inline-flex items-center gap-1 bg-sage-50 border border-sage-200 text-sage-700 text-xs rounded-full px-3 py-1"
            >
              <span className="font-semibold">+{tip.points} pts</span>
              <span className="text-sage-600">·</span>
              <span>{tip.message}</span>
            </span>
          ))}
        </div>
      )}
    </div>
  );
};

export default ProfileStrengthMeter;
