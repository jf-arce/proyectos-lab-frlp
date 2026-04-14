import { createRoot } from 'react-dom/client';
import { BrowserRouter, Navigate, Route, Routes } from 'react-router';
import { Toaster } from 'sonner';
import './index.css';
import { AuthProvider } from '@/context/auth-context';
import { PrivateRoute } from '@/components/private-route';
import { Role } from '@/types/auth';
import { LoginPage } from '@/pages/auth/login-page';
import { RegisterPage } from '@/pages/auth/register-page';

// Placeholders hasta que se implementen los módulos correspondientes
function ProjectsPage() {
  return <div className="p-8">Proyectos (próximamente)</div>;
}
function ManageProjectsPage() {
  return <div className="p-8">Gestión de proyectos (próximamente)</div>;
}

createRoot(document.getElementById('root')!).render(
  <BrowserRouter>
    <AuthProvider>
      <Toaster richColors position="top-right" />
      <Routes>
        {/* Públicas */}
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />

        {/* Alumno */}
        <Route element={<PrivateRoute allowedRoles={[Role.ALUMNO]} />}>
          <Route path="/alumno/projects" element={<ProjectsPage />} />
        </Route>

        {/* Responsable de laboratorio */}
        <Route
          element={
            <PrivateRoute allowedRoles={[Role.RESPONSABLE_LABORATORIO]} />
          }
        >
          <Route
            path="/responsable/manage-projects"
            element={<ManageProjectsPage />}
          />
        </Route>

        {/* Raíz → login */}
        <Route path="/" element={<Navigate to="/login" replace />} />
      </Routes>
    </AuthProvider>
  </BrowserRouter>,
);
