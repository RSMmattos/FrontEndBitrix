// Serviço para buscar usuários online do Bitrix24
export interface UsuarioOnline {
  ID: string;
  NOME: string;
  ONLINE: string;
}

import { fetchBitrixUsers } from './bitrixUsersService';

export const fetchUsuariosOnline = async (): Promise<UsuarioOnline[]> => {
  let allUsers: UsuarioOnline[] = [];
  let start = 0;
  while (true) {
    const params = {
      start: start.toString(),
      SORT: 'NAME',
      order: 'ASC',
    };
    const json = await fetchBitrixUsers(params);
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
