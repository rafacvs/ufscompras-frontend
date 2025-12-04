import { API_BASE_URL } from './api';

export const purchaseProduct = async (
  token: string,
  productId: string,
  quantity: number,
  accessories: string[] = [],
) => {
  const response = await fetch(`${API_BASE_URL}/purchase`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ productId, quantity, accessories }),
  });

  if (!response.ok) {
    const body = (await response.json().catch(() => ({}))) as { message?: string };
    throw new Error(body?.message ?? 'Falha ao confirmar compra');
  }
  return response.json() as Promise<{ message: string; estoque: number }>;
};

