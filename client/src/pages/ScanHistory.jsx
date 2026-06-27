import React, { useEffect, useState } from 'react';
import ScanTable from '../components/scan/ScanTable';
import { useScans } from '../hooks/useScans';
import { TableSkeleton } from '../components/ui/LoadingSkeleton';
import EmptyState from '../components/ui/EmptyState';
import { Search, ShieldAlert, SlidersHorizontal, RefreshCw } from 'lucide-react';
import toast from 'react-hot-toast';

const ScanHistory = () => {
  const { getScansList, deleteScanItem, loading } = useScans();
  const [scans, setScans] = useState([]);
  const [search, setSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');

  const fetchScans = async () => {
    try {
      const res = await getScansList();
      if (res?.success) {
        setScans(res.scans);
      }
    } catch (err) {
      toast.error('Failed to load scan history');
    }
  };

  useEffect(() => {
    fetchScans();
  }, []);

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this scan permanently?')) return;
    try {
      await deleteScanItem(id);
      toast.success('Scan removed successfully');
      fetchScans();
    } catch (err) {
      toast.error('Failed to delete scan record');
    }
  };

  const filteredScans = scans.filter((scan) => {
    const matchesSearch = scan.targetUrl.toLowerCase().includes(search.toLowerCase());
    const matchesStatus = filterStatus === 'all' ? true : scan.status === filterStatus;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="flex flex-col gap-6">
      {/* Title */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl md:text-3xl font-bold font-display text-base-content">
            Security Scan History
          </h2>
          <p className="text-xs text-base-content/60 mt-0.5">
            Audit history of your target domains and their previous security levels.
          </p>
        </div>
        <button 
          onClick={fetchScans}
          disabled={loading}
          className="btn btn-ghost btn-circle"
          title="Refresh Scan List"
        >
          <RefreshCw className={`h-5 w-5 ${loading ? 'animate-spin' : ''}`} />
        </button>
      </div>

      {/* Filter and Search actions */}
      <div className="flex flex-col sm:flex-row gap-3 w-full justify-between items-center bg-base-100 p-4 rounded-xl border border-base-content/5 shadow-sm">
        <label className="input input-bordered flex items-center gap-2 w-full sm:max-w-xs">
          <Search className="h-4 w-4 text-base-content/40" />
          <input
            type="text"
            placeholder="Search domain..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="grow bg-transparent"
          />
        </label>

        <div className="flex gap-2 w-full sm:w-auto items-center">
          <SlidersHorizontal className="h-4 w-4 text-base-content/40 hidden sm:block" />
          <select
            className="select select-bordered select-sm w-full sm:w-auto"
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            aria-label="Filter scans by status"
          >
            <option value="all">All Statuses</option>
            <option value="completed">Completed</option>
            <option value="running">Running</option>
            <option value="failed">Failed</option>
            <option value="queued">Queued</option>
          </select>
        </div>
      </div>

      {/* Results grid */}
      {loading ? (
        <div className="bg-base-100 p-6 rounded-xl border border-base-content/5">
          <TableSkeleton rows={6} cols={5} />
        </div>
      ) : filteredScans.length === 0 ? (
        <EmptyState
          title="No Scans Match Selection"
          description="Try broadening your filters or start a new scan from the dashboard."
          icon={ShieldAlert}
        />
      ) : (
        <ScanTable scans={filteredScans} onDelete={handleDelete} />
      )}
    </div>
  );
};

export default ScanHistory;
