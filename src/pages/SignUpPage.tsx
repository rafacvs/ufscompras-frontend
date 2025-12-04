import { FormEvent, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { API_BASE_URL } from '../services/api';
import { useAuth } from '../context/AuthContext';

const SignUpPage = () => {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [confirm, setConfirm] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    setError('');
    if (senha !== confirm) {
      setError('As senhas não conferem');
      return;
    }
    setLoading(true);
    try {
      const nome = email.split('@')[0] || 'Cliente';
      const response = await fetch(`${API_BASE_URL}/auth/signup`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ nome, email, senha }),
      });
      if (!response.ok) {
        const body = (await response.json().catch(() => ({}))) as { message?: string };
        throw new Error(body?.message ?? 'Falha ao cadastrar');
      }
      // loga automaticamente após cadastro
      await login(email, senha);
      navigate('/', { replace: true });
    } catch (err) {
      setError((err as Error).message ?? 'Erro ao cadastrar');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mx-auto max-w-md px-4 py-16">
      <h1 className="text-2xl font-bold">Criar conta</h1>
      <form
        onSubmit={(e) => {
          void handleSubmit(e);
        }}
        className="mt-6 space-y-4 rounded-2xl bg-[#1f1c25] p-6"
      >
        <label className="block text-sm">
          <span className="text-offwhite/70">Email</span>
          <input
            type="email"
            required
            className="mt-2 w-full rounded-xl border border-offwhite/20 bg-dark px-3 py-2 text-offwhite"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </label>
        <label className="block text-sm">
          <span className="text-offwhite/70">Senha</span>
          <input
            type="password"
            required
            className="mt-2 w-full rounded-xl border border-offwhite/20 bg-dark px-3 py-2 text-offwhite"
            value={senha}
            onChange={(e) => setSenha(e.target.value)}
          />
        </label>
        <label className="block text-sm">
          <span className="text-offwhite/70">Confirmar senha</span>
          <input
            type="password"
            required
            className="mt-2 w-full rounded-xl border border-offwhite/20 bg-dark px-3 py-2 text-offwhite"
            value={confirm}
            onChange={(e) => setConfirm(e.target.value)}
          />
        </label>
        {error && <p className="text-sm text-orange">{error}</p>}
        <button
          type="submit"
          disabled={loading}
          className="w-full rounded-full bg-purple py-3 text-sm font-semibold text-offwhite disabled:opacity-50"
        >
          {loading ? 'Criando...' : 'Criar conta'}
        </button>
      </form>
    </div>
  );
};

export default SignUpPage;

