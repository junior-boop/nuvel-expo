// hooks/useCommentsWebSocket.ts - VERSION COMPLÈTE
import { useCallback, useRef, useState } from 'react';
import { Alert } from 'react-native';
import { createdComment, getComments } from './instantdb.comment';
interface Comment {
  id: string;
  articleId: string;
  creator: string;
  content: string;
  notes: number;
  upvotes: string;  // JSON array
  signals: string;  // JSON array
  created: string;
  modified: string;
}
export const useCommentsWebSocket = (
  articleId: string,
  apiBase: string = 'https://nuvelserver.godigital.workers.dev'
) => {
  const [comments, setComments] = useState<Comment[]>([]);
  const [count, setCount] = useState<number>(0);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [connected, setConnected] = useState<boolean>(false);

  const wsRef = useRef<WebSocket | null>(null);
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const reconnectAttempts = useRef<number>(0);
  const log = useCallback((message: string) => {
    console.log(`[Comments] ${message}`);
  }, []);

  // Ajouter un commentaire (éviter doublons)
  const addComment = useCallback((comment: Comment) => {
    setComments((prev) => {
      const exists = prev.some(c => c.id === comment.id);
      if (exists) return prev;
      return [comment, ...prev];
    });
    loadComments()
  }, []);
  // Mettre à jour un commentaire existant (upvotes/signals)
  const updateComment = useCallback((updatedComment: Comment) => {
    setComments((prev) =>
      prev.map(c => c.id === updatedComment.id ? updatedComment : c)
    );
  }, []);

  // Charger commentaires initiaux
  const loadComments = useCallback(async () => {
    if (!articleId) return;
    try {
      setLoading(true);
      const { data } = await getComments(articleId)
      setComments(data.comments || []);
      setCount(data.comments.length || 0);

      log(`✅ ${data.comments.length} commentaires chargés`);
    } catch (err) {
      setError(err.message);
      log(`❌ Erreur: ${err.message}`);
    } finally {
      setLoading(false);
    }
  }, [articleId, apiBase, log]);

  // Poster un commentaire
  const postComment = useCallback(async (content: string, creator: string): Promise<boolean> => {
    if (!articleId || !content || !creator) return false;
    try {
      setLoading(true);

      const comment = await createdComment(articleId, creator, content)
      // const check = await checkArticleStats(articleId)

      console.log("[useComments] Check:", comment);



      if (comment) {
        log('✅ Commentaire envoyé');
        // Le WebSocket va broadcaster automatiquement
        loadComments()
        return true;
      }
      return false;
    } catch (err) {
      setError(err.message);
      Alert.alert('Erreur', err.message);
      return false;
    } finally {
      setLoading(false);
    }
  }, [articleId, apiBase, log]);

  // Connexion WebSocket
  // const connectWebSocket = useCallback(() => {
  //   if (!articleId) return;
  //   const wsUrl = apiBase.replace(/^https?:\/\//, 'wss://');
  //   const url = `${wsUrl}/comments/${articleId}/ws`;

  //   log(`🔌 Connexion à ${url}`);
  //   try {
  //     const ws = new WebSocket(url);
  //     wsRef.current = ws;
  //     ws.onopen = () => {
  //       log('✅ WebSocket connecté');
  //       setConnected(true);
  //       setError(null);
  //       reconnectAttempts.current = 0;
  //     };
  //     ws.onmessage = (event) => {
  //       try {
  //         const data = JSON.parse(event.data);
  //         log(`📩 Message reçu: ${data.type}`);

  //         switch (data.type) {
  //           case 'connected':
  //             log(`Connecté à l'article ${data.articleId}`);
  //             setCount(data.count || 0);
  //             break;

  //           case 'comment_added':
  //             log('📩 Nouveau commentaire !');
  //             addComment(data.comment);
  //             setCount(data.count || 0);
  //             break;
  //           case 'comment_updated':
  //             log('🔄 Commentaire mis à jour (upvote/signal)');
  //             updateComment(data.comment);
  //             setCount(data.count || 0);
  //             break;

  //           case 'comment_deleted':
  //             log('🗑️ Commentaire supprimé');
  //             setComments(prev => prev.filter(c => c.id !== data.commentId));
  //             setCount(data.count || 0);
  //             break;

  //           case 'count_update':
  //             setCount(data.count || 0);
  //             break;
  //           default:
  //             log(`⚠️ Type inconnu: ${data.type}`);
  //         }
  //       } catch (err) {
  //         log(`❌ Erreur parsing: ${err.message}`);
  //       }
  //     };
  //     ws.onerror = (event) => {
  //       log('❌ Erreur WebSocket');
  //       setConnected(false);
  //     };
  //     ws.onclose = () => {
  //       log('🔌 WebSocket fermé');
  //       setConnected(false);
  //       wsRef.current = null;

  //       // Reconnexion automatique
  //       if (reconnectAttempts.current < 5) {
  //         reconnectAttempts.current++;
  //         const delay = Math.min(1000 * Math.pow(2, reconnectAttempts.current), 10000);
  //         log(`Reconnexion dans ${delay / 1000}s`);

  //         reconnectTimeoutRef.current = setTimeout(() => {
  //           connectWebSocket();
  //         }, delay);
  //       }
  //     };
  //   } catch (err) {
  //     log(`❌ Erreur création WebSocket: ${err}`);
  //     setError('Erreur WebSocket');
  //   }
  // }, [articleId, apiBase, log, addComment, updateComment]);

  // // Connexion au montage
  // useEffect(() => {
  //   connectWebSocket();
  //   return () => {
  //     if (reconnectTimeoutRef.current) {
  //       clearTimeout(reconnectTimeoutRef.current);
  //     }
  //     if (wsRef.current) {
  //       wsRef.current.close();
  //       wsRef.current = null;
  //     }
  //   };
  // }, [connectWebSocket]);
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