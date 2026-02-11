
import React from 'react';
import { BitrixTask } from '../types';
import { STATUS_MAP, PRIORITY_MAP } from '../constants';
import { Badge } from './Badge';
import { formatDistanceToNow, differenceInMonths } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { ChevronRight, MoreHorizontal, AlertCircle } from 'lucide-react';

interface TaskRowProps {
  task: BitrixTask;
  onClick: (task: BitrixTask) => void;
}

export const TaskRow: React.FC<TaskRowProps> = ({ task, onClick }) => {
  const status = STATUS_MAP[task.STATUS] || { label: 'Desconhecido', color: 'bg-slate-100 text-slate-600', icon: null };
  // const priority = PRIORITY_MAP[task.PRIORITY] || { label: 'Normal', color: 'text-slate-600', dot: 'bg-slate-300' };

  const getRelativeDate = () => {
    try {
      return formatDistanceToNow(new Date(task.CREATED_DATE), { addSuffix: true, locale: ptBR });
    } catch {
      return task.CREATED_DATE;
    }
  };

  const getOverdueMonths = () => {
    if (!task.DEADLINE) return 0;
    const deadline = new Date(task.DEADLINE);
    const now = new Date();
    if (deadline < now) {
      return Math.max(0, differenceInMonths(now, deadline));
    }
    return 0;
  };

  const monthsOverdue = getOverdueMonths();

  return (
    <tr 
      onClick={() => onClick(task)}
      className="group hover:bg-emerald-50/20 cursor-pointer transition-all duration-300"
    >
      <td className="px-8 py-6 align-top">
        <span className="text-[11px] font-black text-slate-300 group-hover:text-emerald-500 transition-colors tracking-tighter">
          #{task.ID.padStart(4, '0')}
        </span>
      </td>
      <td className="px-8 py-6 align-top">
        <div className="flex flex-col">
          <span className="text-sm font-bold text-slate-800 group-hover:text-emerald-800 transition-colors mb-2 leading-snug">
            {task.TITLE}
          </span>
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-[10px] text-slate-400 font-bold uppercase tracking-tight">Iniciado {getRelativeDate()}</span>
            {monthsOverdue > 0 && (
              <span className="flex items-center gap-1 text-[9px] font-black text-rose-500 uppercase">
                <AlertCircle size={10} /> {monthsOverdue} {monthsOverdue === 1 ? 'mês' : 'meses'} de atraso
              </span>
            )}
          </div>
        </div>
      </td>
      <td className="px-8 py-6 whitespace-nowrap align-top">
        <Badge className={`${status.color}`}>
          {status.label}
        </Badge>
      </td>
      <td className="px-8 py-6 whitespace-nowrap align-top">
        <div className="flex items-center gap-2 justify-center">
          <input
            type="checkbox"
            checked={task.PRIORITY === 'high'}
            readOnly
            className="accent-red-600 w-5 h-5 rounded border border-slate-300 cursor-default"
            tabIndex={-1}
          />
        </div>
      </td>
      <td className="px-8 py-6 text-right align-top">
        <div className="flex items-center justify-end gap-3 opacity-0 group-hover:opacity-100 transition-all transform translate-x-2 group-hover:translate-x-0">
          <div className="h-8 w-8 rounded-full bg-white border border-slate-100 flex items-center justify-center text-slate-400 shadow-sm">
            <MoreHorizontal size={14} />
          </div>
          <div className="h-8 w-8 rounded-full bg-emerald-600 text-white flex items-center justify-center shadow-lg shadow-emerald-200">
            <ChevronRight size={16} />
          </div>
        </div>
      </td>
    </tr>
  );
};
