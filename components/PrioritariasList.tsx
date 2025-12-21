import React, { useEffect, useState } from 'react';
import { fetchBAtividadeG, BAtividadeG } from '../services/batividadegService';
import { User as UserIcon, Hash as HashIcon, Calendar, Search, ArrowRight } from 'lucide-react';

interface PrioritariasListProps {
  tasks: any[];
}

export const PrioritariasList: React.FC<PrioritariasListProps> = ({ tasks }) => {
  const [dados, setDados] = useState<BAtividadeG[]>([]);
  const [loading, setLoading] = useState(true);
  const [consulta, setConsulta] = useState("");
  const hojeStr = (() => {
    const hoje = new Date();
    const yyyy = hoje.getFullYear();
    const mm = String(hoje.getMonth() + 1).padStart(2, '0');
    const dd = String(hoje.getDate()).padStart(2, '0');
    return `${yyyy}-${mm}-${dd}`;
  })();
  const [dataInicial, setDataInicial] = useState(hojeStr);
  const [dataFinal, setDataFinal] = useState(hojeStr);
  const [filtro, setFiltro] = useState({ consulta: "", dataInicial: hojeStr, dataFinal: hojeStr });
  useEffect(() => {
    fetchBAtividadeG().then(res => {
      setDados(res);
      setLoading(false);
    });
  }, []);

  // Função para buscar descrição pelo idtask
  const getNome = (idtask: number) => {
    const t = tasks.find(tk => String(tk.ID) === String(idtask));
    return t?.TITLE || '--';
  };
  const getResponsavel = (idtask: number) => {
    const t = tasks.find(tk => String(tk.ID) === String(idtask));
    return t?.RESPONSIBLE_NAME || '--';
  };

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

  // Aplica filtro inicial ao carregar dados
  useEffect(() => {
    if (!loading) aplicarFiltro();
    // eslint-disable-next-line
  }, [loading]);

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
              <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase">Urgente?</th>
              <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase">Prazo Final</th>
              <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase">Comentário</th>
            </tr>
          </thead>
          <tbody>
            {dadosFiltrados.map((item) => (
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
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
};