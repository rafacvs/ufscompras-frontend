import type { ReactElement } from 'react';
import { render } from '@testing-library/react';
import { RouterProvider, createMemoryRouter, type RouteObject } from 'react-router-dom';
import { AuthProvider } from '../context/AuthContext';

type RenderRouteOptions = {
  path?: string;
  initialEntries?: string[];
  extraRoutes?: RouteObject[];
};

export const renderRoute = (element: ReactElement, options: RenderRouteOptions = {}) => {
  const { path = '/', initialEntries = [path], extraRoutes = [] } = options;
  const routes: RouteObject[] = [
    ...extraRoutes,
    {
      path,
      element,
    },
  ];

  const router = createMemoryRouter(routes, { initialEntries });

  return {
    router,
    ...render(
      <AuthProvider>
        <RouterProvider router={router} />
      </AuthProvider>,
    ),
  };
};


