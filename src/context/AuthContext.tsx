import { createContext, useContext, useState } from 'react';
import type { LoginResponse } from '../services/auth';
import { login as loginRequest } from '../services/auth';

type AuthState = {
  token: string | null;
  user: LoginResponse['user'] | null;
};

type AuthContextValue = {
  token: string | null;
  user: LoginResponse['user'] | null;
  isAuthenticated: boolean;
  isAdmin: boolean;
  login: (email: string, senha: string) => Promise<void>;
  logout: () => void;
};

const STORAGE_KEY = 'ufscompras:auth';

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

const loadInitialState = (): AuthState => {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      return JSON.parse(stored) as AuthState;
    }
  } catch (error) {
    console.error('Erro ao carregar estado de auth', error);
  }
  return { token: null, user: null };
};

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [state, setState] = useState<AuthState>(() => loadInitialState());

  const persistState = (nextState: AuthState) => {
    setState(nextState);
    if (nextState.token) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(nextState));
    } else {
      localStorage.removeItem(STORAGE_KEY);
    }
  };

  const login = async (email: string, senha: string) => {
    const response = await loginRequest(email, senha);
    persistState({ token: response.token, user: response.user });
  };

  const logout = () => {
    persistState({ token: null, user: null });
  };

  const value: AuthContextValue = {
    token: state.token,
    user: state.user,
    isAuthenticated: Boolean(state.token),
    isAdmin: Boolean(state.user?.isAdmin),
    login,
    logout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

// eslint-disable-next-line react-refresh/only-export-components
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth deve ser usado dentro de AuthProvider');
  }
  return context;
};

