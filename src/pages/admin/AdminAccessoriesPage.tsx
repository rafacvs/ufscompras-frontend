import { useCallback, useEffect, useState } from 'react';
import ChipInput from '../../components/admin/ChipInput';
import Modal from '../../components/admin/Modal';
import Table from '../../components/admin/Table';
import { useAuth } from '../../context/AuthContext';
import { adminApi } from '../../services/api';
import type { AccessoryDocument, CategoryDocument } from '../../services/types';

const AdminAccessoriesPage = () => {
  const { token } = useAuth();
  const [accessories, setAccessories] = useState<AccessoryDocument[]>([]);
  const [categories, setCategories] = useState<CategoryDocument[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formState, setFormState] = useState<{
    id?: string;
    nome: string;
    descricao: string;
    preco: number;
    images: string[];
    ativo: boolean;
    categorias: string[];
  }>({
    nome: '',
    descricao: '',
    preco: 0,
    images: [],
    ativo: true,
    categorias: [],
  });
  const [notification, setNotification] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const loadAccessories = useCallback(async () => {
    if (!token) return;
    setIsLoading(true);
    setError('');
    try {
      const list = await adminApi.listAccessories(token);
      setAccessories(list);
    } catch (err) {
      setError((err as Error).message ?? 'Erro ao carregar acessórios');
    } finally {
      setIsLoading(false);
    }
  }, [token]);

  useEffect(() => {
    void loadAccessories();
    if (!token) return;
    adminApi
      .listCategories(token)
      .then(setCategories)
      .catch(() => setCategories([]));
  }, [token, loadAccessories]);

  const openModal = (accessory?: AccessoryDocument) => {
    if (accessory) {
      setFormState({
        id: accessory._id,
        nome: accessory.nome,
        descricao: accessory.descricao ?? '',
        preco: accessory.preco,
        images: accessory.images ?? [],
        ativo: accessory.ativo,
        categorias: accessory.categorias?.map((category) => category._id) ?? [],
      });
    } else {
      setFormState({
        nome: '',
        descricao: '',
        preco: 0,
        images: [],
        ativo: true,
        categorias: [],
      });
    }
    setIsModalOpen(true);
  };

  const handleSubmit = async () => {
    if (!token) return;
    if (!formState.nome.trim()) {
      setNotification('Informe o nome');
      return;
    }
    setSubmitting(true);
    setNotification('');
    try {
      const payload = {
        nome: formState.nome,
        descricao: formState.descricao,
        preco: Number(formState.preco),
        images: formState.images,
        ativo: formState.ativo,
        categorias: formState.categorias,
      };
      if (formState.id) {
        await adminApi.updateAccessory(token, formState.id, payload);
        setNotification('Acessório atualizado');
      } else {
        await adminApi.createAccessory(token, payload);
        setNotification('Acessório criado');
      }
      setIsModalOpen(false);
      void loadAccessories();
    } catch (err) {
      setNotification((err as Error).message ?? 'Erro ao salvar acessório');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!token) return;
    if (!confirm('Remover este acessório?')) return;
    try {
      await adminApi.deleteAccessory(token, id);
      setNotification('Acessório removido');
      void loadAccessories();
    } catch (err) {
      setNotification((err as Error).message ?? 'Erro ao remover acessório');
    }
  };

  const toggleCategory = (categoryId: string) => {
    setFormState((prev) => {
      const exists = prev.categorias.includes(categoryId);
      return {
        ...prev,
        categorias: exists ? prev.categorias.filter((id) => id !== categoryId) : [...prev.categorias, categoryId],
      };
    });
  };

  return (
    <div className="space-y-6">
      <header className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h2 className="text-2xl font-semibold">Acessórios</h2>
          <p className="text-sm text-offwhite/70">Produtos complementares vendidos junto às peças principais.</p>
        </div>
        <button
          type="button"
          onClick={() => openModal()}
          className="rounded-full bg-purple px-5 py-2 text-sm font-semibold text-offwhite shadow"
        >
          Novo acessório
        </button>
      </header>

      <div className="rounded-2xl bg-[#1f1c25] p-4">
        {error && <p className="mb-4 text-sm text-orange">{error}</p>}
        {isLoading ? (
          <div className="rounded-2xl bg-[#14121a] p-6 text-center text-sm text-offwhite/70">Carregando...</div>
        ) : (
          <Table
            columns={[
              { header: 'Nome', key: 'nome' },
              {
                header: 'Preço',
                render: (acess: AccessoryDocument) => acess.preco.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' }),
              },
              {
                header: 'Ativo',
                render: (acess: AccessoryDocument) => (acess.ativo ? 'Sim' : 'Não'),
              },
              {
                header: 'Categorias',
                render: (acess: AccessoryDocument) =>
                  acess.categorias?.map((category) => category.nome).join(', ') || '-',
              },
              {
                header: 'Ações',
                render: (acess: AccessoryDocument) => (
                  <div className="flex gap-2 text-xs">
                    <button className="text-purple" onClick={() => openModal(acess)}>
                      Editar
                    </button>
                    <button
                      className="text-orange"
                      onClick={() => {
                        void handleDelete(acess._id);
                      }}
                    >
                      Remover
                    </button>
                  </div>
                ),
              },
            ]}
            data={accessories}
            emptyMessage="Nenhum acessório cadastrado."
          />
        )}
      </div>

      <Modal open={isModalOpen} onClose={() => setIsModalOpen(false)} title={formState.id ? 'Editar acessório' : 'Novo acessório'}>
        <div className="space-y-4 text-sm">
          <label className="block">
            <span className="text-offwhite/70">Nome</span>
            <input
              type="text"
              value={formState.nome}
              onChange={(event) => setFormState((prev) => ({ ...prev, nome: event.target.value }))}
              className="mt-2 w-full rounded-2xl border border-offwhite/20 bg-[#14121a] px-4 py-2 text-offwhite"
            />
          </label>
          <label className="block">
            <span className="text-offwhite/70">Descrição</span>
            <textarea
              value={formState.descricao}
              onChange={(event) => setFormState((prev) => ({ ...prev, descricao: event.target.value }))}
              className="mt-2 w-full rounded-2xl border border-offwhite/20 bg-[#14121a] px-4 py-2 text-offwhite"
            />
          </label>
          <label className="block">
            <span className="text-offwhite/70">Preço</span>
            <input
              type="number"
              value={formState.preco}
              onChange={(event) => setFormState((prev) => ({ ...prev, preco: Number(event.target.value) }))}
              className="mt-2 w-full rounded-2xl border border-offwhite/20 bg-[#14121a] px-4 py-2 text-offwhite"
            />
          </label>
          <ChipInput
            label="Imagens (URLs)"
            values={formState.images}
            onChange={(values) => setFormState((prev) => ({ ...prev, images: values }))}
          />
          <label className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              checked={formState.ativo}
              onChange={(event) => setFormState((prev) => ({ ...prev, ativo: event.target.checked }))}
            />
            Exibir na área pública
          </label>
          <div>
            <p className="text-offwhite/70">Categorias vinculadas</p>
            <div className="mt-2 grid gap-2 md:grid-cols-2">
              {categories.map((category) => (
                <label key={category._id} className="flex items-center gap-2 rounded-xl border border-offwhite/10 px-3 py-2">
                  <input
                    type="checkbox"
                    checked={formState.categorias.includes(category._id)}
                    onChange={() => toggleCategory(category._id)}
                  />
                  <span>{category.nome}</span>
                </label>
              ))}
              {!categories.length && <p className="text-sm text-offwhite/50">Nenhuma categoria cadastrada.</p>}
            </div>
          </div>
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
              {submitting ? 'Salvando...' : 'Salvar'}
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default AdminAccessoriesPage;

