import React from 'react';
import { useNavigate } from 'react-router-dom';

const SkillGapCard = ({ gaps = [] }) => {
  const navigate = useNavigate();

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-5">
      <p className="font-semibold text-gray-900 mb-3">Skill Gaps</p>

      {gaps.length === 0 ? (
        <p className="text-sm text-green-600 font-medium py-2">
          Your skills match well with available roles ✓
        </p>
      ) : (
        <div className="space-y-3">
          {gaps.map((gap) => (
            <div key={gap.code} className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-2 min-w-0">
                {/* Warning icon */}
                <svg className="w-4 h-4 text-yellow-500 flex-shrink-0" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M1 21h22L12 2 1 21zm12-3h-2v-2h2v2zm0-4h-2v-4h2v4z" />
                </svg>
                <span className="text-sm text-gray-800 truncate">{gap.name}</span>
              </div>
              <div className="flex items-center gap-2 flex-shrink-0">
                <span className="text-xs text-gray-400">~{gap.jobs_unlocked} more jobs</span>
                <button
                  onClick={() => navigate('/onboarding/worker')}
                  className="text-xs text-ocean-600 hover:underline whitespace-nowrap"
                >
                  Add →
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default SkillGapCard;
