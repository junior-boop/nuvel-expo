import { useCallback, useEffect, useState } from 'react';
interface UseCommentInteractionsResult {
  upvotesCount: number;
  signalsCount: number;
  isUpvoted: boolean;
  isSignaled: boolean;
  loading: boolean;
  error: string | null;
  toggleUpvote: () => Promise<void>;
  toggleSignal: () => Promise<void>;
}
export const useCommentInteractions = (
  articleId: string,
  commentId: string,
  userId: string,
  apiBase: string = 'https://nuvelserver.godigital.workers.dev'
): UseCommentInteractionsResult => {
  const [upvotesCount, setUpvotesCount] = useState<number>(0);
  const [signalsCount, setSignalsCount] = useState<number>(0);
  const [isUpvoted, setIsUpvoted] = useState<boolean>(false);
  const [isSignaled, setIsSignaled] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  // Charger les stats initiales
  const loadStats = useCallback(async () => {
    try {
      setLoading(true);
      const response = await fetch(
        `${apiBase}/comments/${articleId}/${commentId}/stats`
      );

      if (!response.ok) {
        throw new Error(`HTTP error: ${response.status}`);
      }
      const data = await response.json();

      setUpvotesCount(data.upvotesCount || 0);
      setSignalsCount(data.signalsCount || 0);
      setIsUpvoted(data.upvotes?.includes(userId) || false);
      setIsSignaled(data.signals?.includes(userId) || false);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur inconnue');
    } finally {
      setLoading(false);
    }
  }, [articleId, commentId, userId, apiBase]);
  // Charger au montage
  useEffect(() => {
    loadStats();
  }, [loadStats]);

  // Toggle upvote
  const toggleUpvote = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await fetch(
        `${apiBase}/comments/${articleId}/${commentId}/upvote`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ userid: userId }),
        }
      );
      if (!response.ok) {
        throw new Error(`HTTP error: ${response.status}`);
      }
      const data = await response.json();

      if (data.success) {
        setUpvotesCount(data.upvotesCount);
        setIsUpvoted(data.action === 'added');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur toggle upvote');
    } finally {
      setLoading(false);
    }
  }, [articleId, commentId, userId, apiBase]);
  // Toggle signal
  const toggleSignal = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await fetch(
        `${apiBase}/comments/${articleId}/${commentId}/signal`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ userid: userId }),
        }
      );
      if (!response.ok) {
        throw new Error(`HTTP error: ${response.status}`);
      }
      const data = await response.json();

      if (data.success) {
        setSignalsCount(data.signalsCount);
        setIsSignaled(data.action === 'added');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur toggle signal');
    } finally {
      setLoading(false);
    }
  }, [articleId, commentId, userId, apiBase]);
  return {
    upvotesCount,
    signalsCount,
    isUpvoted,
    isSignaled,
    loading,
    error,
    toggleUpvote,
    toggleSignal,
  };
};