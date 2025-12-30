import React, { useEffect, useState } from 'react';
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
  const [data, setData] = useState<VariaveisResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setLoading(true);
    setError(null);
    axios
      .get(`${API_BASE_URL}/api/batividadeg/data-prazo-final-relatorio?ano=${ano}`)
      .then((res) => {
        // Aceita tanto array direto quanto objeto com chave 'registros'
        if (Array.isArray(res.data)) {
          setData({ registros: res.data });
        } else if (res.data && Array.isArray(res.data.registros)) {
          setData(res.data);
        } else {
          setData({ registros: [] });
        }
      })
      .catch((err) => setError(err.message || 'Erro desconhecido'))
      .finally(() => setLoading(false));
  }, [ano]);

  if (loading) return <div className="p-8 text-center">Carregando...</div>;
  if (error) return <div className="p-8 text-center text-red-600">{error}</div>;
  if (!data || !data.registros || data.registros.length === 0) return <div className="p-8 text-center">Nenhum dado encontrado.</div>;

  // Extrai colunas dinâmicas
  const allKeys = Object.keys(data.registros[0] || {});
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
          {data.registros.map((row, idx) => (
            <tr key={idx} className="border-t hover:bg-gray-50 align-top">
              <td className="px-4 py-3 text-sm">{row.codccusto_nome}</td>
              <td className="px-4 py-3 text-sm">{row.idgrupobitrix}</td>
              <td className="px-4 py-3 text-sm text-center font-bold">{row.total_registros}</td>
              {dynamicColumns.map((col) => (
                <td key={col} className="px-4 py-3 text-sm text-center">{row[col]}</td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default VariaveisTable;
