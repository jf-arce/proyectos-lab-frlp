import type { ReactNode } from 'react';
import { useAuth } from '@/hooks/use-auth';
import { NotificationsProvider } from '@/context/notifications-context';

interface AppProvidersProps {
  children: ReactNode;
}

export function AppProviders({ children }: AppProvidersProps) {
  const { token } = useAuth();

  return (
    <NotificationsProvider token={token}>
      {children}
    </NotificationsProvider>
  );
}
