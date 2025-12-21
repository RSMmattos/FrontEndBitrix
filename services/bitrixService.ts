
import { BitrixTask } from '../types';

// Ajustado para 16 caracteres (qpf9), que é o padrão de tokens do Bitrix24.
// A URL anterior de 14 caracteres causava o erro 401 (Não Autorizado).
const BASE_URL = 'https://agroserra.bitrix24.com.br/rest/77/1rbygnbdl3w9qpf9';

export const fetchTasks = async (startDate?: string, endDate?: string): Promise<BitrixTask[]> => {
  let allTasks: any[] = [];
  let start = 0;
  let hasMore = true;

  try {
    const filter: any = {};
    if (startDate) filter[">=CREATED_DATE"] = `${startDate}T00:00:00`;
    if (endDate) filter["<=CREATED_DATE"] = `${endDate}T23:59:59`;

    while (hasMore) {
      const response = await fetch(`${BASE_URL}/tasks.task.list`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          order: { ID: 'DESC' },
          filter: filter,
          select: ["ID", "TITLE", "DESCRIPTION", "RESPONSIBLE_ID", "CREATED_DATE", "DEADLINE", "CLOSED_DATE", "PARENT_ID", "GROUP_ID", "PRIORITY", "STATUS", "AUDITORS"],
          start: start
        })
      });

      if (response.status === 401) {
        throw new Error("Chave do Webhook inválida ou expirada (Erro 401). Verifique a URL no código.");
      }

      if (!response.ok) throw new Error(`Erro na API: ${response.status}`);
      
      const data = await response.json();
      const currentBatch = data.result?.tasks || data.result || [];
      
      if (!Array.isArray(currentBatch)) {
        hasMore = false;
        break;
      }

      allTasks = [...allTasks, ...currentBatch];
      
      if (data.next && currentBatch.length >= 50) {
        start = data.next;
      } else {
        hasMore = false;
      }

      if (start > 5000) break; // Limite para evitar travamentos
    }

    const parentIds = new Set(allTasks.map((t: any) => String(t.parentId || t.PARENT_ID)).filter((id: string) => id !== "0" && id !== ""));

    return allTasks.map((t: any) => {
      const id = String(t.id || t.ID);
      const parentId = String(t.parentId || t.PARENT_ID || "0");
      const isFilha = parentId !== "0" && parentId !== "";
      const isMae = parentIds.has(id);
      
      return {
        ID: id,
        TITLE: String(t.title || t.TITLE),
        DESCRIPTION: String(t.description || t.DESCRIPTION || ""),
        RESPONSIBLE_ID: String(t.responsibleId || t.RESPONSIBLE_ID),
        RESPONSIBLE_NAME: t.responsible?.name || t.RESPONSIBLE_NAME || `Usuário ${t.responsibleId || t.RESPONSIBLE_ID}`,
        CREATED_DATE: t.createdDate || t.CREATED_DATE,
        DEADLINE: t.deadline || t.DEADLINE || null,
        CLOSED_DATE: t.closedDate || t.CLOSED_DATE || null,
        PRIORITY: String(t.priority || t.PRIORITY),
        STATUS: String(t.status || t.STATUS),
        PARENT_ID: isFilha ? parentId : null,
        GROUP_NAME: (t.group?.name || t.GROUP_NAME) || "Geral",
        AUDITORS: t.auditorsData ? Object.values(t.auditorsData).map((a: any) => a.name) : [],
        TASK_TYPE: isFilha ? 'FILHA' : (isMae ? 'MÃE' : 'NORMAL')
      };
    }) as BitrixTask[];

  } catch (error: any) {
    console.error('Erro Bitrix Service:', error);
    throw error;
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
