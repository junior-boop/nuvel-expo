import { useNavigation } from '@react-navigation/native';
import { useCallback, useMemo, useState } from 'react';
import { AuthAPI } from './auth';

interface HistoryItem {
    id: string;
    pageType: string;
    pageId: string;
    pageTitle: string;
    pagePath: string;
    visitedAt: string;
    duration?: number;
}

interface HistoryStats {
    totalVisits: number;
    topPages: Array<{ pageId: string; title: string; count: number }>;
    byType: Record<string, number>;
}

const API_BASE = 'https://nuvelserver.godigital.workers.dev';

export const useNavigationHistory = () => {
    const [history, setHistory] = useState<HistoryItem[]>([]);
    const [stats, setStats] = useState<HistoryStats | null>(null);
    const [loading, setLoading] = useState(false);
    const navigation = useNavigation();
    /**
     * Charger l'historique
     */
    const loadHistory = useCallback(async (limit = 50, pageType?: string) => {
        try {
            setLoading(true);
            const headers = await AuthAPI.getAuthHeaders();
            const url = new URL(`${API_BASE}/history`);
            url.searchParams.set('limit', limit.toString());
            if (pageType) url.searchParams.set('pageType', pageType);
            const response = await fetch(url.toString(), { headers });
            const data = await response.json();
            if (data.success) {
                setHistory(data.history);
            }
        } catch (error) {
            console.error('[History] Erreur chargement:', error);
        } finally {
            setLoading(false);
        }
    }, []);
    /**
     * Charger les statistiques
     */
    const loadStats = useCallback(async () => {
        try {
            const headers = await AuthAPI.getAuthHeaders();
            const response = await fetch(`${API_BASE}/history/stats`, { headers });
            const data = await response.json();
            if (data.success) {
                setStats(data);
            }
        } catch (error) {
            console.error('[History] Erreur stats:', error);
        }
    }, []);
    /**
     * Enregistrer une visite
     */
    const trackVisit = useCallback(async (
        pageType: string,
        pageId: string,
        pageTitle: string,
        pagePath?: string,
        duration?: number
    ) => {
        try {
            const headers = await AuthAPI.getAuthHeaders();
            await fetch(`${API_BASE}/history`, {
                method: 'POST',
                headers,
                body: JSON.stringify({
                    pageType,
                    pageId,
                    pageTitle,
                    pagePath,
                    duration,
                }),
            });
            // Recharger l'historique
            await loadHistory();
        } catch (error) {
            console.error('[History] Erreur tracking:', error);
        }
    }, [loadHistory]);
    /**
     * Supprimer tout l'historique
     */
    const clearHistory = useCallback(async () => {
        try {
            const headers = await AuthAPI.getAuthHeaders();
            await fetch(`${API_BASE}/history`, {
                method: 'DELETE',
                headers,
            });
            setHistory([]);
        } catch (error) {
            console.error('[History] Erreur suppression:', error);
        }
    }, []);
    /**
     * Supprimer une visite
     */
    const removeVisit = useCallback(async (id: string) => {
        try {
            const headers = await AuthAPI.getAuthHeaders();
            await fetch(`${API_BASE}/history/${id}`, {
                method: 'DELETE',
                headers,
            });
            setHistory(prev => prev.filter(item => item.id !== id));
        } catch (error) {
            console.error('[History] Erreur suppression:', error);
        }
    }, []);
    /**
     * Grouper par date
     */
    const groupedByDate = useMemo(() => {
        const groups: Record<string, HistoryItem[]> = {
            today: [],
            yesterday: [],
            thisWeek: [],
            older: [],
        };
        const now = new Date();
        const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        const yesterday = new Date(today);
        yesterday.setDate(yesterday.getDate() - 1);
        const weekAgo = new Date(today);
        weekAgo.setDate(weekAgo.getDate() - 7);
        history.forEach(item => {
            const visitDate = new Date(item.visitedAt);
            if (visitDate >= today) {
                groups.today.push(item);
            } else if (visitDate >= yesterday) {
                groups.yesterday.push(item);
            } else if (visitDate >= weekAgo) {
                groups.thisWeek.push(item);
            } else {
                groups.older.push(item);
            }
        });
        return groups;
    }, [history]);
    return {
        history,
        groupedByDate,
        stats,
        loading,
        loadHistory,
        loadStats,
        trackVisit,
        clearHistory,
        removeVisit,
    };
};