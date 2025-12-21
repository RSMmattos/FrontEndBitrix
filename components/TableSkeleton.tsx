
import React from 'react';

export const TableSkeleton: React.FC = () => {
  return (
    <div className="animate-pulse">
      {[...Array(8)].map((_, i) => (
        <div key={i} className="flex items-center px-6 py-4 border-b border-slate-100 gap-4">
          <div className="h-4 w-12 bg-slate-200 rounded"></div>
          <div className="flex-1 space-y-2">
            <div className="h-4 w-1/3 bg-slate-200 rounded"></div>
            <div className="h-3 w-1/4 bg-slate-100 rounded"></div>
          </div>
          <div className="h-6 w-20 bg-slate-200 rounded-full"></div>
          <div className="h-4 w-16 bg-slate-200 rounded"></div>
          <div className="h-4 w-24 bg-slate-200 rounded"></div>
          <div className="h-8 w-8 bg-slate-200 rounded-full"></div>
        </div>
      ))}
    </div>
  );
};
