import React from 'react';

const SecurityScoreGauge = ({ score, grade, size = '8rem', thickness = '0.75rem' }) => {
  const getScoreColorClass = (val) => {
    if (val >= 80) return 'text-success';
    if (val >= 60) return 'text-warning';
    if (val >= 40) return 'text-orange-500';
    return 'text-error';
  };

  const getScoreBgClass = (val) => {
    if (val >= 80) return 'bg-success/5 border-success/15';
    if (val >= 60) return 'bg-warning/5 border-warning/15';
    if (val >= 40) return 'bg-orange-500/5 border-orange-500/15';
    return 'bg-error/5 border-error/15';
  };

  const safeScore = typeof score === 'number' && !isNaN(score) ? score : 0;

  return (
    <div className={`flex flex-col items-center justify-center p-6 rounded-2xl border ${getScoreBgClass(safeScore)}`}>
      <div 
        className={`radial-progress font-display font-black text-2xl md:text-3xl ${getScoreColorClass(safeScore)} transition-all duration-700`}
        style={{
          '--value': safeScore,
          '--size': size,
          '--thickness': thickness,
        }}
        aria-valuenow={safeScore}
        role="progressbar"
      >
        {safeScore}%
      </div>
      <div className="mt-4 text-center">
        <span className="text-xs uppercase tracking-widest text-base-content/50">Security Grade</span>
        <h4 className="text-xl font-bold text-base-content mt-0.5">Level {grade || 'F'}</h4>
      </div>
    </div>
  );
};

export default SecurityScoreGauge;
