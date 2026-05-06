import { useEffect, useState } from 'react';
import { useAuth } from '@/hooks/use-auth';
import { alumnoService, type AlumnoProfile } from '@/services/alumno';
import { AlumnoProfileSidebar } from './components/alumno-profile-sidebar';
import { RecommendedProjectsSection } from './components/recommended-projects-section';
import { ExploreProjectsSection } from './components/explore-projects-section';

export function AlumnoDashboardPage() {
  const { user, token } = useAuth();
  const [profile, setProfile] = useState<AlumnoProfile | null>(null);

  const displayName = user ? `${user.nombre} ${user.apellido}` : 'Alumno';
  const initials = user
    ? `${user.nombre[0]}${user.apellido[0]}`.toUpperCase()
    : 'A';

  useEffect(() => {
    if (!token) return;
    alumnoService.getMyProfile(token).then(setProfile).catch(() => null);
  }, [token]);

  return (
    <div className="space-y-10 grid grid-cols-1 lg:grid-cols-[280px_1fr] gap-6 items-start">
      <AlumnoProfileSidebar
        displayName={displayName}
        initials={initials}
        email={user?.email}
        anioEnCurso={profile?.anioEnCurso}
        bio={profile?.bio}
      />

      <div className="space-y-5">
        <RecommendedProjectsSection />
        <ExploreProjectsSection />
      </div>
    </div>
  );
}
