import { PrivateRoute } from '@/components/private-route';
import { Role } from '@/types/auth';
import { ResponsableDashboardPage } from '@/pages/responsable/dashboard-page';
import { LaboratorioPage } from '@/pages/responsable/laboratorio-page';
import { ProjectPostulacionesPage } from '@/pages/responsable/project-postulaciones-page';
import { LabLayout } from '@/layouts/lab-layout';

export const responsableRoutes = [
  {
    element: <PrivateRoute allowedRoles={[Role.RESPONSABLE_LABORATORIO]} />,
    children: [
      {
        element: <LabLayout />,
        children: [
          { path: '/responsable/dashboard', element: <ResponsableDashboardPage /> },
          { path: '/responsable/laboratorio', element: <LaboratorioPage /> },
          {
            path: '/responsable/proyectos/:id/postulaciones',
            element: <ProjectPostulacionesPage />,
          },
        ]
      }
    ],
  },
];
