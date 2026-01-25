import { LikeButton } from "@/components/appreciation";
import Commentaire from "@/components/commentaire";
import CommentaireItem from "@/components/commentaireItem";
import { PageLayout_3 } from "@/components/page";
import { Text, View } from "@/components/Themed";
import { w } from "@/constants/Colors";
import { convert } from "@/constants/convert";
import { IcBaselineArrowBack, RiBookmark3Fill, RiBookmark3Line, RiSendPlaneLine, RiShareForwardLine } from "@/constants/icons";
import { useDatabase } from "@/context/database.context";
import { Articles, Comments } from "@/Database/db";
import ReaderHtml from "@/editor/readerhtml";
import { useArticle } from "@/lib/useArticles";
import { useCommentsWebSocket } from "@/lib/useComments";
import BottomSheet, { BottomSheetView } from "@gorhom/bottom-sheet";
import { router, useLocalSearchParams } from "expo-router";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { ActivityIndicator, KeyboardAvoidingView, Platform, StyleSheet, TextInput, TouchableOpacity } from "react-native";
import { GestureHandlerRootView, ScrollView } from "react-native-gesture-handler";

export default function ReaderPage() {
    const { article } = useLocalSearchParams()
    const [commentOpen, setCommentOpen] = useState(false)
    const [request, setRequest] = useState<{ articlesId: string, comments: Comments[], count: number } | null>(null)
    const note = JSON.parse(article as string)
    const [bookmark, setBookmark] = useState(false)

    const sheetRef = useRef<BottomSheet>(null);
    const snapPoints = useMemo(() => ["100%"], []);
    const { usersQuery, session, addArticle, articlesQuery } = useDatabase()
    const userinfo = usersQuery?.findById(session?.iduser as string)

    const creatorName = JSON.stringify(userinfo);
    const articleToSave = useArticle(note.id).article

    const handleBookmark = () => {
        if (!session) return;
        addArticle(articleToSave as Articles)
        setBookmark(true)
    }

    useEffect(() => {
        const bookmark = articlesQuery?.findById(note.id);
        if (bookmark) {
            setBookmark(true)
        } else {
            setBookmark(false)
        }
    }, [articlesQuery])

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
                    <TouchableOpacity onPress={handleBookmark} style={{ flexDirection: 'row', alignItems: 'center', gap: convert(5) }} disabled={bookmark}>
                        {
                            bookmark ? <RiBookmark3Fill width={24} height={24} color={'#c5c5c5ff'} /> : <RiBookmark3Line width={24} height={24} color={'black'} />
                        }
                    </TouchableOpacity>
                </View>
                <Article id={note.id} />
                <View style={{ height: 52, width: w, backgroundColor: 'white', elevation: convert(12), justifyContent: 'center' }}>
                    <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-around', paddingHorizontal: convert(16) }}>
                        <LikeButton articleId={note.id} userId={note.user.id} apiBase="https://nuvelserver.godigital.workers.dev" />
                        <Commentaire onPress={() => setCommentOpen(true)} />
                        <TouchableOpacity style={styles.btn_appreciation}>
                            <RiShareForwardLine width={24} height={24} color={'#777'} />
                            <Text style={{ fontSize: convert(18), fontWeight: 'bold' }}>Share</Text>
                        </TouchableOpacity>
                        {/* <TouchableOpacity style={styles.btn_appreciation}>
                            <RiDownload2Line width={24} height={24} color={'#777'} />
                            <Text style={{ fontSize: convert(18), fontWeight: 'bold' }}>Save</Text>
                        </TouchableOpacity> */}
                    </View>
                </View>
                {
                    commentOpen && (<SheetComments onClose={() => setCommentOpen(false)} articleId={note.id} creatorName={creatorName} userId={note.user.id} />)
                }
            </GestureHandlerRootView>
        </PageLayout_3>
    )
}


const Article = ({ id }: { id: string }) => {
    const { articlesQuery } = useDatabase()
    const a = articlesQuery?.findById(id)
    const articleWhichSaved = a === undefined ? undefined : { ...a, user: JSON.parse(a.user as string) }
    const { article, loading, error, refresh } = useArticle(id);


    return (
        <>
            {
                loading
                    ? (<View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
                        <ActivityIndicator size={'large'} color={"black"} />
                    </View>)
                    : <ReaderHtml note={articleWhichSaved || article} />

            }
        </>
    )
}

export interface CommentsProps {
    id: string;
    articleId: string;
    creator: string;
    content: string;
    notes: number;
    upvotes: string; // JSON array of userids
    signals: string; // JSON array of userids
    created: string;
    modified: string;
}

const SheetComments = ({ onClose, articleId, creatorName, commentCount, userId }: { onClose: () => void, articleId: string, creatorName: string, commentCount?: number, userId: string }) => {
    const sheetRef = useRef<BottomSheet>(null);
    const snapPoints = useMemo(() => ["100%"], []);
    const [commentValue, setCommentValue] = useState<String | null>(null)
    const [listComments, setListComments] = useState<CommentsProps[]>([])
    const {
        comments,
        count,
        loading,
        postComment,
        loadComments,
    } = useCommentsWebSocket(articleId);

    // Fonction pour envoyer un commentaire
    const handlePostComment = useCallback(async () => {

        if (!commentValue?.trim()) return;
        const success = await postComment(commentValue.trim(), creatorName);

        if (success) {
            setCommentValue("");
            loadComments();
        }
    }, [commentValue, postComment, creatorName]);

    useEffect(() => {
        setListComments(comments)
    }, [comments]);

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
                                <CommentaireItem articleId={articleId} comment={comment} index={index} userId={userId} key={index} />
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