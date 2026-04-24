import {
  createContext,
  useEffect,
  useRef,
  useState,
  useCallback,
  type ReactNode,
} from 'react';
import { useNavigate } from 'react-router';
import { jwtDecode } from 'jwt-decode';
import { authService } from '@/services/auth';
import type { Role, RegisterDto } from '@/types/auth';

export interface JwtPayload {
  sub: string;
  email: string;
  role: Role;
  nombre: string;
  apellido: string;
  laboratoryId?: string;
  exp?: number;
}

interface AuthContextValue {
  user: JwtPayload | null;
  token: string | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<JwtPayload>;
  register: (dto: RegisterDto) => Promise<JwtPayload>;
  logout: () => Promise<void>;
}

export const AuthContext = createContext<AuthContextValue | null>(null);

const REFRESH_TOKEN_KEY = 'refreshToken';
const REFRESH_MARGIN_MS = 60_000; // renovar 1 minuto antes de expirar

export function AuthProvider({ children }: { children: ReactNode }) {
  const [token, setToken] = useState<string | null>(null);
  const [user, setUser] = useState<JwtPayload | null>(null);
  // Start as true only when there's a stored token to restore; false otherwise.
  // This avoids calling setState synchronously inside the effect.
  const [isLoading, setIsLoading] = useState(
    () => !!localStorage.getItem(REFRESH_TOKEN_KEY),
  );
  const navigate = useNavigate();
  const refreshTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const clearRefreshTimer = useCallback(() => {
    if (refreshTimerRef.current !== null) {
      clearTimeout(refreshTimerRef.current);
      refreshTimerRef.current = null;
    }
  }, []);

  const clearSession = useCallback(() => {
    clearRefreshTimer();
    setToken(null);
    setUser(null);
    localStorage.removeItem(REFRESH_TOKEN_KEY);
  }, [clearRefreshTimer]);

  const scheduleRefreshRef = useRef<(accessToken: string) => void>(null!);

  const scheduleRefresh = useCallback(
    (accessToken: string) => {
      clearRefreshTimer();

      const payload = jwtDecode<JwtPayload>(accessToken);
      if (!payload.exp) return;

      const delay = payload.exp * 1000 - Date.now() - REFRESH_MARGIN_MS;

      const doRefresh = () => {
        const storedRefreshToken = localStorage.getItem(REFRESH_TOKEN_KEY);
        if (!storedRefreshToken) {
          clearSession();
          navigate('/login', { replace: true });
          return;
        }
        authService
          .refreshTokens(storedRefreshToken)
          .then(({ accessToken: newToken }) => {
            setToken(newToken);
            setUser(jwtDecode<JwtPayload>(newToken));
            scheduleRefreshRef.current(newToken);
          })
          .catch(() => {
            clearSession();
            navigate('/login', { replace: true });
          });
      };

      if (delay <= 0) {
        doRefresh();
        return;
      }

      refreshTimerRef.current = setTimeout(doRefresh, delay);
    },
    [clearRefreshTimer, clearSession, navigate],
  );

  // Sincronizar el ref fuera del render para que doRefresh siempre tenga la versión más reciente
  useEffect(() => {
    scheduleRefreshRef.current = scheduleRefresh;
  }, [scheduleRefresh]);

  const applyTokens = useCallback(
    (accessToken: string, refreshToken: string): JwtPayload => {
      const payload = jwtDecode<JwtPayload>(accessToken);
      setToken(accessToken);
      setUser(payload);
      localStorage.setItem(REFRESH_TOKEN_KEY, refreshToken);
      scheduleRefresh(accessToken);
      return payload;
    },
    [scheduleRefresh],
  );

  // Restaurar sesión al montar
  useEffect(() => {
    const storedRefreshToken = localStorage.getItem(REFRESH_TOKEN_KEY);
    if (!storedRefreshToken) return;

    authService
      .refreshTokens(storedRefreshToken)
      .then(({ accessToken }) => {
        setToken(accessToken);
        setUser(jwtDecode<JwtPayload>(accessToken));
        localStorage.setItem(REFRESH_TOKEN_KEY, storedRefreshToken);
        scheduleRefresh(accessToken);
      })
      .catch(() => {
        localStorage.removeItem(REFRESH_TOKEN_KEY);
      })
      .finally(() => setIsLoading(false));

    return () => clearRefreshTimer();
  }, [clearRefreshTimer, scheduleRefresh]);

  const login = useCallback(
    async (email: string, password: string): Promise<JwtPayload> => {
      const { accessToken, refreshToken } = await authService.login(
        email,
        password,
      );
      return applyTokens(accessToken, refreshToken);
    },
    [applyTokens],
  );

  const register = useCallback(
    async (dto: RegisterDto): Promise<JwtPayload> => {
      const { accessToken, refreshToken } = await authService.register(dto);
      return applyTokens(accessToken, refreshToken);
    },
    [applyTokens],
  );

  const logout = useCallback(async () => {
    const storedRefreshToken = localStorage.getItem(REFRESH_TOKEN_KEY);
    if (storedRefreshToken) {
      await authService.logout(storedRefreshToken).catch(() => {});
    }
    clearSession();
    navigate('/login', { replace: true });
  }, [clearSession, navigate]);

  return (
    <AuthContext.Provider
      value={{ user, token, isLoading, login, register, logout }}
    >
      {children}
    </AuthContext.Provider>
  );
}
