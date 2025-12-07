// hooks/useCommentsSSE.ts
import { useCallback, useEffect, useRef, useState } from 'react';
import { Alert } from 'react-native';
import EventSource from 'react-native-sse';
interface Comment {
  id: string;
  articleId: string;
  creator: string;
  content: string;
  notes: number;
  created: string;
  modified: string;
}
interface UseCommentsSSEResult {
  comments: Comment[];
  count: number;
  loading: boolean;
  error: string | null;
  postComment: (content: string, creator: string) => Promise<boolean>;
  loadComments: () => Promise<void>;
  connected: boolean;
}
export const useCommentsSSE = (
  articleId: string,
  apiBase: string = 'https://nuvelserver.godigital.workers.dev'
): UseCommentsSSEResult => {
  const [comments, setComments] = useState<Comment[]>([]);
  const [count, setCount] = useState<number>(0);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [connected, setConnected] = useState<boolean>(false);
  
  const eventSourceRef = useRef<EventSource | null>(null);
  // Fonction pour logger (peut être remplacée par votre logger)
  const log = useCallback((message: string, type: 'info' | 'success' | 'error' = 'info') => {
    const timestamp = new Date().toLocaleTimeString();
    console.log(`[${timestamp}] [${type.toUpperCase()}] ${message}`);
  }, []);
  // Ajouter un commentaire à la liste (éviter les doublons)
  const addComment = useCallback((comment: Comment) => {
    setComments((prev) => {
      // Vérifier si le commentaire existe déjà
      const exists = prev.some(c => c.id === comment.id);
      if (exists) return prev;
      
      // Ajouter le nouveau commentaire au début
      return [comment, ...prev];
    });
    setCount((prev) => prev + 1);
  }, []);
  // Charger tous les commentaires
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
  // Poster un nouveau commentaire
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
        log('✅ Commentaire envoyé avec succès', 'success');
        // Le SSE mettra à jour automatiquement la liste
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
  // Connexion SSE
  useEffect(() => {
    if (!articleId) return;
    const url = `${apiBase}/comments/${articleId}/stream`;
    
    log(`🔌 Connexion SSE à: ${url}`, 'info');
    
    const es = new EventSource(url);
    eventSourceRef.current = es;
    // Événement de connexion
    es.addEventListener('connected', (event) => {
      try {
        const data = JSON.parse(event.data);
        log(`✅ ${data.message}`, 'success');
        setConnected(true);
        setError(null);
      } catch (err) {
        log('Erreur parsing connected event', 'error');
      }
    });
    // Événement de mise à jour (nouveaux commentaires)
    es.addEventListener('update', (event) => {
      try {
        const data = JSON.parse(event.data);
        log(`📩 ${data.count} nouveau(x) commentaire(s)`, 'success');
        
        // Ajouter les nouveaux commentaires
        data.comments.forEach((comment: Comment) => {
          addComment(comment);
        });
      } catch (err) {
        log('Erreur parsing update event', 'error');
      }
    });
    // Événement ping (keep-alive)
    es.addEventListener('ping', () => {
      // Keep-alive, ne rien faire
    });
    // Gestion des erreurs
    es.addEventListener('error', (event) => {
      log('❌ Erreur de connexion SSE', 'error');
      setConnected(false);
      setError('Connexion SSE perdue');
    });
    // Cleanup
    return () => {
      log('🔌 Déconnexion SSE', 'info');
      es.close();
      eventSourceRef.current = null;
      setConnected(false);
    };
  }, [articleId, apiBase, log, addComment]);
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