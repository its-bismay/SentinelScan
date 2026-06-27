import { useEffect, useRef, useState, useCallback } from 'react';
import axiosClient from '../api/axiosClient';

const MAX_SSE_RETRIES = 5;
const POLL_INTERVAL_MS = 4000;
const SSE_RETRY_DELAY_MS = 2500;

/**
 * Tracks a scan's real-time progress via SSE, with automatic reconnection
 * and a polling fallback when SSE is unavailable (e.g. proxy strips chunked encoding).
 */
export const useScanProgress = (scanId) => {
  const [logs, setLogs]     = useState([]);
  const [status, setStatus] = useState('queued');
  const [score, setScore]   = useState(null);
  const [grade, setGrade]   = useState(null);
  const [error, setError]   = useState(null);
  const [isDone, setIsDone] = useState(false);

  const esRef        = useRef(null);
  const retries      = useRef(0);
  const pollTimer    = useRef(null);
  const seenLogIds   = useRef(new Set());
  const usePoll      = useRef(false);   // flips to true if SSE keeps failing
  const isMounted    = useRef(true);

  const appendLog = useCallback((log) => {
    // Deduplicate by message + timestamp
    const key = `${log.timestamp}:${log.message}`;
    if (seenLogIds.current.has(key)) return;
    seenLogIds.current.add(key);
    setLogs((prev) => [...prev, log]);
  }, []);

  // ─── Polling fallback ────────────────────────────────────────────────────────
  const startPolling = useCallback(() => {
    if (!isMounted.current || isDone) return;

    const poll = async () => {
      if (!isMounted.current) return;
      try {
        const res = await axiosClient.get(`/scans/${scanId}`);
        const scan = res.data?.scan;
        if (!scan) return;

        if (scan.status) setStatus(scan.status);
        if (scan.score != null) setScore(scan.score);
        if (scan.grade) setGrade(scan.grade);

        if (scan.status === 'completed' || scan.status === 'failed') {
          setIsDone(true);
          return; // stop polling
        }
      } catch (_) { /* ignore transient errors */ }

      if (isMounted.current) {
        pollTimer.current = setTimeout(poll, POLL_INTERVAL_MS);
      }
    };

    poll();
  }, [scanId, isDone]);

  // ─── SSE connection ──────────────────────────────────────────────────────────
  const connectSSE = useCallback(() => {
    if (!scanId || !isMounted.current || isDone) return;

    const baseURL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
    const sseUrl  = `${baseURL}/scans/${scanId}/progress`;

    const es = new EventSource(sseUrl, { withCredentials: true });
    esRef.current = es;

    es.onmessage = (event) => {
      if (!isMounted.current) return;
      try {
        const data = JSON.parse(event.data);

        if (data.type === 'log') {
          appendLog(data);
        } else if (data.type === 'status') {
          setStatus(data.status);
          if (data.score != null) setScore(data.score);
          if (data.grade)         setGrade(data.grade);
        } else if (data.type === 'done') {
          setStatus(data.status);
          setIsDone(true);
          es.close();
        } else if (data.type === 'timeout') {
          setError('Scan monitoring timed out — the scan may still be running in the background.');
          setIsDone(true);
          es.close();
        }
      } catch (_) { /* ignore parse errors */ }
    };

    es.onerror = () => {
      es.close();
      esRef.current = null;

      if (!isMounted.current || isDone) return;

      retries.current += 1;

      if (retries.current >= MAX_SSE_RETRIES) {
        // Give up on SSE — switch to polling silently
        usePoll.current = true;
        startPolling();
        return;
      }

      // Exponential back-off before reconnecting
      const delay = SSE_RETRY_DELAY_MS * Math.min(retries.current, 3);
      setTimeout(() => {
        if (isMounted.current && !isDone) connectSSE();
      }, delay);
    };
  }, [scanId, isDone, appendLog, startPolling]);

  // ─── Lifecycle ───────────────────────────────────────────────────────────────
  useEffect(() => {
    if (!scanId) return;
    isMounted.current  = true;
    retries.current    = 0;
    usePoll.current    = false;
    seenLogIds.current = new Set();

    // Small initial delay so the server has time to register the scan before SSE connects
    const initTimer = setTimeout(() => connectSSE(), 600);

    return () => {
      isMounted.current = false;
      clearTimeout(initTimer);
      clearTimeout(pollTimer.current);
      esRef.current?.close();
    };
  }, [scanId]); // eslint-disable-line react-hooks/exhaustive-deps

  // ─── When done — do a final data fetch to get final score/grade ──────────────
  useEffect(() => {
    if (!isDone || !scanId) return;
    axiosClient.get(`/scans/${scanId}`)
      .then((res) => {
        const scan = res.data?.scan;
        if (!scan) return;
        setStatus(scan.status);
        if (scan.score != null) setScore(scan.score);
        if (scan.grade) setGrade(scan.grade);
      })
      .catch(() => {});
  }, [isDone, scanId]);

  return { logs, status, score, grade, error, isDone };
};
