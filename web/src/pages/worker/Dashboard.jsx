import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { workerApi } from '../../services/api';
import StatCard from '../../components/worker/StatCard';

const STATUS_COLORS = {
  pending: 'bg-yellow-100 text-yellow-700',
  reviewed: 'bg-blue-100 text-blue-700',
  shortlisted: 'bg-sage-100 text-sage-700',
  rejected: 'bg-red-100 text-red-700',
  withdrawn: 'bg-gray-100 text-gray-500',
};

const WorkerDashboard = () => {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    workerApi.getDashboard()
      .then(setData)
      .catch(() => setError('Failed to load dashboard. Please refresh.'))
      .finally(() => setLoading(false));
  }, []);

  const handleLogout = async () => {
    await logout();
    navigate('/');
  };

  const workerName = data?.worker_name || user?.worker_profile?.first_name || 'there';

  return (
    <div className="min-h-screen bg-gradient-to-br from-sage-50 via-white to-ocean-50">
      {/* Top bar */}
      <header className="bg-white border-b border-gray-100 sticky top-0 z-10">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 bg-gradient-to-br from-sage-400 to-terracotta-400 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-lg">V</span>
            </div>
            <span className="font-bold text-charcoal text-lg">Vicarity</span>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-sm text-gray-500 hidden sm:block">{user?.email}</span>
            <button
              onClick={handleLogout}
              className="text-sm text-gray-500 hover:text-red-600 transition-colors"
            >
              Logout
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 sm:px-6 py-8 space-y-8">
        {/* Welcome */}
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">
            Welcome back, {workerName}! 👋
          </h1>
          <p className="text-gray-500 mt-1">Here's what's happening on your account.</p>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-24 bg-gray-100 rounded-xl animate-pulse" />
            ))}
          </div>
        ) : error ? (
          <div className="bg-red-50 border border-red-200 text-red-700 rounded-xl p-4">{error}</div>
        ) : (
          <>
            {/* Profile completion */}
            {data.profile_completion < 100 && (
              <div className="bg-white rounded-xl border border-sage-200 p-5">
                <div className="flex items-center justify-between mb-3">
                  <div>
                    <p className="font-semibold text-gray-900">Complete your profile</p>
                    <p className="text-sm text-gray-500">Your profile is {data.profile_completion}% complete</p>
                  </div>
                  <button
                    onClick={() => navigate('/onboarding/worker')}
                    className="text-sm bg-sage-600 hover:bg-sage-700 text-white px-4 py-2 rounded-lg transition-colors font-medium"
                  >
                    Continue
                  </button>
                </div>
                <div className="w-full bg-gray-100 rounded-full h-2">
                  <div
                    className="bg-sage-500 h-2 rounded-full transition-all duration-500"
                    style={{ width: `${data.profile_completion}%` }}
                  />
                </div>
              </div>
            )}

            {/* Stats */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <StatCard
                color="sage"
                label="Profile Completion"
                value={`${data.profile_completion}%`}
                icon={
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                }
              />
              <StatCard
                color="ocean"
                label="Applications Submitted"
                value={data.applications_count}
                icon={
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                }
              />
              <StatCard
                color="terracotta"
                label="Active Jobs Available"
                value={data.active_jobs_count}
                icon={
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                }
              />
            </div>

            {/* Quick actions */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <button
                onClick={() => navigate('/dashboard/worker/jobs')}
                className="bg-white rounded-xl border border-gray-200 hover:border-sage-300 hover:shadow-soft p-5 text-left transition-all group"
              >
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-10 h-10 bg-sage-100 text-sage-600 rounded-lg flex items-center justify-center group-hover:bg-sage-200 transition-colors">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                  </div>
                  <span className="font-semibold text-gray-900">Browse Jobs</span>
                </div>
                <p className="text-sm text-gray-500">{data.active_jobs_count} active positions available</p>
              </button>

              <button
                onClick={() => navigate('/dashboard/worker/jobs?tab=applications')}
                className="bg-white rounded-xl border border-gray-200 hover:border-ocean-300 hover:shadow-soft p-5 text-left transition-all group"
              >
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-10 h-10 bg-ocean-100 text-ocean-600 rounded-lg flex items-center justify-center group-hover:bg-ocean-200 transition-colors">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                    </svg>
                  </div>
                  <span className="font-semibold text-gray-900">My Applications</span>
                </div>
                <p className="text-sm text-gray-500">{data.applications_count} application{data.applications_count !== 1 ? 's' : ''} submitted</p>
              </button>
            </div>

            {/* Recent applications */}
            {data.recent_applications?.length > 0 && (
              <div>
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-lg font-semibold text-gray-900">Recent Applications</h2>
                  <button
                    onClick={() => navigate('/dashboard/worker/jobs?tab=applications')}
                    className="text-sm text-ocean-600 hover:underline"
                  >
                    View all
                  </button>
                </div>
                <div className="bg-white rounded-xl border border-gray-200 divide-y divide-gray-100">
                  {data.recent_applications.map((app) => (
                    <div key={app.id} className="px-5 py-4 flex items-center justify-between gap-4">
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-gray-900 truncate">{app.job?.title || 'Unknown role'}</p>
                        <p className="text-sm text-gray-500">
                          {app.job?.care_home_name || ''}{app.job?.location ? ` · ${app.job.location}` : ''}
                        </p>
                      </div>
                      <span className={`text-xs font-medium px-2.5 py-1 rounded-full capitalize flex-shrink-0 ${STATUS_COLORS[app.status] || 'bg-gray-100 text-gray-500'}`}>
                        {app.status}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </>
        )}
      </main>
    </div>
  );
};

export default WorkerDashboard;
