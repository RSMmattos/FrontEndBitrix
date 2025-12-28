import React, { useState, useEffect } from 'react';
import { API_BASE_URL } from '../constants';
import { getCurrentUser } from '../services/authService';

interface PerfilUsuarioProps {
  idusuario: number;
  onSenhaAlterada?: () => void;
}

export const PerfilUsuario: React.FC<PerfilUsuarioProps> = ({ idusuario, onSenhaAlterada }) => {
  const [user, setUser] = useState(getCurrentUser() || {});

  // Busca o usuário atualizado do backend ao montar
  useEffect(() => {
    const fetchUser = async () => {
      try {
        const id = typeof idusuario === 'string' ? parseInt(idusuario, 10) : idusuario;
        const response = await fetch(`${API_BASE_URL}/api/usuario/${id}`);
        if (response.ok) {
          const data = await response.json();
          setUser(data);
        }
      } catch (e) {
        // Se der erro, mantém o user do localStorage
      }
    };
    fetchUser();
  }, [idusuario]);
  const [modalOpen, setModalOpen] = useState(false);
  const [senhaAtual, setSenhaAtual] = useState('');
  const [senhaNova, setSenhaNova] = useState('');
  const [mensagem, setMensagem] = useState<string | null>(null);
  const [erro, setErro] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const handleTrocarSenha = async (e: React.FormEvent) => {
    e.preventDefault();
    setMensagem(null);
    setErro(null);
    if (!senhaAtual) {
      setErro('A senha atual é obrigatória.');
      return;
    }
    if (!senhaNova) {
      setErro('A nova senha é obrigatória.');
      return;
    }
    if (senhaNova.length < 6) {
      setErro('Nova senha deve ter pelo menos 6 caracteres.');
      return;
    }
    setLoading(true);
    try {
      const id = typeof idusuario === 'string' ? parseInt(idusuario, 10) : idusuario;
      // Altera para a rota correta e envia senhaAtual e senhaNova
      const response = await fetch(`${API_BASE_URL}/api/usuario/alterar-senha/${id}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ senhaAtual, senhaNova })
      });
      let data;
      const text = await response.text();
      try {
        data = JSON.parse(text);
      } catch {
        throw new Error('Erro inesperado do servidor. Tente novamente mais tarde.');
      }
      if (!response.ok) throw new Error(data.message || 'Erro ao alterar senha');
      setMensagem('Senha alterada com sucesso!');
      setSenhaNova('');
      setSenhaAtual('');
      setModalOpen(false);
      if (onSenhaAlterada) onSenhaAlterada();
    } catch (err: any) {
      setErro(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-black text-slate-900">Meu Perfil</h2>
      <div>
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead className="bg-slate-50/50">
              <tr>
                <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase">Usuário</th>
                <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase">Perfil</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td className="px-6 py-4 text-sm font-medium text-slate-900">{user.nome_usuario || user.name || '-'}</td>
                <td className="px-6 py-4 text-sm font-medium text-slate-900">{user.codperfil === 1 || user.codperfil === '1' ? 'Administrador' : 'Usuário'}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
      <div className="flex justify-end mb-4">
        <button onClick={() => setModalOpen(true)} className="bg-emerald-600 text-white px-5 py-2 rounded-xl text-xs font-black shadow-lg hover:bg-emerald-700 transition-all">Alterar Senha</button>
      </div>
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
          <div className="bg-white rounded-2xl shadow-lg p-8 w-full max-w-sm relative">
            <button onClick={() => setModalOpen(false)} className="absolute top-2 right-2 text-slate-400 hover:text-slate-700 text-xl">×</button>
            <h3 className="text-lg font-black mb-4 text-slate-800">Alterar Senha</h3>
            <form onSubmit={handleTrocarSenha} className="space-y-4">
              <div>
                <label className="block text-xs font-bold mb-1 text-slate-600">Senha Atual</label>
                <input
                  type="password"
                  value={senhaAtual}
                  onChange={e => setSenhaAtual(e.target.value)}
                  className="w-full border rounded-lg p-2"
                  required
                  autoComplete="current-password"
                />
              </div>
              <div>
                <label className="block text-xs font-bold mb-1 text-slate-600">Nova Senha</label>
                <input
                  type="password"
                  value={senhaNova}
                  onChange={e => setSenhaNova(e.target.value)}
                  className="w-full border rounded-lg p-2"
                  required
                  autoComplete="new-password"
                />
              </div>
              {erro && <div className="text-red-500 text-xs font-bold">{erro}</div>}
              {mensagem && <div className="text-green-600 text-xs font-bold">{mensagem}</div>}
              <button type="submit" disabled={loading} className="w-full bg-emerald-600 text-white py-3 rounded-xl font-black text-xs uppercase tracking-[0.2em] transition-all hover:bg-emerald-500 disabled:opacity-50">
                {loading ? 'Salvando...' : 'Atualizar Senha'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
