import { useDatabase } from '@/context/database.context';
import { NotificationRow } from '@/lib/notifications.api';
import { useNotificationsWebSocket } from '@/lib/useNotifications';
import React, { createContext, ReactNode, useContext } from 'react';

interface NotificationsContextType {
    notifications: NotificationRow[];
    unreadCount: number;
    loading: boolean;
    refresh: () => Promise<void>;
    markRead: (notificationId: string) => Promise<void>;
    markAllRead: () => Promise<void>;
}

const NotificationsContext = createContext<NotificationsContextType | undefined>(undefined);

// Une seule connexion WebSocket/REST partagée entre l'écran Notifications et le badge
// de la tab bar, au lieu d'une instance par consommateur.
export const NotificationsProvider = ({ children }: { children: ReactNode }) => {
    const { session } = useDatabase();
    const { notifications, unreadCount, loading, refresh, markRead, markAllRead } = useNotificationsWebSocket(
        session?.iduser as string
    );

    return (
        <NotificationsContext.Provider value={{ notifications, unreadCount, loading, refresh, markRead, markAllRead }}>
            {children}
        </NotificationsContext.Provider>
    );
};

export const useNotificationsContext = () => {
    const ctx = useContext(NotificationsContext);
    if (!ctx) throw new Error('useNotificationsContext must be used within a NotificationsProvider');
    return ctx;
};
