import { createContext, useEffect, useState, useCallback } from 'react';
import { notificationsService } from '@/services/notifications';
import type { Notification } from '@/types/notification';

export interface NotificationsContextType {
  notifications: Notification[];
  unreadCount: number;
  error: string | null;
  markAsRead: (notificationId: string) => Promise<void>;
  markAllAsRead: () => Promise<void>;
  refetch: () => Promise<void>;
}

export const NotificationsContext = createContext<NotificationsContextType | undefined>(
  undefined,
);

interface NotificationsProviderProps {
  children: React.ReactNode;
  token: string | null;
}

export function NotificationsProvider({ children, token }: NotificationsProviderProps) {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [error, setError] = useState<string | null>(null);

  const unreadCount = notifications.filter((n) => !n.leida).length;

  const fetchNotifications = useCallback(async () => {
    if (!token) return;

    try {
      setError(null);
      const data = await notificationsService.getAll(token);
      setNotifications(data);
    } catch (err) {
      console.error('Error fetching notifications:', err);
      setError(err instanceof Error ? err.message : 'Error desconocido');
    }
  }, [token]);

  const markAsRead = useCallback(
    async (notificationId: string) => {
      if (!token) return;

      try {
        const updated = await notificationsService.markAsRead(notificationId, token);
        setNotifications((prev) =>
          prev.map((n) => (n.id === notificationId ? updated : n)),
        );
      } catch (err) {
        console.error('Error marking as read:', err);
      }
    },
    [token],
  );

  const markAllAsRead = useCallback(async () => {
    if (!token) return;

    try {
      await notificationsService.markAllAsRead(token);
      setNotifications((prev) => prev.map((n) => ({ ...n, leida: true })));
    } catch (err) {
      console.error('Error marking all as read:', err);
    }
  }, [token]);

  // Cargar notificaciones al montar
  useEffect(() => {
    fetchNotifications();
  }, [fetchNotifications]);

  // Polling cada 30 segundos
  useEffect(() => {
    const interval = setInterval(() => {
      fetchNotifications();
    }, 30000);

    return () => clearInterval(interval);
  }, [fetchNotifications]);

  const value: NotificationsContextType = {
    notifications,
    unreadCount,
    error,
    markAsRead,
    markAllAsRead,
    refetch: fetchNotifications,
  };

  return (
    <NotificationsContext.Provider value={value}>
      {children}
    </NotificationsContext.Provider>
  );
}
