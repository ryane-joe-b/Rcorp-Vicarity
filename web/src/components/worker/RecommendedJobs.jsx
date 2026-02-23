import React from 'react';
import { useNavigate } from 'react-router-dom';

const SHIFT_BADGES = {
  day: { label: 'Day', color: 'bg-sky-100 text-sky-700' },
  night: { label: 'Night', color: 'bg-indigo-100 text-indigo-700' },
  long_day: { label: 'Long Day', color: 'bg-orange-100 text-orange-700' },
  waking_night: { label: 'Waking Night', color: 'bg-purple-100 text-purple-700' },
};

const formatRate = (min, max) => {
  if (min == null && max == null) return null;
  if (min != null && max != null) return `£${min.toFixed(2)}–£${max.toFixed(2)}/hr`;
  if (min != null) return `From £${min.toFixed(2)}/hr`;
  return `Up to £${max.toFixed(2)}/hr`;
};

const SkeletonCard = () => (
  <div className="flex-shrink-0 w-64 lg:w-auto bg-gray-100 rounded-xl h-36 animate-pulse" />
);

const RecommendedJobs = ({ jobs, loading, onViewAll }) => {
  const navigate = useNavigate();

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-5">
      <div className="flex items-center justify-between mb-4">
        <p className="font-semibold text-gray-900">Recommended Jobs</p>
        <button onClick={onViewAll} className="text-sm text-ocean-600 hover:underline">
          View all →
        </button>
      </div>

      {loading ? (
        <div className="flex gap-4 overflow-x-auto pb-1 lg:grid lg:grid-cols-3 lg:overflow-visible">
          <SkeletonCard />
          <SkeletonCard />
          <SkeletonCard />
        </div>
      ) : jobs.length === 0 ? (
        <p className="text-sm text-gray-400 text-center py-6">No jobs available right now. Check back soon.</p>
      ) : (
        <div className="flex gap-4 overflow-x-auto pb-1 snap-x lg:grid lg:grid-cols-3 lg:overflow-visible">
          {jobs.map((job) => {
            const badge = SHIFT_BADGES[job.shift_type] || { label: job.shift_type, color: 'bg-gray-100 text-gray-600' };
            const rate = formatRate(job.hourly_rate_min, job.hourly_rate_max);
            return (
              <div
                key={job.id}
                onClick={() => navigate('/dashboard/worker/jobs')}
                className="animate-fade-in flex-shrink-0 w-64 lg:w-auto snap-start bg-white border border-gray-200 hover:border-sage-300 hover:shadow-soft rounded-xl p-4 cursor-pointer transition-all"
              >
                <span className={`inline-block text-xs font-medium px-2 py-0.5 rounded-full mb-2 ${badge.color}`}>
                  {badge.label}
                </span>
                <p className="font-semibold text-gray-900 text-sm truncate">{job.title}</p>
                {job.care_home_name && (
                  <p className="text-xs text-gray-500 truncate">{job.care_home_name}</p>
                )}
                {job.location && (
                  <p className="text-xs text-gray-400 truncate mt-0.5">{job.location}</p>
                )}
                <div className="mt-3 flex items-center justify-between">
                  {rate && <span className="text-xs font-medium text-sage-700">{rate}</span>}
                  <span className="text-xs text-ocean-600 ml-auto">View →</span>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default RecommendedJobs;
