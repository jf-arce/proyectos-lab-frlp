import { Navigate, Outlet } from 'react-router';
import { useAuth } from '@/hooks/use-auth';

interface PrivateRouteProps {
  allowedRoles?: string[];
}

export function PrivateRoute({ allowedRoles }: PrivateRouteProps) {
  const { token, user, isLoading } = useAuth();

  if (isLoading) return null;

  if (!token) return <Navigate to="/login" replace />;

  if (allowedRoles && user && !allowedRoles.includes(user.role)) {
    return <Navigate to="/login" replace />;
  }

  return <Outlet />;
}
