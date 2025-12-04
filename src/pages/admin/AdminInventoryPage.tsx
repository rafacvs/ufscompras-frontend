import { useCallback, useEffect, useState } from 'react';
import Modal from '../../components/admin/Modal';
import Table from '../../components/admin/Table';
import { useAuth } from '../../context/AuthContext';
import { adminApi } from '../../services/api';
import type { MovementDocument, ProductDocument } from '../../services/types';

const AdminInventoryPage = () => {
  const { token } = useAuth();
  const [movements, setMovements] = useState<MovementDocument[]>([]);
  const [products, setProducts] = useState<ProductDocument[]>([]);
  const [filters, setFilters] = useState({ from: '', to: '', tipo: '', produto: '' });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formState, setFormState] = useState({
    tipo: 'Entrada' as 'Entrada' | 'Saida',
    produtoId: '',
    quantidade: 1,
    valor_unitario: 0,
    observacao: '',
  });
  const [submitting, setSubmitting] = useState(false);
  const [notification, setNotification] = useState('');

  const formatCurrency = (value: number) =>
    value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });

  const summarizeAccessories = (acessorios?: MovementDocument['acessorios']) => {
    if (!acessorios?.length) return [];
    const summary = new Map<
      string,
      { _id: string; nome: string; preco: number; count: number }
    >();

    acessorios.forEach((acc) => {
      const existing = summary.get(acc._id);
      if (existing) {
        existing.count += 1;
      } else {
        summary.set(acc._id, { ...acc, count: 1 });
      }
    });

    return Array.from(summary.values());
  };

  const calculateAccessoriesTotal = (acessorios?: MovementDocument['acessorios']) => {
    return summarizeAccessories(acessorios).reduce(
      (sum, accessory) => sum + accessory.preco * accessory.count,
      0,
    );
  };

  const calculateMovementTotal = (mov: MovementDocument) => {
    const productTotal = mov.valor_unitario * mov.quantidade;
    return productTotal + calculateAccessoriesTotal(mov.acessorios);
  };

  const loadMovements = useCallback(async () => {
    if (!token) return;
    setLoading(true);
    setError('');
    try {
      const list = await adminApi.listMovements(token, {
        from: filters.from || undefined,
        to: filters.to || undefined,
        tipo: filters.tipo || undefined,
        produto: filters.produto || undefined,
      });
      setMovements(list);
    } catch (err) {
      setError((err as Error).message ?? 'Erro ao carregar movimentos');
    } finally {
      setLoading(false);
    }
  }, [token, filters.from, filters.to, filters.tipo, filters.produto]);

  useEffect(() => {
    if (!token) return;
    adminApi
      .listProducts(token, { limit: 100 })
      .then((response) => setProducts(response.data))
      .catch(() => setProducts([]));
  }, [token]);

  useEffect(() => {
    void loadMovements();
  }, [loadMovements]);

  const handleSubmit = async () => {
    if (!token) return;
    if (!formState.produtoId) {
      setNotification('Selecione um produto');
      return;
    }
    setSubmitting(true);
    setNotification('');
    try {
      await adminApi.createMovement(token, {
        tipo: formState.tipo,
        quantidade: Number(formState.quantidade),
        valor_unitario: Number(formState.valor_unitario),
        observacao: formState.observacao,
        id_produto: formState.produtoId,
      });
      setIsModalOpen(false);
      setFormState({ tipo: 'Entrada', produtoId: '', quantidade: 1, valor_unitario: 0, observacao: '' });
      void loadMovements();
    } catch (err) {
      setNotification((err as Error).message ?? 'Erro ao registrar movimento');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      <header className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h2 className="text-2xl font-semibold">Controle de estoque</h2>
          <p className="text-sm text-offwhite/70">Monitore entradas e saídas registradas no sistema.</p>
        </div>
        <button
          type="button"
          onClick={() => setIsModalOpen(true)}
          className="rounded-full bg-purple px-5 py-2 text-sm font-semibold text-offwhite shadow"
        >
          Registrar movimento
        </button>
      </header>

      <div className="rounded-2xl bg-[#1f1c25] p-4">
        <div className="grid gap-4 md:grid-cols-4">
          <label className="text-sm">
            <span className="text-offwhite/70">De</span>
            <input
              type="date"
              value={filters.from}
              onChange={(event) => setFilters((prev) => ({ ...prev, from: event.target.value }))}
              className="mt-2 w-full rounded-2xl border border-offwhite/20 bg-dark px-3 py-2 text-offwhite"
            />
          </label>
          <label className="text-sm">
            <span className="text-offwhite/70">Até</span>
            <input
              type="date"
              value={filters.to}
              onChange={(event) => setFilters((prev) => ({ ...prev, to: event.target.value }))}
              className="mt-2 w-full rounded-2xl border border-offwhite/20 bg-dark px-3 py-2 text-offwhite"
            />
          </label>
          <label className="text-sm">
            <span className="text-offwhite/70">Tipo</span>
            <select
              value={filters.tipo}
              onChange={(event) => setFilters((prev) => ({ ...prev, tipo: event.target.value }))}
              className="mt-2 w-full rounded-2xl border border-offwhite/20 bg-dark px-3 py-2 text-offwhite"
            >
              <option value="">Todos</option>
              <option value="Entrada">Entrada</option>
              <option value="Saida">Saída</option>
            </select>
          </label>
          <label className="text-sm">
            <span className="text-offwhite/70">Produto</span>
            <select
              value={filters.produto}
              onChange={(event) => setFilters((prev) => ({ ...prev, produto: event.target.value }))}
              className="mt-2 w-full rounded-2xl border border-offwhite/20 bg-dark px-3 py-2 text-offwhite"
            >
              <option value="">Todos</option>
              {products.map((product) => (
                <option key={product._id} value={product._id}>
                  {product.nome}
                </option>
              ))}
            </select>
          </label>
        </div>

        {error && <p className="mt-4 text-sm text-orange">{error}</p>}

        {loading ? (
          <div className="mt-4 rounded-2xl bg-[#14121a] p-6 text-center text-sm text-offwhite/70">Carregando...</div>
        ) : (
          <Table
            className="mt-4"
            data={movements}
            emptyMessage="Nenhum movimento encontrado."
            columns={[
              { header: 'Data', render: (mov: MovementDocument) => new Date(mov.data_mov).toLocaleString('pt-BR') },
              { header: 'Tipo', key: 'tipo' },
              { header: 'Produto', render: (mov: MovementDocument) => mov.id_produto?.nome ?? '-' },
              { header: 'Qtd.', key: 'quantidade' },
              {
                header: 'Valor unitário',
                render: (mov: MovementDocument) => formatCurrency(mov.valor_unitario),
              },
              {
                header: 'Total',
                render: (mov: MovementDocument) => formatCurrency(calculateMovementTotal(mov)),
              },
              {
                header: 'Acessórios',
                render: (mov: MovementDocument) => {
                  const summary = summarizeAccessories(mov.acessorios);
                  if (!summary.length) {
                    return <span className="text-offwhite/40">-</span>;
                  }
                  return (
                    <details>
                      <summary className="cursor-pointer text-purple">
                        Ver acessórios ({summary.reduce((count, item) => count + item.count, 0)})
                      </summary>
                      <ul className="mt-2 list-disc pl-4 text-xs text-offwhite/70">
                        {summary.map((acc) => (
                          <li key={acc._id}>
                            {acc.nome}
                            {acc.count > 1 ? ` (${acc.count}x)` : ''} — {formatCurrency(acc.preco * acc.count)}
                          </li>
                        ))}
                      </ul>
                    </details>
                  );
                },
              },
              { header: 'Responsável', render: (mov: MovementDocument) => mov.id_user?.nome ?? '-' },
            ]}
          />
        )}
      </div>

      <Modal open={isModalOpen} onClose={() => setIsModalOpen(false)} title="Registrar movimento">
        <div className="space-y-4 text-sm">
          <label className="block">
            <span className="text-offwhite/70">Tipo</span>
            <select
              value={formState.tipo}
              onChange={(event) => setFormState((prev) => ({ ...prev, tipo: event.target.value as 'Entrada' | 'Saida' }))}
              className="mt-2 w-full rounded-2xl border border-offwhite/20 bg-dark px-3 py-2 text-offwhite"
            >
              <option value="Entrada">Entrada</option>
              <option value="Saida">Saída</option>
            </select>
          </label>
          <label className="block">
            <span className="text-offwhite/70">Produto</span>
            <select
              value={formState.produtoId}
              onChange={(event) => setFormState((prev) => ({ ...prev, produtoId: event.target.value }))}
              className="mt-2 w-full rounded-2xl border border-offwhite/20 bg-dark px-3 py-2 text-offwhite"
            >
              <option value="">Selecione</option>
              {products.map((product) => (
                <option key={product._id} value={product._id}>
                  {product.nome}
                </option>
              ))}
            </select>
          </label>
          <div className="grid gap-4 md:grid-cols-2">
            <label className="block">
              <span className="text-offwhite/70">Quantidade</span>
              <input
                type="number"
                min={1}
                value={formState.quantidade}
                onChange={(event) => setFormState((prev) => ({ ...prev, quantidade: Number(event.target.value) }))}
                className="mt-2 w-full rounded-2xl border border-offwhite/20 bg-dark px-3 py-2 text-offwhite"
              />
            </label>
            <label className="block">
              <span className="text-offwhite/70">Valor unitário</span>
              <input
                type="number"
                min={0}
                step="0.01"
                value={formState.valor_unitario}
                onChange={(event) => setFormState((prev) => ({ ...prev, valor_unitario: Number(event.target.value) }))}
                className="mt-2 w-full rounded-2xl border border-offwhite/20 bg-dark px-3 py-2 text-offwhite"
              />
            </label>
          </div>
          <label className="block">
            <span className="text-offwhite/70">Observação</span>
            <textarea
              value={formState.observacao}
              onChange={(event) => setFormState((prev) => ({ ...prev, observacao: event.target.value }))}
              className="mt-2 w-full rounded-2xl border border-offwhite/20 bg-dark px-3 py-2 text-offwhite"
            />
          </label>
          {notification && <p className="text-sm text-orange">{notification}</p>}
          <div className="flex justify-end gap-3 pt-4">
            <button
              type="button"
              onClick={() => setIsModalOpen(false)}
              className="rounded-full border border-offwhite/20 px-4 py-2 text-sm text-offwhite/70"
            >
              Cancelar
            </button>
            <button
              type="button"
              onClick={() => {
                void handleSubmit();
              }}
              disabled={submitting}
              className="rounded-full bg-purple px-5 py-2 text-sm font-semibold text-offwhite disabled:opacity-50"
            >
              {submitting ? 'Registrando...' : 'Registrar'}
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default AdminInventoryPage;

