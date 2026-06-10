// components/LikeButton.tsx
import { convert } from '@/constants/convert';
import { RiOpenArmFill, RiOpenArmLine } from '@/constants/icons';
import {
    getAppreciationStateForUser,
    removeAppreciation,
    setAppreciation
} from '@/lib/instantdb.appreciation';
import { checkArticleStats, removeLikeCount, setLikeCount } from '@/lib/instantdb.articles';
import { AppreciationType } from '@/lib/instantdb.init';
import React, { useCallback, useEffect, useState } from 'react';
import { StyleSheet, Text, TouchableOpacity } from 'react-native';

interface LikeButtonProps {
    articleId: string;
    userId: string;
}

export const useAppreciation = (articleId: string, userId: string) => {
    const [liked, setLiked] = useState(false);
    const [appreciationId, setAppreciationId] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [count, setCount] = useState(0);

    // Charge l'état depuis la DB et met à jour liked + count
    const fetchState = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const [appreciationRes, statsRes] = await Promise.all([
                getAppreciationStateForUser(userId, articleId),
                checkArticleStats(articleId),
            ]);

            const appreciations = appreciationRes?.data?.appreciation as AppreciationType[] ?? [];
            const hasLiked = appreciations.length > 0;

            setLiked(hasLiked);
            setAppreciationId(hasLiked ? appreciations[0].id : null);
            setCount(statsRes?.data.articlesStats[0].likeCount ?? 0); // adapte selon la forme réelle de statsRes
        } catch (err) {
            console.error('[useAppreciation]', err);
            setError('Erreur lors du chargement.');
        } finally {
            setLoading(false);
        }
    }, [userId, articleId]);

    const toggleLike = useCallback(async () => {
        if (loading) return;
        setLoading(true);
        setError(null);

        // Optimistic update
        const wasLiked = liked;
        setLiked(!wasLiked);
        setCount(prev => wasLiked ? Math.max(0, prev - 1) : prev + 1);

        try {
            const [appreciationRes, statsRes] = await Promise.all([
                getAppreciationStateForUser(userId, articleId),
                checkArticleStats(articleId),
            ]);
            if (wasLiked && appreciationId) {
                await removeAppreciation(appreciationId);
                setAppreciationId(null);
                removeLikeCount(statsRes?.data.articlesStats[0].id, count);
            } else {
                const res = await setAppreciation(articleId, userId);
                // Stocke le nouvel id si retourné par setAppreciation
                setAppreciationId(res?.id ?? null);
                setLikeCount(statsRes?.data.articlesStats[0].id, count);
            }
        } catch (err) {
            // Rollback si erreur
            console.error('[useAppreciation] toggleLike', err);
            setLiked(wasLiked);
            setCount(prev => wasLiked ? prev + 1 : Math.max(0, prev - 1));
            setError('Erreur lors de la mise à jour.');
        } finally {
            setLoading(false);
        }
    }, [liked, loading, appreciationId, articleId, userId]);

    // Fetch initial + polling toutes les 15s
    useEffect(() => {
        fetchState();
        const interval = setInterval(fetchState, 15000);
        return () => clearInterval(interval);
    }, [fetchState]);

    return { liked, loading, error, count, toggleLike };
};

export const LikeButton: React.FC<LikeButtonProps> = ({ articleId, userId }) => {
    const { liked, loading, error, count, toggleLike } = useAppreciation(articleId, userId);

    return (
        <>
            <TouchableOpacity
                style={styles.btn_appreciation}
                onPress={toggleLike}
                disabled={loading}
            >
                {liked
                    ? <RiOpenArmFill width={24} height={24} color='#0065fdff' />
                    : <RiOpenArmLine width={24} height={24} color='#777' />
                }
                <Text style={[styles.count, liked && styles.count_active]}>
                    {count}
                </Text>
            </TouchableOpacity>

            {error && <Text style={styles.error}>{error}</Text>}
        </>
    );
};

const styles = StyleSheet.create({
    btn_appreciation: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: convert(8),
        flex: 1,
        justifyContent: 'center',
        paddingVertical: convert(4),
    },
    count: {
        fontSize: convert(18),
        fontWeight: 'bold',
        color: '#777',
    },
    count_active: {
        color: '#0065fdff',
    },
    error: {
        color: 'red',
        fontSize: convert(12),
    },
});