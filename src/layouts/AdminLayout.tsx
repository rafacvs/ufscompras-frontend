import { NavLink, Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const navItems = [
  { to: '/admin', label: 'Overview', end: true },
  { to: '/admin/produtos', label: 'Produtos' },
  { to: '/admin/categorias', label: 'Categorias' },
  { to: '/admin/acessorios', label: 'Acessórios' },
  { to: '/admin/estoque', label: 'Estoque' },
  { to: '/admin/relatorios', label: 'Relatórios' },
];

const AdminLayout = () => {
  const { user, logout } = useAuth();

  return (
    <div className="flex min-h-screen bg-[#0f0d13] text-offwhite">
      <aside className="w-64 bg-[#1b1823] px-5 py-8">
        <div className="mb-8">
          <p className="text-lg font-semibold">Painel UFSCompras</p>
          <p className="text-xs text-offwhite/60">{user?.nome ?? 'Administrador'}</p>
        </div>
        <nav className="flex flex-col gap-2 text-sm">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.end}
              className={({ isActive }) =>
                `rounded-xl px-3 py-2 transition ${
                  isActive ? 'bg-purple/30 text-white' : 'text-offwhite/70 hover:bg-offwhite/10'
                }`
              }
            >
              {item.label}
            </NavLink>
          ))}
        </nav>
        <button
          type="button"
          onClick={logout}
          className="mt-10 w-full rounded-full border border-offwhite/30 px-4 py-2 text-sm text-offwhite transition hover:bg-offwhite/10"
        >
          Sair
        </button>
      </aside>

      <main className="flex-1 overflow-y-auto bg-dark px-6 py-8">
        <Outlet />
      </main>
    </div>
  );
};

export default AdminLayout;

