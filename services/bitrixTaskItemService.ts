// Serviço para buscar uma tarefa específica do Bitrix via task.item.get
export const fetchBitrixTaskItem = async (taskId: number) => {
  const url = 'https://agroserra.bitrix24.com.br/rest/77/1611kgqjihc2tsfy/task.item.get';
  const response = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ TASKID: taskId })
  });
  if (!response.ok) throw new Error('Erro ao buscar tarefa Bitrix: ' + response.status);
  const data = await response.json();
  return data;
};
