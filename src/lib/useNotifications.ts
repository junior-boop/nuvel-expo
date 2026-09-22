// hooks/useNotificationsWebSocket.ts
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { AppState } from 'react-native';
import {
    getNotifications,
    markAllNotificationsRead,
    markNotificationRead,
    NotificationRow,
} from './notifications.api';

interface UseNotificationsWebSocketResult {
    notifications: NotificationRow[];
    unreadCount: number;
    loading: boolean;
    error: string | null;
    connected: boolean;
    refresh: () => Promise<void>;
    markRead: (notificationId: string) => Promise<void>;
    markAllRead: () => Promise<void>;
}

export const useNotificationsWebSocket = (
    userId: string,
    apiBase: string = 'https://nuvelserver.godigital.workers.dev'
): UseNotificationsWebSocketResult => {
    const [notifications, setNotifications] = useState<NotificationRow[]>([]);
    const [loading, setLoading] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);
    const [connected, setConnected] = useState<boolean>(false);

    const wsRef = useRef<WebSocket | null>(null);
    const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null);
    const reconnectAttempts = useRef<number>(0);
    const maxReconnectAttempts = 5;

    const unreadCount = useMemo(() => notifications.filter((n) => !n.read).length, [notifications]);

    // Chargement initial via REST : le Durable Object ne garde pas d'historique,
    // il diffuse seulement les notifications qui arrivent pendant que le WS est ouvert.
    const loadNotifications = useCallback(async () => {
        if (!userId) return;
        try {
            setLoading(true);
            setError(null);
            const data = await getNotifications(userId, apiBase);
            setNotifications(data?.notifications ?? []);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Erreur inconnue');
        } finally {
            setLoading(false);
        }
    }, [userId, apiBase]);

    // Marquer comme lue, avec mise à jour optimiste immédiate
    const markRead = useCallback(async (notificationId: string) => {
        setNotifications((prev) =>
            prev.map((n) => (n.id === notificationId ? { ...n, read: true } : n))
        );
        try {
            await markNotificationRead(notificationId, userId, apiBase);
        } catch (err) {
            if (__DEV__) console.log('[useNotificationsWebSocket] markRead error', err);
        }
    }, [userId, apiBase]);

    const markAllRead = useCallback(async () => {
        setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
        try {
            await markAllNotificationsRead(userId, apiBase);
        } catch (err) {
            if (__DEV__) console.log('[useNotificationsWebSocket] markAllRead error', err);
        }
    }, [userId, apiBase]);

    // Connexion WebSocket : reçoit les nouvelles notifications en direct
    // (comme les likes/commentaires), en complément du push OS.
    const connectWebSocket = useCallback(() => {
        if (!userId) return;
        if (wsRef.current?.readyState === WebSocket.OPEN || wsRef.current?.readyState === WebSocket.CONNECTING) return;

        const wsUrl = apiBase.replace(/^https?:\/\//, 'wss://');
        const url = `${wsUrl}/notifications/${userId}/ws`;

        try {
            const ws = new WebSocket(url);
            wsRef.current = ws;

            ws.onopen = () => {
                setConnected(true);
                setError(null);
                reconnectAttempts.current = 0;
                // Resynchronise : les annonces diffusées pendant que le socket était
                // fermé ne sont jamais rejouées par le Durable Object.
                loadNotifications();
            };

            ws.onmessage = (event) => {
                try {
                    const data = JSON.parse(event.data);

                    if (data.type === 'notification' && data.notification) {
                        const incoming: NotificationRow = {
                            id: data.notification.id,
                            recipientUserId: userId,
                            type: data.notification.type,
                            title: data.notification.title,
                            body: data.notification.body,
                            data: null,
                            read: false,
                            actorUserId: null,
                            articleId: data.notification.articleId ?? null,
                            commentId: data.notification.commentId ?? null,
                            createdAt: data.notification.createdAt,
                        };
                        setNotifications((prev) =>
                            prev.some((n) => n.id === incoming.id) ? prev : [incoming, ...prev]
                        );
                    }
                } catch (err) {
                    if (__DEV__) console.log('[useNotificationsWebSocket] Erreur parsing message', err);
                }
            };

            ws.onerror = () => {
                setConnected(false);
                setError('Erreur de connexion');
            };

            ws.onclose = () => {
                setConnected(false);
                wsRef.current = null;

                if (reconnectAttempts.current < maxReconnectAttempts) {
                    reconnectAttempts.current++;
                    const delay = Math.min(1000 * Math.pow(2, reconnectAttempts.current), 10000);
                    reconnectTimeoutRef.current = setTimeout(() => {
                        connectWebSocket();
                    }, delay);
                }
            };
        } catch (err) {
            if (__DEV__) console.log('[useNotificationsWebSocket] Erreur WebSocket', err);
            setError('Erreur WebSocket');
        }
    }, [userId, apiBase, loadNotifications]);

    useEffect(() => {
        loadNotifications();
    }, [loadNotifications]);

    useEffect(() => {
        connectWebSocket();
        return () => {
            if (reconnectTimeoutRef.current) {
                clearTimeout(reconnectTimeoutRef.current);
            }
            if (wsRef.current) {
                // Sans cela, close() déclencherait onclose qui replanifierait une
                // reconnexion alors que le hook est déjà démonté.
                wsRef.current.onclose = null;
                wsRef.current.close();
                wsRef.current = null;
            }
        };
    }, [connectWebSocket]);

    // L'OS ferme le socket quand l'app passe en arrière-plan, et le backoff finit par
    // épuiser ses tentatives. Au retour au premier plan on repart d'un compteur neuf.
    useEffect(() => {
        const subscription = AppState.addEventListener('change', (state) => {
            if (state !== 'active') return;
            reconnectAttempts.current = 0;
            connectWebSocket();
        });
        return () => subscription.remove();
    }, [connectWebSocket]);

    return {
        notifications,
        unreadCount,
        loading,
        error,
        connected,
        refresh: loadNotifications,
        markRead,
        markAllRead,
    };
};
