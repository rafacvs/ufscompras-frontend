import { useCallback, useEffect, useState } from 'react';
import Table from '../../components/admin/Table';
import { useAuth } from '../../context/AuthContext';
import { adminApi } from '../../services/api';
import type { SalesReport, StockMovementReport, TopProductReport } from '../../services/types';

const AdminReportsPage = () => {
  const { token } = useAuth();
  const [filters, setFilters] = useState({ from: '', to: '' });
  const [salesReport, setSalesReport] = useState<SalesReport | null>(null);
  const [stockReport, setStockReport] = useState<StockMovementReport | null>(null);
  const [topProducts, setTopProducts] = useState<TopProductReport[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const loadReports = useCallback(async () => {
    if (!token) return;
    setLoading(true);
    setError('');
    try {
      const [sales, stock, top] = await Promise.all([
        adminApi.getSalesReport(token, filters),
        adminApi.getStockReport(token, filters),
        adminApi.getTopProducts(token, { ...filters, limit: 5 }),
      ]);
      setSalesReport(sales);
      setStockReport(stock);
      setTopProducts(top);
    } catch (err) {
      setError((err as Error).message ?? 'Erro ao carregar relatórios');
    } finally {
      setLoading(false);
    }
  }, [token, filters]);

  useEffect(() => {
    void loadReports();
  }, [loadReports]);

  return (
    <div className="space-y-6">
      <header className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h2 className="text-2xl font-semibold">Relatórios</h2>
          <p className="text-sm text-offwhite/70">Acompanhe vendas, movimentações e produtos mais vendidos.</p>
        </div>
        <div className="flex gap-3">
          <label className="text-sm">
            <span className="text-offwhite/70">De</span>
            <input
              type="date"
              value={filters.from}
              onChange={(event) => setFilters((prev) => ({ ...prev, from: event.target.value }))}
              className="mt-1 rounded-2xl border border-offwhite/20 bg-dark px-3 py-2 text-offwhite"
            />
          </label>
          <label className="text-sm">
            <span className="text-offwhite/70">Até</span>
            <input
              type="date"
              value={filters.to}
              onChange={(event) => setFilters((prev) => ({ ...prev, to: event.target.value }))}
              className="mt-1 rounded-2xl border border-offwhite/20 bg-dark px-3 py-2 text-offwhite"
            />
          </label>
        </div>
      </header>

      {error && <p className="text-sm text-orange">{error}</p>}

      {loading ? (
        <div className="rounded-2xl bg-[#1f1c25] p-6 text-center text-sm text-offwhite/70">Carregando relatórios...</div>
      ) : (
        <>
          <section className="grid gap-4 md:grid-cols-3">
            <div className="rounded-2xl bg-[#1f1c25] p-6">
              <p className="text-sm text-offwhite/60">Unidades vendidas</p>
              <p className="mt-2 text-3xl font-bold">{salesReport?.totalUnits ?? 0}</p>
            </div>
            <div className="rounded-2xl bg-[#1f1c25] p-6">
              <p className="text-sm text-offwhite/60">Receita bruta</p>
              <p className="mt-2 text-3xl font-bold text-green-300">
                {(salesReport?.totalRevenue ?? 0).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
              </p>
            </div>
            <div className="rounded-2xl bg-[#1f1c25] p-6">
              <p className="text-sm text-offwhite/60">Período</p>
              <p className="mt-2 text-lg">
                {filters.from ? new Date(filters.from).toLocaleDateString('pt-BR') : 'Início'} -{' '}
                {filters.to ? new Date(filters.to).toLocaleDateString('pt-BR') : 'Hoje'}
              </p>
            </div>
          </section>

          <section className="grid gap-4 md:grid-cols-2">
            <div className="rounded-2xl bg-[#1f1c25] p-6">
              <h3 className="text-lg font-semibold">Entradas</h3>
              <p className="mt-2 text-2xl font-bold">{stockReport?.Entrada.totalUnits ?? 0} itens</p>
              <p className="text-offwhite/60">
                {(stockReport?.Entrada.totalValue ?? 0).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
              </p>
            </div>
            <div className="rounded-2xl bg-[#1f1c25] p-6">
              <h3 className="text-lg font-semibold">Saídas</h3>
              <p className="mt-2 text-2xl font-bold">{stockReport?.Saida.totalUnits ?? 0} itens</p>
              <p className="text-offwhite/60">
                {(stockReport?.Saida.totalValue ?? 0).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
              </p>
            </div>
          </section>

          <section className="rounded-2xl bg-[#1f1c25] p-6">
            <div className="mb-4 flex items-center justify-between">
              <h3 className="text-lg font-semibold">Produtos mais vendidos</h3>
              <span className="text-sm text-offwhite/60">Top 5</span>
            </div>
            <Table
              data={topProducts}
              emptyMessage="Nenhum produto vendido neste período."
              columns={[
                { header: 'Produto', render: (row: TopProductReport) => row.produto.nome },
                { header: 'Unidades', render: (row: TopProductReport) => row.totalUnits },
                {
                  header: 'Receita',
                  render: (row: TopProductReport) =>
                    row.totalRevenue.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' }),
                },
              ]}
            />
          </section>
        </>
      )}
    </div>
  );
};

export default AdminReportsPage;

