// Serviço para buscar uma tarefa específica do Bitrix24 pelo ID
import { BitrixTask } from '../types';

const BASE_URL = 'https://agroserra.bitrix24.com.br/rest/77/1rbygnbdl3w9qpf9';

export const fetchBitrixTaskById = async (id: string | number): Promise<BitrixTask | null> => {
  try {
    const response = await fetch(`${BASE_URL}/tasks.task.get`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        taskId: String(id),
        select: ["ID", "TITLE", "RESPONSIBLE_ID", "RESPONSIBLE_NAME"]
      })
    });
    if (!response.ok) return null;
    const data = await response.json();
    const t = data.result?.task;
    if (!t) return null;
    return {
      ID: String(t.id || t.ID),
      TITLE: String(t.title || t.TITLE),
      DESCRIPTION: '',
      RESPONSIBLE_ID: String(t.responsibleId || t.RESPONSIBLE_ID),
      RESPONSIBLE_NAME: t.responsible?.name || t.RESPONSIBLE_NAME || `Usuário ${t.responsibleId || t.RESPONSIBLE_ID}`,
      CREATED_DATE: '',
      DEADLINE: null,
      CLOSED_DATE: null,
      PRIORITY: '',
      STATUS: '',
      PARENT_ID: null,
      GROUP_NAME: '',
      AUDITORS: [],
      TASK_TYPE: undefined,
    };
  } catch {
    return null;
  }
};
