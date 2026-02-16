import React, { useEffect, useState } from 'react';
import { fetchBitrixGroupNameById } from '../services/bitrixGroupNameService';
import axios from 'axios';
import { API_BASE_URL } from '../constants';
import * as XLSX from 'xlsx';

interface VariavelRegistro {
  [key: string]: string | number | null;
}

interface PorcentagemExecucaoTableProps {
  ano: number;
}

const PorcentagemExecucaoTable: React.FC<PorcentagemExecucaoTableProps> = ({ ano }) => {
    const [exporting, setExporting] = useState(false);
    // Função para exportar para Excel
    const handleExportExcel = () => {
      setExporting(true);
      const exportData = data.map(row => {
        const idGrupo = Number(row.idgrupobitrix);
        const nomeGrupo = groupNames[idGrupo] || '';
        return {
          'Centro de Custo': row.codccusto_nome,
          'Grupo Bitrix': nomeGrupo ? `${idGrupo} - ${nomeGrupo}` : `ID: ${idGrupo}`,
          ...dynamicColumns.reduce((acc, col) => {
            acc[col] = row[col];
            return acc;
          }, {})
        };
      });
      const ws = XLSX.utils.json_to_sheet(exportData);
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, '% Execução');
      XLSX.writeFile(wb, `porcentagem_execucao_${ano}.xlsx`);
      setExporting(false);
    };
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


  // Novo estado para nomes dos grupos Bitrix (deve ser declarado antes de qualquer return)
  const [groupNames, setGroupNames] = useState<{ [key: number]: string | null }>({});

  useEffect(() => {
    const missingIds = data
      .map((row) => Number(row.idgrupobitrix))
      .filter((id) => id && !(id in groupNames));
    if (missingIds.length > 0) {
      missingIds.forEach(async (id) => {
        const nome = await fetchBitrixGroupNameById(id);
        setGroupNames((prev) => ({ ...prev, [id]: nome }));
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [data]);

  if (loading) return <div className="p-8 text-center">Carregando...</div>;
  if (error) return <div className="p-8 text-center text-red-600">{error}</div>;
  if (!data || data.length === 0) return <div className="p-8 text-center">Nenhum dado encontrado.</div>;

  const allKeys = Object.keys(data[0] || {});
  const fixedColumns = ['codccusto_nome', 'idgrupobitrix'];
  const dynamicColumns = allKeys.filter(
    (k) => !fixedColumns.includes(k)
  );

  return (
    <>
      <div className="flex justify-end mb-2">
        <button
          className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-2 px-4 rounded shadow disabled:opacity-50"
          onClick={handleExportExcel}
          disabled={exporting || !data.length}
        >
          {exporting ? 'Exportando...' : 'Exportar para Excel'}
        </button>
      </div>
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
              const nomeGrupo = groupNames[idGrupo];
              return (
                <tr key={idx} className="border-t hover:bg-gray-50 align-top">
                  <td className="px-4 py-3 text-sm">{row.codccusto_nome}</td>
                  <td className="px-4 py-3 text-sm">{nomeGrupo ? `${idGrupo} - ${nomeGrupo}` : `Buscando... (ID: ${idGrupo})`}</td>
                  {dynamicColumns.map((col) => {
                    const valor = row[col];
                    const isPercent = typeof valor === 'number' && col.match(/^[\d]{4}-[\d]{2}$/);
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
    </>
  );
};

export default PorcentagemExecucaoTable;
