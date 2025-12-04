import { describe, expect, it } from 'vitest';
import { rest } from 'msw';
import { login } from '../auth';
import { server } from '../../test/msw/server';
import { API_BASE_URL } from '../../test/msw/handlers';

describe('auth service', () => {
  it('returns the token and user payload on success', async () => {
    const response = await login('admin@ufscompras.com', 'admin123');

    expect(response).toMatchObject({
      token: 'token-admin',
      user: {
        email: 'admin@ufscompras.com',
        isAdmin: true,
      },
    });
  });

  it('throws an error message returned by the backend', async () => {
    server.use(
      rest.post(`${API_BASE_URL}/auth/login`, (_req, res, ctx) =>
        res(ctx.status(401), ctx.json({ message: 'Credenciais inválidas' })),
      ),
    );

    await expect(login('wrong@example.com', '123456')).rejects.toThrow('Credenciais inválidas');
  });
});


