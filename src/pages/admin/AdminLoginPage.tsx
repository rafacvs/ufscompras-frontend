import { FormEvent, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

const AdminLoginPage = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [email, setEmail] = useState('admin@ufscompras.com');
  const [senha, setSenha] = useState('admin123');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    setIsSubmitting(true);
    setError('');
    try {
      await login(email, senha);
      const redirectTo = (location.state as { from?: { pathname: string } })?.from?.pathname ?? '/admin';
      navigate(redirectTo, { replace: true });
    } catch (err) {
      setError((err as Error).message ?? 'Credenciais inválidas');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-[#0f0d13] px-4">
      <form
        onSubmit={(event) => {
          void handleSubmit(event);
        }}
        className="w-full max-w-md rounded-3xl bg-[#1b1823] p-8 shadow-xl shadow-black/40"
      >
        <h1 className="text-2xl font-bold text-offwhite">Acesso administrativo</h1>
        <p className="mt-2 text-sm text-offwhite/60">Entre com sua conta para gerenciar o catálogo.</p>

        <label className="mt-6 block text-sm text-offwhite/70">
          Email
          <input
            type="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            className="mt-2 w-full rounded-2xl border border-offwhite/20 bg-dark px-4 py-2 text-offwhite focus:border-purple focus:outline-none"
            required
          />
        </label>

        <label className="mt-4 block text-sm text-offwhite/70">
          Senha
          <input
            type="password"
            value={senha}
            onChange={(event) => setSenha(event.target.value)}
            className="mt-2 w-full rounded-2xl border border-offwhite/20 bg-dark px-4 py-2 text-offwhite focus:border-purple focus:outline-none"
            required
          />
        </label>

        {error && <p className="mt-4 text-sm text-orange">{error}</p>}

        <button
          type="submit"
          disabled={isSubmitting}
          className="mt-6 w-full rounded-full bg-purple py-3 text-sm font-semibold text-offwhite transition hover:brightness-110 disabled:opacity-50"
        >
          {isSubmitting ? 'Entrando...' : 'Entrar'}
        </button>
      </form>
    </div>
  );
};

export default AdminLoginPage;

