
import { User } from '../types';
import { API_BASE_URL } from '../constants';

const USER_INFO_KEY = 'agroserra_user_data';

export const login = async (username: string, password: string): Promise<User> => {
  const response = await fetch(`${API_BASE_URL}/api/usuario/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ codusuario: username, senha: password })
  });
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.message || 'Credenciais inválidas.');
  }
  const data = await response.json();
  let user = data.user || data;
  // Garante que idusuario esteja presente e consistente
  if (!user.idusuario) {
    user.idusuario = user.ID || user.codusuario || user.id || user.id_usuario;
  }
  // Salva sempre o idusuario no localStorage
  localStorage.setItem(USER_INFO_KEY, JSON.stringify(user));
  return user;
};

export const logout = () => {
  localStorage.removeItem(USER_INFO_KEY);
  window.location.reload();
};

export const getCurrentUser = (): User | null => {
  const session = localStorage.getItem(USER_INFO_KEY);
  if (!session) return null;
  try {
    return JSON.parse(session);
  } catch {
    return null;
  }
};

export const getToken = (): string | null => null;
