import { PageLayout_3 } from "@/components/page";
import { Text, View } from "@/components/Themed";
import { w } from "@/constants/Colors";
import { convert } from "@/constants/convert";
import { useDatabase } from "@/context/database.context";
import { deleteHistoryItem, getHistoryForUser, HistoryType } from "@/lib/instantdb.histories";
import { router } from "expo-router";
import moment from "moment";
import { useCallback, useMemo, useState } from "react";
import { Alert, Image, RefreshControl, ScrollView, StyleSheet, TouchableOpacity } from "react-native";

export default function HistoryPage() {
    const { historyQuery, session } = useDatabase()
    const [items, setItems] = useState<HistoryType[]>(historyQuery?.findAll() ?? [])
    const [refreshing, setRefreshing] = useState(false)
    const [query, setQuery] = useState("")

    const reload = useCallback(async () => {
        if (!session?.iduser) return
        const res = await getHistoryForUser(session.iduser)
        setItems((res?.data?.histories ?? []) as HistoryType[])
    }, [session?.iduser])

    const onRefresh = useCallback(async () => {
        setRefreshing(true)
        try { await reload() } finally { setRefreshing(false) }
    }, [reload])

    const filtered = useMemo(() => {
        const q = query.trim().toLowerCase()
        const list = [...items].sort((a, b) =>
            new Date(b.createdAt as any).getTime() - new Date(a.createdAt as any).getTime()
        )
        if (!q) return list
        return list.filter(h => (h.content?.title || '').toLowerCase().includes(q))
    }, [items, query])

    const openItem = useCallback((h: HistoryType) => {
        const stub = {
            articleId: h.articleId,
            viewCount: 0,
            article: {
                id: h.articleId,
                title: h.content?.title ?? '',
                imageurl: h.content?.image ?? '',
                description: '',
                createdAt: h.content?.createdAt ?? h.createdAt,
                user: { photo: '' },
            },
        }
        router.navigate({
            pathname: '/reader',
            params: { element: JSON.stringify(stub) },
        })
    }, [])

    const removeItem = useCallback((h: HistoryType) => {
        Alert.alert("Remove", "Remove this article from your history?", [
            { text: "Cancel", style: "cancel" },
            {
                text: "Remove", style: "destructive", onPress: async () => {
                    setItems(prev => prev.filter(x => x.id !== h.id))
                    try { await deleteHistoryItem(h.id) } catch (e) { console.error('[History] delete error:', e) }
                }
            },
        ])
    }, [])

    return (
        <PageLayout_3>
            <ScrollView
                contentContainerStyle={{ paddingBottom: 100, paddingTop: convert(16) }}
                refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
            >
                <View style={{ paddingHorizontal: convert(16) }}>
                    <Text style={{ ...styles.title, marginBottom: convert(8) }}>History</Text>
                    <Text style={{ fontSize: convert(16), color: "#777", marginBottom: convert(16) }}>
                        Articles you have read recently
                    </Text>
                </View>

                {filtered.length === 0 ? (
                    <View style={{ paddingHorizontal: convert(16), paddingTop: convert(40), alignItems: 'center' }}>
                        <Text style={{ fontSize: convert(16), color: '#777' }}>
                            No reading history yet.
                        </Text>
                    </View>
                ) : (
                    <View style={{ gap: convert(12), paddingHorizontal: convert(16) }}>
                        {filtered.map(h => (
                            <HistoryRow key={h.id} history={h} onPress={() => openItem(h)} onLongPress={() => removeItem(h)} />
                        ))}
                    </View>
                )}
            </ScrollView>
        </PageLayout_3>
    )
}

const HistoryRow = ({ history, onPress, onLongPress }: { history: HistoryType, onPress: () => void, onLongPress: () => void }) => {
    const title = history.content?.title ?? 'Untitled'
    const image = history.content?.image
    return (
        <TouchableOpacity
            onPress={onPress}
            onLongPress={onLongPress}
            delayLongPress={350}
            style={{ flexDirection: 'row', gap: convert(12), alignItems: 'flex-start' }}
        >
            <View style={{ width: convert(80), height: convert(80), borderWidth: 1, borderColor: '#e2e2e2', overflow: 'hidden', backgroundColor: '#f3f3f3' }}>
                {image ? (
                    <Image source={{ uri: `https://${image}` }} style={{ width: convert(80), height: convert(80) }} />
                ) : null}
            </View>
            <View style={{ flex: 1, gap: convert(6) }}>
                <Text style={{ width: w * 0.6, fontSize: convert(16), fontWeight: 'bold' }} numberOfLines={2}>
                    {title}
                </Text>
                <Text style={{ fontSize: convert(13), color: '#777', textTransform: 'uppercase', fontWeight: 'bold' }}>
                    {moment(history.createdAt as any).fromNow()}
                </Text>
            </View>
        </TouchableOpacity>
    )
}

const styles = StyleSheet.create({
    container: { flex: 1 },
    title: { fontSize: 20, fontWeight: 'bold' },
    separator: { marginVertical: 30, height: 1, width: '80%' },
});
