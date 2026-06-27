import React from 'react';

const SeverityBadge = ({ severity }) => {
  const getBadgeStyle = (sev) => {
    switch (sev?.toLowerCase()) {
      case 'critical':
        return 'badge-error text-error-content font-bold';
      case 'high':
        return 'bg-red-500! text-white font-bold border-none';
      case 'medium':
        return 'badge-warning text-warning-content font-bold';
      case 'low':
        return 'badge-info text-info-content font-semibold';
      case 'informational':
      default:
        return 'badge-neutral text-neutral-content';
    }
  };

  return (
    <span className={`badge uppercase text-2xs px-2.5 py-1 ${getBadgeStyle(severity)}`}>
      {severity}
    </span>
  );
};

export default SeverityBadge;
