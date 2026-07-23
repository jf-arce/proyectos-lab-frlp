import { useEffect, useState } from 'react';
import { useAuth } from '@/hooks/use-auth';
import { usePerfilContext } from '@/context/perfil-context';
import { projectsService } from '@/services/projects';
import { AlumnoProfileSidebar } from './components/alumno-profile-sidebar';
import { RecommendedProjectsSection } from './components/recommended-projects-section';
import { ExploreProjectsSection } from './components/explore-projects-section';

export function AlumnoDashboardPage() {
  const { user, token } = useAuth();
  const { profile } = usePerfilContext();

  const [postulacionesActivas, setPostulacionesActivas] = useState(0);

  const nombre = profile?.nombre ?? user?.nombre ?? '';
  const apellido = profile?.apellido ?? user?.apellido ?? '';
  const displayName = nombre && apellido ? `${nombre} ${apellido}` : 'Alumno';
  const initials =
    nombre && apellido ? `${nombre[0]}${apellido[0]}`.toUpperCase() : 'A';

  useEffect(() => {
    if (!token) return;

    projectsService
      .getMyApplications(token)
      .then((apps) => {
        setPostulacionesActivas(
          apps.filter((app) => app.estado === 'PENDIENTE').length,
        );
      })
      .catch(() => {
        setPostulacionesActivas(0);
      });
  }, [token]);

  return (
    <div className="space-y-10 grid grid-cols-1 lg:grid-cols-[280px_1fr] gap-6 items-start">
      <AlumnoProfileSidebar
        displayName={displayName}
        initials={initials}
        email={user?.email}
        anioEnCurso={profile?.anioEnCurso}
        bio={profile?.bio}
        postulacionesActivas={postulacionesActivas}
      />

      <div className="space-y-5">
        <RecommendedProjectsSection />
        <ExploreProjectsSection />
      </div>
    </div>
  );
}
