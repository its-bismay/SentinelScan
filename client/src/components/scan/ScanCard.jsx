import React from 'react';
import { Link } from 'react-router-dom';
import { Shield, ShieldAlert, ShieldCheck, ArrowRight, Trash2 } from 'lucide-react';
import SeverityBadge from '../ui/SeverityBadge';

const ScanCard = ({ scan, onDelete }) => {
  const getSeverityCounts = () => {
    return [
      { name: 'Critical', val: scan.criticalCount || 0, color: 'bg-error' },
      { name: 'High', val: scan.highCount || 0, color: 'bg-red-500' },
      { name: 'Medium', val: scan.mediumCount || 0, color: 'bg-warning' },
      { name: 'Low', val: scan.lowCount || 0, color: 'bg-info' },
    ];
  };

  const getScoreIcon = (score) => {
    if (score >= 80) return <ShieldCheck className="h-10 w-10 text-success fill-success/15" />;
    if (score >= 50) return <Shield className="h-10 w-10 text-warning fill-warning/15" />;
    return <ShieldAlert className="h-10 w-10 text-error fill-error/15" />;
  };

  return (
    <div className="card bg-base-100 border border-base-content/10 shadow-md hover:border-primary/20 transition-all group">
      <div className="card-body p-5">
        <div className="flex justify-between items-start gap-4">
          <div className="flex-1 min-w-0">
            <h4 className="card-title text-base font-bold truncate tracking-wide text-base-content hover:text-primary transition-colors">
              <Link to={`/scan/${scan._id}`}>{scan.targetUrl}</Link>
            </h4>
            <span className="text-3xs text-base-content/50 uppercase tracking-widest font-semibold block mt-1">
              Scanned: {new Date(scan.createdAt).toLocaleDateString()} at {new Date(scan.createdAt).toLocaleTimeString()}
            </span>
          </div>

          <div className="flex-none">
            {scan.status === 'completed' ? (
              <div className="flex items-center gap-2">
                <div className="text-right">
                  <div className="text-xl font-bold font-display">{scan.score}/100</div>
                  <div className="text-3xs font-bold uppercase text-base-content/40 tracking-wider">Score</div>
                </div>
                {getScoreIcon(scan.score)}
              </div>
            ) : (
              <span className={`badge ${
                scan.status === 'running' ? 'badge-primary' : scan.status === 'failed' ? 'badge-error' : 'badge-neutral'
              } capitalize`}>
                {scan.status}
              </span>
            )}
          </div>
        </div>

        {/* Severity list */}
        {scan.status === 'completed' && (
          <div className="grid grid-cols-4 gap-2 mt-4 py-2 border-t border-b border-base-content/5">
            {getSeverityCounts().map((sev) => (
              <div key={sev.name} className="flex flex-col items-center">
                <div className="flex items-center gap-1">
                  <span className={`w-1.5 h-1.5 rounded-full ${sev.color}`} />
                  <span className="text-3xs text-base-content/50 uppercase font-semibold">{sev.name}</span>
                </div>
                <span className="text-sm font-bold mt-0.5">{sev.val}</span>
              </div>
            ))}
          </div>
        )}

        {/* Actions */}
        <div className="card-actions justify-between items-center mt-4">
          <button 
            onClick={() => onDelete(scan._id)}
            className="btn btn-ghost btn-circle btn-xs text-error opacity-40 hover:opacity-100 transition-opacity"
            title="Delete scan"
          >
            <Trash2 className="h-4 w-4" />
          </button>
          
          <Link 
            to={`/scan/${scan._id}`}
            className="btn btn-link btn-xs p-0 text-primary gap-1 group-hover:gap-2 transition-all font-semibold"
          >
            View Full Report
            <ArrowRight className="h-3 w-3" />
          </Link>
        </div>
      </div>
    </div>
  );
};

export default ScanCard;
