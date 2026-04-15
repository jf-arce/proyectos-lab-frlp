import { createRoot } from 'react-dom/client';
import { Outlet, RouterProvider, createBrowserRouter } from 'react-router';
import { Toaster } from 'sonner';
import { AuthProvider } from '@/context/auth-context';
import { publicRoutes } from '@/routes/public-routes';
import { alumnoRoutes } from '@/routes/alumno-routes';
import { responsableRoutes } from '@/routes/responsable-routes';
import './index.css';

const router = createBrowserRouter([
  {
    element: (
      <AuthProvider>
        <Toaster richColors position="top-right" />
        <Outlet />
      </AuthProvider>
    ),
    children: [...publicRoutes, ...alumnoRoutes, ...responsableRoutes],
  },
]);

createRoot(document.getElementById('root')!).render(
  <RouterProvider router={router} />,
);
