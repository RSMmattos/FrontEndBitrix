import React, { useEffect, useState } from 'react';
import { fetchBitrixTaskById } from '../services/bitrixTaskById';
import { fetchBAtividadeG, updateBAtividadeG, BAtividadeG } from '../services/batividadegService';
import { User as UserIcon, Hash as HashIcon, Calendar, Search, ArrowRight, Trash2 } from 'lucide-react';

interface PrioritariasListProps {
  tasks: any[];
}

export const PrioritariasList: React.FC<PrioritariasListProps> = ({ tasks }) => {
  // Estado para exclusão e funções relacionadas (devem estar dentro do componente)
  const [confirmDelete, setConfirmDelete] = useState<{ open: boolean; idtask: number | null }>({ open: false, idtask: null });

  const handleDelete = (idtask: number) => {
    setConfirmDelete({ open: true, idtask });
  };

  const confirmDeleteAction = async () => {
    if (!confirmDelete.idtask) return;
    try {
      await updateBAtividadeG(confirmDelete.idtask, { prioridade: false });
      setDados(prev => prev.filter(d => d.idtask !== confirmDelete.idtask));
      setConfirmDelete({ open: false, idtask: null });
    } catch (err) {
      alert('Erro ao excluir tarefa prioritária.');
      setConfirmDelete({ open: false, idtask: null });
    }
  };

  const cancelDeleteAction = () => {
    setConfirmDelete({ open: false, idtask: null });
  };
    // Estado para armazenar tasks buscadas dinamicamente (completo)
    const [tasksMap, setTasksMap] = useState<Record<string, any>>({});

  const [dados, setDados] = useState<BAtividadeG[]>([]);
  const [loading, setLoading] = useState(true);
  const [consulta, setConsulta] = useState("");
  const hoje = new Date();
  const yyyy = hoje.getFullYear();
  const mm = String(hoje.getMonth() + 1).padStart(2, '0');
  const dd = String(hoje.getDate()).padStart(2, '0');
  const hojeStr = `${yyyy}-${mm}-${dd}`;
  // Data inicial: 1 mês atrás
  const umMesAtras = new Date(hoje);
  umMesAtras.setMonth(umMesAtras.getMonth() - 1);
  const yyyyIni = umMesAtras.getFullYear();
  const mmIni = String(umMesAtras.getMonth() + 1).padStart(2, '0');
  const ddIni = String(umMesAtras.getDate()).padStart(2, '0');
  const umMesAtrasStr = `${yyyyIni}-${mmIni}-${ddIni}`;
  const [dataInicial, setDataInicial] = useState(umMesAtrasStr);
  const [dataFinal, setDataFinal] = useState(hojeStr);
  const [filtro, setFiltro] = useState({ consulta: "", dataInicial: umMesAtrasStr, dataFinal: hojeStr });
  useEffect(() => {
    fetchBAtividadeG().then(res => {
      setDados(res);
      setLoading(false);
    });
  }, []);

  // Função para buscar task completa do Bitrix
  const fetchTaskById = async (idtask: number | string) => {
    const task = await fetchBitrixTaskById(idtask);
    return task || null;
  };

  const getNome = (idtask: number | string) => {
    const t = tasksMap[String(idtask)];
    if (t && (t.TITLE || t.title)) return t.TITLE || t.title;
    return 'Buscando...';
  };
  const getResponsavel = (idtask: number | string) => {
    const t = tasksMap[String(idtask)];
    if (t && (t.RESPONSIBLE_NAME || (t.responsible && t.responsible.name))) return t.RESPONSIBLE_NAME || t.responsible?.name;
    return 'Buscando...';
  };

  // Ao montar ou atualizar dadosFiltrados, buscar tasks ausentes
  useEffect(() => {
    const idsFaltando = dados
      .map(d => String(d.idtask))
      .filter(id => !tasksMap[id]);
    if (idsFaltando.length > 0) {
      // Limitar buscas para evitar bloqueio/lentidão (Bitrix QUERY_LIMIT_EXCEEDED)
      const delay = (ms: number) => new Promise(res => setTimeout(res, ms));
      const processSequential = async () => {
        for (const id of idsFaltando) {
          const task = await fetchTaskById(id);
          setTasksMap(prev => ({ ...prev, [id]: task || {} }));
          await delay(500); // 500ms entre cada requisição
        }
      };
      processSequential();
    }
    // eslint-disable-next-line
  }, [dados]);

  // Filtrar dados apenas ao clicar no botão FILTRAR
  const [dadosFiltrados, setDadosFiltrados] = useState<BAtividadeG[]>([]);

  const aplicarFiltro = () => {
    const termo = filtro.consulta.toLowerCase();
    const dataIni = filtro.dataInicial ? new Date(filtro.dataInicial) : null;
    const dataFim = filtro.dataFinal ? new Date(filtro.dataFinal) : null;
    const filtrados = dados.filter(item => {
      const nome = getNome(item.idtask).toLowerCase();
      const responsavel = getResponsavel(item.idtask).toLowerCase();
      const idtask = String(item.idtask);
      // Filtro de datas (considerando datacriacao)
      if ((dataIni || dataFim)) {
        if (!item.datacriacao) return false;
        // Extrai apenas a parte da data (YYYY-MM-DD) para comparar corretamente
        const dataStr = String(item.datacriacao).slice(0, 10); // '2025-12-21'
        const dataItem = new Date(dataStr + 'T00:00:00');
        if (dataIni && dataItem < dataIni) return false;
        if (dataFim && dataItem > dataFim) return false;
      }
      return (
        nome.includes(termo) || responsavel.includes(termo) || idtask.includes(termo)
      );
    });
    setDadosFiltrados(filtrados);
  };

  // Atualiza filtro local mas só aplica ao clicar
  useEffect(() => {
    setFiltro({ consulta, dataInicial, dataFinal });
  }, [consulta, dataInicial, dataFinal]);


  // Aplica filtro sempre que dados mudar (edição, carregamento, etc)
  useEffect(() => {
    if (!loading) aplicarFiltro();
    // eslint-disable-next-line
  }, [loading, dados]);

  // Estado para edição da data de conclusão
  const [editandoId, setEditandoId] = useState<number | null>(null);
  const [editandoValor, setEditandoValor] = useState<string>('');
  const [savingId, setSavingId] = useState<number | null>(null);

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-8">
      <h2 className="text-2xl font-black text-rose-600 mb-6">Tarefas Prioritárias</h2>
      <div className="mb-6 flex flex-col gap-2 sm:flex-row sm:items-center">
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
        <div className="flex items-center gap-2 bg-white border border-slate-200 p-2 rounded-2xl shadow-sm">
          <Calendar size={18} className="text-emerald-600 ml-2" />
          <input type="date" value={dataInicial} onChange={e => setDataInicial(e.target.value)} className="text-xs font-bold border-none bg-slate-50 p-2 rounded-lg" />
          <ArrowRight size={14} className="text-slate-300" />
          <input type="date" value={dataFinal} onChange={e => setDataFinal(e.target.value)} className="text-xs font-bold border-none bg-slate-50 p-2 rounded-lg" />
          <button onClick={aplicarFiltro} className="bg-emerald-600 text-white px-4 py-2 rounded-lg text-[10px] font-black uppercase hover:bg-emerald-700 ml-2">FILTRAR</button>
        </div>
      </div>
      {loading ? (
        <div className="text-slate-400">Carregando...</div>
      ) : dadosFiltrados.length === 0 ? (
        <div className="text-slate-400">Nenhuma tarefa prioritária encontrada.</div>
      ) : (
        <table className="w-full text-left border-collapse">
          <thead className="bg-slate-50/50">
            <tr>
              <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase">ID Task</th>
              <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase">Nome</th>
              <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase">Responsável</th>
              <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase">Urgente Diretor</th>
              <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase">Prazo Final Diretor</th>
              <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase">Comentário Diretor</th>
              <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase">Data Conclusão Diretor</th>
              <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase">Concluída Bitrix</th>
              <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase text-right">Ação</th>
            </tr>
          </thead>
          <tbody>
            {dadosFiltrados.map((item) => {
              // Função para obter STATUS da task
              let status: string | undefined = undefined;
              const t = tasksMap[String(item.idtask)];
              if (t && (t.STATUS || t.status)) status = t.STATUS || t.status;
              let concluida = '';
              if (status === '5') concluida = 'SIM';
              else if (status) concluida = 'NÃO';
              else if (status === undefined) concluida = 'Não encontrado no Bitrix';
              else concluida = 'Buscando...';
              return (
                <tr key={item.idtask} className="border-b border-slate-100">
                  <td className="px-6 py-4 text-sm font-bold">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-black text-slate-400">#{item.idtask}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm text-slate-700">{getNome(item.idtask)}</td>
                  <td className="px-6 py-4 text-sm text-slate-600">
                    <div className="flex items-center gap-2">
                      <span className="w-7 h-7 bg-emerald-100 rounded-full flex items-center justify-center text-emerald-700 shrink-0">
                        <UserIcon size={14} />
                      </span>
                      <span>{getResponsavel(item.idtask)}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm font-bold text-rose-600">{item.prioridade ? 'SIM' : 'NÃO'}</td>
                  <td className="px-6 py-4 text-sm font-bold text-slate-600">{item.dataprazofinal ? new Date(item.dataprazofinal).toLocaleDateString('pt-BR') : '--'}</td>
                  <td className="px-6 py-4 text-sm text-slate-700">{item.comentario || '--'}</td>
                  <td className="px-6 py-4 text-sm">
                    {editandoId === item.idtask ? (
                      <input
                        type="date"
                        value={editandoValor}
                        onChange={async (e) => {
                          const novaData = e.target.value;
                          setEditandoValor(novaData);
                          setSavingId(item.idtask);
                          await updateBAtividadeG(item.idtask, { dataconclusao: novaData || null });
                          setDados(prev => {
                            const novos = prev.map(d => d.idtask === item.idtask ? { ...d, dataconclusao: novaData || undefined } : d);
                            setTimeout(aplicarFiltro, 0); // Garante atualização do filtro após o setDados
                            return novos;
                          });
                          setSavingId(null);
                          setEditandoId(null);
                        }}
                        className="border rounded px-2 py-1 text-xs"
                        disabled={savingId === item.idtask}
                        autoFocus
                        onKeyDown={e => {
                          if (e.key === 'Backspace' || e.key === 'Delete') {
                            setEditandoValor('');
                          }
                        }}
                        placeholder=""
                      />
                    ) : (
                      <span
                        onClick={() => {
                          setEditandoId(item.idtask);
                          setEditandoValor(item.dataconclusao ? item.dataconclusao.split('T')[0] : '');
                        }}
                        style={{ cursor: 'pointer', color: '#2563eb', textDecoration: 'underline' }}
                      >
                        {item.dataconclusao ? (() => {
                          const dataStr = item.dataconclusao.split('T')[0];
                          const [ano, mes, dia] = dataStr.split('-');
                          return `${dia}/${mes}/${ano}`;
                        })() : '---'}
                      </span>
                    )}
                  </td>
                  <td className="px-6 py-4 text-sm font-bold text-emerald-700">{concluida}</td>
                  <td className="px-6 py-4 text-sm text-right">
                    <button onClick={() => handleDelete(item.idtask)} className="text-red-600 hover:text-red-800"><Trash2 size={16} /></button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      )}
      {/* Modal de confirmação de exclusão */}
      {confirmDelete.open && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-2xl shadow-xl max-w-sm w-full mx-4">
            <h3 className="text-lg font-bold mb-4 text-rose-700 flex items-center gap-2"><Trash2 size={20}/> Confirmar Exclusão</h3>
            <p className="mb-6">Tem certeza que deseja remover a prioridade desta tarefa?</p>
            <div className="flex gap-2">
              <button onClick={confirmDeleteAction} className="bg-rose-600 text-white px-4 py-2 rounded-lg flex-1">Excluir</button>
              <button onClick={cancelDeleteAction} className="bg-gray-500 text-white px-4 py-2 rounded-lg flex-1">Cancelar</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};