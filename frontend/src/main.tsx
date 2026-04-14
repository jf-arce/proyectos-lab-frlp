import { createRoot } from 'react-dom/client';
import { BrowserRouter, Navigate, Route, Routes } from 'react-router';
import { Toaster } from 'sonner';
import { AuthProvider } from '@/context/auth-context';
import { PrivateRoute } from '@/components/private-route';
import { Role } from '@/types/auth';
import { LoginPage } from '@/pages/auth/login-page';
import { RegisterPage } from '@/pages/auth/register-page';
import './index.css';

// Placeholders hasta que se implementen los módulos correspondientes
function LabsPage() {
  return <div className="p-8">Laboratorios (próximamente)</div>;
}
function LabDetailPage() {
  return <div className="p-8">Detalle del laboratorio (próximamente)</div>;
}
function LabProjectsPage() {
  return <div className="p-8">Proyectos del laboratorio (próximamente)</div>;
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

        {/* Protegidas */}
        <Route element={<PrivateRoute allowedRoles={[Role.ALUMNO]} />}>
          <Route path="/alumno/labs" element={<LabsPage />} />
          <Route path="/alumno/lab/:labId" element={<LabDetailPage />} />
          <Route
            path="/alumno/lab/:labId/projects"
            element={<LabProjectsPage />}
          />
        </Route>

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

        {/* Root */}
        <Route path="/" element={<Navigate to="/login" replace />} />
      </Routes>
    </AuthProvider>
  </BrowserRouter>,
);
