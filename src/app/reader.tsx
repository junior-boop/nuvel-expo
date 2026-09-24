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
import { incrementShareCount, toggleArticleSignal } from "@/lib/articleStats.api";
import { CommentRow } from "@/lib/comments.api";
import { useArticle } from "@/lib/useArticles";
import { ArticleStat } from "@/lib/useArticlesAll";
import { useBottomSheetBackHandler } from "@/lib/useBottomSheetBackHandler";
import { server_url } from "@/constants/server_url";
import BottomSheet, { BottomSheetTextInput, BottomSheetView } from "@gorhom/bottom-sheet";
import { router, useLocalSearchParams } from "expo-router";
import * as WebBrowser from "expo-web-browser";
import { memo, useCallback, useEffect, useMemo, useRef, useState } from "react";
import { ActivityIndicator, Alert, Share, StyleSheet, TouchableOpacity } from "react-native";
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
    const {
        count: commentCount,
        comments,
        loading: commentsLoading,
        addComment,
        deleteComment,
        fetchComments
    } = useCommentHooks(note?.id as string);

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
                <ArticleView id={note?.id as string} articleLoading={A.loading} article={A.article} />
                <View style={{ height: 52, width: w, backgroundColor: 'white', elevation: convert(12), justifyContent: 'center' }}>
                    <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-around', paddingHorizontal: convert(16) }}>
                        <LikeButton articleId={note?.id as string} userId={session?.iduser as string} />
                        <Commentaire onPress={() => setCommentOpen(true)} count={commentCount} />
                        <ShareButton articleId={articleStats.articleId as string} Count={articleStats.shareCount as number} />
                        <SignalButton articleId={articleStats.articleId as string} signalStat={articleStats.signals as string[]} userId={session?.iduser as string} />
                    </View>
                </View>
                {
                    commentOpen && (
                        <SheetComments
                            onClose={() => setCommentOpen(false)}
                            articleId={note?.id as string}
                            creatorName={creatorName}
                            userId={note?.user?.id as string}
                            count={commentCount}
                            comments={comments}
                            loading={commentsLoading}
                            addComment={addComment}
                            fetchComments={fetchComments}
                        />
                    )
                }
            </GestureHandlerRootView>
        </PageLayout_3>
    )
}




type ArticleData = ReturnType<typeof useArticle>['article'];

// Composant stable et mémoïsé : ne se remonte/re-rend plus lorsque le parent
// (ReaderPage) re-rend pour des raisons sans rapport (ouverture des commentaires,
// polling du compteur de commentaires, etc.). Ne re-rend que si id/article changent.
const ArticleView = memo(({ id, articleLoading, article }: { id: string, articleLoading: boolean, article: ArticleData }) => {
    const { articlesQuery } = useDatabase()
    const a = articlesQuery?.findById(id)
    const articleWhichSaved = a === undefined ? undefined : { ...a, user: JSON.parse(a.user as string) }

    const onLinkPress = useCallback((url: string) => {
        WebBrowser.openBrowserAsync(url);
    }, []);

    const onAuthorPress = useCallback(() => {
        const authorUser = (articleWhichSaved || article)?.user
        router.navigate({
            pathname: '/author',
            params: {
                userId: authorUser?.id as string,
                name: authorUser?.name ?? '',
                first_name: authorUser?.first_name ?? '',
                photo: authorUser?.photo ?? '',
            }
        })
    }, [articleWhichSaved, article])

    const onTopicPress = useCallback((topic: string) => {
        router.navigate({
            pathname: '/topicarticles',
            params: { topic }
        })
    }, [])

    if (articleLoading || id === undefined) {
        return (
            <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
                <ActivityIndicator size={'large'} color={"black"} />
            </View>
        )
    }

    return (
        <ReaderHtml
            note={articleWhichSaved || article}
            onAuthorPress={onAuthorPress}
            onTopicPress={onTopicPress}
            onLinkPress={onLinkPress}
        />
    )
})

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

const SheetComments = ({
    onClose,
    articleId,
    creatorName,
    userId,
    count,
    comments,
    loading,
    addComment,
    fetchComments
}: {
    onClose: () => void,
    articleId: string,
    creatorName: string,
    userId: string,
    count: number,
    comments: CommentRow[],
    loading: boolean,
    addComment: (creator: any, content: string) => Promise<boolean>,
    fetchComments: () => Promise<void>
}) => {
    const sheetRef = useRef<BottomSheet>(null);
    const snapPoints = useMemo(() => ["100%"], []);
    const [commentValue, setCommentValue] = useState<String | null>(null)

    useBottomSheetBackHandler(true, onClose);

    // Fonction pour envoyer un commentaire (mise à jour optimiste gérée dans addComment)
    const handlePostComment = useCallback(async () => {
        const value = commentValue?.trim();
        if (!value) return;
        setCommentValue("");
        await addComment(JSON.parse(creatorName), value);
    }, [commentValue, addComment, creatorName]);

    useEffect(() => {
        fetchComments();
    }, []);
    return (<BottomSheet
        ref={sheetRef}
        snapPoints={snapPoints}
        enableDynamicSizing={false}
        enablePanDownToClose={true}
        enableContentPanningGesture={true}
        keyboardBehavior="interactive"
        keyboardBlurBehavior="restore"
        // footerComponent={renderFooter}
        onClose={onClose}
        containerStyle={{ backgroundColor: '#0003' }}

    >
        <BottomSheetView style={{ position: 'relative', flex: 1, height: '100%' }}>
            <View style={{ height: convert(32), backgroundColor: 'white', flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: convert(16) }}>
                <Text style={{ fontSize: convert(16), fontWeight: 'bold', color: '#929292' }}>{count < 9 ? `0${count}` : count} - comments</Text>
            </View>
            <ScrollView style={{ flex: 1, position: 'relative', height: "100%" }}>
                <View style={{ gap: convert(24), paddingVertical: convert(16) }}>
                    {
                        comments.map((comment, index) => (
                            <CommentaireItem articleId={articleId} comment={comment} index={index} userId={userId} key={index} />
                        ))
                    }
                </View>
            </ScrollView>
            <View style={{ position: 'absolute', bottom: 0, left: 16, zIndex: 12, width: w - 32, borderWidth: 1, borderColor: '#cfdfeeff', borderRadius: convert(12), paddingHorizontal: convert(16), minHeight: convert(46), paddingTop: convert(8), paddingBottom: convert(8), height: 'auto', maxHeight: convert(150), flexDirection: 'row', gap: 12, alignItems: "flex-end" }}>
                <BottomSheetTextInput
                    multiline={true}
                    value={commentValue as string}
                    onChangeText={setCommentValue}
                    autoFocus={false}
                    autoCapitalize="sentences"
                    placeholder="Types your request"
                    placeholderTextColor={"#a7a7a7ff"}
                    style={{
                        minHeight: 24,
                        height: 'auto',
                        color: 'black',
                        flex: 1,
                        lineHeight: convert(18),
                        fontSize: convert(18)
                    }}
                />
                <View>
                    <TouchableOpacity
                        onPress={handlePostComment}
                        disabled={!commentValue?.trim()}
                        style={{ width: 32, aspectRatio: 1, borderRadius: 26, alignItems: 'center', justifyContent: "center" }}>
                        <RiSendPlaneLine width={24} height={24} color={"#238dffff"} />
                    </TouchableOpacity>
                </View>
            </View>
        </BottomSheetView>
    </BottomSheet>)
}

const useShareHook = ({ articleId, Count }: { articleId: string, Count: number }) => {
    const [shareCount, setSharCounts] = useState<number>(Count)
    const [loading, setLoading] = useState<boolean>(false)
    const [error, setError] = useState<string | null>(null)

    const shareArticle = useCallback(async () => {
        if (__DEV__) console.log('shareArticle', articleId, shareCount)
        const previousCount = shareCount
        setSharCounts(previousCount + 1)
        try {
            setLoading(true)
            setError(null)
            await incrementShareCount(articleId)
            setLoading(false)
        } catch (error) {
            if (__DEV__) console.log(error)
            setSharCounts(previousCount)
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
                message: `${server_url}/articles/${articleId}`
            })

            if (__DEV__) console.log(result)

            if (result.action === Share.sharedAction) {
                if (result.activityType !== null) {
                    if (__DEV__) console.log('result activity', result.activityType)
                } else {
                    shareArticle()
                    // share
                }
            } else if (result.action === Share.dismissedAction) {
                Alert.alert('dismissed')
            }

        } catch (error) {
            if (__DEV__) console.log(error)
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
        if (__DEV__) console.log('signalArticle', articleId)
        try {
            setLoading(true)
            if (isSignal) {
                if (__DEV__) console.log('remove')
                await toggleArticleSignal(articleId, userId)
                setIsSignal(false)
            } else {
                if (__DEV__) console.log('add')
                await toggleArticleSignal(articleId, userId)
                setIsSignal(true)
            }
            setLoading(false)
        } catch (error) {
            if (__DEV__) console.log(error)
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