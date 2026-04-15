import { FlaskConical, GraduationCap } from 'lucide-react';
import { AuthBackground } from './components/auth-background';
import { AuthBrandingPanel } from './components/auth-branding-panel';
import { RegisterForm } from './components/register-form';
import { AuthGridContainer } from './components/auth-grid-container';

export function RegisterPage() {
  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-6 relative overflow-hidden">
      <AuthBackground />

      <AuthGridContainer>
        <AuthBrandingPanel
          patternId="register-grid"
          title="Comenzá tu experiencia en los laboratorios"
          description="Registrate para explorar proyectos de investigación y postularte a los que se ajusten a tu perfil."
        >
          <div className="flex items-center gap-3 text-sm font-medium">
            <GraduationCap
              className="size-5 text-primary-foreground/60"
              strokeWidth={1.5}
            />
            <span>Solo para alumnos de UTN FRLP</span>
          </div>
          <div className="flex items-center gap-3 text-sm font-medium">
            <FlaskConical
              className="size-5 text-primary-foreground/60"
              strokeWidth={1.5}
            />
            <span>Accedé a proyectos de laboratorio</span>
          </div>
          <div className="pt-6 border-t border-white/10">
            <p className="text-xs text-primary-foreground/40 font-medium tracking-wide uppercase">
              Universidad Tecnológica Nacional - Facultad Regional La Plata
            </p>
          </div>
        </AuthBrandingPanel>

        <RegisterForm />
      </AuthGridContainer>
    </div>
  );
}
