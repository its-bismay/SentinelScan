import React from 'react';

export const TableSkeleton = ({ rows = 5, cols = 4 }) => {
  return (
    <div className="w-full flex flex-col gap-3">
      {Array.from({ length: rows }).map((_, rIdx) => (
        <div key={rIdx} className="flex gap-4 w-full">
          {Array.from({ length: cols }).map((_, cIdx) => (
            <div key={cIdx} className="skeleton h-8 flex-1"></div>
          ))}
        </div>
      ))}
    </div>
  );
};

export const CardSkeleton = () => {
  return (
    <div className="card bg-base-100 p-6 flex flex-col gap-4 border border-base-content/5">
      <div className="skeleton h-6 w-1/3"></div>
      <div className="skeleton h-4 w-full"></div>
      <div className="skeleton h-4 w-5/6"></div>
      <div className="flex justify-between items-center mt-2">
        <div className="skeleton h-8 w-20"></div>
        <div className="skeleton h-8 w-24"></div>
      </div>
    </div>
  );
};

export const StatsSkeleton = () => {
  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 w-full">
      {Array.from({ length: 4 }).map((_, idx) => (
        <div key={idx} className="skeleton h-24 rounded-2xl"></div>
      ))}
    </div>
  );
};
