// ...existing code...
import React, { useEffect, useState } from 'react';
import { API_BASE_URL } from '../constants';
import DetalhesAtividadesModal from './DetalhesAtividadesModal';


const ResumoAtividadesPivot: React.FC = () => {
  const [data, setData] = useState<any>(null);
  const [dataConclusao, setDataConclusao] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [grupos, setGrupos] = useState<Record<string, string>>({});
  const [modalOpen, setModalOpen] = useState(false);
  const [modalGrupoId, setModalGrupoId] = useState<string | number | null>(null);
  const [modalGrupoNome, setModalGrupoNome] = useState<string | undefined>(undefined);
  const [modalMes, setModalMes] = useState<string | null>(null);
  const [modalContexto, setModalContexto] = useState<'programadas' | 'executadas' | 'saldo'>('programadas');

  useEffect(() => {
    const fetchResumo = async () => {
      setLoading(true);
      setError(null);
      try {
        const [resResumo, resConclusao, resGrupos] = await Promise.all([
          fetch(`${API_BASE_URL}/api/relatorio/resumo-atividades-pivot`),
          fetch(`${API_BASE_URL}/api/relatorio/resumo-atividades-pivot-conclusao`),
          fetch('https://agroserra.bitrix24.com.br/rest/187/wdalwcekbog0ke1r/sonet_group.get')
        ]);
        const jsonResumo = await resResumo.json();
        const jsonConclusao = await resConclusao.json();
        const jsonGrupos = await resGrupos.json();
        setData(jsonResumo);
        setDataConclusao(jsonConclusao);
        // Monta um mapa id -> nome
        const map: Record<string, string> = {};
        (jsonGrupos.result || []).forEach((g: any) => {
          map[String(g.ID)] = g.NAME;
        });
        setGrupos(map);
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
  const mesesConclusao = dataConclusao && dataConclusao.registros && dataConclusao.registros[0]
    ? Object.keys(dataConclusao.registros[0]).filter(k => /^\d{4}-\d{2}$/.test(k))
    : [];

  // --- Saldo Acumulado ---
  // Estrutura: { [idgrupobitrix]: { [mes]: saldo } }
  const saldoAcumulado: Record<string, Record<string, number>> = {};
  if (data && data.registros && dataConclusao && dataConclusao.registros) {
    // Agrupa por grupo
    const gruposIds = Array.from(new Set(data.registros.map((r: any) => r.idgrupobitrix)));
    gruposIds.forEach((gid) => {
      saldoAcumulado[gid] = {};
      let saldoAnterior = 0;
      meses.forEach((mes) => {
        // Atividades programadas para o mês
        const reg = data.registros.find((r: any) => r.idgrupobitrix === gid);
        const programadas = reg && reg[mes] ? Number(reg[mes]) : 0;
        // Atividades concluídas no mês (com dataconclusao dentro do mês)
        const regConcl = dataConclusao.registros.find((r: any) => r.idgrupobitrix === gid);
        const concluidas = regConcl && regConcl[mes] ? Number(regConcl[mes]) : 0;
        // Saldo acumulado: saldo anterior + programadas - concluídas
        saldoAcumulado[gid][mes] = saldoAnterior + programadas - concluidas;
        saldoAnterior = saldoAcumulado[gid][mes];
      });
    });
  }

  // --- % Execução ---
  // Estrutura: { [idgrupobitrix]: { [mes]: percentual } }
  const percentualExecucao: Record<string, Record<string, number>> = {};
  if (data && data.registros && dataConclusao && dataConclusao.registros) {
    const gruposIds = Array.from(new Set(data.registros.map((r: any) => r.idgrupobitrix)));
    gruposIds.forEach((gid) => {
      percentualExecucao[gid] = {};
      meses.forEach((mes) => {
        const saldo = saldoAcumulado[gid]?.[mes] ?? 0;
        const regConcl = dataConclusao.registros.find((r: any) => r.idgrupobitrix === gid);
        const executada = regConcl && regConcl[mes] ? Number(regConcl[mes]) : 0;
        const denominador = saldo + executada;
        percentualExecucao[gid][mes] = denominador === 0 ? 0 : (executada / denominador) * 100;
      });
    });
  }

  // --- Resumo Geral mês a mês ---
  // Para cada mês: total programadas, total executadas, diferença, acumulado programadas, acumulado executadas, % execução
  const resumoMeses = meses.map(mes => {
    // Total programadas no mês (soma de todos os grupos)
    const totalProgramadas = data.registros.reduce((acc: number, r: any) => acc + (Number(r[mes]) || 0), 0);
    // Total executadas no mês (soma de todos os grupos)
    const totalExecutadas = dataConclusao && dataConclusao.registros
      ? dataConclusao.registros.reduce((acc: number, r: any) => acc + (Number(r[mes]) || 0), 0)
      : 0;
    // Diferença mês
    const diferenca = totalProgramadas - totalExecutadas;
    // Acumulados até o mês
    let acumuladoProgramadas = 0;
    let acumuladoExecutadas = 0;
    for (const m of meses) {
      if (m > mes) break;
      acumuladoProgramadas += data.registros.reduce((acc: number, r: any) => acc + (Number(r[m]) || 0), 0);
      acumuladoExecutadas += dataConclusao && dataConclusao.registros
        ? dataConclusao.registros.reduce((acc: number, r: any) => acc + (Number(r[m]) || 0), 0)
        : 0;
    }
    // % execução acumulada
    const percExec = acumuladoProgramadas === 0 ? 0 : (acumuladoExecutadas / acumuladoProgramadas) * 100;
    return {
      mes,
      totalProgramadas,
      totalExecutadas,
      diferenca,
      acumuladoProgramadas,
      acumuladoExecutadas,
      percExec
    };
  });

  return (
    <div className="space-y-8">
      {/* Tabela Resumo Geral */}
      <div>
        <h2 className="text-2xl font-black text-slate-900 mb-2">Resumo Geral</h2>
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-x-auto mb-6">
          <table className="w-full text-left">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-xs font-bold text-gray-500 uppercase">Mês</th>
                <th className="px-4 py-3 text-xs font-bold text-gray-500 uppercase">Programadas</th>
                <th className="px-4 py-3 text-xs font-bold text-gray-500 uppercase">Executadas</th>
                <th className="px-4 py-3 text-xs font-bold text-gray-500 uppercase">Diferença</th>
                <th className="px-4 py-3 text-xs font-bold text-gray-500 uppercase">Acum. Programadas</th>
                <th className="px-4 py-3 text-xs font-bold text-gray-500 uppercase">Acum. Executadas</th>
                <th className="px-4 py-3 text-xs font-bold text-gray-500 uppercase">% Execução Acum.</th>
              </tr>
            </thead>
            <tbody>
              {resumoMeses.map((r, idx) => (
                <tr key={r.mes} className="border-t hover:bg-gray-50 align-top">
                  <td className="px-4 py-3 text-sm font-bold">{r.mes}</td>
                  <td className="px-4 py-3 text-sm text-center">{r.totalProgramadas}</td>
                  <td className="px-4 py-3 text-sm text-center">{r.totalExecutadas}</td>
                  <td className="px-4 py-3 text-sm text-center">{r.diferenca}</td>
                  <td className="px-4 py-3 text-sm text-center">{r.acumuladoProgramadas}</td>
                  <td className="px-4 py-3 text-sm text-center">{r.acumuladoExecutadas}</td>
                  <td className="px-4 py-3 text-sm text-center">{r.percExec.toLocaleString(undefined, { maximumFractionDigits: 1 })}%</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
      <div>
        <h2 className="text-2xl font-black text-slate-900 mb-2">Atividades Programadas</h2>
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
                  <td className="px-4 py-3 text-sm">
                    {row.idgrupobitrix}
                    {grupos[row.idgrupobitrix] ? <span className="ml-2 text-slate-500">- {grupos[row.idgrupobitrix]}</span> : null}
                  </td>
                  <td className="px-4 py-3 text-sm text-center font-bold">
                    <button
                      className="underline text-emerald-700 hover:text-emerald-900 font-bold cursor-pointer"
                      title="Ver detalhes das atividades"
                      onClick={() => {
                        setModalGrupoId(row.idgrupobitrix);
                        setModalGrupoNome(grupos[row.idgrupobitrix]);
                        setModalMes(null);
                        setModalContexto('programadas');
                        setModalOpen(true);
                      }}
                    >
                      {row.total_registros}
                    </button>
                  </td>
                  {meses.map(mes => (
                    <td key={mes} className="px-4 py-3 text-sm text-center">
                      <button
                        className="underline text-indigo-700 hover:text-indigo-900 font-bold cursor-pointer"
                        title={`Ver detalhes das atividades do mês ${mes}`}
                        onClick={() => {
                          setModalGrupoId(row.idgrupobitrix);
                          setModalGrupoNome(grupos[row.idgrupobitrix]);
                          setModalMes(mes);
                          setModalContexto('programadas');
                          setModalOpen(true);
                        }}
                      >
                        {row[mes]}
                      </button>
                    </td>
                  ))}
                </tr>
              ))}
                  <DetalhesAtividadesModal
                    open={modalOpen}
                    onClose={() => setModalOpen(false)}
                    idgrupobitrix={modalGrupoId}
                    grupoNome={modalGrupoNome}
                    mes={modalMes}
                    contexto={modalContexto}
                  />
            </tbody>
          </table>
        </div>
      </div>
      {dataConclusao && (
        <div>
          <h2 className="text-2xl font-black text-slate-900 mb-2 mt-8">Atividades Executadas</h2>
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-x-auto">
            <table className="w-full text-left">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-xs font-bold text-gray-500 uppercase">Centro de Custo</th>
                  <th className="px-4 py-3 text-xs font-bold text-gray-500 uppercase">Grupo Bitrix</th>
                  <th className="px-4 py-3 text-xs font-bold text-gray-500 uppercase">Total</th>
                  {mesesConclusao.map(mes => (
                    <th key={mes} className="px-4 py-3 text-xs font-bold text-gray-500 uppercase">{mes}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {dataConclusao.registros.map((row: any, idx: number) => (
                  <tr key={idx} className="border-t hover:bg-gray-50 align-top">
                    <td className="px-4 py-3 text-sm">{row.codccusto_nome}</td>
                    <td className="px-4 py-3 text-sm">
                      {row.idgrupobitrix}
                      {grupos[row.idgrupobitrix] ? <span className="ml-2 text-slate-500">- {grupos[row.idgrupobitrix]}</span> : null}
                    </td>
                    <td className="px-4 py-3 text-sm text-center font-bold">
                      <button
                        className="underline text-emerald-700 hover:text-emerald-900 font-bold cursor-pointer"
                        title="Ver detalhes das atividades concluídas"
                        onClick={() => {
                          setModalGrupoId(row.idgrupobitrix);
                          setModalGrupoNome(grupos[row.idgrupobitrix]);
                          setModalMes(null);
                          setModalOpen(true);
                        }}
                      >
                        {row.total_registros}
                      </button>
                    </td>
                    {mesesConclusao.map(mes => (
                      <td key={mes} className="px-4 py-3 text-sm text-center">
                        <button
                          className="underline text-indigo-700 hover:text-indigo-900 font-bold cursor-pointer"
                          title={`Ver detalhes das atividades concluídas do mês ${mes}`}
                          onClick={() => {
                            setModalGrupoId(row.idgrupobitrix);
                            setModalGrupoNome(grupos[row.idgrupobitrix]);
                            setModalMes(mes);
                            setModalOpen(true);
                          }}
                        >
                          {row[mes]}
                        </button>
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Tabela de Saldo Acumulado */}
      {data && (
        <div>
          <h2 className="text-2xl font-black text-slate-900 mb-2 mt-8">Saldo Acumulado</h2>
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-x-auto">
            <table className="w-full text-left">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-xs font-bold text-gray-500 uppercase">Centro de Custo</th>
                  <th className="px-4 py-3 text-xs font-bold text-gray-500 uppercase">Grupo Bitrix</th>
                  {meses.map(mes => (
                    <th key={mes} className="px-4 py-3 text-xs font-bold text-gray-500 uppercase">{mes}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {data.registros.map((reg: any, idx: number) => {
                  const gid = reg.idgrupobitrix;
                  return (
                    <tr key={gid} className="border-t hover:bg-gray-50 align-top">
                      <td className="px-4 py-3 text-sm">{reg.codccusto_nome}</td>
                      <td className="px-4 py-3 text-sm font-bold">
                        {gid} {grupos[gid] ? <span className="ml-2 text-slate-500">- {grupos[gid]}</span> : null}
                      </td>
                      {meses.map(mes => (
                        <td key={mes} className="px-4 py-3 text-sm text-center">
                          <button
                            className="underline text-indigo-700 hover:text-indigo-900 font-bold cursor-pointer"
                            title={`Ver detalhes do saldo acumulado do mês ${mes}`}
                            onClick={() => {
                              setModalGrupoId(gid);
                              setModalGrupoNome(grupos[gid]);
                              setModalMes(mes);
                              setModalOpen(true);
                            }}
                          >
                            {saldoAcumulado[gid] && saldoAcumulado[gid][mes] != null ? saldoAcumulado[gid][mes] : 0}
                          </button>
                        </td>
                      ))}
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
      {/* Tabela de % Execução */}
      {data && (
        <div>
          <h2 className="text-2xl font-black text-slate-900 mb-2 mt-8">% Execução</h2>
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-x-auto">
            <table className="w-full text-left">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-xs font-bold text-gray-500 uppercase">Centro de Custo</th>
                  <th className="px-4 py-3 text-xs font-bold text-gray-500 uppercase">Grupo Bitrix</th>
                  {meses.map(mes => (
                    <th key={mes} className="px-4 py-3 text-xs font-bold text-gray-500 uppercase">{mes}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {data.registros.map((reg: any, idx: number) => {
                  const gid = reg.idgrupobitrix;
                  return (
                    <tr key={gid} className="border-t hover:bg-gray-50 align-top">
                      <td className="px-4 py-3 text-sm">{reg.codccusto_nome}</td>
                      <td className="px-4 py-3 text-sm font-bold">
                        {gid} {grupos[gid] ? <span className="ml-2 text-slate-500">- {grupos[gid]}</span> : null}
                      </td>
                      {meses.map(mes => (
                        <td key={mes} className="px-4 py-3 text-sm text-center">
                          {percentualExecucao[gid] && percentualExecucao[gid][mes] != null ? percentualExecucao[gid][mes].toLocaleString(undefined, { maximumFractionDigits: 1 }) + '%' : '0%'}
                        </td>
                      ))}
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default ResumoAtividadesPivot;
