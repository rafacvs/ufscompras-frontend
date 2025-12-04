import { screen } from '@testing-library/react';
import { rest } from 'msw';
import { describe, expect, it } from 'vitest';
import HomePage from '../HomePage';
import { renderRoute } from '../../test/renderWithProviders';
import { server } from '../../test/msw/server';
import { API_BASE_URL } from '../../test/msw/handlers';

describe('HomePage', () => {
  it('renders hero, categories and featured products', async () => {
    renderRoute(<HomePage />, {
      path: '/',
      initialEntries: ['/'],
    });

    expect(await screen.findByText('Seleção destacada')).toBeInTheDocument();
    expect(screen.getByText('Vitrine')).toBeInTheDocument();
  });

  it('shows an error message when the featured endpoint fails', async () => {
    server.use(
      rest.get(`${API_BASE_URL}/products/featured`, (_req, res, ctx) =>
        res(ctx.status(500), ctx.json({ message: 'Falhou' })),
      ),
    );

    renderRoute(<HomePage />, {
      path: '/',
      initialEntries: ['/'],
    });

    expect(
      await screen.findByText('Não foi possível carregar os produtos em destaque. Tente novamente mais tarde.'),
    ).toBeInTheDocument();
  });
});


