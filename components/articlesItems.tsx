import { w } from "@/constants/Colors";
import { convert } from "@/constants/convert";
import { Articles } from "@/Database/db";
import { router } from "expo-router";
import moment from "moment";
import { Image, Pressable } from "react-native";
import { Text, View } from "./Themed";

export default function ArticlesItems({ article }: { article: Articles }) {
    const handleOpen = async () => {
        router.navigate({
            pathname: '/reader',
            params: {
                article: JSON.stringify(article)
            }
        })
    }
    return (
        <Pressable
            onPress={handleOpen}
            style={{ flexDirection: 'row', justifyContent: 'space-between', paddingHorizontal: convert(16), alignItems: 'flex-start' }}>
            <View style={{ gap: convert(8) }}>
                <Text style={{ width: w * 0.66, fontSize: convert(20), fontWeight: "bold" }}>{article.title}</Text>
                <Text style={{ width: w * 0.66, fontSize: convert(16), color: "#444" }}>{article.description.substring(0, 100)}...</Text>
                <View style={{ flexDirection: 'row', gap: convert(8), alignItems: 'center' }}>
                    <View style={{ width: convert(24), height: convert(24), borderRadius: convert(12), overflow: 'hidden', borderColor: "#e2e2e2ff", borderWidth: 1, backgroundColor: "#c7c7c7ff" }}>
                        <Image source={{ uri: `https://${article.user.photo}` }} style={{ width: convert(24), height: convert(24) }} />
                    </View>
                    <Text style={{ fontSize: convert(16), color: "#444" }}>{article.user.name} {article.user.first_name}</Text>
                    <Text style={{ fontSize: convert(16), color: "#444" }}>• {moment(article.createdAt).fromNow()}</Text>
                </View>
            </View>
            <View style={{ borderWidth: 1, borderColor: "#e2e2e2ff", borderRadius: convert(0), overflow: 'hidden' }}>
                <Image source={{ uri: `https://${article.imageurl}` }} style={{ width: 80, height: 80 }} />
            </View>

        </Pressable>
    )
}