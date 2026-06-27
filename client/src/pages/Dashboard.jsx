import React, { useState, useEffect, useRef } from 'react';
import ScanForm from '../components/scan/ScanForm';
import ProgressTracker from '../components/ui/ProgressTracker';
import ScanCard from '../components/scan/ScanCard';
import { useScans } from '../hooks/useScans';
import { useScanProgress } from '../hooks/useScanProgress';
import { ShieldCheck, ShieldAlert, Clock, ChevronRight, RefreshCw } from 'lucide-react';
import toast from 'react-hot-toast';
import { Link, useNavigate } from 'react-router-dom';

// Simulated progress bar that increments until scan is done
const ScanProgressBar = ({ status, isDone }) => {
  const [pct, setPct] = useState(0);
  const timer = useRef(null);

  useEffect(() => {
    if (isDone) {
      setPct(100);
      return;
    }
    if (status === 'queued' || status === 'running') {
      timer.current = setInterval(() => {
        setPct((p) => {
          // Slow down as it approaches 90% — only jumps to 100 on done
          if (p >= 90) return p + 0.05;
          if (p >= 70) return p + 0.2;
          return p + 0.8;
        });
      }, 300);
    }
    return () => clearInterval(timer.current);
  }, [status, isDone]);

  const clampedPct = Math.min(pct, isDone ? 100 : 92);

  const barColor =
    status === 'failed' ? 'bg-error' :
    isDone              ? 'bg-success' :
                          'bg-primary';

  return (
    <div className="w-full flex flex-col gap-1">
      <div className="flex justify-between text-xs font-semibold text-base-content/60">
        <span>{isDone ? (status === 'failed' ? 'Scan failed' : 'Scan complete!') : 'Scanning in progress...'}</span>
        <span>{Math.round(clampedPct)}%</span>
      </div>
      <div className="w-full h-2 bg-base-300 rounded-full overflow-hidden">
        <div
          className={`h-full rounded-full transition-all duration-500 ${barColor} ${!isDone ? 'animate-pulse' : ''}`}
          style={{ width: `${clampedPct}%` }}
        />
      </div>
    </div>
  );
};

const Dashboard = () => {
  const { startScan, getScansList, deleteScanItem } = useScans();
  const [activeScanId, setActiveScanId] = useState(null);
  const [recentScans, setRecentScans]   = useState([]);
  const [loadingList, setLoadingList]   = useState(false);
  const [totalMetrics, setTotalMetrics] = useState({ total: 0, completed: 0, criticals: 0 });

  const navigate = useNavigate();

  const { logs, status, score, grade, error: sseError, isDone } = useScanProgress(activeScanId);

  const fetchRecentScans = async () => {
    setLoadingList(true);
    try {
      const res = await getScansList();
      if (res?.success) {
        setRecentScans(res.scans.slice(0, 4));
        const completed = res.scans.filter(s => s.status === 'completed');
        const crits = completed.reduce((sum, s) => sum + (s.criticalCount || 0) + (s.highCount || 0), 0);
        setTotalMetrics({ total: res.scans.length, completed: completed.length, criticals: crits });
      }
    } finally {
      setLoadingList(false);
    }
  };

  useEffect(() => { fetchRecentScans(); }, []);

  // React to scan completion / failure
  useEffect(() => {
    if (!isDone || !activeScanId) return;

    fetchRecentScans(); // refresh sidebar cards immediately

    if (status === 'completed') {
      toast.success('Scan complete! Check the terminal and then view your report.', { duration: 4000 });
      // No auto-navigate — user reads logs first, then clicks the button
    }

    if (status === 'failed') {
      toast.error('Scan encountered errors. Check the log for details.');
    }
  }, [isDone, status, activeScanId]);

  // SSE error — don't show "connection lost" if the scan itself is done
  useEffect(() => {
    if (sseError && activeScanId && !isDone) {
      toast('Still waiting for scan results... switching to polling.', {
        icon: '📡',
        duration: 3000,
      });
    }
  }, [sseError, activeScanId, isDone]);

  const handleStartScan = async (targetUrl, options) => {
    try {
      const scanObj = await startScan(targetUrl, options);
      if (scanObj?._id) {
        setActiveScanId(scanObj._id);
        toast.success('Scan queued! Live terminal starting shortly...');
      }
    } catch (_) { /* handled in hook */ }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this scan record?')) return;
    try {
      await deleteScanItem(id);
      toast.success('Scan deleted');
      fetchRecentScans();
    } catch (_) {
      toast.error('Failed to delete scan');
    }
  };

  const isScanning = !!activeScanId && !isDone;

  return (
    <div className="flex flex-col gap-6 md:gap-8">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl md:text-3xl font-bold font-display text-base-content">
            Dashboard Control Panel
          </h2>
          <p className="text-xs text-base-content/60 mt-0.5">
            Submit assets, track active telemetry, and review security grades.
          </p>
        </div>
        <button
          onClick={fetchRecentScans}
          disabled={loadingList}
          className="btn btn-ghost btn-sm gap-1 text-base-content/60"
          title="Refresh scan list"
        >
          <RefreshCw className={`h-4 w-4 ${loadingList ? 'animate-spin' : ''}`} />
        </button>
      </div>

      {/* Quick Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="stat bg-base-100 border border-base-content/10 rounded-2xl p-4 shadow-sm flex items-center gap-4">
          <div className="p-3 bg-primary/10 text-primary rounded-xl">
            <Clock className="h-6 w-6" />
          </div>
          <div>
            <div className="stat-title text-4xs uppercase tracking-widest font-bold text-base-content/50">Total Assets Scanned</div>
            <div className="stat-value text-2xl font-black mt-0.5">{totalMetrics.total}</div>
          </div>
        </div>

        <div className="stat bg-base-100 border border-base-content/10 rounded-2xl p-4 shadow-sm flex items-center gap-4">
          <div className="p-3 bg-success/10 text-success rounded-xl">
            <ShieldCheck className="h-6 w-6" />
          </div>
          <div>
            <div className="stat-title text-4xs uppercase tracking-widest font-bold text-base-content/50">Scans Completed</div>
            <div className="stat-value text-2xl font-black mt-0.5">{totalMetrics.completed}</div>
          </div>
        </div>

        <div className="stat bg-base-100 border border-base-content/10 rounded-2xl p-4 shadow-sm flex items-center gap-4">
          <div className="p-3 bg-error/10 text-error rounded-xl">
            <ShieldAlert className="h-6 w-6" />
          </div>
          <div>
            <div className="stat-title text-4xs uppercase tracking-widest font-bold text-base-content/50">Critical / High Issues</div>
            <div className="stat-value text-2xl font-black mt-0.5">{totalMetrics.criticals}</div>
          </div>
        </div>
      </div>

      {/* Main panel */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left: Scan form + live terminal */}
        <div className="lg:col-span-2 flex flex-col gap-4">
          <ScanForm onStartScan={handleStartScan} loading={isScanning} />

          {/* Active scan UI */}
          {activeScanId && (
            <div className="flex flex-col gap-3 p-4 bg-base-100 rounded-2xl border border-base-content/10 shadow-sm">
              {/* Progress bar */}
              <ScanProgressBar status={status} isDone={isDone} />

              {/* Score reveal + action on complete */}
              {isDone && status === 'completed' && score !== null && (
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 p-3 bg-success/10 border border-success/20 rounded-xl">
                  <div className="flex items-center gap-2">
                    <ShieldCheck className="h-5 w-5 text-success shrink-0" />
                    <div>
                      <span className="text-sm font-bold text-success block">
                        Scan complete — Score: {score}/100 · Grade {grade}
                      </span>
                      <span className="text-xs text-base-content/50">Review the log above, then navigate to the full report.</span>
                    </div>
                  </div>
                  <Link
                    to={`/scan/${activeScanId}`}
                    className="btn btn-success btn-sm text-success-content gap-1 shrink-0"
                  >
                    View Full Report <ChevronRight className="h-3 w-3" />
                  </Link>
                </div>
              )}

              {isDone && status === 'failed' && (
                <div className="flex items-center gap-2 p-3 bg-error/10 border border-error/20 rounded-xl">
                  <ShieldAlert className="h-5 w-5 text-error shrink-0" />
                  <span className="text-sm font-semibold text-error">Scan failed. Review the error log above for details.</span>
                </div>
              )}

              {/* Terminal log */}
              <ProgressTracker logs={logs} status={status} />
            </div>
          )}
        </div>

        {/* Right: Recent scans list */}
        <div className="flex flex-col gap-4">
          <div className="flex justify-between items-center">
            <h3 className="font-bold text-sm uppercase tracking-wider text-base-content/70">
              Recent Activity
            </h3>
            <Link to="/history" className="text-primary hover:underline text-xs font-semibold">
              View all
            </Link>
          </div>

          <div className="flex flex-col gap-4">
            {loadingList ? (
              <div className="flex justify-center py-10">
                <span className="loading loading-spinner loading-md"></span>
              </div>
            ) : recentScans.length === 0 ? (
              <div className="p-6 text-center bg-base-100 border border-base-content/5 rounded-2xl text-xs text-base-content/50">
                No recent security scans found. Submit a target to start.
              </div>
            ) : (
              recentScans.map((scan) => (
                <ScanCard key={scan._id} scan={scan} onDelete={handleDelete} />
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
