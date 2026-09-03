import ArticlesItems from "@/components/articlesItems";
import { PageLayout_3 } from "@/components/page";
import { Text, View } from "@/components/Themed";
import { convert } from "@/constants/convert";
import { useArticlesAll } from "@/lib/useArticlesAll";
import { useLocalSearchParams, useNavigation } from "expo-router";
import { useLayoutEffect, useMemo } from "react";
import { ActivityIndicator, ScrollView } from "react-native";

export default function TopicArticlesPage() {
    const { topic } = useLocalSearchParams<{ topic: string }>()
    const navigation = useNavigation()
    const { articles, loading } = useArticlesAll()

    const topicArticles = useMemo(
        () => articles.filter(a => {
            try {
                const parsed = JSON.parse(a.article?.topic ?? '')
                return Array.isArray(parsed) && parsed.includes(topic)
            } catch {
                return false
            }
        }),
        [articles, topic]
    )

    useLayoutEffect(() => {
        navigation.setOptions({ title: topic ?? 'Topic' })
    }, [navigation, topic])

    return (
        <PageLayout_3>
            <ScrollView contentContainerStyle={{ paddingBottom: convert(100), paddingTop: convert(16) }}>
                <View style={{ paddingHorizontal: convert(16), marginBottom: convert(16) }}>
                    <Text style={{ fontSize: convert(20), fontWeight: 'bold' }}>{topic}</Text>
                    <Text style={{ fontSize: convert(13), color: '#777' }}>{topicArticles.length} publication{topicArticles.length > 1 ? 's' : ''}</Text>
                </View>

                {loading && topicArticles.length === 0 ? (
                    <View style={{ paddingTop: convert(40), alignItems: 'center' }}>
                        <ActivityIndicator size="large" color="black" />
                    </View>
                ) : topicArticles.length === 0 ? (
                    <View style={{ paddingHorizontal: convert(16), paddingTop: convert(20), alignItems: 'center' }}>
                        <Text style={{ fontSize: convert(16), color: '#777' }}>No publications yet.</Text>
                    </View>
                ) : (
                    <View style={{ gap: convert(24) }}>
                        {topicArticles.map(article => (
                            <ArticlesItems key={article.id} article={article} />
                        ))}
                    </View>
                )}
            </ScrollView>
        </PageLayout_3>
    )
}
