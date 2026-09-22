import { PageLayout_3 } from '@/components/page';
import { Text, View } from '@/components/Themed';
import { w } from '@/constants/Colors';
import { convert } from '@/constants/convert';
import { IcBaselineArrowBack } from '@/constants/icons';
import { ArticleStat } from '@/lib/useArticlesAll';
import { router, useLocalSearchParams } from 'expo-router';
import moment from 'moment';
import { useEffect } from 'react';
import { ActivityIndicator, StyleSheet, TouchableOpacity } from 'react-native';

// Point d'entrée unique pour toutes les notifications : la page s'adapte au contenu.
// - articleId présent (commentaire, article annoncé, sujet de prière lié à un article) : redirige vers le reader.
// - sinon (simple annonce texte de l'admin) : affiche titre + message.
export default function NotificationPage() {
    const { type, title, body, articleId, createdAt } = useLocalSearchParams<{
        type: string;
        title: string;
        body: string;
        articleId?: string;
        createdAt?: string;
    }>();

    const isAdmin = type !== 'comment_reply';

    useEffect(() => {
        if (!articleId) return;
        const stub: ArticleStat = {
            id: articleId,
            articleId: articleId,
            viewCount: 0,
            likeCount: 0,
            commentCount: 0,
            lastCommentAt: '',
            updatedAt: '',
            shareCount: 0,
            signals: [],
            article: { id: articleId } as ArticleStat['article'],
        };
        router.replace({ pathname: '/reader', params: { element: JSON.stringify(stub) } });
    }, [articleId]);

    if (articleId) {
        return (
            <PageLayout_3>
                <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
                    <ActivityIndicator size="large" color={'black'} />
                </View>
            </PageLayout_3>
        );
    }

    return (
        <PageLayout_3>
            <View style={{ height: convert(52), flexDirection: 'row', alignItems: 'center', paddingHorizontal: convert(16) }}>
                <TouchableOpacity onPress={() => router.back()}>
                    <IcBaselineArrowBack width={24} height={24} color={'black'} />
                </TouchableOpacity>
            </View>
            <View style={{ paddingHorizontal: convert(16), gap: convert(12) }}>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: convert(8), flexWrap: 'wrap' }}>
                    {isAdmin && (
                        <View style={styles.adminTag}>
                            <Text style={styles.adminTagText}>Admin</Text>
                        </View>
                    )}
                    <Text style={{ width: w - convert(32), fontSize: convert(22), fontWeight: 'bold' }}>{title}</Text>
                </View>
                {!!createdAt && (
                    <Text style={{ fontSize: convert(13), color: '#a0a0a0' }}>{moment(createdAt).format('LL')}</Text>
                )}
                <Text style={{ fontSize: convert(16), color: '#3a3a3a', lineHeight: convert(24) }}>{body}</Text>
            </View>
        </PageLayout_3>
    );
}

const styles = StyleSheet.create({
    adminTag: {
        backgroundColor: '#208AEF',
        borderRadius: convert(6),
        paddingHorizontal: convert(8),
        paddingVertical: convert(3),
    },
    adminTagText: {
        color: 'white',
        fontSize: convert(11),
        fontWeight: 'bold',
    },
});
