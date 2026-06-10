import { useCallback, useEffect, useState } from 'react';
import { apiRequest } from './token_system';
interface HistoryItem {
  id: string;
  noteid: string; // ID de l'article
  userid: string;
  lastReading: string;
}
const API_BASE = 'https://nuvelserver.godigital.workers.dev';
export const useArticleHistory = (userId: string) => {
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  /**
   * Charger l'historique de l'utilisateur
   */
  const loadHistory = useCallback(async () => {
    if (!userId) return;
    try {
      setLoading(true);
      setError(null);
      const response = await apiRequest(`${API_BASE}/history/${userId}`);
      const data = await response.json();
      if (data.data) {
        setHistory(data.data);
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Erreur chargement';
      setError(message);
      console.error('[History] Erreur:', err);
    } finally {
      setLoading(false);
    }
  }, [userId]);
  /**
   * Ajouter un article à l'historique
   */
  const addToHistory = useCallback(async (articleId: string): Promise<boolean> => {
    if (!userId || !articleId) return false;
    try {
      const response = await apiRequest(`${API_BASE}/history/${userId}/${articleId}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      const data = await response.json();
      // Recharger l'historique
      await loadHistory();
      return true;
    } catch (err) {
      console.error('[History] Erreur ajout:', err);
      return false;
    }
  }, [userId, loadHistory]);
  /**
   * Vérifier si un article est dans l'historique
   */
  const isInHistory = useCallback((articleId: string): boolean => {
    return history.some(item => item.noteid === articleId);
  }, [history]);
  /**
   * Obtenir la dernière lecture d'un article
   */
  const getLastReading = useCallback((articleId: string): string | null => {
    const item = history.find(h => h.noteid === articleId);
    return item?.lastReading || null;
  }, [history]);
  /**
   * Trier par date (récent en premier)
   */
  const sortedHistory = useCallback(() => {
    return [...history].sort((a, b) =>
      new Date(b.lastReading).getTime() - new Date(a.lastReading).getTime()
    );
  }, [history]);
  // Charger automatiquement au montage
  useEffect(() => {
    loadHistory();
  }, [loadHistory]);
  return {
    history: sortedHistory(),
    loading,
    error,
    addToHistory,
    loadHistory,
    isInHistory,
    getLastReading,
  };
};