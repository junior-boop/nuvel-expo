import ArticlesItems from "@/components/articlesItems";
import { PageLayout_3 } from "@/components/page";
import { Text, View } from "@/components/Themed";
import { convert } from "@/constants/convert";
import { useArticlesAll } from "@/lib/useArticlesAll";
import { useLocalSearchParams, useNavigation } from "expo-router";
import { useLayoutEffect, useMemo } from "react";
import { ActivityIndicator, Image, ScrollView } from "react-native";

export default function AuthorPage() {
    const { userId, name, first_name, photo } = useLocalSearchParams<{ userId: string, name?: string, first_name?: string, photo?: string }>()
    const navigation = useNavigation()
    const { articles, loading } = useArticlesAll()

    const authorArticles = useMemo(
        () => articles.filter(a => a.article?.user?.id === userId),
        [articles, userId]
    )

    const author = authorArticles[0]?.article?.user ?? {
        id: userId,
        name: name ?? '',
        first_name: first_name ?? '',
        photo: photo ?? '',
        church_status: '',
        email: '',
    }

    useLayoutEffect(() => {
        navigation.setOptions({ title: `${author.name} ${author.first_name}`.trim() || 'Author' })
    }, [navigation, author.name, author.first_name])

    return (
        <PageLayout_3>
            <ScrollView contentContainerStyle={{ paddingBottom: convert(100), paddingTop: convert(16) }}>
                <View style={{ alignItems: 'center', gap: convert(8), paddingHorizontal: convert(16), marginBottom: convert(24) }}>
                    <View style={{ width: convert(88), height: convert(88), borderRadius: convert(44), overflow: 'hidden', backgroundColor: '#e2e2e2ff' }}>
                        {author.photo ? (
                            <Image source={{ uri: `https://${author.photo}` }} style={{ width: convert(88), height: convert(88) }} />
                        ) : null}
                    </View>
                    <Text style={{ fontSize: convert(20), fontWeight: 'bold' }}>{author.name} {author.first_name}</Text>
                    {!!author.church_status && (
                        <Text style={{ fontSize: convert(14), color: '#777' }}>{author.church_status}</Text>
                    )}
                    <Text style={{ fontSize: convert(13), color: '#777' }}>{authorArticles.length} publication{authorArticles.length > 1 ? 's' : ''}</Text>
                </View>

                {loading && authorArticles.length === 0 ? (
                    <View style={{ paddingTop: convert(40), alignItems: 'center' }}>
                        <ActivityIndicator size="large" color="black" />
                    </View>
                ) : authorArticles.length === 0 ? (
                    <View style={{ paddingHorizontal: convert(16), paddingTop: convert(20), alignItems: 'center' }}>
                        <Text style={{ fontSize: convert(16), color: '#777' }}>No publications yet.</Text>
                    </View>
                ) : (
                    <View style={{ gap: convert(24) }}>
                        {authorArticles.map(article => (
                            <ArticlesItems key={article.id} article={article} />
                        ))}
                    </View>
                )}
            </ScrollView>
        </PageLayout_3>
    )
}
