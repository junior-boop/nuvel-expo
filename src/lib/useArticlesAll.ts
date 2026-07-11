import * as LocalStorage from '@/Database/localstorage';
import { safeFetch } from '@/lib/safeFetch';
import { useCallback, useEffect, useState } from 'react';

export type User = {
  id: string;
  name: string;
  email: string;
  church_status: string;
  first_name: string;
  photo: string;
};

// Article en mode "liste" : sans body ni appreciation (payload allégé).
// Le body complet est récupéré via GET /articles/:id côté reader (useArticle).
export type Article = {
  id: string;
  userid: string;
  title: string;
  description: string;
  topic: string;
  imageurl: string;
  noteid: string;
  version: number;
  createdAt: string;
  updatedAt: string;
  user?: User;
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
  article?: Article;
};

interface UseArticlesAllResult {
  articles: ArticleStat[];
  loading: boolean;
  error: string | null;
  offline: boolean;
  refresh: () => Promise<void>;
}

const CACHE_KEY = 'cache:articles:stats';

export const useArticlesAll = (
  apiBase: string = 'https://nuvelserver.godigital.workers.dev'
): UseArticlesAllResult => {
  const [articles, setArticles] = useState<ArticleStat[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [offline, setOffline] = useState<boolean>(false);

  const fetchArticles = useCallback(async () => {
    setError(null);

    const res = await safeFetch<{ stats: ArticleStat[] }>(`${apiBase}/articles/stats`);

    if (res.offline) {
      setOffline(true);
      setLoading(false);
      return;
    }

    setOffline(false);

    if (!res.ok || !Array.isArray(res.data?.stats)) {
      setError(res.error || `HTTP ${res.status}`);
      setLoading(false);
      return;
    }

    const stats = res.data!.stats;
    setArticles(stats);
    setLoading(false);
    try {
      await LocalStorage.setItem(CACHE_KEY, JSON.stringify(stats));
    } catch {}
    if (__DEV__) console.log(`[useArticlesAll] ✅ ${stats.length} articles loaded`);
  }, [apiBase]);

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const cached = await LocalStorage.getItem(CACHE_KEY);
        if (cached && mounted) {
          const parsed = JSON.parse(cached) as ArticleStat[];
          if (Array.isArray(parsed)) {
            setArticles(parsed);
            setLoading(false);
          }
        }
      } catch {}
      if (mounted) fetchArticles();
    })();
    return () => { mounted = false; };
  }, [fetchArticles]);

  return {
    articles,
    loading,
    error,
    offline,
    refresh: fetchArticles,
  };
};
