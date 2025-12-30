import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { API_BASE_URL } from '../constants';

interface VariavelRegistro {
  [key: string]: string | number | null;
}

interface PorcentagemExecucaoTableProps {
  ano: number;
}

const PorcentagemExecucaoTable: React.FC<PorcentagemExecucaoTableProps> = ({ ano }) => {
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [bitrixGroups, setBitrixGroups] = useState<any[]>([]);

  useEffect(() => {
    setLoading(true);
    setError(null);
    Promise.all([
      axios.get(`${API_BASE_URL}/api/batividadeg/porcentagem-relatorio?ano=${ano}`),
      fetchBitrixGroups()
    ])
      .then(([res, groups]) => {
        setData(Array.isArray(res.data) ? res.data : []);
        setBitrixGroups(groups);
      })
      .catch((err) => setError(err.message || 'Erro desconhecido'))
      .finally(() => setLoading(false));
  }, [ano]);

  async function fetchBitrixGroups(): Promise<any[]> {
    try {
      const res = await fetch('https://agroserra.bitrix24.com.br/rest/187/wdalwcekbog0ke1r/sonet_group.get');
      const data = await res.json();
      return Array.isArray(data) ? data : data.result || [];
    } catch {
      return [];
    }
  }

  if (loading) return <div className="p-8 text-center">Carregando...</div>;
  if (error) return <div className="p-8 text-center text-red-600">{error}</div>;
  if (!data || data.length === 0) return <div className="p-8 text-center">Nenhum dado encontrado.</div>;

  const allKeys = Object.keys(data[0] || {});
  const fixedColumns = ['codccusto_nome', 'idgrupobitrix'];
  const dynamicColumns = allKeys.filter(
    (k) => !fixedColumns.includes(k)
  );

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-x-auto">
      <table className="w-full text-left">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-4 py-3 text-xs font-bold text-gray-500 uppercase">Centro de Custo</th>
            <th className="px-4 py-3 text-xs font-bold text-gray-500 uppercase">Grupo Bitrix</th>
            {dynamicColumns.map((col) => (
              <th key={col} className="px-4 py-3 text-xs font-bold text-gray-500 uppercase">{col}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {data.map((row, idx) => {
            const idGrupo = Number(row.idgrupobitrix);
            const bitrixGroup = Array.isArray(bitrixGroups)
              ? bitrixGroups.find(bg => bg && Number(bg.ID) === idGrupo)
              : undefined;
            const nomeGrupo = bitrixGroup?.NAME || '';
            return (
              <tr key={idx} className="border-t hover:bg-gray-50 align-top">
                <td className="px-4 py-3 text-sm">{row.codccusto_nome}</td>
                <td className="px-4 py-3 text-sm">{nomeGrupo ? `${idGrupo} - ${nomeGrupo}` : `Grupo não encontrado (ID: ${idGrupo})`}</td>
                {dynamicColumns.map((col) => {
                  const valor = row[col];
                  const isPercent = typeof valor === 'number' && col.match(/^\d{4}-\d{2}$/);
                  return (
                    <td
                      key={col}
                      className={
                        'px-4 py-3 text-sm text-center' +
                        (isPercent && valor > 0 ? ' text-emerald-700 font-bold bg-emerald-50' : '')
                      }
                    >
                      {isPercent ? `${valor}%` : valor}
                    </td>
                  );
                })}
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
};

export default PorcentagemExecucaoTable;
