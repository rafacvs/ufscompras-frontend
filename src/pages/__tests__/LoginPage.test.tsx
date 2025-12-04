import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { rest } from 'msw';
import { beforeEach, describe, expect, it } from 'vitest';
import LoginPage from '../LoginPage';
import { renderRoute } from '../../test/renderWithProviders';
import { server } from '../../test/msw/server';
import { API_BASE_URL } from '../../test/msw/handlers';

const AUTH_STORAGE_KEY = 'ufscompras:auth';

describe('LoginPage', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('redirects users who are already authenticated', async () => {
    localStorage.setItem(
      AUTH_STORAGE_KEY,
      JSON.stringify({
        token: 'token-user',
        user: { id: '1', nome: 'Cliente', email: 'cliente@ufscompras.com', isAdmin: false },
      }),
    );

    const { router } = renderRoute(<LoginPage />, {
      path: '/login',
      initialEntries: ['/login'],
      extraRoutes: [{ path: '/', element: <div data-testid="home-route">Home</div> }],
    });

    await waitFor(() => expect(router.state.location.pathname).toBe('/'));
    expect(screen.getByTestId('home-route')).toBeInTheDocument();
  });

  it('logs in and redirects to the path provided in the from query param', async () => {
    const user = userEvent.setup();
    const { router } = renderRoute(<LoginPage />, {
      path: '/login',
      initialEntries: ['/login?from=%2Fprodutos'],
      extraRoutes: [
        { path: '/', element: <div>Home</div> },
        { path: '/produtos', element: <div data-testid="catalog-route">Catalog</div> },
      ],
    });

    await user.type(screen.getByLabelText(/email/i), 'cliente@ufscompras.com');
    await user.type(screen.getByLabelText(/senha/i), 'cliente123');
    await user.click(screen.getByRole('button', { name: 'Entrar' }));

    await waitFor(() => expect(router.state.location.pathname).toBe('/produtos'));
    expect(screen.getByTestId('catalog-route')).toBeInTheDocument();
  });

  it('shows the backend error message when login fails', async () => {
    server.use(
      rest.post(`${API_BASE_URL}/auth/login`, (_req, res, ctx) =>
        res(ctx.status(401), ctx.json({ message: 'Credenciais inválidas' })),
      ),
    );

    const user = userEvent.setup();
    renderRoute(<LoginPage />, {
      path: '/login',
      initialEntries: ['/login'],
      extraRoutes: [{ path: '/', element: <div>Home</div> }],
    });

    await user.type(screen.getByLabelText(/email/i), 'wrong@ufscompras.com');
    await user.type(screen.getByLabelText(/senha/i), 'wrong');
    await user.click(screen.getByRole('button', { name: 'Entrar' }));

    expect(await screen.findByText('Credenciais inválidas')).toBeInTheDocument();
  });
});


