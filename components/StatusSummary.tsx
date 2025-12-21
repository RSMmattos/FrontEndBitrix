
import React from 'react';
import { BitrixTask, TaskStatus } from '../types';
import { STATUS_MAP } from '../constants';

interface StatusSummaryProps {
  tasks: BitrixTask[];
}

export const StatusSummary: React.FC<StatusSummaryProps> = ({ tasks }) => {
  const total = tasks.length;
  if (total === 0) return null;

  const counts = tasks.reduce((acc, task) => {
    acc[task.STATUS] = (acc[task.STATUS] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const sortedStatuses = Object.entries(STATUS_MAP).filter(([id]) => counts[id] > 0);

  return (
    <div className="bg-white p-8 rounded-[2.5rem] shadow-[0_8px_40px_rgb(0,0,0,0.03)] border border-slate-100 space-y-6">
      <div className="flex justify-between items-start">
        <div>
          <h4 className="text-sm font-black text-slate-800 uppercase tracking-[0.2em]">Fluxo Operacional</h4>
          <p className="text-xs text-slate-400 font-medium mt-1">Status em tempo real das frentes de trabalho</p>
        </div>
        <div className="bg-emerald-50 text-emerald-700 text-[10px] font-black px-3 py-1.5 rounded-xl uppercase tracking-widest border border-emerald-100 shadow-sm">
          {total} Unidades
        </div>
      </div>
      
      <div className="h-4 w-full flex rounded-2xl overflow-hidden bg-slate-50 p-1 border border-slate-100">
        {sortedStatuses.map(([id, meta]) => {
          const percentage = (counts[id] / total) * 100;
          const bgColorClass = meta.color.split(' ')[0];
          return (
            <div 
              key={id} 
              style={{ width: `${percentage}%` }}
              className={`${bgColorClass} rounded-full transition-all duration-700 hover:scale-y-125 hover:z-10`}
              title={`${meta.label}: ${counts[id]}`}
            />
          );
        })}
      </div>

      <div className="grid grid-cols-2 gap-4">
        {sortedStatuses.map(([id, meta]) => (
          <div key={id} className="flex items-center gap-3 p-3 rounded-2xl border border-slate-50 hover:bg-slate-50/50 transition-colors">
            <span className={`w-2.5 h-2.5 rounded-full ${meta.color.split(' ')[0]} shadow-sm`}></span>
            <div className="flex flex-col">
              <span className="text-[10px] font-black text-slate-700 uppercase tracking-tighter">
                {meta.label}
              </span>
              <span className="text-[11px] font-black text-slate-400">{counts[id]} itens</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
