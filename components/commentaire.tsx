// components/Commentaire.tsx
import { convert } from "@/constants/convert";
import { RiMessageLine } from "@/constants/icons";
import { useCommentsWebSocket } from "@/lib/useComments";
import { useLocalSearchParams } from "expo-router";
import { useEffect } from "react";
import {
    StyleSheet,
    TouchableOpacity,
    View
} from "react-native";
import { Text } from "./Themed";

export default function Commentaire({ onPress }: { onPress: () => void }) {
    const { article } = useLocalSearchParams();
    const note = JSON.parse(article as string);

    const {
        count,
        loading,
        loadComments,
        connected,
    } = useCommentsWebSocket(note.id);
    // Charger les commentaires quand le bottom sheet s'ouvre
    useEffect(() => {
        const t1 = setInterval(() => {
            loadComments()
        }, 5000)

        return () => {
            clearInterval(t1)
        }

    }, []);
    return (
        <>
            {/* Bouton pour ouvrir les commentaires */}
            <TouchableOpacity
                onPress={onPress}
                style={styles.btn_appreciation}
            >
                <RiMessageLine width={24} height={24} color={'#777'} />
                <Text style={styles.countText}>
                    {count > 9 ? count : `0${count}`}
                </Text>
                {connected && <View style={styles.connectedDot} />}
            </TouchableOpacity>

        </>
    );
}
const styles = StyleSheet.create({
    btn_appreciation: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: convert(8),
        flex: 1,
        justifyContent: 'center',
        paddingVertical: convert(4),
    },
    countText: {
        fontSize: convert(18),
        fontWeight: 'bold',
    },
    connectedDot: {
        width: 8,
        height: 8,
        borderRadius: 4,
        backgroundColor: '#10b981',
        marginLeft: 4,
    },

});