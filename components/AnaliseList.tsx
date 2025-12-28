




import React, { useEffect, useState } from 'react';
import { API_BASE_URL } from '../constants';
import { fetchBAtividadeG } from '../services/batividadegService';
import { fetchTasks } from '../services/bitrixService';
import { CostCenter, BitrixGroup, BitrixTask } from '../types';


interface AnaliseRow {
  grupoId: string;
  grupoNome: string;
  centroCusto: string;
  centroCustoNome: string;
  quantidade: number;
  atividadesPrioritarias: BitrixTask[];
}

export const AnaliseList: React.FC = () => {
  const [rows, setRows] = useState<AnaliseRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);

      import React, { useEffect, useState } from 'react';

      export const AnaliseList: React.FC = () => {
        const [data, setData] = useState<any>(null);
        const [loading, setLoading] = useState(true);
        const [error, setError] = useState<string | null>(null);

        useEffect(() => {
          const fetchResumo = async () => {
            setLoading(true);
            setError(null);
            try {
              const res = await fetch(`${API_BASE_URL}/api/relatorio/resumo-atividades-pivot`);
              const json = await res.json();
              setData(json);
            } catch (err: any) {
              setError(err.message || 'Erro desconhecido');
            }
            setLoading(false);
          };
          fetchResumo();
        }, []);

        if (loading) return <div className="p-8 text-center">Carregando...</div>;
        if (error) return <div className="p-8 text-center text-red-600">{error}</div>;
        if (!data) return null;

        // Extrai os meses dinamicamente
        const meses = Object.keys(data.registros[0] || {}).filter(k => /^\d{4}-\d{2}$/.test(k));

        return (
          <div className="space-y-4">
            <h2 className="text-2xl font-black text-slate-900 mb-2">Resumo de Atividades por Grupo</h2>
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-x-auto">
              <table className="w-full text-left">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-3 text-xs font-bold text-gray-500 uppercase">Centro de Custo</th>
                    <th className="px-4 py-3 text-xs font-bold text-gray-500 uppercase">Grupo Bitrix</th>
                    <th className="px-4 py-3 text-xs font-bold text-gray-500 uppercase">Total</th>
                    {meses.map(mes => (
                      <th key={mes} className="px-4 py-3 text-xs font-bold text-gray-500 uppercase">{mes}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {data.registros.map((row: any, idx: number) => (
                    <tr key={idx} className="border-t hover:bg-gray-50 align-top">
                      <td className="px-4 py-3 text-sm">{row.codccusto_nome}</td>
                      <td className="px-4 py-3 text-sm">{row.idgrupobitrix}</td>
                      <td className="px-4 py-3 text-sm text-center font-bold">{row.total_registros}</td>
                      {meses.map(mes => (
                        <td key={mes} className="px-4 py-3 text-sm text-center">{row[mes]}</td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        );
      };
  if (loading) return <div className="p-8 text-center">Carregando...</div>;
