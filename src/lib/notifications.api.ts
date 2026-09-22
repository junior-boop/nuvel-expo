// D1 REST client for notifications (replaces instantdb.notifications.ts)
import { server_url } from '@/constants/server_url';

export interface NotificationRow {
    id: string;
    recipientUserId: string;
    type: string;
    title: string;
    body: string;
    data: { articleId?: string | null; commentId?: string | null } | null;
    read: boolean;
    actorUserId: string | null;
    articleId: string | null;
    commentId: string | null;
    createdAt: string;
}

export const getNotifications = async (
    userId: string,
    apiBase: string = server_url
): Promise<{ success: boolean; notifications: NotificationRow[] }> => {
    const response = await fetch(`${apiBase}/notifications/${userId}`);
    if (!response.ok) throw new Error(`HTTP error: ${response.status}`);
    return response.json();
};

// L'état de lecture est par utilisateur : une annonce diffusée est partagée par tous,
// elle ne peut donc pas porter un unique drapeau read côté ligne de notification.
export const markNotificationRead = async (
    notificationId: string,
    userId: string,
    apiBase: string = server_url
) => {
    const response = await fetch(`${apiBase}/notifications/${notificationId}/read`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId }),
    });
    if (!response.ok) throw new Error(`HTTP error: ${response.status}`);
    return response.json();
};

export const markAllNotificationsRead = async (
    userId: string,
    apiBase: string = server_url
) => {
    const response = await fetch(`${apiBase}/notifications/${userId}/read-all`, {
        method: 'POST',
    });
    if (!response.ok) throw new Error(`HTTP error: ${response.status}`);
    return response.json();
};
