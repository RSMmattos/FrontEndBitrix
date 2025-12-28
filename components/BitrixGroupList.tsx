
import React, { useState, useEffect } from 'react';
import { Loader2, AlertCircle, RefreshCw } from 'lucide-react';
import { BitrixGroup } from '../types';

export const BitrixGroupList: React.FC = () => {
  const [groups, setGroups] = useState<BitrixGroup[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchGroups = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await fetch('https://agroserra.bitrix24.com.br/rest/187/wdalwcekbog0ke1r/sonet_group.get');
      if (!response.ok) throw new Error('Erro ao carregar grupos do Bitrix24');
      const data = await response.json();
      if (data.result && Array.isArray(data.result)) {
        setGroups(data.result.map((g: any) => ({ ...g, ID: g.ID?.toString?.() })));
      } else {
        throw new Error('Formato de resposta inválido');
      }
    } catch (err: any) {
      setError(err.message);
      console.error('Erro:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchGroups();
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
        <button onClick={fetchGroups} className="ml-auto bg-rose-500 text-white px-3 py-1 rounded-lg text-xs hover:bg-rose-600">
          Tentar novamente
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-black text-slate-900">Grupos do Bitrix</h2>
        <button onClick={fetchGroups} className="bg-emerald-600 text-white px-4 py-2 rounded-lg text-sm font-bold hover:bg-emerald-700 flex items-center gap-2">
          <RefreshCw size={16} />
          Atualizar
        </button>
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
              {groups.length > 0 ? (
                groups.map(group => (
                  <tr key={group.ID} className="border-t border-slate-100 hover:bg-slate-50/50">
                    <td className="px-6 py-4 text-sm font-medium text-slate-900">{group.ID}</td>
                    <td className="px-6 py-4 text-sm font-medium text-slate-900">{group.NAME}</td>
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
};