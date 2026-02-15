import React from 'react';

const SHIFT_LABELS = {
  day: 'Day Shift',
  night: 'Night Shift',
  long_day: 'Long Day',
  waking_night: 'Waking Night',
};

const SHIFT_COLORS = {
  day: 'bg-sage-100 text-sage-700',
  night: 'bg-ocean-100 text-ocean-700',
  long_day: 'bg-terracotta-100 text-terracotta-700',
  waking_night: 'bg-purple-100 text-purple-700',
};

const STATUS_COLORS = {
  pending: 'bg-yellow-100 text-yellow-700',
  reviewed: 'bg-blue-100 text-blue-700',
  shortlisted: 'bg-sage-100 text-sage-700',
  rejected: 'bg-red-100 text-red-700',
  withdrawn: 'bg-gray-100 text-gray-500',
};

const JobCard = ({ job, onApply, onViewDetails, applicationStatus }) => {
  const hasApplied = !!applicationStatus;

  return (
    <div className="bg-white rounded-xl border border-gray-200 shadow-soft hover:shadow-soft-lg transition-shadow p-5 flex flex-col gap-3">
      {/* Header */}
      <div className="flex items-start justify-between gap-2">
        <div className="flex-1 min-w-0">
          <h3
            className="font-semibold text-gray-900 text-base truncate cursor-pointer hover:text-ocean-600 transition-colors"
            onClick={() => onViewDetails && onViewDetails(job)}
          >
            {job.title}
          </h3>
          <p className="text-sm text-gray-500 mt-0.5">
            {job.care_home?.business_name || 'Care Home'}
          </p>
        </div>
        {hasApplied && (
          <span className={`text-xs font-medium px-2 py-1 rounded-full flex-shrink-0 capitalize ${STATUS_COLORS[applicationStatus] || 'bg-gray-100 text-gray-500'}`}>
            {applicationStatus}
          </span>
        )}
      </div>

      {/* Details row */}
      <div className="flex flex-wrap gap-2 text-sm">
        <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${SHIFT_COLORS[job.shift_type] || 'bg-gray-100 text-gray-600'}`}>
          {SHIFT_LABELS[job.shift_type] || job.shift_type}
        </span>
        {job.location && (
          <span className="flex items-center gap-1 text-gray-500">
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            {job.location}
          </span>
        )}
        {(job.hourly_rate_min || job.hourly_rate_max) && (
          <span className="flex items-center gap-1 text-gray-500">
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            £{job.hourly_rate_min ?? '?'}–£{job.hourly_rate_max ?? '?'}/hr
          </span>
        )}
      </div>

      {/* Qualifications preview */}
      {job.required_qualifications?.length > 0 && (
        <div className="flex flex-wrap gap-1">
          {job.required_qualifications.slice(0, 3).map((q, i) => (
            <span key={i} className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded">
              {q}
            </span>
          ))}
          {job.required_qualifications.length > 3 && (
            <span className="text-xs text-gray-400">+{job.required_qualifications.length - 3} more</span>
          )}
        </div>
      )}

      {/* Actions */}
      <div className="flex gap-2 mt-1">
        <button
          onClick={() => onViewDetails && onViewDetails(job)}
          className="flex-1 text-sm text-ocean-600 border border-ocean-200 hover:bg-ocean-50 rounded-lg px-3 py-2 transition-colors font-medium"
        >
          View Details
        </button>
        {!hasApplied ? (
          <button
            onClick={() => onApply && onApply(job)}
            className="flex-1 text-sm bg-sage-600 hover:bg-sage-700 text-white rounded-lg px-3 py-2 transition-colors font-medium"
          >
            Apply
          </button>
        ) : (
          <button
            disabled
            className="flex-1 text-sm bg-gray-100 text-gray-400 rounded-lg px-3 py-2 font-medium cursor-not-allowed"
          >
            Applied
          </button>
        )}
      </div>
    </div>
  );
};

export default JobCard;
