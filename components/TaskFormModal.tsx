
import React, { useState, useEffect } from 'react';
import { X, Save, AlertCircle, Loader2, Type, AlignLeft, Calendar, Flag } from 'lucide-react';
import { BitrixTask, TaskPriority } from '../types';

interface TaskFormModalProps {
  task: BitrixTask | null;
  isOpen: boolean;
  onClose: () => void;
  onSave: (taskData: Partial<BitrixTask>) => Promise<void>;
}

export const TaskFormModal: React.FC<TaskFormModalProps> = ({ task, isOpen, onClose, onSave }) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [priority, setPriority] = useState<string>(TaskPriority.NORMAL);
  const [deadline, setDeadline] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (task) {
      setTitle(task.TITLE || '');
      setDescription(task.DESCRIPTION || '');
      setPriority(task.PRIORITY || TaskPriority.NORMAL);
      setDeadline(task.DEADLINE ? new Date(task.DEADLINE).toISOString().slice(0, 16) : '');
    } else {
      setTitle('');
      setDescription('');
      setPriority(TaskPriority.NORMAL);
      setDeadline('');
    }
    setError(null);
  }, [task, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      setError('O título da tarefa é obrigatório.');
      return;
    }

    setIsSubmitting(true);
    setError(null);
    try {
      await onSave({
        TITLE: title,
        DESCRIPTION: description,
        PRIORITY: priority,
        DEADLINE: deadline ? new Date(deadline).toISOString() : null,
      });
      onClose();
    } catch (err: any) {
      setError(err.message || 'Ocorreu um erro ao salvar a tarefa.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-md transition-opacity" onClick={onClose} />
      
      <div className="relative w-full max-w-2xl bg-white rounded-3xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
        <div className="px-8 py-6 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
          <div>
            <h2 className="text-xl font-black text-slate-900 tracking-tight">
              {task ? 'Editar Tarefa' : 'Nova Tarefa Operacional'}
            </h2>
            <p className="text-xs text-slate-500 font-bold uppercase tracking-widest mt-0.5">
              {task ? `Modificando registro #${task.ID}` : 'Preencha os dados abaixo'}
            </p>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-white hover:shadow-sm rounded-xl transition-all border border-transparent hover:border-slate-200">
            <X size={20} className="text-slate-400" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-8 space-y-6">
          {error && (
            <div className="p-4 bg-red-50 border border-red-100 rounded-xl flex items-center gap-3 text-red-600 text-sm font-medium animate-in fade-in slide-in-from-top-2">
              <AlertCircle size={18} />
              {error}
            </div>
          )}

          <div className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                <Type size={12} className="text-indigo-500" /> Título da Tarefa
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Ex: Manutenção Preventiva do Trator #42"
                className="w-full bg-slate-50 border border-slate-200 rounded-xl py-3 px-4 text-sm font-semibold focus:ring-2 focus:ring-indigo-500 focus:bg-white outline-none transition-all shadow-inner"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                <AlignLeft size={12} className="text-indigo-500" /> Descrição Detalhada
              </label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={4}
                placeholder="Descreva as etapas, materiais necessários ou observações técnicas..."
                className="w-full bg-slate-50 border border-slate-200 rounded-xl py-3 px-4 text-sm focus:ring-2 focus:ring-indigo-500 focus:bg-white outline-none transition-all shadow-inner resize-none"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 pt-2">
              <div className="space-y-1.5">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                  <Flag size={12} className="text-indigo-500" /> Prioritária
                </label>
                <div className="flex items-center gap-2 p-1">
                  <input
                    id="prioritaria-checkbox"
                    type="checkbox"
                    checked={priority === TaskPriority.HIGH}
                    onChange={e => setPriority(e.target.checked ? TaskPriority.HIGH : TaskPriority.NORMAL)}
                    className="accent-red-600 w-5 h-5 rounded border border-slate-300 focus:ring-2 focus:ring-red-500"
                  />
                  <label htmlFor="prioritaria-checkbox" className="text-xs font-bold text-slate-700 select-none">Marcar como prioritária</label>
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                  <Calendar size={12} className="text-indigo-500" /> Prazo Final (Opcional)
                </label>
                <input
                  type="datetime-local"
                  value={deadline}
                  onChange={(e) => setDeadline(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2.5 px-4 text-sm font-medium focus:ring-2 focus:ring-indigo-500 focus:bg-white outline-none transition-all shadow-inner"
                />
              </div>
            </div>
          </div>

          <div className="pt-4 flex gap-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-6 py-3.5 border border-slate-200 text-slate-600 rounded-2xl text-xs font-black uppercase tracking-widest hover:bg-slate-50 transition-all"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex-[2] bg-indigo-600 text-white py-3.5 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-indigo-700 transition-all shadow-xl shadow-indigo-100 flex items-center justify-center gap-2 disabled:opacity-70"
            >
              {isSubmitting ? (
                <>
                  <Loader2 size={16} className="animate-spin" /> Processando...
                </>
              ) : (
                <>
                  <Save size={16} /> {task ? 'Atualizar Registro' : 'Lançar Tarefa'}
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
