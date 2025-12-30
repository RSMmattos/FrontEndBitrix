import React, { useEffect, useState } from 'react';
// Função utilitária para buscar grupos Bitrix
async function fetchBitrixGroups(): Promise<any[]> {
  try {
    const res = await fetch('https://agroserra.bitrix24.com.br/rest/187/wdalwcekbog0ke1r/sonet_group.get');
    const data = await res.json();
    return Array.isArray(data) ? data : data.result || [];
  } catch {
    return [];
  }
}
import axios from 'axios';
import { API_BASE_URL } from '../constants';

interface VariavelRegistro {
  [key: string]: string | number | null;
}

interface VariaveisResponse {
  registros: VariavelRegistro[];
}

interface VariaveisTableProps {
  ano: number;
}


const VariaveisTable: React.FC<VariaveisTableProps> = ({ ano }) => {
  const [data, setData] = useState<VariaveisResponse | null | any[]>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [bitrixGroups, setBitrixGroups] = useState<any[]>([]);

  useEffect(() => {
    setLoading(true);
    setError(null);
    Promise.all([
      axios.get(`${API_BASE_URL}/api/batividadeg/data-prazo-final-relatorio?ano=${ano}`),
      fetchBitrixGroups()
    ])
      .then(([res, groups]) => {
        console.log('API DATA:', res.data);
        console.log('BITRIX GROUPS:', groups);
        setData(res.data);
        setBitrixGroups(groups);
      })
      .catch((err) => setError(err.message || 'Erro desconhecido'))
      .finally(() => setLoading(false));
  }, [ano]);

  if (loading) return <div className="p-8 text-center">Carregando...</div>;
  if (error) return <div className="p-8 text-center text-red-600">{error}</div>;

  // Suporte a resposta como array simples ou objeto com registros
  let registros: any[] = [];
  if (Array.isArray(data)) {
    registros = data;
  } else if (data && Array.isArray(data.registros)) {
    registros = data.registros;
  }
  if (!registros || registros.length === 0) return <div className="p-8 text-center">Nenhum dado encontrado.</div>;

  // Extrai colunas dinâmicas
  const allKeys = Object.keys(registros[0] || {});
  // Colunas fixas (ajuste conforme necessário)
  const fixedColumns = ['codccusto_nome', 'idgrupobitrix', 'total_registros'];
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
            <th className="px-4 py-3 text-xs font-bold text-gray-500 uppercase">Total</th>
            {dynamicColumns.map((col) => (
              <th key={col} className="px-4 py-3 text-xs font-bold text-gray-500 uppercase">{col}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {registros.map((row, idx) => {
            const idGrupo = Number(row.idgrupobitrix);
            const bitrixGroup = Array.isArray(bitrixGroups)
              ? bitrixGroups.find(bg => bg && Number(bg.ID) === idGrupo)
              : undefined;
            const nomeGrupo = bitrixGroup?.NAME || '';
            return (
              <tr key={idx} className="border-t hover:bg-gray-50 align-top">
                <td className="px-4 py-3 text-sm">{row.codccusto_nome}</td>
                <td className="px-4 py-3 text-sm">{nomeGrupo ? `${idGrupo} - ${nomeGrupo}` : `Grupo não encontrado (ID: ${idGrupo})`}</td>
                <td className="px-4 py-3 text-sm text-center font-bold">{row.total_registros}</td>
                {dynamicColumns.map((col) => (
                  <td key={col} className="px-4 py-3 text-sm text-center">{row[col]}</td>
                ))}
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
};

export default VariaveisTable;
