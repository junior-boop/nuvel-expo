// components/Commentaire.tsx
import { convert } from "@/constants/convert";
import { RiMessageLine } from "@/constants/icons";
import { User } from "@/Database/db";
import { checkArticleStats, setCommentCount } from "@/lib/instantdb.articles";
import { createdComment, getComments } from "@/lib/instantdb.comment";
import { CommentType } from "@/lib/instantdb.init";
import { ArticleStat } from "@/lib/useArticlesAll";
import { useLocalSearchParams } from "expo-router";
import { useCallback, useEffect, useState } from "react";
import {
    StyleSheet,
    TouchableOpacity
} from "react-native";
import { Text } from "./Themed";



export const useCommentStats = (articleId: string) => {
    const [count, setCount] = useState(0);
    const [loading, setLoading] = useState(false);
    const [connected, setConnected] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const fetchState = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const [statsRes] = await Promise.all([
                checkArticleStats(articleId),
            ]);
            console.log(statsRes?.data.articlesStats[0].commentCount);
            setCount(statsRes?.data.articlesStats[0].commentCount ?? 0); // adapte selon la forme réelle de statsRes
        } catch (err) {
            console.error('[useCommentStats]', err);
            setError('Erreur lors du chargement.');
        } finally {
            setLoading(false);
        }
    }, [articleId]);

    useEffect(() => {
        fetchState();
        const interval = setInterval(fetchState, 15000);
        return () => clearInterval(interval);
    }, [fetchState]);

    return { count, loading, error, connected };
}


export const useCommentHooks = (articleId: string) => {
    const [error, setError] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);
    const [comments, setComments] = useState<CommentType[]>([]);
    const { count } = useCommentStats(articleId);

    const fetchComments = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const [commentsRes] = await Promise.all([
                getComments(articleId),
            ]);
            setComments(commentsRes?.data.comments || []);
        } catch (err) {
            console.error('[useCommentHooks]', err);
            setError('Erreur lors du chargement des commentaires.');
        } finally {
            setLoading(false);
        }
    }, [articleId]);

    const addComment = useCallback(async (creator: User, content: string) => {
        try {
            const [addCommentRes, statsRes, commentsRes] = await Promise.all([
                createdComment(articleId, creator, content),
                checkArticleStats(articleId),
                getComments(articleId),
            ]);
            setComments(commentsRes?.data.comments || []);
            setCommentCount(statsRes?.data.articlesStats[0].id, statsRes?.data.articlesStats[0].commentCount);
            return addCommentRes
        } catch (err) {
            console.error('[useCommentHooks]', err);
            setError('Erreur lors du chargement des commentaires.');
        } finally {
            setLoading(false);
        }
    }, [articleId]);


    const deleteComment = useCallback(async (commentId: string) => {
        try {
            const [deleteCommentRes, commentsRes] = await Promise.all([
                deleteComment(commentId),
                getComments(articleId),
            ]);
            setComments(commentsRes?.data.comments || []);
        } catch (err) {
            console.error('[useCommentHooks]', err);
            setError('Erreur lors du chargement des commentaires.');
        } finally {
            setLoading(false);
        }
    }, [articleId]);


    useEffect(() => {
        fetchComments();
        const interval = setInterval(() => {
            fetchComments();
        }, 10000);

        return () => {
            clearInterval(interval);
        };
    }, []);

    return { count, loading, error, comments, addComment, deleteComment, fetchComments };
}

export default function Commentaire({ onPress }: { onPress: () => void }) {
    const { element } = useLocalSearchParams();
    const articleStats = JSON.parse(element as string) as ArticleStat;

    const { count, loading, error } = useCommentStats(articleStats?.articleId || '');

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