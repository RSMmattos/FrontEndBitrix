// Integração dos dados da API Bitrix e batividadeg no carregamento das atividades
import { fetchTasks } from './bitrixService';
import { fetchBAtividadeG } from './batividadegService';
import { BitrixTask } from '../types';

export const fetchMergedTasks = async (startDate?: string, endDate?: string): Promise<BitrixTask[]> => {
  const [bitrixTasks, batividadeg] = await Promise.all([
    fetchTasks(startDate, endDate),
    fetchBAtividadeG()
  ]);

  // Cria um mapa para acesso rápido
  const batividadegMap = new Map(batividadeg.map(b => [String(b.idtask), b]));

  // Mescla os dados
  return bitrixTasks.map(task => {
    const extra = batividadegMap.get(task.ID);
    return {
      ...task,
      batividadeg_prioridade: extra?.prioridade ?? false,
      batividadeg_comentario: extra?.comentario ?? '',
      batividadeg_dataprazofinal: extra?.dataprazofinal ?? ''
    };
  });
};
