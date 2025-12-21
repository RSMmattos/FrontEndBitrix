
import React, { useState } from 'react';
import { LayoutDashboard, User as UserIcon, Lock, Loader2, AlertCircle, ArrowRight, Shield } from 'lucide-react';
import { login } from '../services/authService';
import { User } from '../types';

interface LoginProps {
  onLoginSuccess: (user: User) => void;
}

export const Login: React.FC<LoginProps> = ({ onLoginSuccess }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      const user = await login(username, password);
      onLoginSuccess(user);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0a0f0d] flex items-center justify-center p-6 relative overflow-hidden">
      {/* Background Decor */}
      <div className="absolute top-[-20%] right-[-10%] w-[60%] h-[60%] bg-emerald-900/10 rounded-full blur-[120px]"></div>
      <div className="absolute bottom-[-10%] left-[-5%] w-[40%] h-[40%] bg-emerald-800/5 rounded-full blur-[100px]"></div>

      <div className="w-full max-w-lg z-10">
        <div className="bg-white/[0.03] backdrop-blur-2xl rounded-[3rem] shadow-2xl overflow-hidden p-12 border border-white/10 relative">
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-emerald-500 to-emerald-700"></div>
          
          <div className="text-center space-y-6 mb-12">
            <div className="inline-flex bg-emerald-600 p-5 rounded-[2rem] text-white shadow-xl shadow-emerald-900/20">
              <LayoutDashboard size={40} />
            </div>
            <div>
              <h1 className="text-4xl font-black text-white tracking-tighter mb-2">AGROSERRA</h1>
              <p className="text-[10px] font-black text-emerald-500 uppercase tracking-[0.3em]">Painel Operacional</p>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {error && (
              <div className="p-4 bg-rose-500/10 border border-rose-500/20 rounded-2xl flex items-center gap-3 text-rose-400 text-xs font-bold animate-in fade-in">
                <AlertCircle size={18} />
                {error}
              </div>
            )}

            <div className="space-y-4">
              <div className="relative group">
                <UserIcon className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-emerald-400 transition-colors" size={20} />
                <input
                  type="text"
                  required
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="Usuário"
                  className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 pl-14 pr-6 text-sm font-medium text-white placeholder:text-slate-500 focus:ring-2 focus:ring-emerald-500 focus:bg-white/10 outline-none transition-all"
                />
              </div>

              <div className="relative group">
                <Lock className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-emerald-400 transition-colors" size={20} />
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Senha"
                  className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 pl-14 pr-6 text-sm font-medium text-white placeholder:text-slate-500 focus:ring-2 focus:ring-emerald-500 focus:bg-white/10 outline-none transition-all"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-emerald-600 text-white py-4 rounded-2xl font-black text-xs uppercase tracking-[0.2em] transition-all hover:bg-emerald-500 active:scale-95 disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {isLoading ? <Loader2 size={18} className="animate-spin" /> : <>Entrar no Sistema <ArrowRight size={18} /></>}
            </button>
          </form>

          <div className="mt-12 flex items-center justify-center gap-2 text-slate-600">
            <Shield size={12} />
            <span className="text-[8px] font-black uppercase tracking-widest">Sistemas Internos Agroserra S.A.</span>
          </div>
        </div>
      </div>
    </div>
  );
};
