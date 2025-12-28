import React, { useState } from 'react';
import { API_BASE_URL } from '../constants';

interface PerfilUsuarioProps {
  idusuario: number;
  onSenhaAlterada?: () => void;
}

export const PerfilUsuario: React.FC<PerfilUsuarioProps> = ({ idusuario, onSenhaAlterada }) => {
  const [senhaAtual, setSenhaAtual] = useState('');
  const [senhaNova, setSenhaNova] = useState('');
  const [confirmarSenha, setConfirmarSenha] = useState('');
  const [mensagem, setMensagem] = useState<string | null>(null);
  const [erro, setErro] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleTrocarSenha = async (e: React.FormEvent) => {
    e.preventDefault();
    setMensagem(null);
    setErro(null);
    if (!senhaAtual || !senhaNova || !confirmarSenha) {
      setErro('Todos os campos são obrigatórios.');
      return;
    }
    if (senhaNova !== confirmarSenha) {
      setErro('A nova senha e a confirmação não correspondem.');
      return;
    }
    if (senhaNova.length < 6) {
      setErro('Nova senha deve ter pelo menos 6 caracteres.');
      return;
    }
    setLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}/api/usuario/alterar-senha/${idusuario}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ senhaAtual, senhaNova })
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.message || 'Erro ao alterar senha');
      setMensagem('Senha alterada com sucesso!');
      setSenhaAtual('');
      setSenhaNova('');
      setConfirmarSenha('');
      if (onSenhaAlterada) onSenhaAlterada();
    } catch (err: any) {
      setErro(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto bg-white p-8 rounded-2xl shadow-lg border border-slate-100 mt-8">
      <h2 className="text-2xl font-black mb-6 text-slate-800">Meu Perfil</h2>
      <form onSubmit={handleTrocarSenha} className="space-y-4">
        <div>
          <label className="block text-xs font-bold mb-1 text-slate-600">Senha Atual</label>
          <input type="password" value={senhaAtual} onChange={e => setSenhaAtual(e.target.value)} className="w-full border rounded-lg p-2" required />
        </div>
        <div>
          <label className="block text-xs font-bold mb-1 text-slate-600">Nova Senha</label>
          <input type="password" value={senhaNova} onChange={e => setSenhaNova(e.target.value)} className="w-full border rounded-lg p-2" required />
        </div>
        <div>
          <label className="block text-xs font-bold mb-1 text-slate-600">Confirmar Nova Senha</label>
          <input type="password" value={confirmarSenha} onChange={e => setConfirmarSenha(e.target.value)} className="w-full border rounded-lg p-2" required />
        </div>
        {erro && <div className="text-red-500 text-xs font-bold">{erro}</div>}
        {mensagem && <div className="text-green-600 text-xs font-bold">{mensagem}</div>}
        <button type="submit" disabled={loading} className="w-full bg-emerald-600 text-white py-3 rounded-xl font-black text-xs uppercase tracking-[0.2em] transition-all hover:bg-emerald-500 disabled:opacity-50">
          {loading ? 'Salvando...' : 'Atualizar Senha'}
        </button>
      </form>
    </div>
  );
};
