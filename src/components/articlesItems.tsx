import { w } from "@/constants/Colors";
import { convert } from "@/constants/convert";
import { createdHistoryItem } from "@/lib/instantdb.histories";
import { ArticleStat } from "@/lib/useArticlesAll";
import { router } from "expo-router";
import moment from "moment";
import { useCallback } from "react";
import { Image, Pressable, TouchableOpacity } from "react-native";
import { Text, View } from "./Themed";

export default function ArticlesItems({ article }: { article: ArticleStat }) {

    const addToHistory = useCallback(async () => {
        const addHistory = await createdHistoryItem(article.articleId, article.article?.userid as string, { title: article.article?.title as string, image: article.article?.imageurl as string, createdAt: (article.article?.createdAt ?? new Date()) as Date });
        if (__DEV__) console.log(addHistory)
    }, [])

    const handleOpen = async () => {
        addToHistory()
        router.navigate({
            pathname: '/reader',
            params: {
                element: JSON.stringify(article)
            }
        })
    }

    const handleOpenAuthor = () => {
        router.navigate({
            pathname: '/author',
            params: {
                userId: article.article?.user?.id as string,
                name: article.article?.user?.name ?? '',
                first_name: article.article?.user?.first_name ?? '',
                photo: article.article?.user?.photo ?? '',
            }
        })
    }
    return (
        <Pressable
            onPress={handleOpen}
            style={{ flexDirection: 'row', justifyContent: 'space-between', paddingHorizontal: convert(16), alignItems: 'flex-start' }}>
            <View style={{ gap: convert(5) }}>
                <Text style={{ width: w * 0.66, fontSize: convert(18), fontWeight: "bold", textTransform: "capitalize" }}>{article.article?.title}</Text>
                <Text style={{ width: w * 0.66, fontSize: convert(16), color: "#797979" }}>{(article.article?.description ?? '').substring(0, 100)}...</Text>
                <TouchableOpacity onPress={handleOpenAuthor} style={{ flexDirection: 'row', gap: convert(8), alignItems: 'center' }}>
                    <View style={{ width: convert(20), height: convert(20), borderRadius: convert(12), overflow: 'hidden', borderColor: "#e2e2e2ff", borderWidth: 1, backgroundColor: "#c7c7c7ff" }}>
                        <Image source={{ uri: `https://${article.article?.user?.photo}` }} style={{ width: convert(20), height: convert(20) }} />
                    </View>
                    <Text style={{ fontSize: convert(12), color: "#444", fontWeight: "bold", textTransform: "uppercase" }}>{article.viewCount} reads</Text>
                    <Text style={{ fontSize: convert(12), color: "#444" }}>•  {moment(article.article?.createdAt).fromNow()}</Text>
                </TouchableOpacity>
            </View>
            <View style={{ borderWidth: 1, borderColor: "#e2e2e2ff", borderRadius: convert(4), overflow: 'hidden', marginTop: convert(8) }}>
                <Image source={{ uri: `https://${article.article?.imageurl}` }} style={{ width: 80, height: 80 }} />
            </View>

        </Pressable>
    )
}