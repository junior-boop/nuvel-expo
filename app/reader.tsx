import { LikeButton } from "@/components/appreciation";
import Commentaire from "@/components/commentaire";
import { PageLayout_3 } from "@/components/page";
import { Text, View } from "@/components/Themed";
import { w } from "@/constants/Colors";
import { convert } from "@/constants/convert";
import { FluentArrowCircleUp20Filled, FluentSubtractCircle12Regular, IcBaselineArrowBack, RiDownload2Line, RiSendPlaneLine, RiShareForwardLine } from "@/constants/icons";
import { Comments } from "@/Database/db";
import ReaderHtml from "@/editor/readerhtml";
import { useArticle } from "@/lib/useArticles";
import { useCommentsWebSocket } from "@/lib/useComments";
import BottomSheet, { BottomSheetView } from "@gorhom/bottom-sheet";
import { router, useLocalSearchParams } from "expo-router";
import moment from "moment";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { ActivityIndicator, KeyboardAvoidingView, Platform, Pressable, StyleSheet, TextInput, TouchableOpacity } from "react-native";
import { GestureHandlerRootView, ScrollView } from "react-native-gesture-handler";

export default function ReaderPage() {
    const { article } = useLocalSearchParams()
    const [articles, setArticles] = useState({})
    const [commentOpen, setCommentOpen] = useState(false)
    const [request, setRequest] = useState<{ articlesId: string, comments: Comments[], count: number } | null>(null)
    const note = JSON.parse(article as string)

    const sheetRef = useRef<BottomSheet>(null);
    const snapPoints = useMemo(() => ["100%"], []);

    const creatorName = `${note.user?.name || ''} ${note.user?.first_name || ''}`.trim();

    // () => { setCommentOpen(false); Keyboard.dismiss() }



    return (
        <PageLayout_3>
            <GestureHandlerRootView style={{
                flex: 1,
                backgroundColor: 'white',
                position: 'relative'
            }}>
                <View style={{ height: convert(52), backgroundColor: 'white', flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: convert(16) }}>
                    <TouchableOpacity onPress={() => { router.back() }}>
                        <IcBaselineArrowBack width={24} height={24} color={'black'} />
                    </TouchableOpacity>
                </View>
                <Article id={note.id} />
                <View style={{ height: 52, width: w, backgroundColor: 'white', elevation: convert(12), justifyContent: 'center' }}>
                    <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-around', paddingHorizontal: convert(16) }}>
                        <LikeButton articleId={note.id} userId={note.user.id} apiBase="https://nuvelserver.godigital.workers.dev" />
                        <Commentaire onPress={() => setCommentOpen(true)} />
                        <TouchableOpacity style={styles.btn_appreciation}>
                            <RiShareForwardLine width={24} height={24} color={'#777'} />
                            <Text style={{ fontSize: convert(18), fontWeight: 'bold' }}>12</Text>
                        </TouchableOpacity>
                        <TouchableOpacity style={styles.btn_appreciation}>
                            <RiDownload2Line width={24} height={24} color={'#777'} />
                        </TouchableOpacity>
                    </View>
                </View>
                {
                    commentOpen && (<SheetComments onClose={() => setCommentOpen(false)} id={note.id} creatorName={creatorName} />)
                }
            </GestureHandlerRootView>
        </PageLayout_3>
    )
}


const Article = ({ id }: { id: string }) => {
    const { article, loading, error, refresh } = useArticle(id);
    return (
        <>
            {
                !article?.body
                    ? <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
                        <ActivityIndicator size={'large'} color={"black"} />
                    </View>
                    : <ReaderHtml note={article} />

            }
        </>
    )
}

const SheetComments = ({ onClose, id, creatorName, commentCount }: { onClose: () => void, id: string, creatorName: string, commentCount?: number }) => {
    const sheetRef = useRef<BottomSheet>(null);
    const snapPoints = useMemo(() => ["100%"], []);
    const [commentValue, setCommentValue] = useState<String | null>(null)

    const {
        comments,
        count,
        loading,
        postComment,
        loadComments,
    } = useCommentsWebSocket(id);

    // Fonction pour envoyer un commentaire
    const handlePostComment = useCallback(async () => {

        if (!commentValue?.trim()) return;
        const success = await postComment(commentValue.trim(), creatorName);

        if (success) {
            setCommentValue("");
        }
    }, [commentValue, postComment, creatorName]);

    useEffect(() => {
        loadComments();
    }, [loadComments]);
    return (<BottomSheet
        ref={sheetRef}
        snapPoints={snapPoints}
        enableDynamicSizing={false}
        enablePanDownToClose={true}
        enableContentPanningGesture={true}
        // footerComponent={renderFooter}
        onClose={onClose}
        containerStyle={{ backgroundColor: '#0003' }}

    >
        <KeyboardAvoidingView
            behavior={Platform.OS === "ios" ? "padding" : "height"}
            style={{ flex: 1 }}
        >
            <BottomSheetView style={{ flex: 1, height: '100%' }}>
                <View style={{ height: convert(42), backgroundColor: 'white', flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: convert(16) }}>
                    <Text style={{ fontSize: convert(18), fontWeight: 'bold' }}>{count > 9 ? count : `0${count}`} Comments</Text>
                </View>
                <ScrollView style={{ flex: 1, backgroundColor: 'white' }}>
                    <View style={{ gap: convert(24), paddingVertical: convert(16) }}>
                        {
                            comments.map((comment, index) => (
                                <View style={{ flexDirection: 'row', alignItems: 'flex-start', gap: convert(16), paddingHorizontal: convert(16), }} key={index}>
                                    <View style={{ width: convert(42), height: convert(42), borderRadius: convert(21), overflow: 'hidden', backgroundColor: '#777' }}>
                                        {/* <Image style={{ width: '100%', height: '100%' }} /> */}
                                    </View>
                                    <View>
                                        <View style={{ flexDirection: 'row', alignItems: 'center', gap: convert(5) }}>
                                            <Text style={{ fontSize: convert(16), fontWeight: 'bold', color: '#252525ff' }}>{comment.creator}</Text>
                                            <Text style={{ fontSize: convert(14), fontStyle: "italic", color: '#252525ff' }}>• {moment(comment.created).fromNow()}</Text>
                                        </View>
                                        <Text style={{ fontSize: convert(16), color: '#202020ff', width: w * 0.7 }}>{comment.content}</Text>
                                        <View style={{ marginTop: convert(8), flexDirection: 'row', alignItems: 'center', gap: convert(24) }}>
                                            <Pressable style={{ flexDirection: 'row', alignItems: 'center', gap: convert(5) }}>
                                                <FluentArrowCircleUp20Filled width={24} height={24} color={'#777'} />
                                                <Text style={{ fontSize: convert(16), color: '#777', fontWeight: 'bold' }}>{comment.notes}</Text>
                                            </Pressable>
                                            <Pressable style={{ flexDirection: 'row', alignItems: 'center', gap: convert(5) }}>
                                                <FluentSubtractCircle12Regular width={20} height={20} color={'#777'} />
                                                <Text style={{ fontSize: convert(16), color: '#777', fontWeight: 'bold' }}>Signal</Text>
                                            </Pressable>
                                        </View>
                                    </View>

                                </View>
                            ))
                        }
                    </View>
                </ScrollView>
                <View style={{ bottom: 0, zIndex: 12, width: w, borderTopWidth: 1, borderColor: '#cfdfeeff', paddingHorizontal: convert(16), minHeight: convert(56), paddingTop: convert(8), paddingBottom: convert(12), height: 'auto', maxHeight: convert(150), flexDirection: 'row', gap: 12, alignItems: "flex-end" }}>
                    <TextInput
                        multiline={true}
                        value={commentValue as string}
                        onChangeText={setCommentValue}
                        autoFocus={false}
                        autoCapitalize="sentences"
                        placeholder="Types your request"
                        placeholderTextColor={"#a7a7a7ff"}
                        style={{
                            minHeight: 40,
                            height: 'auto',
                            color: 'black',
                            flex: 1,
                            fontSize: convert(16)
                        }}
                    />
                    <View>
                        <TouchableOpacity
                            onPress={handlePostComment}
                            disabled={!commentValue?.trim()}
                            style={{ width: 40, aspectRatio: 1, borderRadius: 26, alignItems: 'center', justifyContent: "center", backgroundColor: "#238dffff" }}>
                            <RiSendPlaneLine width={24} height={24} color={"white"} style={{ marginBottom: convert(-5), marginLeft: convert(-5) }} />
                        </TouchableOpacity>
                    </View>
                </View>
            </BottomSheetView>
        </KeyboardAvoidingView>
    </BottomSheet>)
}

const styles = StyleSheet.create({
    btn_appreciation: { flexDirection: 'row', alignItems: 'center', gap: convert(8), flex: 1, justifyContent: 'center', paddingVertical: convert(4) }
})