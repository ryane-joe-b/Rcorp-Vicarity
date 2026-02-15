import React, { useEffect } from 'react';

const SHIFT_LABELS = {
  day: 'Day Shift',
  night: 'Night Shift',
  long_day: 'Long Day',
  waking_night: 'Waking Night',
};

const STATUS_COLORS = {
  pending: 'bg-yellow-100 text-yellow-700',
  reviewed: 'bg-blue-100 text-blue-700',
  shortlisted: 'bg-sage-100 text-sage-700',
  rejected: 'bg-red-100 text-red-700',
  withdrawn: 'bg-gray-100 text-gray-500',
};

const JobDetailsModal = ({ job, onClose, onApply, applicationStatus }) => {
  const hasApplied = !!applicationStatus;

  // Close on Escape
  useEffect(() => {
    const handler = (e) => { if (e.key === 'Escape') onClose(); };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, [onClose]);

  if (!job) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />

      {/* Modal */}
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-gray-100 px-6 py-4 flex items-start justify-between rounded-t-2xl">
          <div className="flex-1 min-w-0 pr-4">
            <h2 className="text-xl font-bold text-gray-900">{job.title}</h2>
            <p className="text-sm text-gray-500 mt-0.5">
              {job.care_home?.business_name || 'Care Home'} · {job.location || job.postcode || ''}
            </p>
          </div>
          <button
            onClick={onClose}
            className="flex-shrink-0 p-2 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Body */}
        <div className="px-6 py-5 space-y-6">
          {/* Key info chips */}
          <div className="flex flex-wrap gap-3">
            <div className="flex items-center gap-1.5 bg-sage-50 text-sage-700 text-sm px-3 py-1.5 rounded-full font-medium">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              {SHIFT_LABELS[job.shift_type] || job.shift_type}
            </div>
            {(job.hourly_rate_min || job.hourly_rate_max) && (
              <div className="flex items-center gap-1.5 bg-ocean-50 text-ocean-700 text-sm px-3 py-1.5 rounded-full font-medium">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                £{job.hourly_rate_min ?? '?'}–£{job.hourly_rate_max ?? '?'}/hr
              </div>
            )}
            {job.hours_per_week && (
              <div className="flex items-center gap-1.5 bg-gray-50 text-gray-600 text-sm px-3 py-1.5 rounded-full font-medium">
                {job.hours_per_week} hrs/week
              </div>
            )}
          </div>

          {/* Description */}
          {job.description && (
            <div>
              <h3 className="text-sm font-semibold text-gray-700 mb-2">About the Role</h3>
              <p className="text-sm text-gray-600 leading-relaxed whitespace-pre-line">{job.description}</p>
            </div>
          )}

          {/* Required Qualifications */}
          {job.required_qualifications?.length > 0 && (
            <div>
              <h3 className="text-sm font-semibold text-gray-700 mb-2">Required Qualifications</h3>
              <ul className="space-y-1">
                {job.required_qualifications.map((q, i) => (
                  <li key={i} className="flex items-center gap-2 text-sm text-gray-600">
                    <svg className="w-4 h-4 text-sage-500 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    {q}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Benefits */}
          {job.benefits?.length > 0 && (
            <div>
              <h3 className="text-sm font-semibold text-gray-700 mb-2">Benefits</h3>
              <ul className="space-y-1">
                {job.benefits.map((b, i) => (
                  <li key={i} className="flex items-center gap-2 text-sm text-gray-600">
                    <svg className="w-4 h-4 text-terracotta-500 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    {b}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="sticky bottom-0 bg-white border-t border-gray-100 px-6 py-4 rounded-b-2xl flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 border border-gray-200 text-gray-600 hover:bg-gray-50 rounded-xl px-4 py-2.5 font-medium text-sm transition-colors"
          >
            Close
          </button>
          {hasApplied ? (
            <div className={`flex-1 text-center text-sm font-medium px-4 py-2.5 rounded-xl capitalize ${STATUS_COLORS[applicationStatus] || 'bg-gray-100 text-gray-500'}`}>
              {applicationStatus}
            </div>
          ) : (
            <button
              onClick={() => { onApply && onApply(job); onClose(); }}
              className="flex-1 bg-sage-600 hover:bg-sage-700 text-white rounded-xl px-4 py-2.5 font-medium text-sm transition-colors"
            >
              Apply Now
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default JobDetailsModal;
