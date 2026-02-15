import React, { useEffect, useState, useCallback, useRef } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { workerApi } from '../../services/api';
import JobCard from '../../components/worker/JobCard';
import JobFilters from '../../components/worker/JobFilters';
import JobDetailsModal from '../../components/worker/JobDetailsModal';
import ApplicationModal from '../../components/worker/ApplicationModal';

const TABS = [
  { key: 'jobs', label: 'Browse Jobs' },
  { key: 'applications', label: 'My Applications' },
];

const STATUS_COLORS = {
  pending: 'bg-yellow-100 text-yellow-700',
  reviewed: 'bg-blue-100 text-blue-700',
  shortlisted: 'bg-sage-100 text-sage-700',
  rejected: 'bg-red-100 text-red-700',
  withdrawn: 'bg-gray-100 text-gray-500',
};

const WorkerJobs = () => {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const { logout } = useAuth();

  const initialTab = searchParams.get('tab') === 'applications' ? 'applications' : 'jobs';
  const [activeTab, setActiveTab] = useState(initialTab);

  const [jobs, setJobs] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const perPage = 12;

  const [applications, setApplications] = useState([]);
  const [loadingJobs, setLoadingJobs] = useState(false);
  const [loadingApps, setLoadingApps] = useState(false);
  const [jobsError, setJobsError] = useState('');
  const [appsError, setAppsError] = useState('');

  const [filters, setFilters] = useState({
    shift_type: '',
    location: '',
    min_rate: '',
    max_rate: '',
  });

  const [selectedJob, setSelectedJob] = useState(null);
  const [applyJob, setApplyJob] = useState(null);
  const [toast, setToast] = useState('');

  const debounceRef = useRef(null);

  // Build applicationStatus map: job_id -> status
  const applicationMap = applications.reduce((acc, app) => {
    if (app.job_id) acc[app.job_id] = app.status;
    return acc;
  }, {});

  const fetchJobs = useCallback(async (f, p) => {
    setLoadingJobs(true);
    setJobsError('');
    try {
      const params = { page: p, per_page: perPage };
      if (f.shift_type) params.shift_type = f.shift_type;
      if (f.location) params.location = f.location;
      if (f.min_rate !== '') params.min_rate = f.min_rate;
      if (f.max_rate !== '') params.max_rate = f.max_rate;
      const res = await workerApi.getJobs(params);
      setJobs(res.jobs);
      setTotal(res.total);
    } catch {
      setJobsError('Failed to load jobs. Please try again.');
    } finally {
      setLoadingJobs(false);
    }
  }, []);

  const fetchApplications = useCallback(async () => {
    setLoadingApps(true);
    setAppsError('');
    try {
      const res = await workerApi.getApplications();
      setApplications(res);
    } catch {
      setAppsError('Failed to load applications.');
    } finally {
      setLoadingApps(false);
    }
  }, []);

  // Initial load
  useEffect(() => {
    fetchJobs(filters, 1);
    fetchApplications();
  }, []);  // eslint-disable-line react-hooks/exhaustive-deps

  // Debounced filter change
  const handleFiltersChange = (newFilters) => {
    setFilters(newFilters);
    setPage(1);
    clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      fetchJobs(newFilters, 1);
    }, 400);
  };

  const handlePageChange = (p) => {
    setPage(p);
    fetchJobs(filters, p);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleApply = async (data) => {
    await workerApi.applyToJob(data);
    setToast('Application submitted successfully!');
    setTimeout(() => setToast(''), 3500);
    fetchApplications();
  };

  const handleWithdraw = async (appId) => {
    try {
      await workerApi.withdrawApplication(appId);
      setToast('Application withdrawn.');
      setTimeout(() => setToast(''), 3500);
      fetchApplications();
    } catch {
      setToast('Failed to withdraw application.');
      setTimeout(() => setToast(''), 3500);
    }
  };

  const totalPages = Math.ceil(total / perPage);

  return (
    <div className="min-h-screen bg-gradient-to-br from-sage-50 via-white to-ocean-50">
      {/* Top bar */}
      <header className="bg-white border-b border-gray-100 sticky top-0 z-10">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button onClick={() => navigate('/dashboard/worker')} className="flex items-center gap-2 text-gray-500 hover:text-gray-800 transition-colors">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              <span className="text-sm font-medium">Dashboard</span>
            </button>
          </div>
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 bg-gradient-to-br from-sage-400 to-terracotta-400 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-lg">V</span>
            </div>
          </div>
          <button
            onClick={async () => { await logout(); navigate('/'); }}
            className="text-sm text-gray-500 hover:text-red-600 transition-colors"
          >
            Logout
          </button>
        </div>
      </header>

      {/* Tabs */}
      <div className="bg-white border-b border-gray-100">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 flex gap-6">
          {TABS.map((tab) => (
            <button
              key={tab.key}
              onClick={() => {
                setActiveTab(tab.key);
                setSearchParams(tab.key === 'applications' ? { tab: 'applications' } : {});
              }}
              className={`py-4 text-sm font-medium border-b-2 transition-colors ${
                activeTab === tab.key
                  ? 'border-sage-500 text-sage-700'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              {tab.label}
              {tab.key === 'applications' && applications.length > 0 && (
                <span className="ml-2 bg-ocean-100 text-ocean-700 text-xs px-1.5 py-0.5 rounded-full">
                  {applications.length}
                </span>
              )}
            </button>
          ))}
        </div>
      </div>

      <main className="max-w-6xl mx-auto px-4 sm:px-6 py-6">
        {/* Toast */}
        {toast && (
          <div className="fixed top-20 left-1/2 -translate-x-1/2 z-50 bg-gray-900 text-white text-sm px-5 py-3 rounded-xl shadow-lg">
            {toast}
          </div>
        )}

        {activeTab === 'jobs' && (
          <div className="flex gap-6">
            {/* Sidebar filters */}
            <aside className="hidden md:block w-60 flex-shrink-0">
              <JobFilters filters={filters} onChange={handleFiltersChange} />
            </aside>

            {/* Jobs grid */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between mb-4">
                <p className="text-sm text-gray-500">
                  {loadingJobs ? 'Loading…' : `${total} job${total !== 1 ? 's' : ''} found`}
                </p>
              </div>

              {/* Mobile filters */}
              <div className="md:hidden mb-4">
                <JobFilters filters={filters} onChange={handleFiltersChange} />
              </div>

              {jobsError && (
                <div className="bg-red-50 border border-red-200 text-red-700 rounded-xl p-4 mb-4">{jobsError}</div>
              )}

              {loadingJobs ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {Array.from({ length: 6 }).map((_, i) => (
                    <div key={i} className="h-48 bg-gray-100 rounded-xl animate-pulse" />
                  ))}
                </div>
              ) : jobs.length === 0 ? (
                <div className="text-center py-16 text-gray-500">
                  <svg className="w-12 h-12 mx-auto mb-3 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                  <p className="font-medium">No jobs found</p>
                  <p className="text-sm mt-1">Try adjusting your filters</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {jobs.map((job) => (
                    <JobCard
                      key={job.id}
                      job={job}
                      applicationStatus={applicationMap[job.id]}
                      onViewDetails={(j) => setSelectedJob(j)}
                      onApply={(j) => setApplyJob(j)}
                    />
                  ))}
                </div>
              )}

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="flex justify-center gap-2 mt-8">
                  <button
                    onClick={() => handlePageChange(page - 1)}
                    disabled={page === 1}
                    className="px-3 py-2 text-sm border border-gray-200 rounded-lg disabled:opacity-40 hover:bg-gray-50 transition-colors"
                  >
                    Previous
                  </button>
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
                    <button
                      key={p}
                      onClick={() => handlePageChange(p)}
                      className={`w-9 h-9 text-sm rounded-lg transition-colors ${
                        p === page
                          ? 'bg-sage-600 text-white'
                          : 'border border-gray-200 hover:bg-gray-50'
                      }`}
                    >
                      {p}
                    </button>
                  ))}
                  <button
                    onClick={() => handlePageChange(page + 1)}
                    disabled={page === totalPages}
                    className="px-3 py-2 text-sm border border-gray-200 rounded-lg disabled:opacity-40 hover:bg-gray-50 transition-colors"
                  >
                    Next
                  </button>
                </div>
              )}
            </div>
          </div>
        )}

        {activeTab === 'applications' && (
          <div>
            <h2 className="text-lg font-semibold text-gray-900 mb-4">My Applications</h2>

            {appsError && (
              <div className="bg-red-50 border border-red-200 text-red-700 rounded-xl p-4 mb-4">{appsError}</div>
            )}

            {loadingApps ? (
              <div className="space-y-3">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="h-20 bg-gray-100 rounded-xl animate-pulse" />
                ))}
              </div>
            ) : applications.length === 0 ? (
              <div className="text-center py-16 text-gray-500">
                <svg className="w-12 h-12 mx-auto mb-3 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                <p className="font-medium">No applications yet</p>
                <p className="text-sm mt-1">Browse jobs and apply to get started</p>
                <button
                  onClick={() => setActiveTab('jobs')}
                  className="mt-4 text-sm bg-sage-600 hover:bg-sage-700 text-white px-5 py-2 rounded-lg transition-colors"
                >
                  Browse Jobs
                </button>
              </div>
            ) : (
              <div className="bg-white rounded-xl border border-gray-200 divide-y divide-gray-100">
                {applications.map((app) => (
                  <div key={app.id} className="px-5 py-4 flex items-center gap-4">
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-gray-900 truncate">{app.job?.title || 'Unknown role'}</p>
                      <p className="text-sm text-gray-500">
                        {app.job?.care_home?.business_name || ''}
                        {app.job?.location ? ` · ${app.job.location}` : ''}
                      </p>
                      <p className="text-xs text-gray-400 mt-0.5">
                        Applied {new Date(app.created_at).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}
                      </p>
                    </div>
                    <div className="flex items-center gap-3 flex-shrink-0">
                      <span className={`text-xs font-medium px-2.5 py-1 rounded-full capitalize ${STATUS_COLORS[app.status] || 'bg-gray-100 text-gray-500'}`}>
                        {app.status}
                      </span>
                      {app.status !== 'withdrawn' && (
                        <button
                          onClick={() => handleWithdraw(app.id)}
                          className="text-xs text-gray-400 hover:text-red-500 transition-colors"
                          title="Withdraw application"
                        >
                          Withdraw
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </main>

      {/* Modals */}
      {selectedJob && (
        <JobDetailsModal
          job={selectedJob}
          applicationStatus={applicationMap[selectedJob.id]}
          onClose={() => setSelectedJob(null)}
          onApply={(j) => { setSelectedJob(null); setApplyJob(j); }}
        />
      )}

      {applyJob && (
        <ApplicationModal
          job={applyJob}
          onClose={() => setApplyJob(null)}
          onSubmit={handleApply}
        />
      )}
    </div>
  );
};

export default WorkerJobs;
