// components/Commentaire.tsx
import { convert } from "@/constants/convert";
import { RiMessageLine } from "@/constants/icons";
import { useCommentsWebSocket } from "@/lib/useComments";
import BottomSheet from "@gorhom/bottom-sheet";
import { useLocalSearchParams } from "expo-router";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
    ActivityIndicator,
    FlatList,
    StyleSheet,
    TextInput,
    TouchableOpacity,
    View,
} from "react-native";
import { Text } from "./Themed";

export default function Commentaire({ onPress }: { onPress: () => void }) {
    const { article } = useLocalSearchParams();
    const note = JSON.parse(article as string);

    const [commentOpen, setCommentOpen] = useState(false);
    const [commentValue, setCommentValue] = useState("");

    const sheetRef = useRef<BottomSheet>(null);
    const snapPoints = useMemo(() => ["100%"], []);
    // Utiliser le hook pour gérer les commentaires
    const {
        comments,
        count,
        loading,
        error,
        postComment,
        loadComments,
        connected,
    } = useCommentsWebSocket(note.id);
    // Récupérer le nom du créateur
    const creatorName = `${note.user?.name || ''} ${note.user?.first_name || ''}`.trim();
    // Charger les commentaires quand le bottom sheet s'ouvre
    useEffect(() => {
        if (commentOpen) {
            loadComments();
        }
    }, [commentOpen, loadComments]);
    // Fonction pour envoyer un commentaire
    const handlePostComment = useCallback(async () => {
        if (!commentValue.trim()) return;

        const success = await postComment(commentValue.trim(), creatorName);

        if (success) {
            setCommentValue("");
        }
    }, [commentValue, postComment, creatorName]);
    // Rendu d'un commentaire
    const renderComment = useCallback(({ item }) => (
        <View style={styles.commentItem}>
            <View style={styles.commentHeader}>
                <Text style={styles.commentCreator}>{item.creator}</Text>
                <Text style={styles.commentDate}>
                    {new Date(item.created).toLocaleDateString()}
                </Text>
            </View>
            <Text style={styles.commentContent}>{item.content}</Text>
        </View>
    ), []);
    return (
        <>
            {/* Bouton pour ouvrir les commentaires */}
            <TouchableOpacity
                onPress={onPress}
                style={styles.btn_appreciation}
            >
                <RiMessageLine width={24} height={24} color={'#777'} />
                {
                    loading
                        ? <ActivityIndicator size="small" color="#000" />
                        : <Text style={styles.countText}>
                            {count > 9 ? count : `0${count}`}
                        </Text>
                }
                {connected && <View style={styles.connectedDot} />}
            </TouchableOpacity>
            {/* Bottom Sheet avec les commentaires */}
            {commentOpen && (
                <BottomSheet
                    ref={sheetRef}
                    snapPoints={snapPoints}
                    enablePanDownToClose
                    onClose={() => setCommentOpen(false)}
                >
                    <View style={styles.sheetContainer}>
                        <Text style={styles.sheetTitle}>
                            Commentaires ({count})
                        </Text>
                        {/* {console.log('je suis dans les commentaires', comments)} */}
                        {/* Affichage des erreurs */}
                        {error && (
                            <View style={styles.errorContainer}>
                                <Text style={styles.errorText}>{error}</Text>
                            </View>
                        )}
                        {/* Liste des commentaires */}
                        {loading && comments.length === 0 ? (
                            <ActivityIndicator size="large" color="#0000ff" />
                        ) : (
                            <FlatList
                                data={comments}
                                renderItem={renderComment}
                                keyExtractor={(item) => item.id}
                                contentContainerStyle={styles.commentsList}
                                ListEmptyComponent={
                                    <Text style={styles.emptyText}>
                                        Aucun commentaire pour le moment
                                    </Text>
                                }
                            />
                        )}
                        {/* Input pour nouveau commentaire */}
                        <View style={styles.inputContainer}>
                            <TextInput
                                style={styles.input}
                                placeholder="Écrire un commentaire..."
                                value={commentValue}
                                onChangeText={setCommentValue}
                                multiline
                            />
                            <TouchableOpacity
                                style={[
                                    styles.sendButton,
                                    (!commentValue.trim() || loading) && styles.sendButtonDisabled
                                ]}
                                onPress={handlePostComment}
                                disabled={!commentValue.trim() || loading}
                            >
                                {loading ? (
                                    <ActivityIndicator size="small" color="#fff" />
                                ) : (
                                    <Text style={styles.sendButtonText}>Envoyer</Text>
                                )}
                            </TouchableOpacity>
                        </View>
                    </View>
                </BottomSheet>
            )}
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
    sheetContainer: {
        flex: 1,
        padding: convert(16),
    },
    sheetTitle: {
        fontSize: convert(20),
        fontWeight: 'bold',
        marginBottom: convert(16),
    },
    errorContainer: {
        backgroundColor: '#fee',
        padding: convert(12),
        borderRadius: convert(8),
        marginBottom: convert(12),
    },
    errorText: {
        color: '#c00',
        fontSize: convert(14),
    },
    commentsList: {
        paddingBottom: convert(80),
    },
    commentItem: {
        backgroundColor: '#f9f9f9',
        padding: convert(12),
        borderRadius: convert(8),
        marginBottom: convert(12),
    },
    commentHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: convert(8),
    },
    commentCreator: {
        fontSize: convert(14),
        fontWeight: '600',
    },
    commentDate: {
        fontSize: convert(12),
        color: '#666',
    },
    commentContent: {
        fontSize: convert(14),
        lineHeight: convert(20),
    },
    emptyText: {
        textAlign: 'center',
        color: '#999',
        marginTop: convert(32),
        fontSize: convert(16),
    },
    inputContainer: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        flexDirection: 'row',
        padding: convert(16),
        backgroundColor: '#fff',
        borderTopWidth: 1,
        borderTopColor: '#eee',
    },
    input: {
        flex: 1,
        borderWidth: 1,
        borderColor: '#ddd',
        borderRadius: convert(8),
        paddingHorizontal: convert(12),
        paddingVertical: convert(8),
        marginRight: convert(8),
        maxHeight: convert(100),
    },
    sendButton: {
        backgroundColor: '#0066cc',
        paddingHorizontal: convert(16),
        paddingVertical: convert(8),
        borderRadius: convert(8),
        justifyContent: 'center',
    },
    sendButtonDisabled: {
        backgroundColor: '#ccc',
    },
    sendButtonText: {
        color: '#fff',
        fontWeight: '600',
    },
});