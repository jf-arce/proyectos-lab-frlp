import {
  createContext,
  useEffect,
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
  laboratoryId?: string;
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

export function AuthProvider({ children }: { children: ReactNode }) {
  const [token, setToken] = useState<string | null>(null);
  const [user, setUser] = useState<JwtPayload | null>(null);
  // Start as true only when there's a stored token to restore; false otherwise.
  // This avoids calling setState synchronously inside the effect.
  const [isLoading, setIsLoading] = useState(
    () => !!localStorage.getItem(REFRESH_TOKEN_KEY),
  );
  const navigate = useNavigate();

  const applyTokens = useCallback(
    (accessToken: string, refreshToken: string): JwtPayload => {
      const payload = jwtDecode<JwtPayload>(accessToken);
      setToken(accessToken);
      setUser(payload);
      localStorage.setItem(REFRESH_TOKEN_KEY, refreshToken);
      return payload;
    },
    [],
  );

  const clearSession = useCallback(() => {
    setToken(null);
    setUser(null);
    localStorage.removeItem(REFRESH_TOKEN_KEY);
  }, []);

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
      })
      .catch(() => {
        localStorage.removeItem(REFRESH_TOKEN_KEY);
      })
      .finally(() => setIsLoading(false));
  }, []);

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
