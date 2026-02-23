import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { workerApi } from '../../services/api';
import StatCard from '../../components/worker/StatCard';
import AvailabilityToggle from '../../components/worker/AvailabilityToggle';
import ProfileStrengthMeter from '../../components/worker/ProfileStrengthMeter';
import BadgesRow from '../../components/worker/BadgesRow';
import ActivityFeed from '../../components/worker/ActivityFeed';
import SkillGapCard from '../../components/worker/SkillGapCard';
import RecommendedJobs from '../../components/worker/RecommendedJobs';

const getGreeting = () => {
  const hour = new Date().getHours();
  if (hour < 12) return 'Good morning';
  if (hour < 18) return 'Good afternoon';
  return 'Good evening';
};

const formatDayDate = () => {
  return new Date().toLocaleDateString('en-GB', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
  });
};

const MARKET_TILES = [
  {
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
      </svg>
    ),
    value: 'Care demand ↑',
    label: 'Trending this week',
    color: 'bg-green-50 text-green-700',
  },
  {
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
      </svg>
    ),
    value: '£15.40/hr',
    label: 'Avg rate in your area',
    color: 'bg-ocean-50 text-ocean-700',
  },
  {
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
      </svg>
    ),
    value: '12 new shifts',
    label: 'Added today',
    color: 'bg-terracotta-50 text-terracotta-700',
  },
];

const WorkerDashboard = () => {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [availability, setAvailability] = useState(false);
  const [availabilityLoading, setAvailabilityLoading] = useState(false);

  useEffect(() => {
    workerApi.getDashboard()
      .then((d) => {
        setData(d);
        setAvailability(d.is_available ?? false);
      })
      .catch(() => setError('Failed to load dashboard. Please refresh.'))
      .finally(() => setLoading(false));
  }, []);

  const handleLogout = async () => {
    await logout();
    navigate('/');
  };

  const handleAvailabilityChange = async (val) => {
    setAvailability(val); // optimistic
    setAvailabilityLoading(true);
    try {
      const res = await workerApi.updateAvailability(val);
      setAvailability(res.is_available);
    } catch {
      setAvailability(!val); // revert on error
    } finally {
      setAvailabilityLoading(false);
    }
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

      <main className="max-w-6xl mx-auto px-4 sm:px-6 py-8 space-y-6">
        {/* Welcome row */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">
              {getGreeting()}, {workerName}!
            </h1>
            <p className="text-gray-400 text-sm mt-0.5">{formatDayDate()}</p>
          </div>
          {!loading && !error && (
            <AvailabilityToggle
              isAvailable={availability}
              onChange={handleAvailabilityChange}
              loading={availabilityLoading}
            />
          )}
        </div>

        {loading ? (
          <div className="space-y-4">
            <div className="h-20 bg-gray-100 rounded-xl animate-pulse" />
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-24 bg-gray-100 rounded-xl animate-pulse" />
              ))}
            </div>
          </div>
        ) : error ? (
          <div className="bg-red-50 border border-red-200 text-red-700 rounded-xl p-4">{error}</div>
        ) : (
          <>
            {/* Profile strength meter */}
            <ProfileStrengthMeter
              percentage={data.profile_completion}
              tips={data.profile_boost_tips || []}
            />

            {/* Stats */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <StatCard
                color="ocean"
                label="Applications"
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
              <StatCard
                color="sage"
                label="Shortlisted"
                value={data.shortlisted_count ?? 0}
                icon={
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
                  </svg>
                }
              />
            </div>

            {/* Recommended jobs */}
            <RecommendedJobs
              jobs={data.recommended_jobs || []}
              loading={false}
              onViewAll={() => navigate('/dashboard/worker/jobs')}
            />

            {/* Two-column: activity + badges/skill gaps */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Left: activity feed */}
              <ActivityFeed activities={data.recent_applications || []} />

              {/* Right: badges + skill gaps */}
              <div className="space-y-4">
                <BadgesRow badges={data.badges || []} />
                <SkillGapCard gaps={data.skill_gaps || []} />
              </div>
            </div>

            {/* Market insights */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {MARKET_TILES.map((tile, i) => (
                <div
                  key={i}
                  className={`rounded-xl border border-gray-100 p-4 flex items-center gap-3 ${tile.color}`}
                >
                  <div className="flex-shrink-0 opacity-80">{tile.icon}</div>
                  <div>
                    <p className="font-semibold text-sm">{tile.value}</p>
                    <p className="text-xs opacity-70">{tile.label}</p>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </main>
    </div>
  );
};

export default WorkerDashboard;
