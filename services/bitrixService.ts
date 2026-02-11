import { BitrixTask } from '../types';

// Ajustado para 16 caracteres (qpf9), que é o padrão de tokens do Bitrix24.
// A URL anterior de 14 caracteres causava o erro 401 (Não Autorizado).
const BASE_URL = 'https://agroserra.bitrix24.com.br/rest/215/7fsjn2lnwl8ntkn7';

export const fetchTasks = async (startDate?: string, endDate?: string): Promise<BitrixTask[]> => {
  try {
    // Busca tarefas com filtro de data se informado
    let url = 'http://10.0.0.6:3001/api/bbitrixtask';
    if (startDate && endDate) {
      url += `?createdDate_gte=${startDate}&createdDate_lte=${endDate}`;
    }
    const response = await fetch(url);
    if (!response.ok) throw new Error(`Erro na API: ${response.status}`);
    const data = await response.json();
    if (!Array.isArray(data)) return [];

    // Busca usuários responsáveis
    const usersResp = await fetch('http://10.0.0.6:3001/api/bbitrixuser');
    const usersData = usersResp.ok ? await usersResp.json() : [];
    const userMap = Array.isArray(usersData)
      ? Object.fromEntries(usersData.map((u: any) => [String(u.responsibleId), u.nome]))
      : {};

    // Busca grupos
    const gruposResp = await fetch('http://10.0.0.6:3001/api/bbitrixgrupo');
    const gruposData = gruposResp.ok ? await gruposResp.json() : [];
    const grupoMap = Array.isArray(gruposData)
      ? Object.fromEntries(gruposData.map((g: any) => [String(g.groupId), g.nome]))
      : {};

    // Determina o tipo da tarefa: MÃE, FILHA ou NORMAL
    const parentIds = new Set(data.map((t: any) => String(t.parentId)).filter((id: string) => id && id !== '0'));

    return data.map((t: any) => {
      const id = String(t.idtask);
      const parentId = String(t.parentId ?? '0');
      const isFilha = parentId !== '0' && parentId !== '';
      const isMae = data.some((other: any) => String(other.parentId) === id);
      let taskType: 'MÃE' | 'FILHA' | 'NORMAL' = 'NORMAL';
      if (isFilha) taskType = 'FILHA';
      else if (isMae) taskType = 'MÃE';

      return {
        ID: id,
        TITLE: t.title || '',
        DESCRIPTION: t.description || '',
        PRIORITY: String(t.priority ?? ''),
        STATUS: String(t.status ?? ''),
        CREATED_DATE: t.createdDate || '',
        DEADLINE: t.deadline || null,
        CLOSED_DATE: t.closedDate || null,
        RESPONSIBLE_ID: String(t.responsibleId ?? ''),
        RESPONSIBLE_NAME: userMap[String(t.responsibleId)] || '',
        PARENT_ID: parentId !== '0' ? parentId : null,
        GROUP_NAME: grupoMap[String(t.groupId)] || '',
        AUDITORS: [],
        TASK_TYPE: taskType,
        COMMENT: '',
        idgrupobitrix: t.groupId ?? undefined,
        batividadeg_prioridade: undefined,
        batividadeg_comentario: undefined,
        batividadeg_dataprazofinal: undefined,
      };
    });
  } catch (err) {
    console.error('Erro ao buscar tarefas:', err);
    return [];
  }
};

export const addTaskComment = async (taskId: string, message: string): Promise<boolean> => {
  try {
    const response = await fetch(`${BASE_URL}/task.commentitem.add`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        taskId: taskId,
        fields: { POST_MESSAGE: message }
      })
    });
    const data = await response.json();
    return !!data.result;
  } catch (error) {
    return false;
  }
};

export const updateTask = async (taskId: string, fields: any): Promise<boolean> => {
  try {
    const response = await fetch(`${BASE_URL}/tasks.task.update`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ taskId, fields })
    });
    const data = await response.json();
    return !!data.result;
  } catch (error) {
    return false;
  }
};
