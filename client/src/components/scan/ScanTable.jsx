import React from 'react';
import { Link } from 'react-router-dom';
import { ShieldCheck, ShieldAlert, Shield, ArrowRight, Eye, Trash2 } from 'lucide-react';

const ScanTable = ({ scans = [], onDelete }) => {
  const getStatusStyle = (status) => {
    switch (status) {
      case 'completed':
        return 'badge-success text-success-content';
      case 'running':
        return 'badge-primary text-primary-content animate-pulse';
      case 'failed':
        return 'badge-error text-error-content';
      case 'queued':
      default:
        return 'badge-neutral text-neutral-content';
    }
  };

  const getScoreBadge = (score) => {
    if (score === null || score === undefined) return <span className="text-base-content/40">-</span>;
    if (score >= 80) return <span className="badge badge-success text-success-content font-bold">{score}</span>;
    if (score >= 60) return <span className="badge badge-warning text-warning-content font-bold">{score}</span>;
    return <span className="badge badge-error text-error-content font-bold">{score}</span>;
  };

  return (
    <div className="overflow-x-auto w-full rounded-xl border border-base-content/10 bg-base-100">
      <table className="table table-md w-full">
        <thead>
          <tr className="bg-base-200">
            <th>Target Application</th>
            <th>Status</th>
            <th>Safety Score</th>
            <th className="text-center">Crit / High / Med / Low</th>
            <th>Date & Time</th>
            <th className="text-right">Actions</th>
          </tr>
        </thead>
        <tbody>
          {scans.map((scan) => (
            <tr key={scan._id} className="hover:bg-base-200/50 transition-colors">
              <td className="font-semibold max-w-xs truncate">
                <Link to={`/scan/${scan._id}`} className="hover:text-primary transition-colors block">
                  {scan.targetUrl}
                </Link>
              </td>
              <td>
                <span className={`badge uppercase text-3xs font-bold px-2 py-0.5 ${getStatusStyle(scan.status)}`}>
                  {scan.status}
                </span>
              </td>
              <td>{getScoreBadge(scan.score)}</td>
              <td className="text-center font-semibold text-xs">
                {scan.status === 'completed' ? (
                  <div className="flex justify-center gap-1.5">
                    <span className="text-error">{scan.criticalCount || 0}</span>
                    <span className="text-base-content/30">/</span>
                    <span className="text-red-400">{scan.highCount || 0}</span>
                    <span className="text-base-content/30">/</span>
                    <span className="text-warning">{scan.mediumCount || 0}</span>
                    <span className="text-base-content/30">/</span>
                    <span className="text-info">{scan.lowCount || 0}</span>
                  </div>
                ) : (
                  <span className="text-base-content/30">-</span>
                )}
              </td>
              <td className="text-xs text-base-content/75">
                {new Date(scan.createdAt).toLocaleString(undefined, {
                  dateStyle: 'short',
                  timeStyle: 'short',
                })}
              </td>
              <td className="text-right">
                <div className="flex justify-end gap-1.5">
                  <Link
                    to={`/scan/${scan._id}`}
                    className="btn btn-square btn-ghost btn-xs text-primary"
                    title="View report Details"
                  >
                    <Eye className="h-4 w-4" />
                  </Link>
                  <button
                    onClick={() => onDelete(scan._id)}
                    className="btn btn-square btn-ghost btn-xs text-error"
                    title="Delete Scan"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default ScanTable;
