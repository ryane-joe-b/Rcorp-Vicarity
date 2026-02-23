import React from 'react';
import { useNavigate } from 'react-router-dom';

const STATUS_COLORS = {
  pending: 'bg-yellow-400',
  reviewed: 'bg-blue-400',
  shortlisted: 'bg-green-400',
  rejected: 'bg-red-400',
  withdrawn: 'bg-gray-400',
};

const timeAgo = (isoString) => {
  const now = Date.now();
  const then = new Date(isoString).getTime();
  const diff = Math.floor((now - then) / 1000);

  if (diff < 60) return 'just now';
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  if (diff < 604800) return `${Math.floor(diff / 86400)}d ago`;
  return new Date(isoString).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' });
};

const ActivityFeed = ({ activities = [] }) => {
  const navigate = useNavigate();

  if (activities.length === 0) {
    return (
      <div className="bg-white rounded-xl border border-gray-200 p-5">
        <p className="font-semibold text-gray-900 mb-3">Recent Activity</p>
        <p className="text-sm text-gray-400 py-4 text-center">No applications yet. Browse jobs to get started.</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-5">
      <p className="font-semibold text-gray-900 mb-4">Recent Activity</p>
      <ol className="relative border-l border-gray-200 space-y-4 ml-1">
        {activities.map((app) => (
          <li key={app.id} className="ml-4">
            <span
              className={`absolute -left-1.5 mt-1.5 w-3 h-3 rounded-full border-2 border-white ${STATUS_COLORS[app.status] || 'bg-gray-400'}`}
            />
            <p className="text-sm text-gray-800">
              Applied to{' '}
              <span className="font-semibold">{app.job?.title || 'a role'}</span>
              {app.job?.care_home_name && (
                <> at <span className="font-semibold">{app.job.care_home_name}</span></>
              )}
            </p>
            <p className="text-xs text-gray-400 mt-0.5">{timeAgo(app.created_at)}</p>
          </li>
        ))}
      </ol>
      <button
        onClick={() => navigate('/dashboard/worker/jobs?tab=applications')}
        className="mt-4 text-sm text-ocean-600 hover:underline"
      >
        View all applications →
      </button>
    </div>
  );
};

export default ActivityFeed;
