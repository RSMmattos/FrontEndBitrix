
import React from 'react';
import { LucideIcon } from 'lucide-react';

interface StatsCardProps {
  title: string;
  value: number | string;
  icon: LucideIcon;
  color: string;
  description?: string;
}

export const StatsCard: React.FC<StatsCardProps> = ({ title, value, icon: Icon, color, description }) => {
  const iconColorClass = color.replace('bg-', 'text-');
  
  return (
    <div className="group bg-white rounded-[2rem] p-6 shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-slate-100 flex items-start gap-5 transition-all duration-500 hover:shadow-[0_20px_40px_rgb(0,0,0,0.08)] hover:-translate-y-1">
      <div className={`p-4 rounded-2xl ${color} bg-opacity-10 transition-all duration-500 group-hover:scale-110 group-hover:rotate-3`}>
        <Icon className={`${iconColorClass}`} size={24} />
      </div>
      <div className="flex-1">
        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">{title}</p>
        <div className="flex items-baseline gap-2">
          <h3 className="text-3xl font-black text-slate-900 tracking-tight">{value}</h3>
          <span className="text-[10px] font-bold text-emerald-500 bg-emerald-50 px-1.5 py-0.5 rounded">+2%</span>
        </div>
        {description && <p className="text-xs text-slate-400 font-medium mt-1.5 leading-tight">{description}</p>}
      </div>
    </div>
  );
};
