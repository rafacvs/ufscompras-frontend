import { render, screen } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import AdminRoute from '../AdminRoute';
import { useAuth } from '../../context/AuthContext';

vi.mock('../../context/AuthContext', () => ({
  useAuth: vi.fn(),
}));

type AuthContextValue = ReturnType<typeof useAuth>;
const mockedUseAuth = useAuth as unknown as vi.MockedFunction<typeof useAuth>;

const renderWithAuth = (value: AuthContextValue) => {
  mockedUseAuth.mockReturnValue(value);

  return render(
    <MemoryRouter initialEntries={['/admin']}>
      <Routes>
        <Route element={<AdminRoute />}>
          <Route path="/admin" element={<div data-testid="admin-area">Admin</div>} />
        </Route>
        <Route path="/admin/login" element={<div data-testid="admin-login">Login</div>} />
        <Route path="/" element={<div data-testid="home">Home</div>} />
      </Routes>
    </MemoryRouter>,
  );
};

const baseAuthValue = (): AuthContextValue => ({
  token: null,
  user: null,
  isAuthenticated: false,
  isAdmin: false,
  login: vi.fn(() => Promise.resolve()),
  logout: vi.fn(),
});

describe('AdminRoute', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('redirects anonymous users to the admin login page', () => {
    renderWithAuth(baseAuthValue());
    expect(screen.getByTestId('admin-login')).toBeInTheDocument();
  });

  it('redirects authenticated non-admin users to the home page', () => {
    renderWithAuth({
      ...baseAuthValue(),
      token: 'token',
      user: { id: '2', nome: 'Cliente', email: 'cliente@ufscompras.com', isAdmin: false },
      isAuthenticated: true,
      isAdmin: false,
    });

    expect(screen.getByTestId('home')).toBeInTheDocument();
  });

  it('renders the admin outlet for admin users', () => {
    renderWithAuth({
      ...baseAuthValue(),
      token: 'token',
      user: { id: '1', nome: 'Admin', email: 'admin@ufscompras.com', isAdmin: true },
      isAuthenticated: true,
      isAdmin: true,
    });

    expect(screen.getByTestId('admin-area')).toBeInTheDocument();
  });
});


