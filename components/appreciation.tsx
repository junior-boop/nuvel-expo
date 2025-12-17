// components/LikeButton.tsx
import { convert } from '@/constants/convert';
import { RiOpenArmFill, RiOpenArmLine } from '@/constants/icons';
import { useAppreciationsWebSocket } from '@/lib/useLikes';
import React, { useCallback } from 'react';
import {
    ActivityIndicator,
    StyleSheet,
    Text,
    TouchableOpacity
} from 'react-native';

interface LikeButtonProps {
    articleId: string;
    userId: string;
    apiBase?: string;
}
export const LikeButton: React.FC<LikeButtonProps> = ({
    articleId,
    userId,
    apiBase = 'http://localhost:8787',
}) => {
    const { count, liked, loading, error, toggleLike } = useAppreciationsWebSocket(
        articleId,
        userId,
        apiBase
    );

    const handleToggleLike = useCallback(() => {
        toggleLike();

    }, [toggleLike]);
    return (
        <>
            <TouchableOpacity
                style={styles.btn_appreciation}
                onPress={handleToggleLike}
                disabled={loading}
            >
                {loading ? (
                    <ActivityIndicator size="small" color="#3d3d3dff" />
                ) : (
                    <>
                        <>{liked
                            ? <RiOpenArmFill width={24} height={24} color={'#0065fdff'} /> : <RiOpenArmLine width={24} height={24} color={'#777'} />}</>
                        <Text style={{ fontSize: convert(18), fontWeight: 'bold', color: liked ? '#0065fdff' : '#777' }}>{count > 9 ? count : `0${count}`}</Text>
                    </>
                )}
            </TouchableOpacity>

            {error && <Text style={styles.error}>{error}</Text>}
        </>
    );
};
const styles = StyleSheet.create({
    container: {
        alignItems: 'center',
    },
    btn_appreciation: { flexDirection: 'row', alignItems: 'center', gap: convert(8), flex: 1, justifyContent: 'center', paddingVertical: convert(4) },

});