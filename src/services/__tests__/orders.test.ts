import { describe, expect, it } from 'vitest';
import { rest } from 'msw';
import { purchaseProduct } from '../orders';
import { server } from '../../test/msw/server';
import { API_BASE_URL } from '../../test/msw/handlers';

describe('orders service', () => {
  it('confirms a purchase when the backend returns success', async () => {
    const response = await purchaseProduct('token-admin', 'prod-shirt', 2, ['acc-bucket']);

    expect(response).toMatchObject({
      message: 'Compra confirmada',
      estoque: expect.any(Number),
    });
  });

  it('throws the backend message when the purchase fails', async () => {
    server.use(
      rest.post(`${API_BASE_URL}/purchase`, (_req, res, ctx) =>
        res(ctx.status(400), ctx.json({ message: 'Falha ao confirmar' })),
      ),
    );

    await expect(purchaseProduct('token-admin', 'prod-shirt', 0)).rejects.toThrow('Falha ao confirmar');
  });
});


