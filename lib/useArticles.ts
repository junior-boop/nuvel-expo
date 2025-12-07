// hooks/useArticle.ts
import { useCallback, useEffect, useState } from 'react';
interface User {
  id: string;
  name: string;
  email: string;
  first_name: string;
  church_status: string;
  photo: string;
}
interface Article {
  id: string;
  userid: string;
  title: string;
  description: string;
  body: string;
  imageurl: string;
  noteid: string;
  topic: string;
  appreciation: string;
  createdAt: string;
  updatedAt: string;
  user?: User;
}
interface UseArticleResult {
  article: Article | null;
  loading: boolean;
  error: string | null;
  refresh: () => Promise<void>;
}
export const useArticle = (
  articleId: string,
  apiBase: string = 'https://nuvelserver.godigital.workers.dev'
): UseArticleResult => {
  const [article, setArticle] = useState<Article | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const fetchArticle = useCallback(async () => {
    if (!articleId) {
      setError('Article ID manquant');
      setLoading(false);
      return;
    }
    try {
      setLoading(true);
      setError(null);
      const response = await fetch(`${apiBase}/articles/${articleId}`);
      
      if (!response.ok) {
        throw new Error(`Erreur HTTP: ${response.status}`);
      }
      const data = await response.json();
      setArticle(data);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Erreur inconnue';
      setError(message);
      console.error('[useArticle] Erreur:', message);
    } finally {
      setLoading(false);
    }
  }, [articleId, apiBase]);
  // Charger l'article au montage
  useEffect(() => {
    fetchArticle();
  }, [fetchArticle]);
  return {
    article,
    loading,
    error,
    refresh: fetchArticle,
  };
};