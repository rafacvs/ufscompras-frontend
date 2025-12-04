import { API_BASE_URL } from './api';

export type LoginResponse = {
  token: string;
  user: {
    id: string;
    nome: string;
    email: string;
    isAdmin: boolean;
  };
};

export const login = async (email: string, senha: string): Promise<LoginResponse> => {
  const response = await fetch(`${API_BASE_URL}/auth/login`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ email, senha }),
  });

  if (!response.ok) {
    const errorBody = (await response.json().catch(() => ({}))) as { message?: string };
    throw new Error(errorBody?.message ?? 'Não foi possível autenticar');
  }

  return response.json() as Promise<LoginResponse>;
};

