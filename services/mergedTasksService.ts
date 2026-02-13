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

  // Mescla os dados para as tarefas do Bitrix (dentro do filtro de data)
  const merged = bitrixTasks.map(task => {
    const extra = batividadegMap.get(task.ID);
    return {
      ...task,
      batividadeg_prioridade: extra?.prioridade ?? false,
      batividadeg_comentario: extra?.comentario ?? '',
      batividadeg_dataprazofinal: extra?.dataprazofinal ?? ''
    };
  });

  // Agora, adiciona todas as tarefas prioritárias do banco auxiliar que não estão no resultado filtrado
  const mergedIds = new Set(merged.map(t => t.ID));
  const prioritariasExtras = batividadeg
    .filter(b => b.prioridade)
    .filter(b => !mergedIds.has(String(b.idtask)))
    .map(b => {
      // Cria um objeto mínimo para exibir na tabela, já que não temos todos os dados do Bitrix
      return {
        ID: String(b.idtask),
        TITLE: '(Tarefa fora do período)',
        DESCRIPTION: '',
        PRIORITY: '',
        STATUS: '',
        CREATED_DATE: '',
        DEADLINE: '',
        CLOSED_DATE: '',
        RESPONSIBLE_ID: '',
        RESPONSIBLE_NAME: '',
        PARENT_ID: null,
        GROUP_NAME: '',
        AUDITORS: [],
        TASK_TYPE: 'NORMAL',
        COMMENT: '',
        idgrupobitrix: b.idgrupobitrix,
        batividadeg_prioridade: b.prioridade ?? false,
        batividadeg_comentario: b.comentario ?? '',
        batividadeg_dataprazofinal: b.dataprazofinal ?? ''
      };
    });

  return [...merged, ...prioritariasExtras];
};
