import { LikeButton } from "@/components/appreciation";
import Commentaire, { useCommentHooks } from "@/components/commentaire";
import CommentaireItem from "@/components/commentaireItem";
import { PageLayout_3 } from "@/components/page";
import { Text, View } from "@/components/Themed";
import { w } from "@/constants/Colors";
import { convert } from "@/constants/convert";
import { FluentSubtractCircle12Regular, IcBaselineArrowBack, RiBookmark3Fill, RiBookmark3Line, RiSendPlaneLine, RiShareForwardLine } from "@/constants/icons";
import { useDatabase } from "@/context/database.context";
import { Articles, Comments } from "@/Database/db";
import ReaderHtml from "@/editor/readerhtml";
import { setShareCount, setSignals } from "@/lib/instantdb.articles";
import { CommentType } from "@/lib/instantdb.init";
import { useArticle } from "@/lib/useArticles";
import { ArticleStat } from "@/lib/useArticlesAll";
import BottomSheet, { BottomSheetView } from "@gorhom/bottom-sheet";
import { router, useLocalSearchParams } from "expo-router";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { ActivityIndicator, Alert, KeyboardAvoidingView, Platform, Share, StyleSheet, TextInput, TouchableOpacity } from "react-native";
import { GestureHandlerRootView, ScrollView } from "react-native-gesture-handler";


export default function ReaderPage() {
    const { element } = useLocalSearchParams()
    const [commentOpen, setCommentOpen] = useState(false)
    const [request, setRequest] = useState<{ articlesId: string, comments: Comments[], count: number } | null>(null)
    const articleStats = JSON.parse(element as string) as ArticleStat
    const [bookmark, setBookmark] = useState(false)

    // const sheetRef = useRef<BottomSheet>(null);
    // const snapPoints = useMemo(() => ["100%"], []);
    const note = articleStats.article
    const { usersQuery, session, addArticle, articlesQuery } = useDatabase()
    const userinfo = usersQuery?.findById(session?.iduser as string)
    const A = useArticle(note?.id as string);
    const creatorName = JSON.stringify(userinfo);

    const handleBookmark = () => {
        if (!session) return;
        addArticle(A.article as Articles)
        setBookmark(true)
    }

    useEffect(() => {
        const bookmark = articlesQuery?.findById(note?.id as string);
        if (bookmark) {
            setBookmark(true)
        } else {
            setBookmark(false)
        }
    }, [articlesQuery])

    const Article = ({ id }: { id: string }) => {
        const { articlesQuery } = useDatabase()
        const a = articlesQuery?.findById(id)
        const articleWhichSaved = a === undefined ? undefined : { ...a, user: JSON.parse(a.user as string) }



        return (
            <>
                {
                    A.loading || note === undefined
                        ? (<View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
                            <ActivityIndicator size={'large'} color={"black"} />
                        </View>)
                        : <ReaderHtml note={articleWhichSaved || A.article} />

                }
            </>
        )
    }

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
                <Article id={note?.id as string} />
                <View style={{ height: 52, width: w, backgroundColor: 'white', elevation: convert(12), justifyContent: 'center' }}>
                    <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-around', paddingHorizontal: convert(16) }}>
                        <LikeButton articleId={note?.id as string} userId={session?.iduser as string} />
                        <Commentaire onPress={() => setCommentOpen(true)} />
                        <ShareButton articleId={articleStats.id as string} Count={articleStats.shareCount as number} />
                        <SignalButton articleId={articleStats.id as string} signalStat={articleStats.signals as string[]} userId={session?.iduser as string} />
                    </View>
                </View>
                {
                    commentOpen && (<SheetComments onClose={() => setCommentOpen(false)} articleId={note?.id as string} creatorName={creatorName} userId={note?.user.id as string} />)
                }
            </GestureHandlerRootView>
        </PageLayout_3>
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
    const [listComments, setListComments] = useState<CommentType[]>([])
    const {
        comments,
        count,
        loading,
        addComment,
        deleteComment,
        fetchComments
    } = useCommentHooks(articleId);

    // Fonction pour envoyer un commentaire
    const handlePostComment = useCallback(async () => {

        if (!commentValue?.trim()) return;
        const success = await addComment(JSON.parse(creatorName), commentValue.trim());
        console.log('je veux voir')
        if (success) {
            setCommentValue("");
            fetchComments();
        }
    }, [commentValue, addComment, creatorName]);

    useEffect(() => {
        setListComments(comments)
    }, [comments]);

    useEffect(() => {
        fetchComments();
    }, []);
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
                    <Text style={{ fontSize: convert(18), fontWeight: 'bold' }}>Comments ( {count} )</Text>
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

const useShareHook = ({ articleId, Count }: { articleId: string, Count: number }) => {
    const [shareCount, setSharCounts] = useState<number>(Count)
    const [loading, setLoading] = useState<boolean>(false)
    const [error, setError] = useState<string | null>(null)

    const shareArticle = useCallback(async () => {
        console.log('shareArticle', articleId, shareCount)
        try {
            setLoading(true)
            await setShareCount(articleId, shareCount)
            setSharCounts(shareCount + 1)
            setLoading(false)
        } catch (error) {
            console.log(error)
            setError(error.message)
            setLoading(false)
        }
    }, [articleId, shareCount])

    return { shareCount, shareArticle, loading, error }
}

const ShareButton = ({ articleId, Count }: { articleId: string, Count: number }) => {
    const { shareCount, shareArticle, loading, error } = useShareHook({ articleId, Count })

    const onShare = useCallback(async () => {
        try {
            const result = await Share.share({
                message: "https://www.nuvel.cc/a/" + articleId
            })

            console.log(result)

            if (result.action === Share.sharedAction) {
                if (result.activityType !== null) {
                    console.log('result activity', result.activityType)
                } else {
                    shareArticle()
                    // share
                }
            } else if (result.action === Share.dismissedAction) {
                Alert.alert('dismissed')
            }

        } catch (error) {
            console.log(error)
            Alert.alert(error.message)
        }
    }, [articleId, shareCount])
    return (
        <TouchableOpacity onPress={onShare} style={styles.btn_appreciation}>
            <RiShareForwardLine width={24} height={24} color={'#777'} />
            <Text style={{ fontSize: convert(18), fontWeight: 'bold' }}>{shareCount}</Text>
        </TouchableOpacity>
    )
}


const SignalButton = ({ articleId, signalStat, userId }: { articleId: string, signalStat: string[], userId: string }) => {
    const [loading, setLoading] = useState<boolean>(false)
    const [error, setError] = useState<string | null>(null)
    const [isSignal, setIsSignal] = useState<boolean>(signalStat.includes(userId))

    const signalArticle = async () => {
        console.log('signalArticle', articleId)
        try {
            setLoading(true)
            if (isSignal) {
                console.log('remove')
                const newSignalStat = signalStat.filter((id) => id !== userId)
                await setSignals(articleId, newSignalStat)
                setIsSignal(false)
            } else {
                console.log('add')
                const newSignalStat = [...signalStat, userId]
                await setSignals(articleId, newSignalStat)
                setIsSignal(true)
            }
            setLoading(false)
        } catch (error) {
            console.log(error)
            setError(error.message)
            setLoading(false)
        }
    }

    useEffect(() => {
        setIsSignal(signalStat.includes(userId))
    }, [signalStat])
    return (
        <TouchableOpacity onPress={signalArticle} style={styles.btn_appreciation}>
            <FluentSubtractCircle12Regular width={24} height={24} color={isSignal ? '#ff2323ff' : '#777'} />
            <Text style={{ fontSize: convert(18), fontWeight: 'bold', color: isSignal ? '#ff2323ff' : '#777' }}>Signal</Text>
        </TouchableOpacity>
    )
}

const styles = StyleSheet.create({
    btn_appreciation: { flexDirection: 'row', alignItems: 'center', gap: convert(8), flex: 1, justifyContent: 'center', paddingVertical: convert(4) }
})