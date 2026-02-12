import React, { useState, useEffect } from 'react';
import { Loader2, AlertCircle, RefreshCw, Search } from 'lucide-react';

export const BitrixGroupList: React.FC = () => {
  const [groups, setGroups] = useState<{ groupId: number; nome: string }[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");

  const fetchGroups = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch('http://10.0.0.6:3001/api/bbitrixgrupo');
      if (!response.ok) throw new Error('Erro ao buscar grupos');
      const data = await response.json();
      if (Array.isArray(data)) {
        setGroups(data);
      } else {
        throw new Error('Formato de resposta inválido');
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchGroups();
  }, []);

  const filteredGroups = groups.filter(g =>
    g.nome.toLowerCase().includes(search.toLowerCase()) ||
    g.groupId.toString().includes(search)
  );

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
        <button onClick={fetchGroups} className="ml-auto bg-rose-500 text-white px-3 py-1 rounded-lg text-xs hover:bg-rose-600">
          Tentar novamente
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-black text-slate-900">Grupos Bitrix</h2>
        <button onClick={fetchGroups} className="bg-emerald-600 text-white px-4 py-2 rounded-lg text-sm font-bold hover:bg-emerald-700 flex items-center gap-2">
          <RefreshCw size={16} /> Atualizar
        </button>
      </div>
      <div className="mb-4">
        <div className="relative w-96">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
          <input
            type="text"
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Buscar por nome ou ID..."
            className="w-full bg-slate-100 border-none rounded-xl py-2.5 pl-10 pr-4 text-sm focus:ring-2 focus:ring-emerald-500 transition-all"
          />
        </div>
      </div>
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead className="bg-slate-50/50">
              <tr>
                <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase">ID</th>
                <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase">Nome</th>
              </tr>
            </thead>
            <tbody>
              {filteredGroups.length > 0 ? (
                filteredGroups.map(group => (
                  <tr key={group.groupId} className="border-t border-slate-100 hover:bg-slate-50/50">
                    <td className="px-6 py-4 text-sm font-medium text-slate-900">{group.groupId}</td>
                    <td className="px-6 py-4 text-sm font-medium text-slate-900">{group.nome}</td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={2} className="px-6 py-12 text-center text-slate-400 font-medium">Nenhum grupo encontrado.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
// ...existing code...
};
// ...existing code...