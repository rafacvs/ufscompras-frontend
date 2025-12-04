import { useCallback, useEffect, useState } from 'react';
import ChipInput from '../../components/admin/ChipInput';
import Modal from '../../components/admin/Modal';
import Table from '../../components/admin/Table';
import { useAuth } from '../../context/AuthContext';
import { adminApi } from '../../services/api';
import type { CategoryDocument } from '../../services/types';

const AdminCategoriesPage = () => {
  const { token } = useAuth();
  const [categories, setCategories] = useState<CategoryDocument[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formState, setFormState] = useState<{
    id?: string;
    nome: string;
    slug?: string;
    descricao: string;
    image: string;
    subcategorias: string[];
  }>({ nome: '', slug: undefined, descricao: '', image: '', subcategorias: [] });
  const [submitting, setSubmitting] = useState(false);
  const [notification, setNotification] = useState('');

  const loadCategories = useCallback(async () => {
    if (!token) return;
    setIsLoading(true);
    setError('');
    try {
      const list = await adminApi.listCategories(token);
      setCategories(list);
    } catch (err) {
      setError((err as Error).message ?? 'Erro ao carregar categorias');
    } finally {
      setIsLoading(false);
    }
  }, [token]);

  useEffect(() => {
    void loadCategories();
  }, [loadCategories]);

  const openModal = (category?: CategoryDocument) => {
    if (category) {
      setFormState({
        id: category._id,
        nome: category.nome,
        slug: category.slug,
        descricao: category.descricao ?? '',
        image: category.image ?? '',
        subcategorias: category.subcategorias ?? [],
      });
    } else {
      setFormState({ nome: '', slug: undefined, descricao: '', image: '', subcategorias: [] });
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
        slug: formState.slug,
        descricao: formState.descricao,
        image: formState.image,
        subcategorias: formState.subcategorias,
      };
      if (formState.id) {
        await adminApi.updateCategory(token, formState.id, payload);
        setNotification('Categoria atualizada');
      } else {
        await adminApi.createCategory(token, payload);
        setNotification('Categoria criada');
      }
      setIsModalOpen(false);
      void loadCategories();
    } catch (err) {
      setNotification((err as Error).message ?? 'Erro ao salvar categoria');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!token) return;
    if (!confirm('Remover esta categoria?')) return;
    try {
      await adminApi.deleteCategory(token, id);
      setNotification('Categoria removida');
      void loadCategories();
    } catch (err) {
      setNotification((err as Error).message ?? 'Erro ao remover categoria');
    }
  };

  return (
    <div className="space-y-6">
      <header className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h2 className="text-2xl font-semibold">Categorias</h2>
          <p className="text-sm text-offwhite/70">Cadastre e organize as categorias utilizadas no catálogo.</p>
        </div>
        <button
          type="button"
          onClick={() => openModal()}
          className="rounded-full bg-purple px-5 py-2 text-sm font-semibold text-offwhite shadow"
        >
          Nova categoria
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
              { header: 'Slug', key: 'slug' },
              {
                header: 'Descrição',
                render: (category: CategoryDocument) => category.descricao ?? '-',
              },
              {
                header: 'Atualizado',
                render: (category: CategoryDocument) => new Date(category.updatedAt).toLocaleDateString('pt-BR'),
              },
              {
                header: 'Ações',
                render: (category: CategoryDocument) => (
                  <div className="flex gap-2 text-xs">
                    <button className="text-purple" onClick={() => openModal(category)}>
                      Editar
                    </button>
                    <button
                      className="text-orange"
                      onClick={() => {
                        void handleDelete(category._id);
                      }}
                    >
                      Remover
                    </button>
                  </div>
                ),
              },
            ]}
            data={categories}
            emptyMessage="Nenhuma categoria cadastrada."
          />
        )}
      </div>

      <Modal open={isModalOpen} onClose={() => setIsModalOpen(false)} title={formState.id ? 'Editar categoria' : 'Nova categoria'}>
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
            <span className="text-offwhite/70">Slug (opcional)</span>
            <input
              type="text"
              value={formState.slug ?? ''}
              onChange={(event) => setFormState((prev) => ({ ...prev, slug: event.target.value || undefined }))}
              className="mt-2 w-full rounded-2xl border border-offwhite/20 bg-[#14121a] px-4 py-2 text-offwhite"
            />
            <p className="mt-1 text-xs text-offwhite/50">Se vazio, será gerado automaticamente a partir do nome.</p>
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
            <span className="text-offwhite/70">Imagem (URL)</span>
            <input
              type="text"
              value={formState.image}
              onChange={(event) => setFormState((prev) => ({ ...prev, image: event.target.value }))}
              className="mt-2 w-full rounded-2xl border border-offwhite/20 bg-[#14121a] px-4 py-2 text-offwhite"
            />
          </label>
          <ChipInput
            label="Subcategorias"
            values={formState.subcategorias}
            onChange={(values) => setFormState((prev) => ({ ...prev, subcategorias: values }))}
            helperText="Separe por vírgula (ex: Animes, Básicas, Cinema)"
          />
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

export default AdminCategoriesPage;

