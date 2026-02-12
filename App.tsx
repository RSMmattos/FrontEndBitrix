import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { API_BASE_URL } from './constants';
import { fetchUsuariosOnline, UsuarioOnline } from './services/usuariosOnlineService';
import { BitrixTask, TaskStatus, TaskPriority, User } from './types';
import { updateTask } from './services/bitrixService';
import { fetchMergedTasks } from './services/mergedTasksService';
import { updateBAtividadeG, createBAtividadeG } from './services/batividadegService';
import { getCurrentUser, logout } from './services/authService';
import { Login } from './components/Login';
import { StatsCard } from './components/StatsCard';
import { StatusSummary } from './components/StatusSummary';
import { TaskDetailsModal } from './components/TaskDetailsModal';
import { TaskFormModal } from './components/TaskFormModal';
import { TableSkeleton } from './components/TableSkeleton';
import { EditableTaskRow } from './components/EditableTaskRow';
import { CostCenterList } from './components/CostCenterList';
import { GroupLinkList } from './components/GroupLinkList';
import { UsuariosOnline } from './components/UsuariosOnline';
import { PerfilUsuario } from './components/PerfilUsuario';
// import { VisaoGroupLinkList } from './components/VisaoGroupLinkList';
// import { VisaoMatriz } from './components/VisaoMatriz';
import { fetchTasks } from './services/bitrixService';
import { BitrixGroupList } from './components/BitrixGroupList';
import { 
  Search, 
  RefreshCw, 
  LayoutDashboard, 
  AlertCircle, 
  Loader2,
  ListTodo,
  Menu,
  LogOut,
  Save,
  Calendar,
  ArrowRight,
  Users,
  Filter,
  Layers
} from 'lucide-react';
import { subDays, format } from 'date-fns';
import { PrioritariasList } from './components/PrioritariasList';
// import { ResumoAtividadesPivot } from './components/ResumoAtividadesPivot';
import VariaveisPage from './VariaveisPage';
import TaskOpenSmartPage from './components/TaskOpenSmartPage';
// import { Gestao } from './components/Gestao';

type ActiveTab = 'dashboard' | 'activities' | 'cost-centers' | 'group-links' | 'bitrix-groups' | 'usuarios-online' | 'perfil-usuario' | 'prioritarias' | 'consultas' | 'variaveis' | 'task-open-smart';


const App: React.FC = () => {
    // Usuários online para exibir no topo
    const [usuariosOnline, setUsuariosOnline] = useState<UsuarioOnline[]>([]);
    useEffect(() => {
      fetchUsuariosOnline().then(users => setUsuariosOnline(users.filter(u => u.ONLINE === 'Online')));
      const interval = setInterval(() => {
        fetchUsuariosOnline().then(users => setUsuariosOnline(users.filter(u => u.ONLINE === 'Online')));
      }, 30000); // Atualiza a cada 30s
      return () => clearInterval(interval);
    }, []);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
    // Garante que o usuário admin padrão exista no banco
    useEffect(() => {
      const ensureAdminUser = async () => {
        try {
          // Busca todos os usuários
          const res = await fetch(`${API_BASE_URL}/api/usuario`);
          if (res.ok) {
            const users = await res.json();
            if (Array.isArray(users) && users.some((u) => u.codusuario === 'admin')) {
              return; // Já existe, não cria
            }
          }
          // Se não existe, cria
          await fetch(`${API_BASE_URL}/api/usuario`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              codperfil: 1,
              codusuario: 'admin',
              nome_usuario: 'admin',
              senha: 'sistema1',
              ativo: 1
            })
          });
        } catch (e) {
          // Ignora erro
        }
      };
      ensureAdminUser();
    }, []);
  const [isAuthChecking, setIsAuthChecking] = useState(true);
  const [activeTab, setActiveTab] = useState<ActiveTab>('activities'); 
  const [tasks, setTasks] = useState<BitrixTask[]>([]);
  const [allTasks, setAllTasks] = useState<BitrixTask[]|null>(null); // Para busca global
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [selectedGroup, setSelectedGroup] = useState<string>('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'completed' | 'not-completed'>('all');
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);
  const [selectedTask, setSelectedTask] = useState<BitrixTask | null>(null);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [consultasOpen, setConsultasOpen] = useState(false);
  // const [showGestao, setShowGestao] = useState(false);
  // const [costCenters, setCostCenters] = useState([]);
  // const [groupLinks, setGroupLinks] = useState([]);
  // const [bitrixGroups, setBitrixGroups] = useState([]);
    // Carregar dados para a página Gestao
    //
  
  // Ajuste: dateFrom inicia 30 dias atrás para garantir que a tabela venha com o último mês por padrão
  const [dateFrom, setDateFrom] = useState<string>(format(subDays(new Date(), 30), 'yyyy-MM-dd'));
  const [dateTo, setDateTo] = useState<string>(format(new Date(), 'yyyy-MM-dd'));
  
  const [pendingChanges, setPendingChanges] = useState<Record<string, Partial<BitrixTask>>>({});
  const [isSavingBatch, setIsSavingBatch] = useState(false);

  useEffect(() => {
    const user = getCurrentUser();
    if (user) setCurrentUser(user);
    setIsAuthChecking(false);
  }, []);


  const loadData = useCallback(async (isManualRefresh = false) => {
    if (!currentUser) return;
    if (isManualRefresh) setIsRefreshing(true); else setLoading(true);
    setError(null);
    // Removido limite de 10 meses no filtro de datas
    try {
      const data = await fetchMergedTasks(dateFrom, dateTo);
      setTasks(data);
      setPendingChanges({});
    } catch (err: any) {
      setError('Erro ao carregar dados.');
    } finally {
      setLoading(false);
      setIsRefreshing(false);
    }
  }, [currentUser, dateFrom, dateTo]);

  useEffect(() => { if (currentUser) loadData(); }, [currentUser, loadData]);

  const handlePendingChange = (taskId: string, field: keyof BitrixTask, value: any) => {
    console.log('handlePendingChange', { taskId, field, value });
    setPendingChanges(prev => ({
      ...prev,
      [taskId]: { ...(prev[taskId] || {}), [field]: value }
    }));
  };

  const saveAllChanges = async () => {
    const ids = Object.keys(pendingChanges);
    if (ids.length === 0) return;
    // Validação: não permitir salvar se qualquer campo obrigatório estiver vazio
    for (const id of ids) {
      const changes = pendingChanges[id];
      const taskObj = tasks.find(t => t.ID === id);
      // Verifica campos obrigatórios
      const prioritaria = changes.batividadeg_prioridade !== undefined ? changes.batividadeg_prioridade : taskObj?.batividadeg_prioridade;
      const prazoPrioritaria = changes.batividadeg_dataprazofinal !== undefined ? changes.batividadeg_dataprazofinal : taskObj?.batividadeg_dataprazofinal;
      const comentario = changes.batividadeg_comentario !== undefined ? changes.batividadeg_comentario : taskObj?.batividadeg_comentario;
      // Prioritária precisa ser true ou false (não undefined/null)
      const prioritariaValida = typeof prioritaria === 'boolean';
      // Prazo precisa ser string não vazia
      const prazoValido = typeof prazoPrioritaria === 'string' && prazoPrioritaria.trim() !== '';
      // Comentário precisa ser string não vazia
      const comentarioValido = typeof comentario === 'string' && comentario.trim() !== '';
      if (!prioritariaValida || !prazoValido || !comentarioValido) {
        setError('Preencha todos os campos obrigatórios: Prioritária, Prazo Prioritária e Comentário para todas as atividades antes de salvar.');
        return;
      }
    }
    setIsSavingBatch(true);
    try {
      for (const id of ids) {
        const changes = pendingChanges[id];
        const bitrixFields: any = {};
        // Salva no Bitrix se necessário
        if (changes.PRIORITY) bitrixFields.PRIORITY = changes.PRIORITY;
        if (changes.DEADLINE) bitrixFields.DEADLINE = changes.DEADLINE;
        if (Object.keys(bitrixFields).length > 0) {
          await updateTask(id, bitrixFields);
        }
        // Salva na batividadeg
        const batividadegFields: any = {};
        // Busca taskObj uma vez para usar em todos os campos
        const taskObj = tasks.find(t => t.ID === id);
        // Garante que prioridade seja sempre 0 (NÃO) se não alterado
        if ('batividadeg_prioridade' in changes) {
          batividadegFields.prioridade = changes.batividadeg_prioridade;
        } else {
          batividadegFields.prioridade = (taskObj && typeof taskObj.batividadeg_prioridade !== 'undefined') ? taskObj.batividadeg_prioridade : false;
        }
        if ('batividadeg_comentario' in changes) batividadegFields.comentario = changes.batividadeg_comentario;
        if ('batividadeg_dataprazofinal' in changes) {
          // Corrige fuso: input date vem sem hora, Date interpreta como UTC e pode subtrair um dia
          const rawDate = changes.batividadeg_dataprazofinal;
          if (rawDate && typeof rawDate === 'string') {
            // Garante formato yyyy-MM-dd
            const [year, month, day] = rawDate.split('-');
            batividadegFields.dataprazofinal = `${year}-${month}-${day}`;
          } else {
            batividadegFields.dataprazofinal = rawDate;
          }
        }
        // Garante que idgrupobitrix será sempre enviado (mesmo se não houver alteração)
        let idGrupo = 0;
        if (taskObj && typeof taskObj.idgrupobitrix !== 'undefined' && taskObj.idgrupobitrix !== null) {
          idGrupo = taskObj.idgrupobitrix;
        } else if (changes.idgrupobitrix !== undefined && changes.idgrupobitrix !== null) {
          idGrupo = changes.idgrupobitrix;
        }
        batividadegFields.idgrupobitrix = (idGrupo === null || idGrupo === undefined) ? 0 : idGrupo;
        if (Object.keys(batividadegFields).length > 0) {
          try {
            await updateBAtividadeG(Number(id), batividadegFields);
          } catch {
            // Se não existir, cria
            await createBAtividadeG({ idtask: Number(id), ...batividadegFields });
          }
        }
        // Se houver comentário, adiciona também no Bitrix
        if ('batividadeg_comentario' in changes && changes.batividadeg_comentario) {
          await import('./services/bitrixService').then(({ addTaskComment }) => {
            addTaskComment(id, changes.batividadeg_comentario);
          });
        }
      }
      await loadData();
    } catch (err: any) {
      setError(`Erro ao salvar: ${err.message}`);
    } finally {
      setIsSavingBatch(false);
    }
  };

  const uniqueGroups = useMemo(() => {
    const groups = new Set(tasks.map(t => t.GROUP_NAME).filter(Boolean));
    return Array.from(groups).sort();
  }, [tasks]);

  const filteredTasks = useMemo(() => {
    let result = tasks;
    const hasSearch = !!searchTerm.trim();
    // Cria um mapa de tarefas salvas para garantir merge correto
    const savedTasksMap = new Map(tasks.map(t => [t.ID, t]));
    if (hasSearch) {
      if (allTasks) {
        const low = searchTerm.toLowerCase();
        return allTasks.filter(t =>
          t.TITLE.toLowerCase().includes(low) ||
          t.ID.includes(low) ||
          (t.RESPONSIBLE_NAME && t.RESPONSIBLE_NAME.toLowerCase().includes(low))
        ).map(t => {
          // Merge com dados salvos da batividadeg
          const saved = savedTasksMap.get(t.ID);
          return {
            ...t,
            batividadeg_prioridade: saved?.batividadeg_prioridade ?? t.batividadeg_prioridade,
            batividadeg_dataprazofinal: saved?.batividadeg_dataprazofinal ?? t.batividadeg_dataprazofinal,
            batividadeg_comentario: saved?.batividadeg_comentario ?? t.batividadeg_comentario
          };
        });
      }
      return [];
    } else {
      if (selectedGroup) {
        result = result.filter(t => t.GROUP_NAME === selectedGroup);
      }
      if (statusFilter === 'completed') {
        result = result.filter(t => t.STATUS === '5');
      } else if (statusFilter === 'not-completed') {
        result = result.filter(t => t.STATUS !== '5');
      }
      return result.map(t => ({
        ...t,
        batividadeg_prioridade: t.batividadeg_prioridade,
        batividadeg_dataprazofinal: t.batividadeg_dataprazofinal,
        batividadeg_comentario: t.batividadeg_comentario
      }));
    }
  }, [tasks, searchTerm, selectedGroup, statusFilter, allTasks]);
  // Busca global ao digitar na pesquisa
  useEffect(() => {
    const doGlobalSearch = async () => {
      if (searchTerm.trim()) {
        const all = await fetchTasks();
        setAllTasks(all);
      } else {
        setAllTasks(null);
      }
    };
    doGlobalSearch();
  }, [searchTerm]);

  const loadStats = useMemo(() => {
    const totalRecords = filteredTasks.length;
    const estimatedPages = Math.ceil(totalRecords / 50);
    return { totalRecords, estimatedPages };
  }, [filteredTasks]);

  if (isAuthChecking) return <div className="min-h-screen bg-[#0a0f0d] flex items-center justify-center"><Loader2 className="animate-spin text-emerald-500" size={48} /></div>;
  if (!currentUser) return <Login onLoginSuccess={setCurrentUser} />;

  // Extrair nome_usuario e codperfil do usuário logado (usando exatamente os campos da API)
  const nomeUsuario = (currentUser as any).nome_usuario;
  const codPerfil = (currentUser as any).codperfil;
  let perfilLabel = 'Usuário';
  if (codPerfil === 1 || codPerfil === '1') perfilLabel = 'ADM';

  // Fallback visual para depuração
  const debugUser = !nomeUsuario || !codPerfil;

  return (
    <div className="min-h-screen bg-[#f8fafc] flex overflow-hidden">
      <aside className={`${sidebarOpen ? 'w-64' : 'w-20'} bg-[#0a0f0d] transition-all duration-300 flex flex-col shrink-0 z-30`}>
        <div className="flex items-center justify-between p-4 h-16 border-b border-white/10">
          <button onClick={() => setSidebarOpen(!sidebarOpen)} className="text-white bg-emerald-700 hover:bg-emerald-800 rounded-lg p-2 transition-all">
            <Menu size={22} />
          </button>
          {sidebarOpen && (
            <div className="flex flex-col ml-2">
              <span className="text-white font-black text-lg tracking-tighter">AGROSERRA</span>
              <span className="text-emerald-200 text-xs font-semibold mt-0.5">Gerenciamento de atividades</span>
            </div>
          )}
        </div>
        <div className="p-6 flex items-center gap-3">
          <div className="w-4 h-4 bg-emerald-400/60 rounded-full shadow-inner animate-pulse" title="Online"></div>
          <div className="flex flex-col">
            {sidebarOpen && (
              <span className="text-xs text-emerald-200 font-bold mt-1">{nomeUsuario} <span className="ml-2 px-2 py-0.5 rounded bg-emerald-700 text-white text-[10px] font-black">{perfilLabel}</span></span>
            )}
          </div>
        </div>
        <nav className="flex-1 px-4 py-4 space-y-1">
          <button onClick={() => setActiveTab('dashboard')} className={`flex items-center gap-4 w-full px-4 py-3 rounded-xl transition-all ${activeTab === 'dashboard' ? 'bg-emerald-600/10 text-emerald-500' : 'text-slate-500 hover:text-white hover:bg-white/5'}`}>
            <LayoutDashboard size={20} />
            {sidebarOpen && <span className="text-sm font-bold">Dashboard</span>}
          </button>
          <button onClick={() => setActiveTab('group-links')} className={`flex items-center gap-4 w-full px-4 py-3 rounded-xl transition-all ${activeTab === 'group-links' ? 'bg-emerald-600/10 text-emerald-500' : 'text-slate-500 hover:text-white hover:bg-white/5'}`}>
            <Users size={20} />
            {sidebarOpen && <span className="text-sm font-bold">Vínculos Grupo</span>}
          </button>
          <button onClick={() => setActiveTab('activities')} className={`flex items-center gap-4 w-full px-4 py-3 rounded-xl transition-all ${activeTab === 'activities' ? 'bg-emerald-600/10 text-emerald-500' : 'text-slate-500 hover:text-white hover:bg-white/5'}`}>
            <ListTodo size={20} />
            {sidebarOpen && <span className="text-sm font-bold">Atividades</span>}
          </button>
          <button onClick={() => setActiveTab('prioritarias')} className={`flex items-center gap-4 w-full px-4 py-3 rounded-xl transition-all ${activeTab === 'prioritarias' ? 'bg-rose-600/10 text-rose-500' : 'text-slate-500 hover:text-white hover:bg-white/5'}`}>
            <AlertCircle size={20} />
            {sidebarOpen && <span className="text-sm font-bold">Prioritárias</span>}
          </button>
          {/* Consultas agrupadas */}
          <div className="relative">
            <button
              onClick={() => setConsultasOpen((open) => !open)}
              className={`flex items-center gap-4 w-full px-4 py-3 rounded-xl transition-all ${['cost-centers','bitrix-groups'].includes(activeTab) || consultasOpen ? 'bg-emerald-600/10 text-emerald-500' : 'text-slate-500 hover:text-white hover:bg-white/5'}`}
            >
              <Filter size={20} />
              {sidebarOpen && <span className="text-sm font-bold">Consultas</span>}
              {sidebarOpen && (
                <span className={`ml-auto transition-transform ${consultasOpen ? 'rotate-90' : ''}`}>▶</span>
              )}
            </button>
            {/* Submenu */}
            {sidebarOpen && consultasOpen && (
              <div className="ml-8 mt-1 space-y-1">
                <button onClick={() => { setActiveTab('cost-centers'); setConsultasOpen(true); }} className={`flex items-center gap-2 w-full px-2 py-2 rounded-lg text-left text-xs font-bold transition-all ${activeTab === 'cost-centers' ? 'bg-emerald-600/20 text-emerald-700' : 'text-slate-400 hover:text-emerald-600 hover:bg-emerald-50'}`}>Centros de Custo</button>
                <button onClick={() => { setActiveTab('bitrix-groups'); setConsultasOpen(true); }} className={`flex items-center gap-2 w-full px-2 py-2 rounded-lg text-left text-xs font-bold transition-all ${activeTab === 'bitrix-groups' ? 'bg-emerald-600/20 text-emerald-700' : 'text-slate-400 hover:text-emerald-600 hover:bg-emerald-50'}`}>Grupos Bitrix</button>
                <button onClick={() => { setActiveTab('usuarios-online'); setConsultasOpen(true); }} className={`flex items-center gap-2 w-full px-2 py-2 rounded-lg text-left text-xs font-bold transition-all ${activeTab === 'usuarios-online' ? 'bg-emerald-600/20 text-emerald-700' : 'text-slate-400 hover:text-emerald-600 hover:bg-emerald-50'}`}>Usuários Online</button>
              </div>
            )}
          </div>

          <button onClick={() => setActiveTab('variaveis')} className={`flex items-center gap-4 w-full px-4 py-3 rounded-xl transition-all ${activeTab === 'variaveis' ? 'bg-emerald-600/10 text-emerald-500' : 'text-slate-500 hover:text-white hover:bg-white/5'}`}>
            <Layers size={20} />
            {sidebarOpen && <span className="text-sm font-bold">Variáveis</span>}
          </button>
        </nav>
        <div className="p-4 border-t border-white/5">
          <button onClick={logout} className="flex items-center gap-4 w-full px-4 py-3 text-rose-500 hover:bg-rose-500/10 rounded-xl font-bold transition-all">
            <LogOut size={20} />
            {sidebarOpen && <span className="text-sm">Sair</span>}
          </button>
            <button onClick={() => setActiveTab('perfil-usuario')} className={`flex items-center gap-4 w-full px-4 py-3 rounded-xl transition-all ${activeTab === 'perfil-usuario' ? 'bg-emerald-600/10 text-emerald-500' : 'text-slate-500 hover:text-white hover:bg-white/5'}`}>
              <Users size={20} />
              {sidebarOpen && <span className="text-sm font-bold">Perfil do Usuário</span>}
            </button>
        </div>
      </aside>

      <div className="flex-1 flex flex-col h-screen overflow-hidden">
        <header className="h-20 bg-white border-b border-slate-200 flex items-center justify-between px-8 shrink-0">
          <div className="flex items-center gap-4">
            <div className="relative w-96">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
              <input 
                type="text" 
                placeholder="Buscar por ID, Nome ou Responsável..." 
                className="w-full bg-slate-100 border-none rounded-xl py-2.5 pl-10 pr-4 text-sm focus:ring-2 focus:ring-emerald-500 transition-all"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            {/* Usuários online mais próximos da barra de pesquisa */}
            <div className="flex items-center gap-2 max-w-[40vw] overflow-x-auto no-scrollbar">
              {usuariosOnline.length > 0 && (
                <span className="text-xs font-bold text-emerald-700 mr-2">Online:</span>
              )}
              {usuariosOnline.map(u => (
                <span key={u.ID} className="px-2 py-1 bg-emerald-100 text-emerald-800 rounded-lg text-xs font-bold whitespace-nowrap">{u.NOME}</span>
              ))}
            </div>
          </div>
          <div className="flex items-center gap-4">
             {Object.keys(pendingChanges).length > 0 && (
               <button onClick={saveAllChanges} disabled={isSavingBatch} className="bg-emerald-600 text-white px-5 py-2 rounded-xl text-xs font-black flex items-center gap-2 shadow-lg shadow-emerald-100 hover:bg-emerald-700 transition-all">
                 {isSavingBatch ? <Loader2 size={14} className="animate-spin" /> : <Save size={14} />}
                 SALVAR {Object.keys(pendingChanges).length} ALTERAÇÕES
               </button>
             )}
             <button onClick={() => loadData(true)} className="p-2 text-slate-400 hover:bg-slate-100 rounded-lg">
               <RefreshCw size={20} className={isRefreshing ? 'animate-spin' : ''} />
             </button>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto p-8 space-y-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-black text-emerald-700 tracking-tighter">Gestão Operacional Bitrix</h1>
              <p className="text-slate-500 text-sm font-medium">Programação de atividades</p>
            </div>
            
            <div className="flex items-center gap-3 bg-white border border-slate-200 p-2 rounded-2xl shadow-sm">
              <select
                value={statusFilter}
                onChange={e => setStatusFilter(e.target.value as 'all' | 'completed' | 'not-completed')}
                className="text-xs font-bold border border-slate-200 bg-slate-50 p-2 rounded-lg mr-2"
              >
                <option value="all">Todas</option>
                <option value="completed">Concluídas</option>
                <option value="not-completed">Não Concluídas</option>
              </select>
              <Calendar size={18} className="text-emerald-600 ml-2" />
              <div className="flex items-center gap-2">
                <input type="date" value={dateFrom} onChange={(e) => setDateFrom(e.target.value)} className="text-xs font-bold border-none bg-slate-50 p-2 rounded-lg" />
                <ArrowRight size={14} className="text-slate-300" />
                <input type="date" value={dateTo} onChange={(e) => setDateTo(e.target.value)} className="text-xs font-bold border-none bg-slate-50 p-2 rounded-lg" />
              </div>
              <button onClick={() => loadData(true)} className="bg-emerald-600 text-white px-4 py-2 rounded-lg text-[10px] font-black uppercase hover:bg-emerald-700">FILTRAR</button>
            </div>
          </div>

          {error && (
            <div className="p-4 bg-rose-50 border border-rose-100 rounded-2xl text-rose-600 text-sm font-bold flex items-center gap-3">
              <AlertCircle size={20} />
              {error}
            </div>
          )}

          {activeTab === 'activities' ? (
            <div className="space-y-4">
              <div className="flex flex-col lg:flex-row gap-4 items-stretch">
                <div className="flex-1 bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-4 overflow-x-auto no-scrollbar">
                  <div className="flex items-center gap-2 text-slate-400 shrink-0">
                    <Filter size={16} />
                    <span className="text-[10px] font-black uppercase tracking-widest">Grupo:</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <button 
                      onClick={() => setSelectedGroup('')}
                      className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase transition-all whitespace-nowrap ${selectedGroup === '' ? 'bg-emerald-600 text-white shadow-md' : 'bg-slate-50 text-slate-500 hover:bg-slate-100'}`}
                    >
                      Todos
                    </button>
                    {uniqueGroups.map(group => (
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

                <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-6 shrink-0">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-indigo-50 text-indigo-600 rounded-lg">
                      <ListTodo size={16} />
                    </div>
                    <div>
                      <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Registros</p>
                      <p className="text-sm font-black text-slate-900">{loadStats.totalRecords}</p>
                    </div>
                  </div>
                  <div className="w-[1px] h-8 bg-slate-100"></div>
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-amber-50 text-amber-600 rounded-lg">
                      <Layers size={16} />
                    </div>
                    <div>
                      <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Páginas</p>
                      <p className="text-sm font-black text-slate-900">{loadStats.estimatedPages}</p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-2xl border border-slate-200 shadow-sm">
                <div className="overflow-x-auto">
                  {loading ? <TableSkeleton /> : (
                    <table className="w-full text-left border-collapse">
                      <thead className="bg-slate-50/50">
                        <tr>
                          <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase">ID</th>
                          <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase">Nome</th>
                          <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase">Responsável</th>
                          <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase">Prazo Prioritária</th>
                          <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase text-center">Prioritária</th>
                          <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase">Forma de Entrega</th>
                          <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase text-right">Info</th>
                        </tr>
                      </thead>
                      <tbody>
                        {filteredTasks.length > 0 ? (
                          filteredTasks.map(t => (
                            <EditableTaskRow 
                              key={t.ID} 
                              task={t} 
                              pendingChanges={pendingChanges[t.ID] || {}}
                              onChange={handlePendingChange}
                              onViewDetails={setSelectedTask}
                            />
                          ))
                        ) : (
                          <tr>
                            <td colSpan={9} className="px-6 py-12 text-center text-slate-400 font-medium">Nenhuma tarefa encontrada no período selecionado.</td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  )}
                </div>
              </div>
            </div>
          ) : activeTab === 'cost-centers' ? (
            <CostCenterList />
          ) : activeTab === 'group-links' ? (
            <GroupLinkList />
          ) : activeTab === 'bitrix-groups' ? (
            <BitrixGroupList />
          ) : activeTab === 'usuarios-online' ? (
            <UsuariosOnline />
          ) : activeTab === 'perfil-usuario' ? (
            <PerfilUsuario idusuario={currentUser?.idusuario || currentUser?.codusuario || ''} />
          ) : activeTab === 'prioritarias' ? (
            <PrioritariasList />
          ) : false ? (
            null
          ) : activeTab === 'variaveis' ? (
            <VariaveisPage />

          ) : activeTab === 'task-open-smart' ? (
            <TaskOpenSmartPage />
          ) : (




            <div className="space-y-8">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <StatsCard title="Total no Período" value={tasks.length} icon={ListTodo} color="bg-emerald-600" description="Todas as tarefas do período selecionado." />
                <StatsCard title="Urgentes" value={tasks.filter(t => t.PRIORITY === TaskPriority.HIGH).length} icon={AlertCircle} color="bg-rose-500" description="Tarefas com prioridade alta." />
                <StatsCard title="Atrasadas" value={tasks.filter(t => t.DEADLINE && new Date(t.DEADLINE) < new Date() && t.STATUS !== '5').length} icon={AlertCircle} color="bg-orange-500" description="Tarefas vencidas e não finalizadas." />
                <StatsCard title="Finalizadas" value={tasks.filter(t => t.STATUS === "5").length} icon={Save} color="bg-teal-500" description="Tarefas concluídas no período." />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-white p-8 rounded-2xl border border-slate-100 shadow-sm flex flex-col items-center justify-center">
                  <h3 className="text-base font-black text-slate-800 mb-4">Progresso das Tarefas</h3>
                  <div className="w-full h-40 flex items-center justify-center">
                    {/* Gráfico de progresso (placeholder) */}
                    <div className="w-full h-32 bg-gradient-to-r from-emerald-400 to-emerald-200 rounded-xl flex items-center justify-center text-2xl font-black text-white shadow-inner">
                      {((tasks.filter(t => t.STATUS === "5").length / (tasks.length || 1)) * 100).toFixed(0)}% Concluídas
                    </div>
                  </div>
                </div>
                <StatusSummary tasks={tasks} />
                <div className="bg-white p-8 rounded-2xl border border-slate-100 shadow-sm space-y-4">
                  <h3 className="text-base font-black text-slate-800 mb-2">Tarefas Recentes</h3>
                  <ul className="divide-y divide-slate-100">
                    {tasks.slice(0, 5).map(t => (
                      <li key={t.ID} className="py-2 flex flex-col cursor-pointer hover:bg-emerald-50 rounded-lg px-2 transition" onClick={() => setSelectedTask(t)}>
                        <span className="font-bold text-slate-700">{t.TITLE}</span>
                        <span className="text-xs text-slate-400">Iniciada em {t.CREATED_DATE?.slice(0,10)} | Resp: {t.RESPONSIBLE_NAME || '--'}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-white p-8 rounded-2xl border border-slate-100 shadow-sm space-y-4">
                  <h3 className="text-base font-black text-slate-800 mb-2">Tarefas Atrasadas</h3>
                  <ul className="divide-y divide-slate-100">
                    {tasks.filter(t => t.DEADLINE && new Date(t.DEADLINE) < new Date() && t.STATUS !== '5').slice(0, 5).map(t => (
                      <li key={t.ID} className="py-2 flex flex-col cursor-pointer hover:bg-rose-50 rounded-lg px-2 transition" onClick={() => setSelectedTask(t)}>
                        <span className="font-bold text-rose-600">{t.TITLE}</span>
                        <span className="text-xs text-slate-400">Prazo: {t.DEADLINE?.slice(0,10)} | Resp: {t.RESPONSIBLE_NAME || '--'}</span>
                      </li>
                    ))}
                  </ul>
                </div>
                <div className="bg-white p-8 rounded-2xl border border-slate-100 shadow-sm space-y-4">
                  <h3 className="text-base font-black text-slate-800 mb-2">Próximas do Prazo</h3>
                  <ul className="divide-y divide-slate-100">
                    {tasks.filter(t => t.DEADLINE && new Date(t.DEADLINE) >= new Date() && t.STATUS !== '5').sort((a, b) => new Date(a.DEADLINE!).getTime() - new Date(b.DEADLINE!).getTime()).slice(0, 5).map(t => (
                      <li key={t.ID} className="py-2 flex flex-col cursor-pointer hover:bg-amber-50 rounded-lg px-2 transition" onClick={() => setSelectedTask(t)}>
                        <span className="font-bold text-emerald-700">{t.TITLE}</span>
                        <span className="text-xs text-slate-400">Prazo: {t.DEADLINE?.slice(0,10)} | Resp: {t.RESPONSIBLE_NAME || '--'}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          )}
          {activeTab === 'dashboard' && (
            <>
              {/* Painel do usuário logado */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
                <div className="col-span-1 md:col-span-2 bg-white rounded-2xl border border-slate-200 shadow-sm flex items-center gap-6 p-6">
                  <div className="flex-shrink-0">
                    <div className="w-20 h-20 rounded-full bg-emerald-100 flex items-center justify-center text-4xl font-black text-emerald-700">
                      {(currentUser?.nome_usuario || currentUser?.NOME || '').slice(0,2).toUpperCase()}
                    </div>
                  </div>
                  <div className="flex-1">
                    <h2 className="text-2xl font-black text-slate-900 mb-1 flex items-center gap-2">
                      {currentUser?.nome_usuario || currentUser?.NOME || '--'}
                      <span className="ml-2 px-2 py-0.5 rounded bg-emerald-700 text-white text-xs font-black">{perfilLabel}</span>
                    </h2>
                    <div className="text-slate-500 text-sm font-medium mb-1">{currentUser?.CARGO || currentUser?.WORK_POSITION || '--'}</div>
                    <div className="flex items-center gap-4 text-xs text-slate-400">
                      <span>Email: <a href={`mailto:${currentUser?.EMAIL || ''}`} className="text-emerald-700 underline">{currentUser?.EMAIL || '--'}</a></span>
                      <span>Telefone: {currentUser?.TELEFONE || currentUser?.PERSONAL_MOBILE || '--'}</span>
                      <span>Status: <span className={`font-bold ${currentUser?.ativo === 1 || currentUser?.ACTIVE === 'Y' ? 'text-green-600' : 'text-gray-400'}`}>{(currentUser?.ativo === 1 || currentUser?.ACTIVE === 'Y') ? 'Ativo' : 'Inativo'}</span></span>
                    </div>
                    <div className="mt-2 flex gap-3">
                      <a href={`https://agroserra.bitrix24.com.br/company/personal/user/${currentUser?.ID || currentUser?.idusuario || ''}/`} target="_blank" rel="noopener noreferrer" className="bg-emerald-600 text-white px-4 py-2 rounded-lg text-xs font-black hover:bg-emerald-700 transition">Ver Perfil Bitrix24</a>
                      <a href={`mailto:${currentUser?.EMAIL || ''}`} className="bg-slate-100 text-emerald-700 px-4 py-2 rounded-lg text-xs font-black hover:bg-emerald-100 transition">Enviar E-mail</a>
                    </div>
                  </div>
                </div>
                {/* Cards de estatísticas de usuários */}
                <div className="col-span-1 md:col-span-2 grid grid-cols-2 gap-6">
                  <StatsCard title="Usuários Online" value={usuariosOnline.length} icon={Users} color="bg-emerald-600" description="Usuários atualmente online no sistema." />
                  <StatsCard title="Total de Usuários" value={usuariosOnline.length} icon={Users} color="bg-indigo-600" description="Total de usuários cadastrados (online)." />
                </div>
              </div>
            </>
          )}


        </main>
      </div>
      <TaskDetailsModal task={selectedTask} onClose={() => setSelectedTask(null)} onEdit={() => {}} onQuickUpdate={async (id, up) => {
        await updateTask(id, up);
        await loadData();
      }} />
    </div>
  );
};

export default App;
