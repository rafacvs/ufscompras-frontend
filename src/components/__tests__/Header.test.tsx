import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { MemoryRouter } from 'react-router-dom';
import Header from '../Header';
import { useAuth } from '../../context/AuthContext';

vi.mock('../../context/AuthContext', () => ({
  useAuth: vi.fn(),
}));

type AuthContextValue = ReturnType<typeof useAuth>;

const mockedUseAuth = useAuth as unknown as vi.MockedFunction<typeof useAuth>;

const createAuthValue = (overrides: Partial<AuthContextValue> = {}): AuthContextValue => ({
  token: null,
  user: null,
  isAuthenticated: false,
  isAdmin: false,
  login: vi.fn(() => Promise.resolve()),
  logout: vi.fn(),
  ...overrides,
});

const renderHeader = () =>
  render(
    <MemoryRouter>
      <Header />
    </MemoryRouter>,
  );

describe('Header', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders login and signup links for anonymous users', () => {
    mockedUseAuth.mockReturnValue(createAuthValue());

    renderHeader();

    expect(screen.getByRole('link', { name: 'Entrar' })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Cadastrar-se' })).toBeInTheDocument();
    expect(screen.queryByText(/Olá/)).not.toBeInTheDocument();
  });

  it('renders admin shortcuts and allows logout for admin users', async () => {
    const user = userEvent.setup();
    const logout = vi.fn();
    (mockedUseAuth as vi.Mock).mockReturnValue(
      createAuthValue({
        token: 'token',
        user: { nome: 'Admin' },
        isAuthenticated: true,
        isAdmin: true,
        logout,
      }),
    );

    renderHeader();

    expect(screen.getByRole('link', { name: 'Admin' })).toBeInTheDocument();
    expect(screen.getByText('Olá, Admin')).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: 'Sair' }));
    expect(logout).toHaveBeenCalled();
  });
});


