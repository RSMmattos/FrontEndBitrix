// URL base centralizada para as APIs do sistema
//export const API_BASE_URL = 'http://localhost:3001';
export const API_BASE_URL = 'http://10.0.0.6:3001';


import React from 'react';
import { TaskStatus, TaskPriority } from './types';
import { 
  CheckCircle2, 
  Circle, 
  Clock, 
  AlertCircle, 
  PauseCircle, 
  XCircle, 
  PlayCircle,
  Zap
} from 'lucide-react';

export const STATUS_MAP: Record<string, { label: string; color: string; icon: React.ReactNode }> = {
  [TaskStatus.NEW]: { label: 'Nova', color: 'bg-emerald-50 text-emerald-700 border-emerald-100', icon: <Circle size={14} /> },
  [TaskStatus.PENDING]: { label: 'Aguardando', color: 'bg-amber-50 text-amber-700 border-amber-100', icon: <Clock size={14} /> },
  [TaskStatus.IN_PROGRESS]: { label: 'Em Campo', color: 'bg-indigo-50 text-indigo-700 border-indigo-100', icon: <PlayCircle size={14} /> },
  [TaskStatus.SUPPOSEDLY_COMPLETED]: { label: 'Em Revisão', color: 'bg-purple-50 text-purple-700 border-purple-100', icon: <Zap size={14} /> },
  [TaskStatus.COMPLETED]: { label: 'Finalizada', color: 'bg-teal-50 text-teal-700 border-teal-100', icon: <CheckCircle2 size={14} /> },
  [TaskStatus.DEFERRED]: { label: 'Postergada', color: 'bg-slate-100 text-slate-600 border-slate-200', icon: <PauseCircle size={14} /> },
  [TaskStatus.DECLINED]: { label: 'Cancelada', color: 'bg-rose-50 text-rose-700 border-rose-100', icon: <XCircle size={14} /> },
};

export const PRIORITY_MAP: Record<string, { label: string; color: string; dot: string }> = {
  [TaskPriority.LOW]: { label: 'Baixa', color: 'text-slate-400', dot: 'bg-slate-300' },
  [TaskPriority.NORMAL]: { label: 'Normal', color: 'text-emerald-600', dot: 'bg-emerald-500' },
  [TaskPriority.HIGH]: { label: 'Urgente', color: 'text-rose-600 font-bold', dot: 'bg-rose-500' },
};
