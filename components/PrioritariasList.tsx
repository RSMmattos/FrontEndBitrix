import React, { useEffect, useState } from 'react';

function formatarDataLocal(dataStr: string) {
  if (!dataStr) return '';
  // Extrai apenas a parte da data (YYYY-MM-DD)
  const match = dataStr.match(/^(\d{4})-(\d{2})-(\d{2})/);
  if (match) {
    const [_, ano, mes, dia] = match;
    const dt = new Date(Number(ano), Number(mes) - 1, Number(dia));
    return dt.toLocaleDateString('pt-BR');
  }
  // fallback para outros formatos
  const dt = new Date(dataStr);
  if (isNaN(dt.getTime())) return '--';
  return dt.toLocaleDateString('pt-BR');
}
// Modal lateral customizada (sem react-modal)
import { Search, Filter, User as UserIcon } from 'lucide-react';

export const PrioritariasList: React.FC = () => {
  const [dados, setDados] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedGroup, setSelectedGroup] = useState('');
  const [consulta, setConsulta] = useState('');
  const [filtroStatusDiretor, setFiltroStatusDiretor] = useState<string>('');
  const [filtroAno, setFiltroAno] = useState<string>('');
  const [filtroMes, setFiltroMes] = useState<string>('');
  const [modalAberto, setModalAberto] = useState(false);
  const [atividadeSelecionada, setAtividadeSelecionada] = useState<any>(null);
  const [dataConclusao, setDataConclusao] = useState<string>('');
  const [salvando, setSalvando] = useState(false);
  // Função para abrir o modal e setar a atividade selecionada
  const abrirModal = (atividade: any) => {
    setAtividadeSelecionada(atividade);
    // Preenche o campo com a data de hoje no formato yyyy-MM-dd
    const hoje = new Date();
    const yyyy = hoje.getFullYear();
    const mm = String(hoje.getMonth() + 1).padStart(2, '0');
    const dd = String(hoje.getDate()).padStart(2, '0');
    setDataConclusao(`${yyyy}-${mm}-${dd}`);
    setModalAberto(true);
  };

  // Função para fechar o modal
  const fecharModal = () => {
    setModalAberto(false);
    setAtividadeSelecionada(null);
    setDataConclusao('');
  };

  // Função para salvar a data de conclusão
  // Função para atualizar os dados da lista
  const atualizarDados = async () => {
    setLoading(true);
    try {
      const r = await fetch('http://10.0.0.6:3001/api/prioritariasOficial');
      const data = await r.json();
      setDados(Array.isArray(data) ? data : []);
    } catch {
      // erro silencioso
    }
    setLoading(false);
  };

  const salvarDataConclusao = async () => {
    if (!atividadeSelecionada) return;
    setSalvando(true);
    try {
      const resp = await fetch(`http://10.0.0.6:3001/api/batividadeg/edit-by-idtask/${atividadeSelecionada.idtask}`,
        {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ dataconclusao: dataConclusao })
        }
      );
      if (resp.ok) {
        await atualizarDados();
        fecharModal();
      } else {
        alert('Erro ao atualizar data.');
      }
    } catch (e) {
      alert('Erro ao atualizar data.');
    }
    setSalvando(false);
  };

  useEffect(() => {
    atualizarDados();
  }, []);

  const gruposUnicos = Array.from(new Set(dados.map(d => d.nomeGrupo).filter(Boolean)));
  // Extrai anos e meses únicos de dataprazofinal (prazo final diretor)
  const anosUnicos = Array.from(new Set(dados.map(d => d.dataprazofinal ? new Date(d.dataprazofinal).getFullYear() : null).filter(Boolean))).sort();
  const mesesUnicos = Array.from(new Set(dados.map(d => {
    if (!d.dataprazofinal) return null;
    const dt = new Date(d.dataprazofinal);
    return (dt.getMonth() + 1).toString().padStart(2, '0');
  }).filter(Boolean))).sort();

  const dadosFiltrados = dados.filter(item => {
    const termo = consulta.toLowerCase();
    if (selectedGroup && item.nomeGrupo !== selectedGroup) return false;
    if (filtroStatusDiretor) {
      if (filtroStatusDiretor === 'Sim' && String(item.statusDiretor) !== 'Sim') return false;
      if (filtroStatusDiretor === 'Não' && String(item.statusDiretor) !== 'Não') return false;
    }
    if (filtroAno && (!item.dataprazofinal || new Date(item.dataprazofinal).getFullYear().toString() !== filtroAno)) return false;
    if (filtroMes && (!item.dataprazofinal || (new Date(item.dataprazofinal).getMonth() + 1).toString().padStart(2, '0') !== filtroMes)) return false;
    if (termo) {
      return (
        String(item.idtask).includes(termo) ||
        (item.title || '').toLowerCase().includes(termo) ||
        (item.nomeResponsavel || '').toLowerCase().includes(termo)
      );
    }
    return true;
  });

  return (
    <>
      <div className="mb-6">
        <h2 className="text-2xl font-black text-emerald-700">Tarefas Prioritárias</h2>
      </div>
      <div className="mb-6 flex flex-col gap-2 sm:flex-row sm:items-center">
        <div className="flex flex-row flex-wrap gap-4 items-center">
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-black uppercase tracking-widest">Conclusão Diretor</span>
            <button onClick={() => setFiltroStatusDiretor('')} className={`px-3 py-1 rounded text-[10px] font-black uppercase ${filtroStatusDiretor === '' ? 'bg-emerald-600 text-white' : 'bg-slate-50 text-slate-500 hover:bg-slate-100'}`}>Todos</button>
            <button onClick={() => setFiltroStatusDiretor('Sim')} className={`px-3 py-1 rounded text-[10px] font-black uppercase ${filtroStatusDiretor === 'Sim' ? 'bg-emerald-600 text-white' : 'bg-slate-50 text-slate-500 hover:bg-slate-100'}`}>Sim</button>
            <button onClick={() => setFiltroStatusDiretor('Não')} className={`px-3 py-1 rounded text-[10px] font-black uppercase ${filtroStatusDiretor === 'Não' ? 'bg-emerald-600 text-white' : 'bg-slate-50 text-slate-500 hover:bg-slate-100'}`}>Não</button>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-black uppercase tracking-widest">Ano:</span>
            <select value={filtroAno} onChange={e => setFiltroAno(e.target.value)} className="px-2 py-1 rounded text-[10px] font-black uppercase border border-slate-200">
              <option value="">Todos</option>
              {anosUnicos.map(ano => (
                <option key={ano} value={ano}>{ano}</option>
              ))}
            </select>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-black uppercase tracking-widest">Mês:</span>
            <select value={filtroMes} onChange={e => setFiltroMes(e.target.value)} className="px-2 py-1 rounded text-[10px] font-black uppercase border border-slate-200">
              <option value="">Todos</option>
              {mesesUnicos.map(mes => (
                <option key={mes} value={mes}>{mes}</option>
              ))}
            </select>
          </div>
        </div>
        <div className="flex items-center gap-2 bg-white border border-slate-200 p-2 rounded-2xl shadow-sm overflow-x-auto max-w-full scrollbar-thin scrollbar-thumb-slate-200" style={{ WebkitOverflowScrolling: 'touch' }}>
          <Filter size={16} />
          <span className="text-[10px] font-black uppercase tracking-widest">Grupo:</span>
          <div className="flex flex-row gap-2 min-w-fit">
            <button
              onClick={() => setSelectedGroup('')}
              className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase transition-all whitespace-nowrap ${selectedGroup === '' ? 'bg-emerald-600 text-white shadow-md' : 'bg-slate-50 text-slate-500 hover:bg-slate-100'}`}
            >
              Todos
            </button>
            {gruposUnicos.map(group => (
              <button
                key={group}
                onClick={() => setSelectedGroup(group || '')}
                className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase transition-all whitespace-nowrap ${selectedGroup === group ? 'bg-emerald-600 text-white shadow-md' : 'bg-slate-50 text-slate-500 hover:bg-slate-100'}`}
              >
                {group}
              </button>
            ))}
          </div>
        </div>
        <div className="relative w-full sm:w-1/2">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
          <input
            type="text"
            placeholder="Buscar por ID, Nome ou Responsável..."
            className="w-full bg-slate-100 border-none rounded-xl py-2.5 pl-10 pr-4 text-sm focus:ring-2 focus:ring-emerald-500 transition-all"
            value={consulta}
            onChange={e => setConsulta(e.target.value)}
          />
        </div>
      </div>
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-x-auto">
        {loading ? (
          <div className="p-8 text-center text-slate-400">Carregando...</div>
        ) : dadosFiltrados.length === 0 ? (
          <div className="p-8 text-center text-slate-400">Nenhuma tarefa prioritária encontrada.</div>
        ) : (
          <table className="w-full text-left border-collapse">
            <thead className="bg-slate-50/50">
              <tr>
                <th className="px-8 py-4 text-[10px] font-black text-slate-400 uppercase">ID Task</th>
                <th className="px-8 py-4 text-[10px] font-black text-slate-400 uppercase">Nome</th>
                <th className="px-8 py-4 text-[10px] font-black text-slate-400 uppercase">Grupo</th>
                <th className="px-8 py-4 text-[10px] font-black text-slate-400 uppercase">Responsável</th>
                <th className="px-8 py-4 text-[10px] font-black text-slate-400 uppercase">Prazo Prioritária</th>
                <th className="px-8 py-4 text-[10px] font-black text-slate-400 uppercase">Concluída Bitrix</th>
                <th className="px-8 py-4 text-[10px] font-black text-slate-400 uppercase">Ação</th>
              </tr>
              <tr>
                <th className="px-8 py-2">
                  <input type="text" className="w-full text-xs rounded border border-slate-200 px-2 py-1" placeholder="Filtrar ID" value={consulta} onChange={e => setConsulta(e.target.value)} />
                </th>
                <th className="px-8 py-2">
                  <input type="text" className="w-full text-xs rounded border border-slate-200 px-2 py-1" placeholder="Filtrar Nome" value={consulta} onChange={e => setConsulta(e.target.value)} />
                </th>
                <th className="px-8 py-2">
                  <select className="w-full text-xs rounded border border-slate-200 px-2 py-1" value={selectedGroup} onChange={e => setSelectedGroup(e.target.value)}>
                    <option value="">Todos</option>
                    {gruposUnicos.map(group => (
                      <option key={group} value={group}>{group}</option>
                    ))}
                  </select>
                </th>
                <th className="px-8 py-2">
                  <input type="text" className="w-full text-xs rounded border border-slate-200 px-2 py-1" placeholder="Filtrar Responsável" value={consulta} onChange={e => setConsulta(e.target.value)} />
                </th>
                <th className="px-8 py-2">
                  <select className="w-full text-xs rounded border border-slate-200 px-2 py-1" value={filtroAno} onChange={e => setFiltroAno(e.target.value)}>
                    <option value="">Ano</option>
                    {anosUnicos.map(ano => (
                      <option key={ano} value={ano}>{ano}</option>
                    ))}
                  </select>
                  <select className="w-full text-xs rounded border border-slate-200 px-2 py-1 mt-1" value={filtroMes} onChange={e => setFiltroMes(e.target.value)}>
                    <option value="">Mês</option>
                    {mesesUnicos.map(mes => (
                      <option key={mes} value={mes}>{mes}</option>
                    ))}
                  </select>
                </th>
                <th className="px-8 py-2">
                  <select className="w-full text-xs rounded border border-slate-200 px-2 py-1" value={filtroStatusDiretor} onChange={e => setFiltroStatusDiretor(e.target.value)}>
                    <option value="">Todos</option>
                    <option value="Sim">Sim</option>
                    <option value="Não">Não</option>
                  </select>
                </th>
              </tr>
            </thead>
            <tbody>
              {dadosFiltrados.map((item) => (
                <tr key={item.idtask} className="border-t hover:bg-gray-50 align-top transition-colors">
                  <td className="px-8 py-4 text-sm font-black text-slate-500 break-words max-w-[80px]">#{item.idtask}</td>
                  <td className="px-8 py-4 text-sm text-slate-800 font-bold break-words max-w-[220px]">{item.title}</td>
                  <td className="px-8 py-4 text-sm text-slate-700 font-bold break-words max-w-[180px]">{item.nomeGrupo}</td>
                  <td className="px-8 py-4 text-sm text-slate-600">
                    <div className="flex items-center gap-2">
                      <span className="w-7 h-7 bg-emerald-100 rounded-full flex items-center justify-center text-emerald-700 shrink-0">
                        <UserIcon size={14} />
                      </span>
                      <span className="text-[11px] font-bold text-slate-600 break-words max-w-[120px]">{item.nomeResponsavel}</span>
                    </div>
                  </td>
                  <td className="px-8 py-4 text-sm font-bold text-slate-600">
                    {item.dataprazofinal ? (() => {
                      const dt = new Date(item.dataprazofinal);
                      const meses = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'];
                      return `${meses[dt.getMonth()]}-${dt.getFullYear()}`;
                    })() : '--'}
                  </td>
                  <td className="px-8 py-4 text-sm font-bold text-emerald-700">{item.concluidaBitrix}</td>
                  <td className="px-8 py-4 text-sm">
                    {item.statusDiretor === 'Sim' ? (
                      <button onClick={() => abrirModal(item)} className="bg-yellow-400 hover:bg-yellow-500 text-white px-4 py-2 rounded-xl font-extrabold text-xs shadow transition-all uppercase tracking-widest">Concluída</button>
                    ) : (
                      <button onClick={() => abrirModal(item)} className="bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-xl font-extrabold text-xs shadow transition-all uppercase tracking-widest">Concluir</button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
      {/* Modal lateral customizada */}
      {modalAberto && atividadeSelecionada && (
        <div className="fixed inset-0 z-50 flex justify-end">
          <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm transition-opacity" onClick={fecharModal} />
          <div className="relative w-full max-w-lg bg-white h-full shadow-2xl flex flex-col animate-in slide-in-from-right duration-500 ease-out rounded-l-3xl border-l-4 border-emerald-600">
            <div className="p-8 border-b border-slate-100 flex items-start justify-between bg-gradient-to-r from-emerald-50 to-white">
              <div>
                <span className="text-xs font-black text-emerald-700 uppercase tracking-widest">Aprovação de Atividade</span>
                <h2 className="text-2xl font-black text-slate-900 leading-tight mt-2 mb-1">{atividadeSelecionada.title}</h2>
                <div className="text-xs text-slate-500 font-bold uppercase tracking-widest">ID: {atividadeSelecionada.idtask}</div>
              </div>
              <button onClick={fecharModal} className="p-2.5 hover:bg-white hover:shadow-sm rounded-xl transition-all border border-transparent hover:border-slate-200" title="Fechar">
                <span className="text-slate-400 text-xl">×</span>
              </button>
            </div>
            <div className="flex-1 overflow-y-auto p-8 space-y-6">
              {atividadeSelecionada.dataconclusao && (
                <div className="mb-4 p-4 bg-yellow-50 border-l-4 border-yellow-400 text-yellow-800 font-bold rounded-xl flex items-center gap-2 animate-in fade-in">
                  <svg width="20" height="20" fill="none" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10" stroke="#facc15" strokeWidth="2" opacity="0.2"/><path d="M8 12l2 2 4-4" stroke="#facc15" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
                  Esta atividade já foi aprovada!
                </div>
              )}
              <div className="mb-2 flex gap-2 items-center">
                <span className="text-xs font-bold text-slate-500 uppercase">ID:</span>
                <span className="text-sm font-bold text-slate-700">{atividadeSelecionada.id}</span>
              </div>
              <div className="mb-2 flex gap-2 items-center">
                <span className="text-xs font-bold text-slate-500 uppercase">ID Task:</span>
                <span className="text-sm font-bold text-slate-700">{atividadeSelecionada.idtask}</span>
              </div>
              <div className="mb-2 flex gap-2 items-center">
                <span className="text-xs font-bold text-slate-500 uppercase">Título:</span>
                <span className="text-sm font-bold text-slate-700">{atividadeSelecionada.title}</span>
              </div>
              <div className="mb-2 flex gap-2 items-center">
                <span className="text-xs font-bold text-slate-500 uppercase">Grupo:</span>
                <span className="text-sm font-bold text-emerald-700">{atividadeSelecionada.nomeGrupo}</span>
              </div>
              <div className="mb-2 flex gap-2 items-center">
                <span className="text-xs font-bold text-slate-500 uppercase">Responsável:</span>
                <span className="flex items-center gap-2">
                  <span className="w-7 h-7 bg-emerald-100 rounded-full flex items-center justify-center text-emerald-700 shrink-0">
                    <UserIcon size={14} />
                  </span>
                  <span className="text-sm font-bold text-slate-700">{atividadeSelecionada.nomeResponsavel}</span>
                </span>
              </div>
              <div className="mb-2 flex gap-2 items-center">
                <span className="text-xs font-bold text-slate-500 uppercase">Prazo Prioritária:</span>
                <span className="text-sm font-bold text-slate-700">{atividadeSelecionada.dataprazofinal ? new Date(atividadeSelecionada.dataprazofinal).toLocaleDateString('pt-BR') : '--'}</span>
              </div>
              <div className="mb-2 flex gap-2 items-center">
                <span className="text-xs font-bold text-slate-500 uppercase">Concluída Bitrix:</span>
                <span className="text-sm font-bold text-emerald-700">{atividadeSelecionada.concluidaBitrix}</span>
              </div>
              <div className="mb-2 flex gap-2 items-center">
                <span className="text-xs font-bold text-slate-500 uppercase">Conclusão Diretor:</span>
                <span className="text-sm font-bold text-slate-700">{atividadeSelecionada.statusDiretor}</span>
              </div>
              <div className="mb-2 flex gap-2 items-center">
                <span className="text-xs font-bold text-slate-500 uppercase">Data Conclusão Diretor:</span>
                <span className="text-sm font-bold text-slate-700">{atividadeSelecionada.dataConclusaoDiretor ? formatarDataLocal(atividadeSelecionada.dataConclusaoDiretor) : '--'}</span>
              </div>
              <div className="mb-6">
                <label className="block text-xs font-black text-slate-500 uppercase mb-1">Data Aprovação</label>
                <input
                  type="date"
                  className="border border-emerald-200 rounded-xl px-4 py-2 text-sm font-bold focus:ring-2 focus:ring-emerald-500 outline-none transition-all shadow-sm"
                  value={dataConclusao}
                  onChange={e => setDataConclusao(e.target.value)}
                  disabled={salvando}
                />
                {atividadeSelecionada.dataconclusao && (
                  <div className="mt-2 text-xs text-emerald-700 font-bold">
                    Data já aprovada: {formatarDataLocal(atividadeSelecionada.dataconclusao)}
                  </div>
                )}
              </div>
              {salvando && (
                <div className="flex items-center gap-2 text-emerald-700 font-bold text-xs animate-pulse">
                  <svg className="animate-spin" width="16" height="16" fill="none" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" opacity="0.2"/><path d="M4 12a8 8 0 018-8" stroke="currentColor" strokeWidth="4" strokeLinecap="round"/></svg>
                  Salvando alteração...
                </div>
              )}
            </div>
            <div className="flex gap-2 p-8 border-t border-slate-100 bg-gradient-to-r from-white to-emerald-50">
              <button
                onClick={salvarDataConclusao}
                disabled={salvando || atividadeSelecionada.dataconclusao}
                className={`flex-1 ${atividadeSelecionada.dataconclusao ? 'bg-yellow-400 text-white cursor-not-allowed opacity-90' : 'bg-emerald-600 hover:bg-emerald-700 text-white'} py-3 rounded-2xl font-black text-xs uppercase tracking-widest shadow-xl shadow-emerald-100 transition-all disabled:opacity-50`}
              >
                {atividadeSelecionada.dataconclusao ? 'Concluída' : 'Concluir'}
              </button>
              <button onClick={fecharModal} className="flex-1 bg-slate-100 hover:bg-slate-200 text-slate-700 py-3 rounded-2xl font-black text-xs uppercase tracking-widest border border-slate-200 transition-all">Cancelar</button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};