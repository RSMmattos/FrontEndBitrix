import React from 'react';
import { Trash2 } from 'lucide-react';

interface ConfirmDeleteModalProps {
  open: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title?: string;
  message?: string;
  loading?: boolean;
}

const ConfirmDeleteModal: React.FC<ConfirmDeleteModalProps> = ({ open, onClose, onConfirm, title = 'Confirmar Exclusão', message, loading }) => {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-md transition-opacity" onClick={onClose} />
      <div className="relative w-full max-w-sm bg-white rounded-3xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
        <div className="px-8 pt-6 pb-2 flex items-center gap-3">
          <Trash2 size={24} className="text-rose-700" />
          <h2 className="text-lg font-black text-rose-700 tracking-tight">{title}</h2>
        </div>
        <div className="px-8 pb-4 text-slate-700 font-semibold text-left">
          <span>Tem certeza que deseja <span className="text-rose-700 font-bold">excluir</span> esta atividade? Esta ação não poderá ser desfeita.</span>
        </div>
        <div className="flex gap-4 px-8 pb-8 pt-2">
          <button
            onClick={onConfirm}
            className="flex-1 bg-rose-600 text-white py-3 rounded-lg font-bold text-xs uppercase tracking-widest hover:bg-rose-700 transition-all shadow-xl shadow-rose-100 flex items-center justify-center gap-2 disabled:opacity-70"
            style={{ borderRadius: '8px' }}
            disabled={loading}
          >
            {loading ? 'Excluindo...' : 'Excluir'}
          </button>
          <button
            onClick={onClose}
            className="flex-1 bg-slate-100 text-slate-600 py-3 rounded-lg font-bold text-xs uppercase tracking-widest border border-slate-200 hover:bg-slate-200 transition-all"
            style={{ borderRadius: '8px' }}
            disabled={loading}
          >
            Cancelar
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmDeleteModal;
