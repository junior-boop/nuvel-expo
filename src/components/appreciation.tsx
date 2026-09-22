// components/LikeButton.tsx
import { convert } from '@/constants/convert';
import { RiOpenArmFill, RiOpenArmLine } from '@/constants/icons';
import { useAppreciationsWebSocket } from '@/lib/useLikes';
import React from 'react';
import { StyleSheet, Text, TouchableOpacity } from 'react-native';

interface LikeButtonProps {
    articleId: string;
    userId: string;
}

export const useAppreciation = (articleId: string, userId: string) => {
    const { liked, loading, error, count, toggleLike } = useAppreciationsWebSocket(articleId, userId);
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