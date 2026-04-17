import { useAuth } from '@/hooks/use-auth';
import { AlumnoProfileSidebar } from './components/alumno-profile-sidebar';
import { RecommendedProjectsSection } from './components/recommended-projects-section';
import { ExploreProjectsSection } from './components/explore-projects-section';

export function AlumnoDashboardPage() {
  const { user } = useAuth();
  const displayName = user ? `${user.nombre} ${user.apellido}` : 'Alumno';
  const initials = user
    ? `${user.nombre[0]}${user.apellido[0]}`.toUpperCase()
    : 'A';

  return (
    <div className="space-y-10 grid grid-cols-1 lg:grid-cols-[280px_1fr] gap-6 items-start">
      <AlumnoProfileSidebar
        displayName={displayName}
        initials={initials}
        email={user?.email}
      />

      <div className="space-y-5">
        <RecommendedProjectsSection />
        <ExploreProjectsSection />
      </div>
    </div>
  );
}
