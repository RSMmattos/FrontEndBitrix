
import React, { useState } from 'react';
import { X, Calendar, User, FileText, Clock, Hash, Activity, Edit3, Save, Flag, CheckCircle, Zap } from 'lucide-react';
import { BitrixTask, TaskPriority } from '../types';
import { STATUS_MAP, PRIORITY_MAP } from '../constants';
import { Badge } from './Badge';

interface TaskDetailsModalProps {
  task: BitrixTask | null;
  onClose: () => void;
  onEdit: (task: BitrixTask) => void;
  onQuickUpdate: (taskId: string, updates: Partial<BitrixTask>) => Promise<void>;
}

export const TaskDetailsModal: React.FC<TaskDetailsModalProps> = ({ task, onClose, onEdit, onQuickUpdate }) => {
  const [isUpdating, setIsUpdating] = useState(false);
  
  if (!task) return null;

  const status = STATUS_MAP[task.STATUS];
  const priority = PRIORITY_MAP[task.PRIORITY];

  const handlePriorityChange = async (newPriority: string) => {
    setIsUpdating(true);
    await onQuickUpdate(task.ID, { PRIORITY: newPriority });
    setIsUpdating(false);
  };

  const handleDeadlineChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setIsUpdating(true);
    await onQuickUpdate(task.ID, { DEADLINE: val ? new Date(val).toISOString() : null });
    setIsUpdating(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      <div 
        className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm transition-opacity" 
        onClick={onClose} 
      />
      <div className="relative w-full max-w-xl bg-white h-full shadow-2xl flex flex-col animate-in slide-in-from-right duration-500 ease-out">
        {/* Modal Header */}
        <div className="p-8 border-b border-slate-100 flex items-start justify-between bg-slate-50/50">
          <div className="space-y-2">
            <div className="flex items-center gap-3">
              <div className="bg-slate-900 text-white p-1.5 rounded-lg">
                <Hash size={16} />
              </div>
              <span className="text-sm font-black text-slate-400 uppercase tracking-widest">Tarefa {task.ID}</span>
            </div>
            <h2 className="text-2xl font-black text-slate-900 leading-tight tracking-tight">
              {task.TITLE}
            </h2>
            <div className="flex gap-3 pt-2">
               <Badge className={status?.color + " py-1 px-3 border border-current bg-opacity-5 font-bold"} icon={status?.icon}>
                {status?.label}
              </Badge>
              <div className={`text-xs font-black uppercase tracking-widest py-1 flex items-center gap-1 ${priority?.color}`}>
                <Activity size={12} /> {priority?.label}
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {isUpdating && <Loader2 size={18} className="animate-spin text-emerald-600 mr-2" />}
            <button 
              onClick={() => onEdit(task)}
              className="p-2.5 bg-indigo-50 text-indigo-600 hover:bg-indigo-100 rounded-xl transition-all border border-indigo-100"
              title="Edição Completa"
            >
              <Edit3 size={18} />
            </button>
            <button onClick={onClose} className="p-2.5 hover:bg-white hover:shadow-sm rounded-xl transition-all border border-transparent hover:border-slate-200">
              <X size={20} className="text-slate-400" />
            </button>
          </div>
        </div>

        {/* Modal Body */}
        <div className="flex-1 overflow-y-auto p-8 space-y-10">
          
          {/* Quick Edit Panel */}
          <section className="bg-emerald-50/30 p-6 rounded-[2rem] border border-emerald-100 space-y-6">
            <h3 className="text-[10px] font-black text-emerald-700 uppercase tracking-[0.2em] flex items-center gap-2">
              <Zap size={14} /> Gerenciamento Direto
            </h3>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Nível de Prioridade</label>
                <div className="flex bg-white p-1 rounded-xl border border-slate-100 shadow-sm">
                  {[
                    { id: TaskPriority.LOW, label: 'Baixa', active: 'bg-slate-100 text-slate-700' },
                    { id: TaskPriority.NORMAL, label: 'Normal', active: 'bg-emerald-600 text-white' },
                    { id: TaskPriority.HIGH, label: 'Alta', active: 'bg-rose-600 text-white' },
                  ].map((p) => (
                    <button
                      key={p.id}
                      onClick={() => handlePriorityChange(p.id)}
                      disabled={isUpdating}
                      className={`flex-1 py-2 text-[9px] font-black uppercase rounded-lg transition-all ${task.PRIORITY === p.id ? p.active + ' shadow-sm' : 'text-slate-400 hover:bg-slate-50'}`}
                    >
                      {p.label}
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Prazo Final (Deadline)</label>
                <div className="relative group">
                  <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={14} />
                  <input
                    type="datetime-local"
                    disabled={isUpdating}
                    value={task.DEADLINE ? new Date(task.DEADLINE).toISOString().slice(0, 16) : ''}
                    onChange={handleDeadlineChange}
                    className="w-full bg-white border border-slate-100 rounded-xl py-2 pl-9 pr-3 text-[10px] font-bold focus:ring-2 focus:ring-emerald-500 outline-none transition-all shadow-sm"
                  />
                </div>
              </div>
            </div>
          </section>

          <section className="space-y-4">
            <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
              <FileText size={14} className="text-emerald-600" />
              Descrição Técnica
            </h3>
            <div 
              className="text-sm text-slate-700 leading-relaxed bg-slate-50 p-6 rounded-2xl border border-slate-100 prose prose-sm max-w-none shadow-inner"
              dangerouslySetInnerHTML={{ __html: task.DESCRIPTION || '<p class="text-slate-400 italic">Sem descrição técnica adicional.</p>' }}
            />
          </section>

          <section className="grid grid-cols-1 sm:grid-cols-2 gap-8">
            <div className="space-y-4">
              <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                <Clock size={14} className="text-emerald-600" />
                Datas
              </h3>
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center text-slate-400">
                    <Calendar size={16} />
                  </div>
                  <div>
                    <p className="text-[10px] text-slate-400 font-bold uppercase tracking-tight">Criação</p>
                    <p className="text-sm font-bold text-slate-800">{task.CREATED_DATE}</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                <User size={14} className="text-emerald-600" />
                Pessoas
              </h3>
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-700 font-bold text-[10px]">
                    <User size={16} />
                  </div>
                  <div>
                    <p className="text-[10px] text-slate-400 font-bold uppercase tracking-tight">Responsável</p>
                    <p className="text-sm font-bold text-slate-800">{task.RESPONSIBLE_NAME}</p>
                  </div>
                </div>
                {task.AUDITORS && task.AUDITORS.length > 0 && (
                  <div className="mt-2">
                    <p className="text-[10px] text-slate-400 font-bold uppercase tracking-tight">Envolvidos</p>
                    <ul className="list-disc ml-4">
                      {task.AUDITORS.map((auditor, idx) => (
                        <li key={idx} className="text-sm font-bold text-slate-800">{auditor}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            </div>
          </section>
        </div>

        {/* Modal Footer */}
        <div className="p-8 border-t border-slate-100 bg-white">
          <div className="flex gap-4">
            <button 
              onClick={onClose}
              className="flex-1 bg-slate-900 text-white py-4 rounded-2xl font-black text-sm uppercase tracking-widest hover:bg-slate-800 transition-all shadow-xl shadow-slate-200"
            >
              Fechar Detalhes
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

const Loader2 = ({ size, className }: { size: number, className: string }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
  >
    <path d="M21 12a9 9 0 1 1-6.219-8.56" />
  </svg>
);
