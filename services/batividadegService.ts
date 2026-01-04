// Serviço para integração com a API batividadeg
import axios from 'axios';
import { API_BASE_URL } from '../constants';
const API_URL = `${API_BASE_URL}/api/batividadeg`;

export interface BAtividadeG {
  idtask: number;
  idgrupobitrix?: number; // ID do grupo Bitrix vinculado à tarefa
  comentario?: string;
  prioridade?: boolean;
  dataprazofinal?: string;
  dataconclusao?: string;
}

export const fetchBAtividadeG = async (): Promise<BAtividadeG[]> => {
  const res = await axios.get(API_URL);
  // Se vier { value: [...] } retorna o array, senão retorna o próprio data (array ou vazio)
  if (Array.isArray(res.data)) return res.data;
  if (res.data && Array.isArray(res.data.value)) return res.data.value;
  return [];
};

export const fetchBAtividadeGById = async (idtask: number): Promise<BAtividadeG | null> => {
  try {
    const res = await axios.get(`${API_URL}/${idtask}`);
    return res.data;
  } catch {
    return null;
  }
};

export const updateBAtividadeG = async (idtask: number, data: Partial<BAtividadeG>): Promise<void> => {
  await axios.put(`${API_URL}/${idtask}`, data);
};

export const createBAtividadeG = async (data: BAtividadeG): Promise<void> => {
  await axios.post(API_URL, data);
};

export const deleteBAtividadeG = async (idtask: number): Promise<void> => {
  await axios.delete(`${API_URL}/${idtask}`);
};
