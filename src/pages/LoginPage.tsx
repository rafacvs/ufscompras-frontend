import { FormEvent, useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const LoginPage = () => {
  const { login, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isAuthenticated) {
      navigate('/', { replace: true });
    }
  }, [isAuthenticated, navigate]);

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    setLoading(true);
    setError('');
    try {
      await login(email, senha);
      const fromParam = location.search.match(/from=([^&]+)/)?.[1];
      const from = fromParam ? decodeURIComponent(fromParam) : '/';
      navigate(from, { replace: true });
    } catch (err) {
      setError((err as Error).message ?? 'Falha no login');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mx-auto max-w-md px-4 py-16">
      <h1 className="text-2xl font-bold">Entrar</h1>
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
        {error && <p className="text-sm text-orange">{error}</p>}
        <button
          type="submit"
          disabled={loading}
          className="w-full rounded-full bg-purple py-3 text-sm font-semibold text-offwhite disabled:opacity-50"
        >
          {loading ? 'Entrando...' : 'Entrar'}
        </button>
      </form>
    </div>
  );
};

export default LoginPage;

