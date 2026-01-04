
import React, { useState } from 'react';
import { BitrixTask, TaskPriority } from '../types';
import { ChevronRight, Calendar, MessageSquare, Send, Users, XCircle, CheckCircle2, User as UserIcon } from 'lucide-react';
import { format, differenceInMonths } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { addTaskComment } from '../services/bitrixService';

interface EditableTaskRowProps {
  task: BitrixTask;
  pendingChanges: Partial<BitrixTask>;
  onChange: (field: keyof BitrixTask, value: any) => void;
  onViewDetails: (task: BitrixTask) => void;
}

export const EditableTaskRow: React.FC<EditableTaskRowProps> = ({ 
  task, 
  pendingChanges, 
  onChange,
  onViewDetails
}) => {
  const [commentText, setCommentText] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [showCommentInput, setShowCommentInput] = useState(false);

  const currentPriority = pendingChanges.PRIORITY !== undefined ? pendingChanges.PRIORITY : task.PRIORITY;
  const currentDeadline = pendingChanges.DEADLINE !== undefined ? pendingChanges.DEADLINE : task.DEADLINE;
  const currentComment = pendingChanges.COMMENT !== undefined ? pendingChanges.COMMENT : (task.COMMENT || '');
  
  const isOverdue = currentDeadline && new Date(currentDeadline) < new Date() && task.STATUS !== "5";
  const overdueMonths = currentDeadline ? Math.max(0, differenceInMonths(new Date(), new Date(currentDeadline))) : 0;

  const formatDateStr = (dateStr: string | null) => {
    if (!dateStr) return '---';
    try {
      return format(new Date(dateStr), 'dd/MM/yyyy', { locale: ptBR });
    } catch {
      return 'Data Inválida';
    }
  };

  const handleSendComment = async () => {
    if (!commentText.trim()) return;
    setIsSending(true);
    const success = await addTaskComment(task.ID, commentText);
    if (success) {
      onChange('COMMENT', commentText);
      setCommentText('');
      setShowCommentInput(false);
    }
    setIsSending(false);
  };

  return (
    <tr className="hover:bg-slate-50/80 transition-colors border-b border-slate-100">
      {/* ID */}
      <td className="px-6 py-5 align-top font-black text-[10px] text-slate-400">#{task.ID}</td>
      
      {/* NOME */}
      <td className="px-6 py-5 align-top">
        <div className="max-w-[200px]">
          <div className="font-bold text-sm text-slate-800 leading-tight mb-1">{task.TITLE}</div>
          <div className="flex items-center gap-1.5 flex-wrap">
            <span className={`text-[8px] font-black px-1.5 py-0.5 rounded border ${task.TASK_TYPE === 'MÃE' ? 'bg-purple-50 text-purple-600 border-purple-200' : (task.TASK_TYPE === 'FILHA' ? 'bg-amber-50 text-amber-600 border-amber-200' : 'bg-slate-50 text-slate-500 border-slate-200')}`}>
              {task.TASK_TYPE}
            </span>
            <span className="text-[8px] text-slate-400 font-bold uppercase">{task.GROUP_NAME}</span>
            {typeof task.idgrupobitrix !== 'undefined' && (
              <span className="text-[8px] text-emerald-700 font-bold ml-2">[{task.idgrupobitrix}]</span>
            )}
          </div>
        </div>
      </td>

      {/* RESPONSÁVEL */}
      <td className="px-6 py-5 align-top">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 bg-emerald-100 rounded-full flex items-center justify-center text-emerald-700 shrink-0">
            <UserIcon size={14} />
          </div>
          <span className="text-[11px] font-bold text-slate-600">{task.RESPONSIBLE_NAME}</span>
        </div>
      </td>
      {/* CRIAÇÃO */}
      <td className="px-6 py-5 align-top">
        <span className="text-[11px] font-bold text-slate-600">{formatDateStr(task.CREATED_DATE)}</span>
      </td>

      {/* PRAZO (EDITÁVEL) */}
      {/* PRAZO BITRIX */}
      <td className="px-6 py-5 align-top">
        <div className="flex flex-col gap-1.5 min-w-[140px]">
          <div className="relative group/date">
            <Calendar className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-300" size={12} />
            <input 
              type="datetime-local" 
              value={task.DEADLINE ? new Date(task.DEADLINE).toISOString().slice(0, 16) : ''}
              disabled
              className="w-full bg-slate-50 border border-slate-200 rounded-lg py-1.5 pl-8 pr-2 text-[10px] font-bold text-slate-600"
            />
          </div>
          {task.DEADLINE ? (
            <div className="flex items-center gap-1 text-[9px] font-black uppercase mt-1"
              style={{
                color: new Date(task.DEADLINE) < new Date() ? '#ef4444' : (new Date(task.DEADLINE).toDateString() === new Date().toDateString() ? '#f59e42' : '#059669')
              }}
            >
              {new Date(task.DEADLINE) < new Date() ? (
                <>
                  <AlertCircle size={10} /> Atrasado
                </>
              ) : new Date(task.DEADLINE).toDateString() === new Date().toDateString() ? (
                <>
                  <AlertCircle size={10} /> Hoje
                </>
              ) : (
                <>
                  <AlertCircle size={10} /> Futuro
                </>
              )}
            </div>
          ) : (
            <div className="flex items-center gap-1 text-[9px] font-black uppercase mt-1 text-slate-400">
              <AlertCircle size={10} /> Prazo Indeterminado
            </div>
          )}
        </div>
      </td>

      {/* PRAZO FINAL (API) */}
      <td className="px-6 py-5 align-top">
        <div className="flex flex-col gap-1.5 min-w-[140px]">
          <div className="relative group/date">
            <Calendar className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-300" size={12} />
            <input
              type="datetime-local"
              value={
                pendingChanges.batividadeg_dataprazofinal !== undefined
                  ? (pendingChanges.batividadeg_dataprazofinal ? pendingChanges.batividadeg_dataprazofinal.slice(0, 16) : '')
                  : (task.batividadeg_dataprazofinal ? task.batividadeg_dataprazofinal.slice(0, 16) : '')
              }
              onChange={e => {
                const value = e.target.value ? e.target.value : null;
                onChange(task.ID, 'batividadeg_dataprazofinal', value);
                // Atualiza o comentário automaticamente
                const deconcluir = pendingChanges.batividadeg_deconcluir !== undefined
                  ? pendingChanges.batividadeg_deconcluir
                  : (task.batividadeg_deconcluir || 'Totalmente');
                let prazoFormatado = '';
                if (value) {
                  try {
                    const data = new Date(value);
                    prazoFormatado = `${String(data.getDate()).padStart(2, '0')}/${String(data.getMonth()+1).padStart(2, '0')}/${data.getFullYear()}`;
                  } catch {
                    prazoFormatado = value;
                  }
                  onChange(task.ID, 'batividadeg_comentario', `Tarefa Prioritária - deve ser concluida (${deconcluir.toLowerCase()}) até ${prazoFormatado}`);
                }
              }}
              className="w-full bg-white border border-slate-200 rounded-lg py-1.5 pl-8 pr-2 text-[10px] font-bold text-slate-600"
            />
          </div>
        </div>
      </td>


      {/* URGENTE? */}
      <td className="px-6 py-5 align-top text-center">
        <select
          value={
            pendingChanges.batividadeg_prioridade !== undefined
              ? (pendingChanges.batividadeg_prioridade ? 'SIM' : 'NÃO')
              : (task.batividadeg_prioridade ? 'SIM' : 'NÃO')
          }
          onChange={e => {
            const value = e.target.value === 'SIM';
            onChange(task.ID, 'batividadeg_prioridade', value);
            // Atualiza o comentário automaticamente
            const deconcluir = pendingChanges.batividadeg_deconcluir !== undefined
              ? pendingChanges.batividadeg_deconcluir
              : (task.batividadeg_deconcluir || 'Totalmente');
            const prazo = pendingChanges.batividadeg_dataprazofinal !== undefined
              ? pendingChanges.batividadeg_dataprazofinal
              : (task.batividadeg_dataprazofinal || '');
            let prazoFormatado = '';
            if (prazo) {
              try {
                const data = new Date(prazo);
                prazoFormatado = `${String(data.getDate()).padStart(2, '0')}/${String(data.getMonth()+1).padStart(2, '0')}/${data.getFullYear()}`;
              } catch {
                prazoFormatado = prazo;
              }
              onChange(task.ID, 'batividadeg_comentario', `Tarefa Prioritária - deve ser concluida (${deconcluir.toLowerCase()}) até ${prazoFormatado}`);
            }
          }}
          className={`bg-white border rounded-lg px-2 py-1.5 text-[10px] font-black uppercase tracking-widest outline-none ${(pendingChanges.batividadeg_prioridade !== undefined ? pendingChanges.batividadeg_prioridade : task.batividadeg_prioridade) ? 'text-rose-600 border-rose-200' : 'text-slate-600 border-slate-200'}`}
        >
          <option value="NÃO">NÃO</option>
          <option value="SIM">SIM</option>
        </select>
      </td>

      {/* DE CONCLUIR */}
      <td className="px-6 py-5 align-top text-center">
        <select
          value={pendingChanges.batividadeg_deconcluir !== undefined ? pendingChanges.batividadeg_deconcluir : (task.batividadeg_deconcluir || 'Totalmente')}
          onChange={e => {
            const value = e.target.value;
            onChange(task.ID, 'batividadeg_deconcluir', value);
            // Atualiza o comentário automaticamente
            const prazo = pendingChanges.batividadeg_dataprazofinal !== undefined
              ? pendingChanges.batividadeg_dataprazofinal
              : (task.batividadeg_dataprazofinal || '');
            let prazoFormatado = '';
            if (prazo) {
              try {
                const data = new Date(prazo);
                prazoFormatado = `${String(data.getDate()).padStart(2, '0')}/${String(data.getMonth()+1).padStart(2, '0')}/${data.getFullYear()}`;
              } catch {
                prazoFormatado = prazo;
              }
              onChange(task.ID, 'batividadeg_comentario', `Tarefa Prioritária - deve ser concluida (${value.toLowerCase()}) até ${prazoFormatado}`);
            }
          }}
          className="bg-white border rounded-lg px-2 py-1.5 text-[10px] font-black uppercase tracking-widest outline-none text-slate-600 border-slate-200"
        >
          <option value="Totalmente">Totalmente</option>
          <option value="Parcialmente">Parcialmente</option>
        </select>
      </td>

      {/* ÚLTIMO COMENTÁRIO */}
      <td className="px-6 py-5 align-top min-w-[250px]">
        <input
          type="text"
          value={
            pendingChanges.batividadeg_comentario !== undefined
              ? pendingChanges.batividadeg_comentario
              : (task.batividadeg_comentario || '')
          }
          onChange={e => onChange(task.ID, 'batividadeg_comentario', e.target.value)}
          className="w-full bg-white border border-slate-200 rounded-lg px-3 py-1.5 text-[11px] outline-none focus:ring-2 focus:ring-emerald-500"
          placeholder="Comentário..."
        />
      </td>

      {/* INFO */}
      <td className="px-6 py-5 text-right align-top">
        <button onClick={() => onViewDetails(task)} className="p-2 text-slate-300 hover:text-emerald-600 transition-all rounded-full hover:bg-emerald-50">
          <ChevronRight size={20} />
        </button>
      </td>
    </tr>
  );
};

const Loader2 = ({ size, className }: { size: number, className?: string }) => (
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

const AlertCircle = ({ size, className }: { size: number, className?: string }) => (
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
    <circle cx="12" cy="12" r="10" />
    <line x1="12" y1="8" x2="12" y2="12" />
    <line x1="12" y1="16" x2="12.01" y2="16" />
  </svg>
);
