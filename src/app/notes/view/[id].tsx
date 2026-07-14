import { server_url } from "@/constants/server_url";
import { Notes } from "@/Database/db";
import NoteReaderHtml from "@/editor/notereaderhtml";
import { useLocalSearchParams } from "expo-router";
import { useEffect, useState } from "react";
import { ActivityIndicator, Text, View } from "react-native";

export default function SharedNotePage() {
    const { id } = useLocalSearchParams();
    const [note, setNote] = useState<Notes | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(false);

    useEffect(() => {
        let cancelled = false;

        const load = async () => {
            setLoading(true);
            setError(false);
            try {
                const response = await fetch(`${server_url}/notes/view/${id}`);
                if (!response.ok) throw new Error("not found");
                const data = await response.json();
                if (!cancelled) setNote(data.note as Notes);
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

    if (error || !note) {
        return (
            <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
                <Text>Note introuvable</Text>
            </View>
        );
    }

    return <NoteReaderHtml note={note} />;
}
