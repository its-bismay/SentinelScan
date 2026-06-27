import React, { useEffect, useRef } from 'react';
import { Terminal, Shield, Play } from 'lucide-react';

const ProgressTracker = ({ logs = [], status }) => {
  const logEndRef = useRef(null);

  useEffect(() => {
    logEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [logs]);

  const getStatusBadge = (stat) => {
    switch (stat) {
      case 'queued':
        return <span className="badge badge-neutral gap-1.5"><Play className="h-3 w-3 animate-pulse" /> Queued</span>;
      case 'running':
        return <span className="badge badge-primary gap-1.5"><Shield className="h-3 w-3 animate-spin" /> Scanning</span>;
      case 'completed':
        return <span className="badge badge-success gap-1.5">Completed</span>;
      case 'failed':
        return <span className="badge badge-error gap-1.5 font-bold">Failed</span>;
      default:
        return <span className="badge badge-ghost">{stat}</span>;
    }
  };

  const getLogColor = (level) => {
    switch (level) {
      case 'error':
        return 'text-red-400 font-bold';
      case 'warn':
        return 'text-yellow-400';
      case 'debug':
        return 'text-blue-300 opacity-75';
      case 'info':
      default:
        return 'text-emerald-400';
    }
  };

  return (
    <div className="flex flex-col rounded-2xl overflow-hidden border border-base-content/10 bg-neutral shadow-2xl">
      {/* Console Header */}
      <div className="flex items-center justify-between px-4 py-3 bg-base-300 border-b border-base-content/10">
        <div className="flex items-center gap-2 text-base-content/80 font-display font-medium text-sm">
          <Terminal className="h-4 w-4 text-primary" />
          <span>Active Scanner Log Console</span>
        </div>
        <div className="flex items-center gap-2">
          {getStatusBadge(status)}
        </div>
      </div>

      {/* Terminal Area */}
      <div className="p-4 h-64 overflow-y-auto font-mono text-xs md:text-sm leading-relaxed flex flex-col gap-1.5">
        {logs.length === 0 ? (
          <div className="text-base-content/40 italic flex items-center justify-center h-full">
            Waiting for logs to start streaming...
          </div>
        ) : (
          logs.map((log, index) => (
            <div key={index} className="flex gap-2">
              <span className="text-base-content/45 select-none font-light">
                [{new Date(log.timestamp).toLocaleTimeString()}]
              </span>
              <span className={getLogColor(log.level)}>
                {log.level === 'error' ? '✖' : log.level === 'warn' ? '⚠' : '▶'}
              </span>
              <span className="text-neutral-content break-all">{log.message}</span>
            </div>
          ))
        )}
        <div ref={logEndRef} />
      </div>
    </div>
  );
};

export default ProgressTracker;
