// hooks/useAppreciationsWebSocket.ts
import { useCallback, useEffect, useRef, useState } from 'react';
interface Appreciation {
  id: string;
  articleId: string;
  userid: string;
}
interface UseAppreciationsWebSocketResult {
  count: number;
  liked: boolean;
  appreciations: Appreciation[];
  loading: boolean;
  error: string | null;
  toggleLike: () => Promise<void>;
  connected: boolean;
}
export const useAppreciationsWebSocket = (
  articleId: string,
  userId: string,
  apiBase: string = 'https://nuvelserver.godigital.workers.dev'
): UseAppreciationsWebSocketResult => {
  const [count, setCount] = useState<number>(0);
  const [liked, setLiked] = useState<boolean>(false);
  const [appreciations, setAppreciations] = useState<Appreciation[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [connected, setConnected] = useState<boolean>(false);
  
  const wsRef = useRef<WebSocket | null>(null);
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const reconnectAttempts = useRef<number>(0);
  const maxReconnectAttempts = 5;
  const log = useCallback((message: string, type: 'info' | 'success' | 'error' = 'info') => {
    const timestamp = new Date().toLocaleTimeString();
    console.log(`[${timestamp}] [${type.toUpperCase()}] ${message}`);
  }, []);
  // Vérifier si l'utilisateur a liké
  const checkIfLiked = useCallback((appreciationsList: Appreciation[]) => {
    return appreciationsList.some(a => a.userid === userId);
  }, [userId]);
  // Toggle like via HTTP
  const toggleLike = useCallback(async () => {
    if (!articleId || !userId) return;
    try {
      setLoading(true);
      log('🔄 Toggle like...', 'info');
      
      const response = await fetch(`${apiBase}/appreciations/${articleId}/toggle`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ userid: userId }),
      });
      const data = await response.json();
      
      if (data.success) {
        log(`✅ Like ${data.action}`, 'success');
        // Le WebSocket va broadcaster automatiquement
      } else {
        throw new Error(data.message || 'Erreur toggle like');
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Erreur inconnue';
      log(`❌ Erreur: ${message}`, 'error');
      setError(message);
    } finally {
      setLoading(false);
    }
  }, [articleId, userId, apiBase, log]);
  // Connexion WebSocket
  const connectWebSocket = useCallback(() => {
    if (!articleId) return;
    const wsUrl = apiBase.replace(/^https?:\/\//, 'wss://');
    const url = `${wsUrl}/appreciations/${articleId}/ws`;
    
    log(`🔌 Connexion WebSocket: ${url}`, 'info');
    try {
      const ws = new WebSocket(url);
      wsRef.current = ws;
      ws.onopen = () => {
        log('✅ WebSocket connecté', 'success');
        setConnected(true);
        setError(null);
        reconnectAttempts.current = 0;
      };
      ws.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          
          switch (data.type) {
            case 'connected':
              log(`Connecté - ${data.count} likes`, 'success');
              setCount(data.count || 0);
              setAppreciations(data.appreciations || []);
              setLiked(checkIfLiked(data.appreciations || []));
              break;
              
            case 'like_added':
              log('❤️ Like ajouté', 'success');
              setCount(data.count || 0);
              setAppreciations(data.appreciations || []);
              setLiked(checkIfLiked(data.appreciations || []));
              break;
              
            case 'like_removed':
              log('💔 Like supprimé', 'info');
              setCount(data.count || 0);
              setAppreciations(data.appreciations || []);
              setLiked(checkIfLiked(data.appreciations || []));
              break;
              
            case 'update':
              setCount(data.count || 0);
              setAppreciations(data.appreciations || []);
              setLiked(checkIfLiked(data.appreciations || []));
              break;
          }
        } catch (err) {
          log('Erreur parsing message', 'error');
        }
      };
      ws.onerror = () => {
        log('❌ Erreur WebSocket', 'error');
        setConnected(false);
        setError('Erreur de connexion');
      };
      ws.onclose = () => {
        log('🔌 WebSocket fermé', 'info');
        setConnected(false);
        wsRef.current = null;
        
        // Reconnexion automatique
        if (reconnectAttempts.current < maxReconnectAttempts) {
          reconnectAttempts.current++;
          const delay = Math.min(1000 * Math.pow(2, reconnectAttempts.current), 10000);
          log(`Reconnexion dans ${delay/1000}s`, 'info');
          
          reconnectTimeoutRef.current = setTimeout(() => {
            connectWebSocket();
          }, delay);
        }
      };
    } catch (err) {
      log(`Erreur WebSocket: ${err}`, 'error');
      setError('Erreur WebSocket');
    }
  }, [articleId, apiBase, log, checkIfLiked]);
  // Connexion au montage
  useEffect(() => {
    connectWebSocket();
    return () => {
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
      }
      if (wsRef.current) {
        wsRef.current.close();
        wsRef.current = null;
      }
    };
  }, [connectWebSocket]);
  return {
    count,
    liked,
    appreciations,
    loading,
    error,
    toggleLike,
    connected,
  };
};