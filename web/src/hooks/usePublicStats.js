import { useState, useEffect, useCallback } from 'react';
import { publicApi } from '../services/api';

/**
 * Custom hook to fetch and auto-refresh public statistics
 * @param {number} refreshInterval - Refresh interval in milliseconds (default: 5 minutes)
 * @returns {object} - { stats, loading, error, refresh }
 */
const usePublicStats = (refreshInterval = 5 * 60 * 1000) => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchStats = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await publicApi.getStats();
      setStats(data);
    } catch (err) {
      console.error('Error fetching stats:', err);
      setError(err.message || 'Failed to load statistics');
      
      // Set fallback data so page doesn't break
      setStats({
        total_workers: 0,
        total_care_homes: 0,
        completed_profiles: 0,
        verified_care_homes: 0,
        display: {
          workers: '0+',
          care_homes: '0+',
          completed: '0',
          verified: '0',
        },
      });
    } finally {
      setLoading(false);
    }
  }, []);

  // Initial fetch
  useEffect(() => {
    fetchStats();
  }, [fetchStats]);

  // Auto-refresh on interval
  useEffect(() => {
    if (refreshInterval > 0) {
      const interval = setInterval(fetchStats, refreshInterval);
      return () => clearInterval(interval);
    }
  }, [fetchStats, refreshInterval]);

  return {
    stats,
    loading,
    error,
    refresh: fetchStats,
  };
};

export default usePublicStats;
