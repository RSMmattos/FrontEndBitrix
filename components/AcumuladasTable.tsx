import React, { useEffect, useState } from 'react';
import { fetchBitrixGroupNameById } from '../services/bitrixGroupNameService';
import axios from 'axios';
import { API_BASE_URL } from '../constants';
import DetalhesAtividadesModal from './DetalhesAtividadesModal';

interface VariavelRegistro {
  [key: string]: string | number | null;
}

interface VariaveisResponse {
  registros: VariavelRegistro[];
}

interface AcumuladasTableProps {
  ano: number;
}

const AcumuladasTable: React.FC<AcumuladasTableProps> = ({ ano }) => {
  const [data, setData] = useState<VariaveisResponse | null | any[]>(null);
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
      axios.get(`${API_BASE_URL}/api/batividadeg/saldo-acumulado-relatorio?ano=${ano}`),
      fetchBitrixGroups()
    ])
      .then(([res, groups]) => {
        setData(res.data);
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

  let registros: any[] = [];
  if (Array.isArray(data)) {
    registros = data;
  } else if (data && Array.isArray(data.registros)) {
    registros = data.registros;
  }

  useEffect(() => {
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

  if (!registros || registros.length === 0) return <div className="p-8 text-center">Nenhum dado encontrado.</div>;

  const allKeys = Object.keys(registros[0] || {});
  const fixedColumns = ['codccusto_nome', 'idgrupobitrix', 'total_registros'];
  const dynamicColumns = allKeys.filter(
    (k) => !fixedColumns.includes(k)
  );

  return (
    <>
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
        contexto={modalMes ? 'saldo' : undefined}
        apiModal={modalMes && modalGrupoId ? `/api/batividadeg/modal_saldo_acumulado/${modalGrupoId}?mes_ref=${modalMes}` : undefined}
      />
    </>
  );
};

export default AcumuladasTable;
