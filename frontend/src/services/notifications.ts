import { API_URL } from '@/lib/api';
import type { Notification } from '@/types/notification';

export const notificationsService = {
  async getAll(token: string): Promise<Notification[]> {
    const res = await fetch(`${API_URL}/notifications`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (!res.ok) {
      throw new Error('Error al cargar notificaciones');
    }

    return res.json();
  },

  async markAsRead(notificationId: string, token: string): Promise<Notification> {
    const res = await fetch(`${API_URL}/notifications/${notificationId}/read`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
    });

    if (!res.ok) {
      throw new Error('Error al marcar como leída');
    }

    return res.json();
  },

  async markAllAsRead(token: string): Promise<void> {
    const res = await fetch(`${API_URL}/notifications/read-all`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
    });

    if (!res.ok) {
      throw new Error('Error al marcar todas como leídas');
    }
  },
};
