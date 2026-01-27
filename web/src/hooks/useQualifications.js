import { useState, useEffect, useCallback } from 'react';
import { publicApi } from '../services/api';

/**
 * Custom hook to fetch qualifications with worker counts
 * @returns {object} - { qualifications, loading, error, refresh }
 */
const useQualifications = () => {
  const [qualifications, setQualifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchQualifications = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await publicApi.getQualifications();
      setQualifications(data.qualifications || []);
    } catch (err) {
      console.error('Error fetching qualifications:', err);
      setError(err.message || 'Failed to load qualifications');
      
      // Set empty fallback so page doesn't break
      setQualifications([]);
    } finally {
      setLoading(false);
    }
  }, []);

  // Initial fetch
  useEffect(() => {
    fetchQualifications();
  }, [fetchQualifications]);

  return {
    qualifications,
    loading,
    error,
    refresh: fetchQualifications,
  };
};

export default useQualifications;
