import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import ProductPage from '../ProductPage';
import { renderRoute } from '../../test/renderWithProviders';

const AUTH_STORAGE_KEY = 'ufscompras:auth';

describe('ProductPage', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('allows selecting accessories and confirms a purchase when authenticated', async () => {
    localStorage.setItem(
      AUTH_STORAGE_KEY,
      JSON.stringify({
        token: 'token-user',
        user: { id: '1', nome: 'Cliente', email: 'cliente@ufscompras.com', isAdmin: false },
      }),
    );

    const user = userEvent.setup();
    const alertSpy = vi.spyOn(window, 'alert').mockImplementation(() => {});

    renderRoute(<ProductPage />, {
      path: '/produto/:id',
      initialEntries: ['/produto/prod-shirt'],
    });

    expect(await screen.findByText('Camiseta Minimal')).toBeInTheDocument();

    const totalPriceNode = screen.getByText('Total com acessórios').nextElementSibling;
    expect(totalPriceNode).toHaveTextContent('149,90');

    const bucketHatCheckbox = await screen.findByLabelText('Bucket Hat');
    const beltCheckbox = await screen.findByLabelText('Cinto Minimal');
    await user.click(bucketHatCheckbox);
    await user.click(beltCheckbox);

    await waitFor(() => expect(totalPriceNode).toHaveTextContent('299,70'));

    await user.click(screen.getByRole('button', { name: 'Comprar' }));
    expect(alertSpy).toHaveBeenCalledWith('Compra confirmada! Obrigado.');
    alertSpy.mockRestore();
  });

  it('redirects to login when purchasing without authentication', async () => {
    const user = userEvent.setup();
    window.history.pushState({}, '', '/produto/prod-shirt');

    renderRoute(<ProductPage />, {
      path: '/produto/:id',
      initialEntries: ['/produto/prod-shirt'],
    });

    expect(await screen.findByText('Camiseta Minimal')).toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: 'Comprar' }));

    await waitFor(() => expect(window.location.href).toContain('/login?from=%2Fproduto%2Fprod-shirt'));
    window.history.pushState({}, '', '/');
  });
});


