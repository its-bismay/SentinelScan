import { useState, useCallback } from 'react';
import axiosClient from '../api/axiosClient';

export const useScans = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const getScansList = useCallback(async (params = {}) => {
    setLoading(true);
    setError(null);
    try {
      const res = await axiosClient.get('/scans', { params });
      setLoading(false);
      return res.data;
    } catch (err) {
      const msg = err.response?.data?.message || 'Failed to fetch scans';
      setError(msg);
      setLoading(false);
      throw err;
    }
  }, []);

  const getScanDetails = useCallback(async (id) => {
    setLoading(true);
    setError(null);
    try {
      const res = await axiosClient.get(`/scans/${id}`);
      setLoading(false);
      return res.data?.scan;
    } catch (err) {
      const msg = err.response?.data?.message || 'Failed to fetch scan details';
      setError(msg);
      setLoading(false);
      throw err;
    }
  }, []);

  const startScan = useCallback(async (targetUrl, options = {}) => {
    setLoading(true);
    setError(null);
    try {
      const res = await axiosClient.post('/scans', { targetUrl, options });
      setLoading(false);
      return res.data?.scan;
    } catch (err) {
      const msg = err.response?.data?.message || 'Failed to trigger scan';
      setError(msg);
      setLoading(false);
      throw err;
    }
  }, []);

  const deleteScanItem = useCallback(async (id) => {
    setLoading(true);
    setError(null);
    try {
      await axiosClient.delete(`/scans/${id}`);
      setLoading(false);
    } catch (err) {
      const msg = err.response?.data?.message || 'Failed to delete scan';
      setError(msg);
      setLoading(false);
      throw err;
    }
  }, []);

  return {
    loading,
    error,
    getScansList,
    getScanDetails,
    startScan,
    deleteScanItem,
  };
};
