import { AuthBackground } from './components/auth-background';
import { AuthBrandingPanel } from './components/auth-branding-panel';
import { AuthGridContainer } from './components/auth-grid-container';
import { LoginForm } from './components/login-form';

export function LoginPage() {
  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-6 relative overflow-hidden">
      <AuthBackground />

      <AuthGridContainer>
        <AuthBrandingPanel
          patternId="login-grid"
          title="Gestión de Proyectos y Laboratorios"
          description="Acceso exclusivo para docentes, investigadores y alumnos de la Facultad Regional La Plata."
        >
          <div className="pt-6 border-t border-white/10">
            <p className="text-xs text-primary-foreground/40 font-medium tracking-wide uppercase">
              Universidad Tecnológica Nacional - Facultad Regional La Plata
            </p>
          </div>
        </AuthBrandingPanel>

        <LoginForm />
      </AuthGridContainer>
    </div>
  );
}
