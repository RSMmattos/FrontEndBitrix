// Serviço para buscar uma tarefa específica do Bitrix24 pelo ID
import { BitrixTask } from '../types';

// const BASE_URL = 'https://agroserra.bitrix24.com.br/rest/77/1611kgqjihc2tsfy';
import { API_BASE_URL } from '../constants';
const BASE_URL = `${API_BASE_URL}/api`;

export const fetchBitrixTaskById = async (id: string | number): Promise<BitrixTask | null> => {
  try {
    const response = await fetch(`${BASE_URL}/bitrix-task`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        taskId: String(id)
      })
    });
    if (!response.ok) {
      console.error('Bitrix API response not ok:', response.status, response.statusText);
      return null;
    }
    const data = await response.json();
    console.log('Bitrix API response for taskId', id, data);
    const t = data.result?.task;
    if (!t) {
      console.warn('Bitrix API: task not found in response for id', id, data);
      return null;
    }
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
      STATUS: String(t.status || t.STATUS || ''),
      PARENT_ID: null,
      GROUP_NAME: '',
      AUDITORS: [],
      TASK_TYPE: undefined,
    };
  } catch (err) {
    console.error('Erro ao buscar tarefa no Bitrix:', err);
    return null;
  }
};
