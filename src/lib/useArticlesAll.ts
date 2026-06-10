import { useCallback, useEffect, useState } from 'react';

export type User = {
  id: string;
  name: string;
  email: string;
  church_status: string;
  first_name: string;
  photo: string;
};

export type Article = {
  id: string;
  userid: string;
  title: string;
  description: string;
  body: string;
  topic: string;
  imageurl: string;
  noteid: string;
  appreciation: string; // JSON stringifié "[]"
  version: number;
  createdAt: string;
  updatedAt: string;
  user?: User; // lien InstantDB
};

export type ArticleStat = {
  id: string;
  articleId: string;
  viewCount: number;
  likeCount: number;
  commentCount: number;
  lastCommentAt: string;
  updatedAt: string;
  shareCount: number;
  signals: string[];
  article?: Article; // lien InstantDB
};

interface UseArticlesAllResult {
  articles: ArticleStat[];
  loading: boolean;
  error: string | null;
  refresh: () => Promise<void>;
}

/**
 * Hook pour récupérer tous les articles depuis le serveur
 * 
 * @param apiBase - URL de base de l'API (optionnel)
 * @returns Object contenant articles, loading, error et refresh
 * 
 * @example
 * const { articles, loading, error, refresh } = useArticlesAll();
 * 
 * if (loading) return <ActivityIndicator />;
 * if (error) return <Text>{error}</Text>;
 * 
 * return (
 *   <FlatList
 *     data={articles}
 *     renderItem={({ item }) => <ArticleItem article={item} />}
 *     onRefresh={refresh}
 *   />
 * );
 */
export const useArticlesAll = (
  apiBase: string = 'https://nuvelserver.godigital.workers.dev'
): UseArticlesAllResult => {
  const [articles, setArticles] = useState<ArticleStat[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  /**
   * Récupère tous les articles depuis le serveur
   */
  const fetchArticles = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch(`${apiBase}/articles/stats`);

      if (!response.ok) {
        throw new Error(`HTTP Error: ${response.status}`);
      }

      const data = await response.json();
      // S'assurer que data est un tableau
      if (Array.isArray(data.stats)) {
        setArticles(data.stats);
        if (__DEV__) console.log(`[useArticlesAll] ✅ ${data.stats.length} articles loaded`);
      } else {
        throw new Error('Invalid response format: expected array');
      }

    } catch (err) {
      const message = err instanceof Error ? err.message : 'Unknown error';
      setError(message);
      console.error('[useArticlesAll] ❌ Error:', message);
    } finally {
      setLoading(false);
    }
  }, [apiBase]);

  /**
   * Charge les articles au montage du composant
   */
  useEffect(() => {
    fetchArticles();
  }, []);

  return {
    articles,
    loading,
    error,
    refresh: fetchArticles,
  };
};
