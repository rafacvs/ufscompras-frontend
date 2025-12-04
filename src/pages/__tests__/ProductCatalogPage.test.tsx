import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { rest } from 'msw';
import { describe, expect, it } from 'vitest';
import ProductCatalogPage from '../ProductCatalogPage';
import { renderRoute } from '../../test/renderWithProviders';
import { server } from '../../test/msw/server';
import { API_BASE_URL } from '../../test/msw/handlers';

describe('ProductCatalogPage', () => {
  it('updates URL params when applying filters and sort options', async () => {
    const user = userEvent.setup();
    const { router } = renderRoute(<ProductCatalogPage />, {
      path: '/produtos',
      initialEntries: ['/produtos'],
    });

    expect(await screen.findByText('Camiseta Minimal')).toBeInTheDocument();

    await user.type(screen.getByPlaceholderText('Buscar por nome...'), 'camiseta');
    await waitFor(() => expect(router.state.location.search).toContain('busca=camiseta'));

    const [categorySelect, sortSelect] = screen.getAllByRole('combobox');

    await user.selectOptions(categorySelect, 'camisetas');
    await waitFor(() => expect(router.state.location.search).toContain('categoria=camisetas'));

    await user.selectOptions(sortSelect, 'price-desc');
    await waitFor(() => expect(router.state.location.search).toContain('ordem=price-desc'));
  });

  it('shows the error state when the listing endpoint fails', async () => {
    server.use(
      rest.get(`${API_BASE_URL}/products`, (_req, res, ctx) => res(ctx.status(500), ctx.json({ message: 'Erro' }))),
    );

    renderRoute(<ProductCatalogPage />, {
      path: '/produtos',
      initialEntries: ['/produtos'],
    });

    expect(await screen.findByText('Não foi possível carregar os produtos. Tente novamente.')).toBeInTheDocument();
  });
});


