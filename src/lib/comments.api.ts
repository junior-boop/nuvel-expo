// D1 REST client for comments (replaces instantdb.comment.ts)
import { server_url } from '@/constants/server_url';
import { User } from '@/Database/db';
import { notifyServerOfCommentReply } from './notifications';

export interface CommentCreator {
    id: string;
    name: string;
    first_name: string;
    photo: string | null;
}

export interface CommentRow {
    id: string;
    articleId: string;
    creator: CommentCreator;
    content: string;
    notes: number;
    upvotes: string;
    signals: string;
    created: string;
    modified: string;
}

export const getComments = async (
    articleId: string,
    apiBase: string = server_url
): Promise<{ comments: CommentRow[]; count: number }> => {
    const response = await fetch(`${apiBase}/comments/${articleId}`);
    if (!response.ok) throw new Error(`HTTP error: ${response.status}`);
    return response.json();
};

export const postComment = async (
    articleId: string,
    creator: User,
    content: string,
    articleTitle?: string,
    apiBase: string = server_url
) => {
    const response = await fetch(`${apiBase}/comments/${articleId}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ creator: creator.id, content }),
    });
    if (!response.ok) throw new Error(`HTTP error: ${response.status}`);
    const data = await response.json();

    if (data.success && data.comment?.id) {
        notifyServerOfCommentReply({ articleId, commentId: data.comment.id, articleTitle, content });
    }

    return data;
};

export const deleteComment = async (
    articleId: string,
    commentId: string,
    apiBase: string = server_url
) => {
    const response = await fetch(`${apiBase}/comments/${articleId}/${commentId}`, {
        method: 'DELETE',
    });
    if (!response.ok) throw new Error(`HTTP error: ${response.status}`);
    return response.json();
};
