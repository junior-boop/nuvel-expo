import { server_url } from "@/constants/server_url";
import { Articles } from "@/Database/db";
import ReaderHtml from "@/editor/readerhtml";
import { useLocalSearchParams } from "expo-router";
import { useEffect, useState } from "react";
import { ActivityIndicator, Text, View } from "react-native";

export default function SharedArticlePage() {
    const { id } = useLocalSearchParams();
    const [article, setArticle] = useState<Articles | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(false);

    useEffect(() => {
        let cancelled = false;

        const load = async () => {
            setLoading(true);
            setError(false);
            try {
                const response = await fetch(`${server_url}/articles/${id}`);
                if (!response.ok) throw new Error("not found");
                const data = await response.json();
                if (!cancelled) setArticle(data.article as Articles);
            } catch {
                if (!cancelled) setError(true);
            } finally {
                if (!cancelled) setLoading(false);
            }
        };

        if (id) load();
        return () => { cancelled = true; };
    }, [id]);

    if (loading) {
        return (
            <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
                <ActivityIndicator size={'large'} color={"black"} />
            </View>
        );
    }

    if (error || !article) {
        return (
            <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
                <Text>Article introuvable</Text>
            </View>
        );
    }

    return <ReaderHtml note={article} />;
}
