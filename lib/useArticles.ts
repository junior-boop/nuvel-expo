// hooks/useArticle.ts
import * as Session from '@/Database/session';
import { getAccessToken } from '@/lib/token_system';
import { useCallback, useEffect, useRef, useState, } from 'react';
import { checkArticleStats, createdArticleStats, deleteArticleStats, setViewCount } from './instantdb.articles';
import { createdHistoryItem } from './instantdb.histories';

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

  // Protection contre les doubles appels (React Strict Mode)
  const hasTrackedHistory = useRef(false);

  const fetchArticle = useCallback(async () => {
    if (!articleId) {
      setError('Article ID manquant');
      setLoading(false);
      return;
    }
    try {
      setLoading(true);
      setError(null);


      const check = await checkArticleStats(articleId)
      console.log("[useArticle] Check:", check);



      if (check?.data.articlesStats.length === 0) {
        await createdArticleStats(articleId)
      }

      if (check?.data.articlesStats.length > 1) {
        console.log("[useArticle] Delete Article Stats", check?.data.articlesStats[0].id)
        await deleteArticleStats(check?.data.articlesStats[0].id)
      }

      const token = await getAccessToken();
      console.log("[useArticle] Token:", token ? 'Present' : 'Not found');

      // Construire les headers - n'inclure Authorization que si token existe
      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
      };

      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }

      const response = await fetch(`${apiBase}/articles/${articleId}`, {
        headers,
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.log("[useArticle] Error Response:", errorText);
        throw new Error(`Erreur HTTP: ${response.status}`);
      }

      const data = await response.json();

      // Le serveur renvoie maintenant { success: true, article: {...}, historyTracked: boolean }
      if (data.success && data.article) {
        setArticle(data.article);
        setArticleStats(data.article);
      } else {
        // Fallback pour l'ancien format
        setArticle(data);
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Erreur inconnue';
      setError(message);
      console.error('[useArticle] Erreur:', message);
    } finally {
      setLoading(false);
    }
  }, []);
  // Charger l'article au montage

  const setArticleStats = useCallback(async (article: Article) => {
    const session = await Session.get()
    // Protection contre les doubles appels (React Strict Mode en dev)
    if (hasTrackedHistory.current) {
      console.log("[useArticle] Histoire déjà trackée, skip");
      return;
    }

    const check = await checkArticleStats(articleId)

    if (check?.data.articlesStats.length === 1) {
      console.log("[useArticle] Article Stats", check?.data.articlesStats[0].id)
      await setViewCount(check?.data.articlesStats[0].id, check?.data.articlesStats[0].viewCount)
      await createdHistoryItem(articleId, session?.iduser as string, { title: article?.title as string, image: article?.imageurl as string, createdAt: new Date(article?.createdAt as string) })

      // Marquer comme déjà tracké
      hasTrackedHistory.current = true;
    }
  }, []);


  useEffect(() => {
    fetchArticle()
  }, []);


  return {
    article,
    loading,
    error,
    refresh: fetchArticle,
  };
};