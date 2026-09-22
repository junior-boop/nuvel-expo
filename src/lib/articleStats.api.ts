// D1 REST client for article-level stats (replaces instantdb.articles.ts)
import { server_url } from '@/constants/server_url';

export const createArticleStats = async (
    articleId: string,
    apiBase: string = server_url
) => {
    const response = await fetch(`${apiBase}/articles/${articleId}/stats`, {
        method: 'POST',
    });
    if (!response.ok) throw new Error(`HTTP error: ${response.status}`);
    return response.json();
};

export const incrementViewCount = async (
    articleId: string,
    apiBase: string = server_url
): Promise<{ viewCount: number }> => {
    const response = await fetch(`${apiBase}/articles/${articleId}/view`, {
        method: 'POST',
    });
    if (!response.ok) throw new Error(`HTTP error: ${response.status}`);
    return response.json();
};

export const incrementShareCount = async (
    articleId: string,
    apiBase: string = server_url
): Promise<{ shareCount: number }> => {
    const response = await fetch(`${apiBase}/articles/${articleId}/share`, {
        method: 'POST',
    });
    if (!response.ok) throw new Error(`HTTP error: ${response.status}`);
    return response.json();
};

export const toggleArticleSignal = async (
    articleId: string,
    userId: string,
    apiBase: string = server_url
): Promise<{ signals: string[] }> => {
    const response = await fetch(`${apiBase}/articles/${articleId}/signal`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId }),
    });
    if (!response.ok) throw new Error(`HTTP error: ${response.status}`);
    return response.json();
};
