// components/Commentaire.tsx
import { convert } from "@/constants/convert";
import { RiMessageLine } from "@/constants/icons";
import { User } from "@/Database/db";
import { CommentRow, deleteComment as deleteCommentApi, getComments, postComment } from "@/lib/comments.api";
import { useCallback, useEffect, useState } from "react";
import {
    StyleSheet,
    TouchableOpacity
} from "react-native";
import { Text } from "./Themed";



export const useCommentHooks = (articleId: string) => {
    const [error, setError] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);
    const [comments, setComments] = useState<CommentRow[]>([]);
    const [count, setCount] = useState(0);

    const fetchComments = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const commentsRes = await getComments(articleId);
            setComments(commentsRes.comments || []);
            setCount(commentsRes.count ?? 0);
        } catch (err) {
            console.error('[useCommentHooks]', err);
            setError('Erreur lors du chargement des commentaires.');
        } finally {
            setLoading(false);
        }
    }, [articleId]);

    const addComment = useCallback(async (creator: User, content: string) => {
        // Mise à jour optimiste : le commentaire apparait instantanément,
        // ensuite on reconcilie avec la réponse du serveur (comme YouTube).
        const tempId = `temp-${Date.now()}`;
        const optimisticComment: CommentRow = {
            id: tempId,
            articleId,
            creator: {
                id: creator.id,
                name: creator.name,
                first_name: creator.first_name,
                photo: creator.photo ?? null,
            },
            content,
            notes: 0,
            upvotes: '[]',
            signals: '[]',
            created: new Date().toISOString(),
            modified: new Date().toISOString(),
        };
        setComments(prev => [optimisticComment, ...prev]);
        setCount(prev => prev + 1);

        try {
            const addCommentRes = await postComment(articleId, creator, content);
            if (addCommentRes?.success) {
                await fetchComments();
                return true;
            }
            setComments(prev => prev.filter(c => c.id !== tempId));
            setCount(prev => Math.max(0, prev - 1));
            return false;
        } catch (err) {
            console.error('[useCommentHooks]', err);
            setComments(prev => prev.filter(c => c.id !== tempId));
            setCount(prev => Math.max(0, prev - 1));
            setError('Erreur lors du chargement des commentaires.');
            return false;
        } finally {
            setLoading(false);
        }
    }, [articleId, fetchComments]);


    const deleteComment = useCallback(async (commentId: string) => {
        const previousComments = comments;
        setComments(prev => prev.filter(c => c.id !== commentId));
        setCount(prev => Math.max(0, prev - 1));

        try {
            await deleteCommentApi(articleId, commentId);
        } catch (err) {
            console.error('[useCommentHooks]', err);
            setError('Erreur lors du chargement des commentaires.');
            setComments(previousComments);
            setCount(previousComments.length);
        } finally {
            setLoading(false);
        }
    }, [articleId, comments]);


    useEffect(() => {
        fetchComments();
        const interval = setInterval(() => {
            fetchComments();
        }, 10000);

        return () => {
            clearInterval(interval);
        };
    }, [fetchComments]);

    return { count, loading, error, comments, addComment, deleteComment, fetchComments };
}

export default function Commentaire({ onPress, count }: { onPress: () => void, count: number }) {
    return (
        <>
            {/* Bouton pour ouvrir les commentaires */}
            <TouchableOpacity
                onPress={onPress}
                style={styles.btn_appreciation}
            >
                <RiMessageLine width={24} height={24} color={'#777'} />
                <Text style={styles.countText}>
                    {count}
                </Text>
                {/* {connected && <View style={styles.connectedDot} />} */}
            </TouchableOpacity>

        </>
    );
}
const styles = StyleSheet.create({
    btn_appreciation: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: convert(8),
        flex: 1,
        justifyContent: 'center',
        paddingVertical: convert(4),
    },
    countText: {
        fontSize: convert(18),
        fontWeight: 'bold',
    },
    connectedDot: {
        width: 8,
        height: 8,
        borderRadius: 4,
        backgroundColor: '#10b981',
        marginLeft: 4,
    },

});