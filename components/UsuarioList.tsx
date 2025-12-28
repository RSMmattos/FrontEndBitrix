import React, { useEffect, useState } from 'react';
import { API_BASE_URL } from '../config';
import { Edit, Trash2, Plus, Loader2 } from 'lucide-react';

interface Usuario {
  idusuario: string;
  nome_usuario: string;
  email_usuario: string;
  codperfil: string;
  status: string;
}

const UsuarioList: React.FC = () => {
  const [usuarios, setUsuarios] = useState<Usuario[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<Usuario | null>(null);
  const [modalMsg, setModalMsg] = useState<string | null>(null);
  const [modalType, setModalType] = useState<'success' | 'error' | 'confirm' | null>(null);
  const [onConfirm, setOnConfirm] = useState<(() => void) | null>(null);

  // Pega o idusuario do usuário logado
  const idusuarioLogado = localStorage.getItem('idusuario');

  const fetchUsuarioLogado = async () => {
    setLoading(true);
    setError(null);
    try {
      if (!idusuarioLogado) throw new Error('Usuário não logado');
      const res = await fetch(`${API_BASE_URL}/api/usuario/${idusuarioLogado}`);
      if (!res.ok) throw new Error('Erro ao buscar usuário logado');
      const usuario = await res.json();
      setUsuarios([usuario]);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchUsuarioLogado(); }, []);

  // Função de exclusão do usuário logado
  const handleDelete = async (idusuario: string) => {
    setModalMsg('Confirma a exclusão deste usuário? Esta ação não poderá ser desfeita.');
    setModalType('confirm');
    setOnConfirm(() => async () => {
      setModalMsg(null);
      setModalType(null);
      setOnConfirm(null);
      const res = await fetch(`${API_BASE_URL}/api/usuario/${idusuario}`, { method: 'DELETE' });
      if (res.ok) {
        setModalMsg('Usuário excluído com sucesso. Você será desconectado.');
        setModalType('success');
        setTimeout(() => window.location.reload(), 1800);
      } else {
        setModalMsg('Erro ao excluir usuário. Tente novamente ou contate o suporte.');
        setModalType('error');
      }
    });
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-black text-slate-900">Cadastro de Usuário</h2>
        <button
          onClick={() => {
            if (idusuarioLogado === '85') {
              setEditing({
                idusuario: '',
                codperfil: '1',
                codusuario: '',
                nome_usuario: '',
                senha: '',
                ativo: 1,
                email_usuario: '',
                status: ''
              });
              setShowForm(true);
            } else {
              setModalMsg('Apenas o usuário autorizado (ID 85) pode cadastrar novos usuários. Caso precise de acesso, entre em contato com o administrador do sistema.');
              setModalType('error');
            }
          }}
          className="bg-emerald-600 text-white px-4 py-2 rounded-lg text-sm font-bold hover:bg-emerald-700 flex items-center gap-2"
        >
          <Plus size={16} /> Novo Usuário
        </button>
      {/* End of header and modal section */}
      {/* Modal de mensagens profissionais */}
      {modalMsg && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-2xl shadow-xl w-full max-w-xs text-center">
            <div className={modalType === 'success' ? 'text-emerald-600' : modalType === 'error' ? 'text-rose-600' : 'text-slate-700'}>
              {modalMsg}
            </div>
            <div className="mt-6 flex justify-center gap-2">
              {modalType === 'confirm' ? (
                <>
                  <button className="px-4 py-2 rounded bg-slate-200" onClick={() => { setModalMsg(null); setModalType(null); setOnConfirm(null); }}>Cancelar</button>
                  <button className="px-4 py-2 rounded bg-emerald-600 text-white font-bold" onClick={() => onConfirm && onConfirm()}>Confirmar</button>
                </>
              ) : (
                <button className="px-4 py-2 rounded bg-emerald-600 text-white font-bold" onClick={() => { setModalMsg(null); setModalType(null); setOnConfirm(null); }}>OK</button>
              )}
            </div>
          </div>
        </div>
      )}
      </div>
      {loading ? (
        <div className="flex items-center justify-center py-12"><Loader2 className="animate-spin text-emerald-500" size={32} /></div>
      ) : error ? (
        <div className="p-4 bg-rose-50 border border-rose-100 rounded-2xl text-rose-600 text-sm font-bold flex items-center gap-3">{error}</div>
      ) : (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead className="bg-slate-50/50">
                <tr>
                  <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase">ID</th>
                  <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase">Nome</th>
                  <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase">Perfil</th>
                  <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase text-center">Ações</th>
                </tr>
              </thead>
              <tbody>
                {usuarios.map(u => (
                  <tr key={u.idusuario} className="border-t border-slate-100 hover:bg-slate-50/50">
                    <td className="px-6 py-4 text-sm font-medium text-slate-900 font-mono">{u.idusuario}</td>
                    <td className="px-6 py-4 text-sm font-medium text-slate-900">{u.nome_usuario}</td>
                    <td className="px-6 py-4 text-sm font-medium text-slate-900">{u.codperfil}</td>
                    <td className="px-6 py-4 text-sm font-medium text-slate-900 text-center">
                      <button className="text-blue-600 hover:text-blue-800 mr-2" onClick={() => { setEditing(u); setShowForm(true); }} title="Editar"><Edit size={16} /></button>
                      <button className="text-rose-600 hover:text-rose-800" onClick={() => handleDelete(u.idusuario)} title="Excluir"><Trash2 size={16} /></button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
      {/* Formulário de edição do usuário logado */}
      {showForm && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white p-8 rounded-2xl shadow-xl w-full max-w-md">
            <h3 className="text-lg font-bold mb-4">{editing ? 'Editar Perfil' : 'Novo Usuário'}</h3>
            <form onSubmit={async (e) => {
              e.preventDefault();
              setLoading(true);
              setError(null);
              try {
                if (editing && editing.idusuario) {
                  // Atualizar usuário existente
                  const res = await fetch(`${API_BASE_URL}/api/usuario/${editing.idusuario}`, {
                    method: 'PUT',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(editing)
                  });
                  if (!res.ok) throw new Error('Erro ao atualizar usuário');
                  setShowForm(false);
                  setEditing(null);
                  await fetchUsuarioLogado();
                } else {
                  // Criar novo usuário
                  const novoUsuario = {
                    codperfil: editing?.codperfil || '1',
                    codusuario: editing?.codusuario || '',
                    nome_usuario: editing?.nome_usuario || '',
                    senha: editing?.senha || '',
                    ativo: editing?.ativo ?? 1
                  };
                  const res = await fetch(`${API_BASE_URL}/api/usuario`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(novoUsuario)
                  });
                  if (!res.ok) throw new Error('Erro ao criar usuário');
                  setShowForm(false);
                  setEditing(null);
                  await fetchUsuarioLogado();
                }
              } catch (err: any) {
                setError(err.message);
              } finally {
                setLoading(false);
              }
            }}>
              <div className="mb-4">
                <label className="block text-xs font-bold mb-1">ID Usuário</label>
                <input type="text" className="w-full border rounded px-3 py-2" value={editing?.idusuario || ''} disabled readOnly />
              </div>
              <div className="mb-4">
                <label className="block text-xs font-bold mb-1">Perfil</label>
                <select className="w-full border rounded px-3 py-2" value={editing?.codperfil || '1'} onChange={e => setEditing({ ...(editing || {}), codperfil: e.target.value })} disabled>
                  <option value="1">1</option>
                  <option value="2">2</option>
                  <option value="3">3</option>
                  <option value="4">4</option>
                </select>
              </div>
              <div className="mb-4">
                <label className="block text-xs font-bold mb-1">Usuário</label>
                <input type="text" className="w-full border rounded px-3 py-2" value={editing?.codusuario || ''} onChange={e => setEditing({ ...(editing || {}), codusuario: e.target.value })} />
              </div>
              <div className="mb-4">
                <label className="block text-xs font-bold mb-1">Nome</label>
                <input type="text" className="w-full border rounded px-3 py-2" value={editing?.nome_usuario || ''} onChange={e => setEditing({ ...(editing || {}), nome_usuario: e.target.value })} />
              </div>
              <div className="mb-4">
                <label className="block text-xs font-bold mb-1">Senha</label>
                <input type="password" className="w-full border rounded px-3 py-2" value={editing?.senha || ''} onChange={e => setEditing({ ...(editing || {}), senha: e.target.value })} autoComplete="new-password" />
              </div>
              <div className="mb-4">
                <label className="block text-xs font-bold mb-1">Ativo</label>
                <select className="w-full border rounded px-3 py-2" value={editing?.ativo ?? 1} onChange={e => setEditing({ ...(editing || {}), ativo: Number(e.target.value) })}>
                  <option value={1}>Sim</option>
                  <option value={0}>Não</option>
                </select>
              </div>
              {error && <div className="text-red-500 text-xs mb-2">{error}</div>}
              <div className="flex justify-end gap-2">
                <button type="button" className="px-4 py-2 rounded bg-slate-200" onClick={() => { setShowForm(false); setEditing(null); }}>Cancelar</button>
                <button type="submit" className="px-4 py-2 rounded bg-emerald-600 text-white font-bold">Salvar</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default UsuarioList;
