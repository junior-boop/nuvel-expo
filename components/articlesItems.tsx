import { w } from "@/constants/Colors";
import { convert } from "@/constants/convert";
import { ArticleStat } from "@/lib/useArticlesAll";
import { router } from "expo-router";
import moment from "moment";
import { Image, Pressable } from "react-native";
import { Text, View } from "./Themed";

export default function ArticlesItems({ article }: { article: ArticleStat }) {
    const handleOpen = async () => {
        router.navigate({
            pathname: '/reader',
            params: {
                element: JSON.stringify(article)
            }
        })
    }
    return (
        <Pressable
            onPress={handleOpen}
            style={{ flexDirection: 'row', justifyContent: 'space-between', paddingHorizontal: convert(16), alignItems: 'flex-start' }}>
            <View style={{ gap: convert(8) }}>
                <Text style={{ width: w * 0.66, fontSize: convert(20), fontWeight: "bold" }}>{article.article?.title}</Text>
                <Text style={{ width: w * 0.66, fontSize: convert(16), color: "#444" }}>{article.article?.description.substring(0, 100)}...</Text>
                <View style={{ flexDirection: 'row', gap: convert(8), alignItems: 'center' }}>
                    <View style={{ width: convert(24), height: convert(24), borderRadius: convert(12), overflow: 'hidden', borderColor: "#e2e2e2ff", borderWidth: 1, backgroundColor: "#c7c7c7ff" }}>
                        <Image source={{ uri: `https://${article.article?.user?.photo}` }} style={{ width: convert(24), height: convert(24) }} />
                    </View>
                    <Text style={{ fontSize: convert(13), color: "#444", fontWeight: "bold", textTransform: "uppercase", marginBottom: convert(-3) }}>{article.viewCount} reads</Text>
                    <Text style={{ fontSize: convert(16), color: "#444" }}>• {moment(article.article?.createdAt).fromNow()}</Text>
                </View>
            </View>
            <View style={{ borderWidth: 1, borderColor: "#e2e2e2ff", borderRadius: convert(4), overflow: 'hidden', marginTop: convert(8) }}>
                <Image source={{ uri: `https://${article.article?.imageurl}` }} style={{ width: 80, height: 80 }} />
            </View>

        </Pressable>
    )
}