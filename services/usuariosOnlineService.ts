// Serviço para buscar usuários online do Bitrix24
export interface UsuarioOnline {
  ID: string;
  NOME: string;
  ONLINE: string;
}

export const fetchUsuariosOnline = async (): Promise<UsuarioOnline[]> => {
  let allUsers: UsuarioOnline[] = [];
  let start = 0;
  while (true) {
    const params = new URLSearchParams({
      start: start.toString(),
      SORT: 'NAME',
      order: 'ASC',
    });
    const response = await fetch('https://agroserra.bitrix24.com.br/rest/215/tvr0gkuvjdkc2oxn/user.get', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: params.toString(),
    });
    if (!response.ok) break;
    const json = await response.json();
    const usuarios = json.result || [];
    for (const user of usuarios) {
      allUsers.push({
        ID: user.ID,
        NOME: `${user.NAME || ''} ${user.LAST_NAME || ''}`.trim(),
        ONLINE: user.IS_ONLINE === 'Y' ? 'Online' : 'Offline',
      });
    }
    if (!('next' in json)) break;
    start = Number(json.next);
  }
  return allUsers;
};
