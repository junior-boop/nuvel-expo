import { LikeButton } from "@/components/appreciation";
import Commentaire from "@/components/commentaire";
import { PageLayout_3 } from "@/components/page";
import { Text, View } from "@/components/Themed";
import { w } from "@/constants/Colors";
import { convert } from "@/constants/convert";
import { FluentArrowCircleUp20Filled, FluentSubtractCircle12Regular, IcBaselineArrowBack, RiDownload2Line, RiSendPlaneLine, RiShareForwardLine } from "@/constants/icons";
import { Comments } from "@/Database/db";
import ReaderHtml from "@/editor/readerhtml";
import BottomSheet, { BottomSheetView } from "@gorhom/bottom-sheet";
import { router, useLocalSearchParams } from "expo-router";
import moment from "moment";
import { Suspense, useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Alert, Keyboard, KeyboardAvoidingView, Platform, Pressable, StyleSheet, TextInput, TouchableOpacity } from "react-native";
import { GestureHandlerRootView, ScrollView } from "react-native-gesture-handler";
import EventSource from 'react-native-sse';

export default function ReaderPage() {
    const { article } = useLocalSearchParams()
    const [articles, setArticles] = useState({})
    const [commentOpen, setCommentOpen] = useState(false)
    const [comments, setComments] = useState<Comments[]>([])
    const [request, setRequest] = useState<{ articlesId: string, comments: Comments[], count: number } | null>(null)
    const note = JSON.parse(article as string)
    const [commentValue, setCommentValue] = useState<String | null>(null)
    const sheetRef = useRef<BottomSheet>(null);
    const snapPoints = useMemo(() => ["100%"], []);

    const fetchArticles = useCallback(async () => {
        console.log(note)
        const response = await fetch(`https://nuvelserver.godigital.workers.dev/articles/${note.id}`)
        const data = await response.json()
        setArticles(data)
    }, [])

    let eventSource: EventSource | null = null

    function log(message: string, type = 'info') {
        message = `[${new Date().toLocaleTimeString()}] ${message}`;
        console.log(message)
    }

    function updateStatus(connected: boolean) {
        if (connected) {
            log('🟢 Connecté', 'success');
        } else {
            log('🔴 Déconnecté', 'error');
        }
    }

    function connectSSE() {
        const articleId = note.id

        if (!articleId) {
            Alert.alert('Veuillez entrer un ID d\'article');
            return;
        }

        if (eventSource) {
            eventSource.close();
        }

        const url = `https://nuvelserver.godigital.workers.dev/comments/${articleId}/stream`;
        log(`Connexion à ${url}...`, 'info');

        eventSource = new EventSource(url);

        eventSource.addEventListener('connected', (event) => {
            const data = JSON.parse(event.data);
            log(`✅ ${data.message}`, 'success');
            updateStatus(true);
        });

        eventSource.addEventListener('update', (event) => {
            const data = JSON.parse(event.data);
            log(`📩 Nouveaux commentaires reçus: ${data.count}`, 'success');

            data.comments.forEach((comment: Comments) => {
                addComment(comment);
            });
        });

        eventSource.addEventListener('ping', (event) => {
            // Keep-alive
        });

        eventSource.onerror = (error) => {
            log('❌ Erreur de connexion SSE', 'error');
            updateStatus(false);
        };
    }

    function addComment(comment: Comments) {

        log('comment added', 'success');
        setComments((prevComments) => [...prevComments, comment]);

    }

    async function loadComments() {
        // const articleId = document.getElementById('articleId').value;
        const articleId = note.id

        if (!articleId) {
            Alert.alert('Veuillez entrer un ID d\'article');
            return;
        }

        try {
            log(`📥 Chargement des commentaires...`, 'info');
            const response = await fetch(`https://nuvelserver.godigital.workers.dev/comments/${articleId}`);
            const data = await response.json();
            setRequest(data)
            setComments(data.comments)

            log(`✅ ${data.count} commentaire(s) chargé(s)`, 'success');
        } catch (error) {
            log(`❌ Erreur: ${error.message}`, 'error');
        }
    }

    async function postComment() {
        const articleId = note.id;
        const creator = `${note.user.name} ${note.user.first_name}`;
        const content = commentValue;

        if (!articleId || !creator || !content) {
            Alert.alert('Veuillez remplir tous les champs');
            return;
        }

        try {
            log(`📤 Envoi du commentaire...`, 'info');

            const response = await fetch(`https://nuvelserver.godigital.workers.dev/comments/${articleId}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    creator,
                    content
                })
            });

            const data = await response.json();
            setRequest(data)
            console.log("nouveau post", data.comments)

            if (data.success) {
                log(`✅ Commentaire envoyé avec succès`, 'success');
                setCommentValue('')
            } else {
                log(`❌ Erreur: ${data.error}`, 'error');
            }
        } catch (error) {
            log(`❌ Erreur: ${error.message}`, 'error');
        }
    }

    useEffect(() => {
        if (eventSource) {
            eventSource.close();
        }
        connectSSE()
        fetchArticles()
    }, [])


    useEffect(() => {
        if (commentOpen) loadComments()
    }, [commentOpen])

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
                <Suspense fallback={<View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}><Text>loading...</Text></View>}>
                    {articles.body && <ReaderHtml note={articles} />}
                </Suspense>
                <View style={{ height: 52, width: w, backgroundColor: 'white', elevation: convert(12), justifyContent: 'center' }}>
                    <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-around', paddingHorizontal: convert(16) }}>
                        <LikeButton articleId={note.id} userId={note.user.id} apiBase="https://nuvelserver.godigital.workers.dev" />
                        <Commentaire />
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
                    commentOpen && (<BottomSheet
                        ref={sheetRef}
                        snapPoints={snapPoints}
                        enableDynamicSizing={false}
                        enablePanDownToClose={true}
                        enableContentPanningGesture={true}
                        // footerComponent={renderFooter}
                        onClose={() => { setCommentOpen(false); Keyboard.dismiss() }}
                        containerStyle={{ backgroundColor: '#0003' }}

                    >
                        <KeyboardAvoidingView
                            behavior={Platform.OS === "ios" ? "padding" : "height"}
                            style={{ flex: 1 }}
                        >
                            <BottomSheetView style={{ flex: 1, height: '100%' }}>
                                <View style={{ height: convert(42), backgroundColor: 'white', flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: convert(16) }}>
                                    <Text style={{ fontSize: convert(18), fontWeight: 'bold' }}>{request?.count > 9 ? request?.count : `0${request?.count}`} Comments</Text>
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
                                            onPress={postComment}
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
            </GestureHandlerRootView>
        </PageLayout_3>
    )
}

const styles = StyleSheet.create({
    btn_appreciation: { flexDirection: 'row', alignItems: 'center', gap: convert(8), flex: 1, justifyContent: 'center', paddingVertical: convert(4) }
})