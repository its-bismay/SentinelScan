import React from 'react';
import { HelpCircle } from 'lucide-react';

const EmptyState = ({
  title = 'No Data Available',
  description = 'There is currently no information to display here.',
  icon: Icon = HelpCircle,
  children,
}) => {
  return (
    <div className="flex flex-col items-center justify-center text-center p-8 md:p-12 rounded-2xl bg-base-100/50 border border-base-content/5 glass-panel">
      <div className="p-4 bg-primary/10 rounded-full text-primary mb-4">
        <Icon className="h-10 w-10" />
      </div>
      <h3 className="text-lg font-bold text-base-content font-display">{title}</h3>
      <p className="text-sm text-base-content/60 max-w-sm mt-1 mb-6">{description}</p>
      {children}
    </div>
  );
};

export default EmptyState;
