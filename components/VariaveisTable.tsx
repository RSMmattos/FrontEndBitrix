import React, { useEffect, useState } from 'react';
import { fetchBitrixGroupNameById } from '../services/bitrixGroupNameService';
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
import DetalhesAtividadesModal from './DetalhesAtividadesModal';
import * as XLSX from 'xlsx';

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
  // Adiciona estado para exportação
  const [exporting, setExporting] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [bitrixGroups, setBitrixGroups] = useState<any[]>([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [modalGrupoId, setModalGrupoId] = useState<number | null>(null);
  const [modalGrupoNome, setModalGrupoNome] = useState<string>('');
  const [modalMes, setModalMes] = useState<string | null>(null);

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


  // Novo estado para nomes dos grupos Bitrix (deve ser declarado antes de qualquer return)
  const [groupNames, setGroupNames] = useState<{ [key: number]: string | null }>({});

  // Suporte a resposta como array simples ou objeto com registros
  let registros: any[] = [];
  if (Array.isArray(data)) {
    registros = data;
  } else if (data && Array.isArray(data.registros)) {
    registros = data.registros;
  }

  useEffect(() => {
    // Para cada registro, buscar o nome do grupo se ainda não estiver no cache
    const missingIds = registros
      .map((row) => Number(row.idgrupobitrix))
      .filter((id) => id && !(id in groupNames));
    if (missingIds.length > 0) {
      missingIds.forEach(async (id) => {
        const nome = await fetchBitrixGroupNameById(id);
        setGroupNames((prev) => ({ ...prev, [id]: nome }));
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [registros]);

  if (loading) return <div className="p-8 text-center">Carregando...</div>;
  if (error) return <div className="p-8 text-center text-red-600">{error}</div>;
  if (!registros || registros.length === 0) return <div className="p-8 text-center">Nenhum dado encontrado.</div>;

  // Extrai colunas dinâmicas
  const allKeys = Object.keys(registros[0] || {});
  // Colunas fixas (ajuste conforme necessário)
  const fixedColumns = ['codccusto_nome', 'idgrupobitrix', 'total_registros'];
  const dynamicColumns = allKeys.filter(
    (k) => !fixedColumns.includes(k)
  );

  // Função para exportar para Excel
  const handleExportExcel = () => {
    setExporting(true);
    // Monta dados para exportação
    const exportData = registros.map(row => {
      const idGrupo = Number(row.idgrupobitrix);
      const nomeGrupo = groupNames[idGrupo] || '';
      return {
        'Centro de Custo': row.codccusto_nome,
        'Grupo Bitrix': nomeGrupo ? `${idGrupo} - ${nomeGrupo}` : `ID: ${idGrupo}`,
        'Total': row.total_registros,
        ...dynamicColumns.reduce((acc, col) => {
          acc[col] = row[col];
          return acc;
        }, {})
      };
    });
    const ws = XLSX.utils.json_to_sheet(exportData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Atividades');
    XLSX.writeFile(wb, `atividades_${ano}.xlsx`);
    setExporting(false);
  };
  return (
    <>
      <div className="flex justify-end mb-2">
        <button
          className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-2 px-4 rounded shadow disabled:opacity-50"
          onClick={handleExportExcel}
          disabled={exporting || !registros.length}
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
              <th className="px-4 py-3 text-xs font-bold text-gray-500 uppercase">Total</th>
              {dynamicColumns.map((col) => (
                <th key={col} className="px-4 py-3 text-xs font-bold text-gray-500 uppercase">{col}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {registros.map((row, idx) => {
              const idGrupo = Number(row.idgrupobitrix);
              const nomeGrupo = groupNames[idGrupo];
              return (
                <tr key={idx} className="border-t hover:bg-gray-50 align-top">
                  <td className="px-4 py-3 text-sm">{row.codccusto_nome}</td>
                  <td className="px-4 py-3 text-sm">{nomeGrupo ? `${idGrupo} - ${nomeGrupo}` : `Buscando... (ID: ${idGrupo})`}</td>
                  <td className="px-4 py-3 text-sm text-center font-bold">
                    <button
                      className="text-emerald-700 underline hover:text-emerald-900"
                      onClick={() => {
                        setModalGrupoId(idGrupo);
                        setModalGrupoNome(nomeGrupo);
                        setModalMes(null);
                        setModalOpen(true);
                      }}
                      disabled={!idGrupo || !row.total_registros}
                    >
                      {row.total_registros}
                    </button>
                  </td>
                  {dynamicColumns.map((col) => (
                    <td key={col} className="px-4 py-3 text-sm text-center">
                      <button
                        className={typeof row[col] === 'number' && row[col] > 0 ? 'text-emerald-700 underline hover:text-emerald-900' : ''}
                        style={{ cursor: typeof row[col] === 'number' && row[col] > 0 ? 'pointer' : 'default', background: 'none', border: 'none', padding: 0 }}
                        disabled={!(typeof row[col] === 'number' && row[col] > 0)}
                        onClick={() => {
                          setModalGrupoId(idGrupo);
                          setModalGrupoNome(nomeGrupo);
                          setModalMes(col);
                          setModalOpen(true);
                        }}
                      >
                        {row[col]}
                      </button>
                    </td>
                  ))}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
      <DetalhesAtividadesModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        idgrupobitrix={modalGrupoId}
        grupoNome={modalGrupoNome}
        mes={modalMes}
        contexto={modalMes ? 'programadas' : undefined}
      />
    </>
  );
};

export default VariaveisTable;
