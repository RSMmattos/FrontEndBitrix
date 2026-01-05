// Serviço para buscar grupos do Bitrix

const GROUPS_API_URL = 'https://agroserra.bitrix24.com.br/rest/187/wdalwcekbog0ke1r/sonet_group.get';

export const fetchBitrixGroups = async () => {
  const response = await fetch(GROUPS_API_URL);
  if (!response.ok) throw new Error('Erro ao buscar grupos do Bitrix');
  const data = await response.json();
  // Retorna um mapa id -> nome do grupo
  const map: Record<string, string> = {};
  if (Array.isArray(data.result)) {
    data.result.forEach((g: any) => {
      if (g.ID && g.NAME) map[String(g.ID)] = g.NAME;
    });
  }
  return map;
};
