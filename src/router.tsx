import { createBrowserRouter } from 'react-router-dom';
import AdminRoute from './components/AdminRoute';
import AdminLayout from './layouts/AdminLayout';
import MainLayout from './layouts/MainLayout';
import LoginPage from './pages/LoginPage';
import CategoryListPage from './pages/CategoryListPage';
import HomePage from './pages/HomePage';
import ProductCatalogPage from './pages/ProductCatalogPage';
import ProductPage from './pages/ProductPage';
import SignUpPage from './pages/SignUpPage';
import AdminAccessoriesPage from './pages/admin/AdminAccessoriesPage';
import AdminCategoriesPage from './pages/admin/AdminCategoriesPage';
import AdminDashboardPage from './pages/admin/AdminDashboardPage';
import AdminInventoryPage from './pages/admin/AdminInventoryPage';
import AdminLoginPage from './pages/admin/AdminLoginPage';
import AdminProductsPage from './pages/admin/AdminProductsPage';
import AdminReportsPage from './pages/admin/AdminReportsPage';

const router = createBrowserRouter([
  {
    path: '/',
    element: <MainLayout />,
    children: [
      { index: true, element: <HomePage /> },
      { path: 'produtos', element: <ProductCatalogPage /> },
      { path: 'categoria/:slug', element: <CategoryListPage /> },
      { path: 'produto/:id', element: <ProductPage /> },
      { path: 'login', element: <LoginPage /> },
      { path: 'cadastro', element: <SignUpPage /> },
    ],
  },
  {
    path: '/admin',
    children: [
      { path: 'login', element: <AdminLoginPage /> },
      {
        element: <AdminRoute />,
        children: [
          {
            element: <AdminLayout />,
            children: [
              { index: true, element: <AdminDashboardPage /> },
              { path: 'produtos', element: <AdminProductsPage /> },
              { path: 'categorias', element: <AdminCategoriesPage /> },
              { path: 'acessorios', element: <AdminAccessoriesPage /> },
              { path: 'estoque', element: <AdminInventoryPage /> },
              { path: 'relatorios', element: <AdminReportsPage /> },
            ],
          },
        ],
      },
    ],
  },
]);

export default router;
