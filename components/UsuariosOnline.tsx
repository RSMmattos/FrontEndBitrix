import React, { useEffect, useState } from 'react';
import { Loader2, AlertCircle, Search } from 'lucide-react';

interface Usuario {
  ID: string;
  NOME: string;
  STATUS: string;
  EMAIL: string;
  CARGO: string;
  ONLINE: string;
  TELEFONE: string;
  ULTIMO_LOGIN: string;
}

export const UsuariosOnline: React.FC = () => {
  const [usuarios, setUsuarios] = useState<Usuario[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState('');

  const fetchUsuarios = async () => {
    setLoading(true);
    setError(null);
    let allUsers: Usuario[] = [];
    let start = 0;
    try {
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
            STATUS: user.ACTIVE ? 'Ativo' : 'Inativo',
            EMAIL: user.EMAIL || '',
            CARGO: user.WORK_POSITION || '',
            ONLINE: user.IS_ONLINE === 'Y' ? 'Online' : 'Offline',
            TELEFONE: user.PERSONAL_MOBILE || '',
            ULTIMO_LOGIN: user.LAST_LOGIN || '',
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

  useEffect(() => {
    fetchUsuarios();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="animate-spin text-emerald-500" size={32} />
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 bg-rose-50 border border-rose-100 rounded-2xl text-rose-600 text-sm font-bold flex items-center gap-3">
        <AlertCircle size={20} />
        {error}
      </div>
    );
  }

  // Filtro de pesquisa
  const filteredUsuarios = usuarios.filter(u =>
    u.NOME.toLowerCase().includes(search.toLowerCase()) ||
    u.EMAIL.toLowerCase().includes(search.toLowerCase()) ||
    u.CARGO.toLowerCase().includes(search.toLowerCase()) ||
    u.TELEFONE.toLowerCase().includes(search.toLowerCase()) ||
    u.ONLINE.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-black text-slate-900">Usuários Online</h2>
      <div className="mb-4 flex items-center gap-2">
        <div className="relative w-full max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
          <input
            type="text"
            className="w-full bg-slate-100 border-none rounded-xl py-2.5 pl-10 pr-4 text-sm focus:ring-2 focus:ring-emerald-500 transition-all"
            placeholder="Buscar por nome, email, cargo, telefone ou status..."
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>
      </div>
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead className="bg-slate-50/50">
            <tr>
              <th className="px-4 py-2 text-xs font-bold text-slate-500 uppercase">ID</th>
              <th className="px-4 py-2 text-xs font-bold text-slate-500 uppercase">Nome</th>
              <th className="px-4 py-2 text-xs font-bold text-slate-500 uppercase">Status</th>
              <th className="px-4 py-2 text-xs font-bold text-slate-500 uppercase">Email</th>
              <th className="px-4 py-2 text-xs font-bold text-slate-500 uppercase">Cargo</th>
              <th className="px-4 py-2 text-xs font-bold text-slate-500 uppercase">Online</th>
              <th className="px-4 py-2 text-xs font-bold text-slate-500 uppercase">Telefone</th>
              <th className="px-4 py-2 text-xs font-bold text-slate-500 uppercase">Último Login</th>
            </tr>
          </thead>
          <tbody>
            {filteredUsuarios.length > 0 ? (
              filteredUsuarios.map((user, idx) => (
                <tr key={user.ID + idx} className="border-t border-slate-100 hover:bg-slate-50/50">
                  <td className="px-4 py-2 text-sm">{user.ID}</td>
                  <td className="px-4 py-2 text-sm">{user.NOME}</td>
                  <td className="px-4 py-2 text-sm text-center font-bold">{user.STATUS}</td>
                  <td className="px-4 py-2 text-sm">{user.EMAIL}</td>
                  <td className="px-4 py-2 text-sm">{user.CARGO}</td>
                  <td className={`px-4 py-2 text-sm text-center font-bold ${user.ONLINE === 'Online' ? 'text-green-700 bg-green-100' : 'text-gray-500 bg-gray-100'}`}>{user.ONLINE}</td>
                  <td className="px-4 py-2 text-sm">{user.TELEFONE}</td>
                  <td className="px-4 py-2 text-sm">{user.ULTIMO_LOGIN}</td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={8} className="px-4 py-12 text-center text-slate-400 font-medium">Nenhum usuário encontrado.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};
