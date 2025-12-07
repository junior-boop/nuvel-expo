// hooks/useLikesSSE.ts
import { useEffect, useState, useCallback, useRef } from 'react';
import EventSource from 'react-native-sse';
interface Appreciation {
  id: string;
  articleId: string;
  userid: string;
}
interface UseLikesSSEResult {
  count: number;
  liked: boolean;
  loading: boolean;
  error: string | null;
  toggleLike: () => Promise<void>;
  appreciations: Appreciation[];
}
export const useLikesSSE = (
  articleId: string,
  userId: string,
  apiBase: string = 'http://localhost:8787'
): UseLikesSSEResult => {
  const [count, setCount] = useState<number>(0);
  const [liked, setLiked] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [appreciations, setAppreciations] = useState<Appreciation[]>([]);
  
  const eventSourceRef = useRef<EventSource | null>(null);
  // Vérifier si l'utilisateur a liké
  const checkIfLiked = useCallback((appreciationsList: Appreciation[]) => {
    return appreciationsList.some(a => a.userid === userId);
  }, [userId]);
  // Connexion SSE
  useEffect(() => {
    const url = `${apiBase}/appreciations/${articleId}/stream`;
    
    console.log('[SSE] Connexion à:', url);
    
    const es = new EventSource(url);
    eventSourceRef.current = es;
    // Événement de connexion
    es.addEventListener('connected', (event) => {
      try {
        const data = JSON.parse(event.data);
        console.log('[SSE] Connecté:', data);
        
        setCount(data.count || 0);
        setAppreciations(data.appreciations || []);
        setLiked(checkIfLiked(data.appreciations || []));
        setLoading(false);
        setError(null);
      } catch (err) {
        console.error('[SSE] Erreur parsing connected:', err);
        setError('Erreur de connexion');
      }
    });
    // Événement de mise à jour
    es.addEventListener('update', (event) => {
      try {
        const data = JSON.parse(event.data);
        console.log('[SSE] Mise à jour:', data);
        
        setCount(data.count || 0);
        setAppreciations(data.appreciations || []);
        setLiked(checkIfLiked(data.appreciations || []));
      } catch (err) {
        console.error('[SSE] Erreur parsing update:', err);
      }
    });
    // Événement ping (keep-alive)
    es.addEventListener('ping', () => {
      // Keep-alive, ne rien faire
    });
    // Gestion des erreurs
    es.addEventListener('error', (event) => {
      console.error('[SSE] Erreur:', event);
      setError('Erreur de connexion au stream');
      setLoading(false);
    });
    // Cleanup
    return () => {
      console.log('[SSE] Déconnexion');
      es.close();
      eventSourceRef.current = null;
    };
  }, [articleId, apiBase, checkIfLiked]);
  // Toggle like
  const toggleLike = useCallback(async () => {
    try {
      setLoading(true);
      
      const response = await fetch(`${apiBase}/appreciations/${articleId}/toggle`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ userid: userId }),
      });
      const data = await response.json();
      
      if (data.success) {
        console.log('[Toggle] Action:', data.action);
        // Le SSE mettra à jour automatiquement l'état
      } else {
        setError(data.message || 'Erreur lors du toggle');
      }
    } catch (err) {
      console.error('[Toggle] Erreur:', err);
      setError('Erreur réseau');
    } finally {
      setLoading(false);
    }
  }, [apiBase, articleId, userId]);
  return {
    count,
    liked,
    loading,
    error,
    toggleLike,
    appreciations,
  };
};