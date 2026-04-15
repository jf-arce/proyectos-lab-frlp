import { PrivateRoute } from '@/components/private-route';
import { Role } from '@/types/auth';
import { AlumnoDashboardPage } from '@/pages/alumno/dashboard-page';
import { LaboratoriosPage } from '@/pages/alumno/labs-page';
import { LaboratorioDetailPage } from '@/pages/alumno/lab-detail-page';
import { ProjectDetailPage } from '@/pages/alumno/project-detail-page';
import { PostulacionesPage } from '@/pages/alumno/postulaciones-page';

export const alumnoRoutes = [
  {
    element: <PrivateRoute allowedRoles={[Role.ALUMNO]} />,
    children: [
      { path: '/alumno/dashboard', element: <AlumnoDashboardPage /> },
      { path: '/alumno/laboratorios', element: <LaboratoriosPage /> },
      { path: '/alumno/laboratorios/:id', element: <LaboratorioDetailPage /> },
      { path: '/alumno/proyecto/:id', element: <ProjectDetailPage /> },
      { path: '/alumno/postulaciones', element: <PostulacionesPage /> },
    ],
  },
];
