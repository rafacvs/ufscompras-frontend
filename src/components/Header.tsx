import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Header = () => {
  const { isAuthenticated, isAdmin, user, logout } = useAuth();
  return (
    <header className="bg-dark text-offwhite">
      <div className="mx-auto flex w-full max-w-6xl flex-wrap items-center justify-between gap-4 px-4 py-4">
        <Link to="/" className="flex items-center gap-2 font-semibold tracking-tight">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-purple text-sm font-bold text-offwhite">
            UFS
          </div>
          <span className="text-xl">compras</span>
        </Link>
        <nav className="flex flex-1 flex-wrap items-center justify-end gap-3 text-sm">
          <Link to="/produtos" className="rounded-full border border-offwhite/20 px-4 py-2 text-offwhite">
            Ver produtos
          </Link>
          {!isAuthenticated ? (
            <>
              <Link to="/login" className="rounded-full border border-offwhite/20 px-4 py-2 text-offwhite">
                Entrar
              </Link>
              <Link to="/cadastro" className="rounded-full bg-purple px-6 py-2 font-semibold text-offwhite shadow">
                Cadastrar-se
              </Link>
            </>
          ) : (
            <>
              {isAdmin && (
                <Link to="/admin" className="rounded-full bg-purple px-6 py-2 font-semibold text-offwhite shadow">
                  Admin
                </Link>
              )}
              <span className="hidden text-offwhite/70 md:inline">Olá, {user?.nome ?? 'Usuário'}</span>
              <button
                type="button"
                onClick={logout}
                className="rounded-full border border-offwhite/20 px-4 py-2 text-offwhite"
              >
                Sair
              </button>
            </>
          )}
        </nav>
      </div>
    </header>
  );
};

export default Header;
