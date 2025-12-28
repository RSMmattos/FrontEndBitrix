import { API_BASE_URL } from '../constants';
import React, { useState, useEffect } from 'react';
import { Loader2, AlertCircle, RefreshCw, ChevronRight, ChevronDown } from 'lucide-react';
import { CostCenter } from '../types';

export const CostCenterList: React.FC = () => {
  const [costCenters, setCostCenters] = useState<CostCenter[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchCostCenters = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await fetch(`${API_BASE_URL}/api/gccusto`);
      if (!response.ok) {
        throw new Error('Erro ao carregar centros de custo');
      }
      const data = await response.json();
      setCostCenters(data);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCostCenters();
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
        <button onClick={fetchCostCenters} className="ml-auto bg-rose-500 text-white px-3 py-1 rounded-lg text-xs hover:bg-rose-600">
          Tentar novamente
        </button>
      </div>
    );
  }



  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-black text-slate-900">Centros de Custo</h2>
        <button onClick={fetchCostCenters} className="bg-emerald-600 text-white px-4 py-2 rounded-lg text-sm font-bold hover:bg-emerald-700 flex items-center gap-2">
          <RefreshCw size={16} />
          Atualizar
        </button>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead className="bg-slate-50/50">
              <tr>
                <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase">Código</th>
                <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase">Nome</th>
                <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase text-center">Ativo</th>
              </tr>
            </thead>
            <tbody>
              {costCenters.length > 0 ? (
                costCenters.map(cc => (
                  <tr key={cc.codccusto} className="border-t border-slate-100 hover:bg-slate-50/50">
                    <td className="px-6 py-4 text-sm font-medium text-slate-900">{cc.codccusto}</td>
                    <td className="px-6 py-4 text-sm font-medium text-slate-900">{cc.nome}</td>
                    <td className="px-6 py-4 text-sm font-medium text-slate-900 text-center">
                      {cc.ativo ? 'Sim' : 'Não'}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={3} className="px-6 py-12 text-center text-slate-400 font-medium">Nenhum centro de custo encontrado.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};