import React, { useEffect, useState } from 'react';

interface UsuarioLogin {
  ID: string;
  NOME: string;
  LAST_LOGIN: string;
  // LOGIN_COUNT: number; // Se disponível
}

export const UsuariosLoginStats: React.FC = () => {
  const [usuarios, setUsuarios] = useState<UsuarioLogin[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [dataInicial, setDataInicial] = useState('');
  const [dataFinal, setDataFinal] = useState('');

  useEffect(() => {
    const fetchUsuarios = async () => {
      setLoading(true);
      setError(null);
      try {
        let allUsers: UsuarioLogin[] = [];
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
          if (!response.ok) throw new Error('Erro ao buscar usuários: ' + (await response.text()));
          const json = await response.json();
          const usuarios = json.result || [];
          for (const user of usuarios) {
            allUsers.push({
              ID: user.ID,
              NOME: `${user.NAME || ''} ${user.LAST_NAME || ''}`.trim(),
              LAST_LOGIN: user.LAST_LOGIN || '',
              // LOGIN_COUNT: user.LOGIN_COUNT || 0,
            });
          }
          if (!('next' in json)) break;
          start = Number(json.next);
        }
        setUsuarios(allUsers);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchUsuarios();
  }, []);

  // Filtro de datas (apenas visual, pois API não filtra por login)
  const usuariosFiltrados = usuarios.filter(u => {
    if (!dataInicial && !dataFinal) return true;
    if (!u.LAST_LOGIN) return false;
    const loginDate = new Date(u.LAST_LOGIN);
    if (dataInicial && loginDate < new Date(dataInicial)) return false;
    if (dataFinal && loginDate > new Date(dataFinal)) return false;
    return true;
  });

  // Não há campo nativo de contagem de logins, então só mostraremos último login

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-8">
      <h2 className="text-2xl font-black text-emerald-700 mb-6">Estatísticas de Login dos Usuários</h2>
      <div className="mb-6 flex flex-col gap-2 sm:flex-row sm:items-center">
        <div className="flex items-center gap-2 bg-white border border-slate-200 p-2 rounded-2xl shadow-sm">
          <span className="text-xs font-bold text-slate-500">Filtrar por data de login:</span>
          <input type="date" value={dataInicial} onChange={e => setDataInicial(e.target.value)} className="text-xs font-bold border-none bg-slate-50 p-2 rounded-lg" />
          <span className="text-slate-400">até</span>
          <input type="date" value={dataFinal} onChange={e => setDataFinal(e.target.value)} className="text-xs font-bold border-none bg-slate-50 p-2 rounded-lg" />
        </div>
      </div>
      {loading ? (
        <div className="text-slate-400">Carregando...</div>
      ) : error ? (
        <div className="text-rose-600">{error}</div>
      ) : (
        <table className="w-full text-left border-collapse">
          <thead className="bg-slate-50/50">
            <tr>
              <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase">Nome</th>
              <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase">Último Login</th>
            </tr>
          </thead>
          <tbody>
            {usuariosFiltrados.map((u) => (
              <tr key={u.ID} className="border-b border-slate-100">
                <td className="px-6 py-4 text-sm text-slate-700">{u.NOME}</td>
                <td className="px-6 py-4 text-sm text-slate-600">{u.LAST_LOGIN ? new Date(u.LAST_LOGIN).toLocaleString('pt-BR') : '--'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
};
