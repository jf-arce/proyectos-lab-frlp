import { createRoot } from 'react-dom/client';
import { BrowserRouter, Navigate, Route, Routes } from 'react-router';
import { Toaster } from 'sonner';
import { AuthProvider } from '@/context/auth-context';
import { PrivateRoute } from '@/components/private-route';
import { Role } from '@/types/auth';
import { LoginPage } from '@/pages/auth/login-page';
import { RegisterPage } from '@/pages/auth/register-page';
import { AlumnoDashboardPage } from '@/pages/alumno/dashboard-page';
import { LaboratoriosPage } from '@/pages/alumno/labs-page';
import { LaboratorioDetailPage } from '@/pages/alumno/lab-detail-page';
import { ProjectDetailPage } from '@/pages/alumno/project-detail-page';
import { PostulacionesPage } from '@/pages/alumno/postulaciones-page';
import { ResponsableDashboardPage } from '@/pages/responsable/dashboard-page';
import { LaboratorioPage } from '@/pages/responsable/laboratorio-page';
import { ProjectPostulacionesPage } from '@/pages/responsable/project-postulaciones-page';
import './index.css';

createRoot(document.getElementById('root')!).render(
  <BrowserRouter>
    <AuthProvider>
      <Toaster richColors position="top-right" />
      <Routes>
        {/* Públicas */}
        <Route path="/" element={<Navigate to="/login" replace />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />

        {/* Alumno */}
        <Route element={<PrivateRoute allowedRoles={[Role.ALUMNO]} />}>
          <Route path="/alumno/dashboard" element={<AlumnoDashboardPage />} />
          <Route path="/alumno/laboratorios" element={<LaboratoriosPage />} />
          <Route
            path="/alumno/laboratorios/:id"
            element={<LaboratorioDetailPage />}
          />
          <Route path="/alumno/proyecto/:id" element={<ProjectDetailPage />} />
          <Route path="/alumno/postulaciones" element={<PostulacionesPage />} />
        </Route>

        {/* Responsable Laboratorio */}
        <Route
          element={
            <PrivateRoute allowedRoles={[Role.RESPONSABLE_LABORATORIO]} />
          }
        >
          <Route
            path="/responsable/dashboard"
            element={<ResponsableDashboardPage />}
          />
          <Route
            path="/responsable/laboratorio"
            element={<LaboratorioPage />}
          />
          <Route
            path="/responsable/proyectos/:id/postulaciones"
            element={<ProjectPostulacionesPage />}
          />
        </Route>
      </Routes>
    </AuthProvider>
  </BrowserRouter>,
);
