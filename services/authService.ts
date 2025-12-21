
import { User } from '../types';

const USER_INFO_KEY = 'agroserra_user_data';

export const login = async (username: string, password: string): Promise<User> => {
  // Credenciais padrão
  const defaultUsername = 'admin';
  const defaultPassword = '123456';

  if (username === defaultUsername && password === defaultPassword) {
    const user: User = {
      id: '1',
      name: 'Administrador',
      email: 'admin@example.com',
      role: 'Administrador',
    };

    localStorage.setItem(USER_INFO_KEY, JSON.stringify(user));
    return user;
  } else {
    throw new Error('Credenciais inválidas.');
  }
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
