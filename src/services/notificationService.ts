/** In-app notifications for the signed-in user. */
import { ApiPage, apiClient } from './apiClient';
import type { AppNotification } from '../store/notificationStore';

export interface RawNotification {
  id: string;
  message: string;
  is_read: boolean;
  created_at: string;
  title?: string | null;
  type?: string;
}

export function mapNotification(raw: RawNotification): AppNotification {
  const allowed = ['info', 'success', 'warning', 'error'] as const;
  const type = (raw.type ?? 'info') as AppNotification['type'];
  return {
    id: raw.id,
    title: raw.title ?? 'Notification',
    message: raw.message,
    timestamp: (raw.created_at ?? '').replace('T', ' ').slice(0, 16),
    read: raw.is_read,
    type: allowed.includes(type) ? type : 'info',
  };
}

export const notificationService = {
  async list(unreadOnly = false): Promise<AppNotification[]> {
    const { data } = await apiClient.get<ApiPage<RawNotification>>('/notifications', {
      params: { unread_only: unreadOnly, limit: 50 },
    });
    return data.items.map(mapNotification);
  },

  async unreadCount(): Promise<number> {
    const { data } = await apiClient.get<{ unread: number }>('/notifications/unread-count');
    return data.unread;
  },

  async markRead(id: string): Promise<void> {
    await apiClient.post(`/notifications/${id}/read`);
  },

  async markAllRead(): Promise<void> {
    await apiClient.post('/notifications/read-all');
  },
};
