import { useCallback, useEffect, useRef, useState } from 'react';
import { Alert } from 'react-native';
interface Comment {
  id: string;
  articleId: string;
  creator: string;
  content: string;
  notes: number;
  created: string;
  modified: string;
}
interface UseCommentsWebSocketResult {
  comments: Comment[];
  count: number;
  loading: boolean;
  error: string | null;
  postComment: (content: string, creator: string) => Promise<boolean>;
  loadComments: () => Promise<void>;
  connected: boolean;
}
export const useCommentsWebSocket = (
  articleId: string,
  apiBase: string = 'https://nuvelserver.godigital.workers.dev'
): UseCommentsWebSocketResult => {
  const [comments, setComments] = useState<Comment[]>([]);
  const [count, setCount] = useState<number>(0);
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
  // Ajouter un commentaire (éviter doublons)
  const addComment = useCallback((comment: Comment) => {
    setComments((prev) => {
      const exists = prev.some(c => c.id === comment.id);
      if (exists) return prev;
      return [comment, ...prev];
    });
  }, []);
  // Charger commentaires initiaux via HTTP
  const loadComments = useCallback(async () => {
    if (!articleId) {
      log('Article ID manquant', 'error');
      return;
    }
    try {
      setLoading(true);
      setError(null);
      
      log('📥 Chargement des commentaires...', 'info');
      
      const response = await fetch(`${apiBase}/comments/${articleId}`);
      
      if (!response.ok) {
        throw new Error(`Erreur HTTP: ${response.status}`);
      }
      
      const data = await response.json();
      
      setComments(data.comments || []);
      setCount(data.count || 0);
      
      log(`✅ ${data.count} commentaire(s) chargé(s)`, 'success');
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Erreur inconnue';
      log(`❌ Erreur: ${message}`, 'error');
      setError(message);
    } finally {
      setLoading(false);
    }
  }, [articleId, apiBase, log]);
  // Poster un commentaire via HTTP
  const postComment = useCallback(async (content: string, creator: string): Promise<boolean> => {
    if (!articleId || !content || !creator) {
      Alert.alert('Erreur', 'Veuillez remplir tous les champs');
      return false;
    }
    try {
      setLoading(true);
      log('📤 Envoi du commentaire...', 'info');
      
      const response = await fetch(`${apiBase}/comments/${articleId}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          creator,
          content,
        }),
      });
      if (!response.ok) {
        throw new Error(`Erreur HTTP: ${response.status}`);
      }
      const data = await response.json();
      
      if (data.success) {
        log('✅ Commentaire envoyé', 'success');
        // Le WebSocket va broadcaster automatiquement
        return true;
      } else {
        throw new Error(data.error || 'Erreur lors de l\'envoi');
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Erreur inconnue';
      log(`❌ Erreur: ${message}`, 'error');
      setError(message);
      Alert.alert('Erreur', message);
      return false;
    } finally {
      setLoading(false);
    }
  }, [articleId, apiBase, log]);
  // Connexion WebSocket
  const connectWebSocket = useCallback(() => {
    if (!articleId) return;
    // Convertir https:// en wss://
    const wsUrl = apiBase.replace(/^https?:\/\//, 'wss://');
    const url = `${wsUrl}/comments/${articleId}/ws`;
    
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
              log(`Connecté à l'article ${data.articleId}`, 'success');
              setCount(data.count || 0);
              break;
              
            case 'comment_added':
              log('📩 Nouveau commentaire reçu', 'success');
              addComment(data.comment);
              setCount(data.count || 0);
              break;
              
            case 'comment_deleted':
              log('🗑️ Commentaire supprimé', 'info');
              setComments(prev => prev.filter(c => c.id !== data.commentId));
              setCount(data.count || 0);
              break;
              
            case 'count_update':
              setCount(data.count || 0);
              break;
          }
        } catch (err) {
          log('Erreur parsing message WebSocket', 'error');
        }
      };
      ws.onerror = (event) => {
        log('❌ Erreur WebSocket', 'error');
        setConnected(false);
        setError('Erreur de connexion WebSocket');
      };
      ws.onclose = () => {
        log('🔌 WebSocket fermé', 'info');
        setConnected(false);
        wsRef.current = null;
        
        // Reconnexion automatique
        if (reconnectAttempts.current < maxReconnectAttempts) {
          reconnectAttempts.current++;
          const delay = Math.min(1000 * Math.pow(2, reconnectAttempts.current), 10000);
          log(`Reconnexion dans ${delay/1000}s (tentative ${reconnectAttempts.current}/${maxReconnectAttempts})`, 'info');
          
          reconnectTimeoutRef.current = setTimeout(() => {
            connectWebSocket();
          }, delay);
        } else {
          log('❌ Nombre maximum de tentatives de reconnexion atteint', 'error');
          setError('Impossible de se connecter au serveur');
        }
      };
    } catch (err) {
      log(`Erreur création WebSocket: ${err}`, 'error');
      setError('Erreur de création WebSocket');
    }
  }, [articleId, apiBase, log, addComment]);
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
    comments,
    count,
    loading,
    error,
    postComment,
    loadComments,
    connected,
  };
};