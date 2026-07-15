import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
} from 'react';
import { useAuth } from '@/hooks/use-auth';
import { alumnoService, type AlumnoProfile } from '@/services/alumno';

interface PerfilContextValue {
  profile: AlumnoProfile | null;
  loadingProfile: boolean;
  refreshProfile: () => Promise<void>;
}

const PerfilContext = createContext<PerfilContextValue | null>(null);

export function PerfilProvider({ children }: { children: React.ReactNode }) {
  const { token } = useAuth();
  const [profile, setProfile] = useState<AlumnoProfile | null>(null);
  const [loadingProfile, setLoadingProfile] = useState(true);

  const refreshProfile = useCallback(async () => {
    if (!token) return;
    try {
      const updated = await alumnoService.getMyProfile(token);
      setProfile(updated);
    } catch {
      // keep last known value on failure
    }
  }, [token]);

  useEffect(() => {
    if (!token) return;
    let cancelled = false;
    alumnoService
      .getMyProfile(token)
      .then((p) => {
        if (!cancelled) setProfile(p);
      })
      .catch(() => null)
      .finally(() => {
        if (!cancelled) setLoadingProfile(false);
      });
    return () => {
      cancelled = true;
    };
  }, [token]);

  return (
    <PerfilContext.Provider value={{ profile, loadingProfile, refreshProfile }}>
      {children}
    </PerfilContext.Provider>
  );
}

export function usePerfilContext() {
  const ctx = useContext(PerfilContext);
  if (!ctx)
    throw new Error('usePerfilContext must be used inside PerfilProvider');
  return ctx;
}
