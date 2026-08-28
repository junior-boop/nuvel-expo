import { filterBible } from "@/components/bible_component/livre";
import { useDatabase } from '@/context/database.context';
import type { AiHistoryType, BibleMetadata, Notes } from "@/Database/db";
import EditorJS from "@/editor";
import { router, Stack, useLocalSearchParams } from "expo-router";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { ActivityIndicator, Alert, Animated, Keyboard, KeyboardAvoidingView, Linking, Modal, Platform, Pressable, Share, TextInput, TextStyle, TouchableOpacity } from "react-native";

import { PageLayout_3 } from "@/components/page";
import { Text, View } from "@/components/Themed";
import { w } from "@/constants/Colors";
import { convert, H } from "@/constants/convert";
import { FluentArrowUp32Filled, FluentCheckmark28Filled, FluentDelete32Regular, FluentDismiss32Filled, FluentFolderLink32Regular, FluentGlobeArrowForward32Regular, FluentMoreVertical32Filled, FluentShare32Regular, FluentSparkle32Regular, FluentTextProofingToolsAbc16Regular, IcBaselineArrowBack, IcTwotoneWhatsapp } from "@/constants/icons";
import BottomSheet, { BottomSheetView } from "@gorhom/bottom-sheet";
import { GestureHandlerRootView, ScrollView } from 'react-native-gesture-handler';

import { generateUUID as uuidv4 } from "@/Database/uuid";

import htmlToWhatsApp from "@/components/bible_component/livre/convert_whatsapp";
import { QueryForTable } from "@/constants/Queryuilder";
import * as AiStore from '@/Database/ai';
import { askAiAgent, correctText } from "@/lib/aiAgent";
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { useBottomSheetBackHandler } from "@/lib/useBottomSheetBackHandler";
import { server_url } from "@/constants/server_url";
import { apiRequest } from "@/lib/token_system";
import * as Clipboard from 'expo-clipboard';
import moment from "moment";
import Markdown from 'react-native-markdown-display';
import { useSafeAreaInsets } from "react-native-safe-area-context";

// Les messages user avec reply sont stockés en JSON ({ question, reply }) dans la colonne `content`
// pour persister le reply sans migration de schéma. Fallback en texte brut pour les anciennes lignes.
function parseStoredMessage(item: AiHistoryType): AiHistoryType {
    if (item.role !== "user") return item;
    try {
        const parsed = JSON.parse(item.content);
        if (parsed && typeof parsed.question === "string") {
            return { ...item, content: parsed.question, replyContent: parsed.reply };
        }
    } catch {
        // texte brut (ancien format ou question sans reply) -> inchangé
    }
    return item;
}

export default function NoteEditor() {
    const [isKeyboard, setIskeyboard] = useState<{ height: number | string, screenY: number | string, width?: number } | undefined>(undefined)
    const [note_whatsapp, set_note_whatsapp] = useState<string | null>(null)
    const [note_body, set_note_body] = useState<string | null>(null)
    const data = useLocalSearchParams()
    const { notesQuery, updateNote, biblemetadatState, usersQuery, deleteNote, session } = useDatabase()
    const [isOpen, setIsOpen] = useState(false)
    const [aiOpen, setAiOpen] = useState(false)
    const [groupPickerOpen, setGroupPickerOpen] = useState(false)
    const [title, setTitle] = useState<string | null>(null)
    const [inputValue, setInputValue] = useState("");
    const [ai_conversation, setConversation] = useState<AiHistoryType[]>([])
    const [aiLoading, setAiLoading] = useState(false)
    const [replyTo, setReplyTo] = useState<AiHistoryType | null>(null)
    const [note_data, set_note_data] = useState<Notes | null>(null)
    const [spellState, setSpellState] = useState<{ isChecking: boolean; isApplying: boolean; count: number }>({ isChecking: false, isApplying: false, count: 0 })

    // menu de modification texte
    const editorRef = useRef<any | null>(null);
    const [isTest, setIsTest] = useState(false)

    const bible = biblemetadatState?.findAll()
    const sheetRef = useRef<BottomSheet>(null);
    const aisheetRef = useRef<BottomSheet>(null)
    const chatScrollRef = useRef<ScrollView>(null)
    const [chatHeight, setChatHeight] = useState(0)
    const hasScrolledOnOpenRef = useRef(false)
    // variables
    const snapPoints = useMemo(() => ["50%"], []);
    const aisnapPoints = useMemo(() => ['100%'], [])


    const insets = useSafeAreaInsets();


    const history_ai = new QueryForTable<AiHistoryType>()
    const Note = notesQuery?.findById(data.id as string) as Notes
    const userId = data.userid

    const handleUpdate = async (data: Partial<Notes>) => {
        await updateNote({ ...data, userId: userId as string })
        set_note_data(data)
        const ws_vs = htmlToWhatsApp(data.html as string)
        const _ = JSON.parse(data.body as string)
        set_note_whatsapp(ws_vs)
        set_note_body(data.body as string)

        if (_.content[0].type === "heading") {
            setTitle(_.content[0].content[0].text)
        } else setTitle("Aucun titre")
    }

    // listening to keyboadEvent
    Keyboard.addListener('keyboardDidShow', (event) => {
        setIskeyboard(event.endCoordinates)
    })
    Keyboard.addListener('keyboardDidHide', (event) => {
        setIskeyboard(undefined)
    })

    const getconversation = useCallback(async () => {
        const result = await AiStore.get(data.id as string)
        setConversation((result as AiHistoryType[])?.map(parseStoredMessage))
    }, [Note])

    const handleWhatsapp = async () => {
        const url = `whatsapp://send?text=${encodeURIComponent(note_whatsapp as string)}`
        try {
            const supported = await Linking.canOpenURL(url)

            await Linking.openURL(url);
        } catch (error) {
            Alert.alert("Erreur WhatsApp", "WhatsApp n'est installé sur votre appareil")
        }
    }

    const handleBack = async () => {
        await updateNote({ ...note_data, userId: userId as string })
        router.back()
    }

    useEffect(() => {
        getconversation()
    }, [])


    // bottom sheet
    const handleSnapPress = useCallback((index: number) => {
        sheetRef.current?.snapToIndex(index);
        setIsOpen(true)
        if (aiOpen) {
            setAiOpen(false)
        }
    }, []);
    const handleAiSnapPress = useCallback((index: number) => {
        aisheetRef.current?.snapToIndex(index);
        setAiOpen(true)
        if (isOpen) {
            setIsOpen(false)
        }
    }, []);

    useBottomSheetBackHandler(isOpen, () => setIsOpen(false));
    useBottomSheetBackHandler(aiOpen, () => setAiOpen(false));
    useBottomSheetBackHandler(groupPickerOpen, () => setGroupPickerOpen(false));

    useEffect(() => {
        if (!aiOpen) hasScrolledOnOpenRef.current = false;
    }, [aiOpen]);

    const handleTest = useCallback(() => {
        if (editorRef) {
            // Appeler la méthode de l'éditeur
            if (isTest) {
                if (__DEV__) console.log("appel de la methode test");
                editorRef.test();
            }
        }
    }, [editorRef, isTest]);

    const onShare = async () => {
        try {
            const result = await Share.share({
                message: `${server_url}/notes/view/${data.id}`
            })

            if (result.action === Share.sharedAction) {
                if (result.activityType) {
                    if (__DEV__) console.log('result activity', result.activityType)
                } else {
                    // share
                }
            } else if (result.action === Share.dismissedAction) {
                Alert.alert('dismissed')
            }

        } catch (error) {
            if (__DEV__) console.log(error)
            Alert.alert(error.message)
        }
    }

    const agent = useCallback(async (prompt: string) => {
        const context = note_whatsapp ?? (Note?.html ? htmlToWhatsApp(Note.html as string) : "");
        return askAiAgent(context, prompt);
    }, [note_whatsapp, Note]);

    const handleCorrectSelection = useCallback(async (text: string) => {
        try {
            const result = await correctText(text);
            if (!result.success) {
                if (__DEV__) console.log('[Correction] Échec:', result.message ?? result.error ?? result);
                Alert.alert('Correction indisponible', result.message ?? result.error ?? "Impossible d'obtenir une correction. Réessayez plus tard.");
                return null;
            }
            return result.corrected ?? null;
        } catch (error) {
            if (__DEV__) console.log('[Correction] Erreur:', error);
            Alert.alert('Correction indisponible', "Impossible d'obtenir une correction. Réessayez plus tard.");
            return null;
        }
    }, []);

    const fetch_ai_history = useCallback(async () => {
        const ai_history = await AiStore.get(data.id as string)
        history_ai.addMany(ai_history)
        setConversation(history_ai.findAll().map(parseStoredMessage))

    }, [])

    useEffect(() => {
        fetch_ai_history()
    }, [])


    const handleAgent = async () => {
        const question = inputValue.trim();
        if (!question || aiLoading) return;

        Keyboard.dismiss();

        const noteId = data.id as string;
        const quoted = replyTo?.content;

        // Ajouter immédiatement le message de l'utilisateur pour un feedback instantané
        const userMessage: AiHistoryType = { id: uuidv4(), iduser: noteId, role: "user", content: question, replyContent: quoted, created: new Date().toISOString(), modified: new Date().toISOString() };
        setConversation((el) => [...el, userMessage]);
        setInputValue("")
        setReplyTo(null)
        const storedContent = quoted ? JSON.stringify({ question, reply: quoted }) : question;
        AiStore.set({ iduser: noteId, role: "user", content: storedContent });
        requestAnimationFrame(() => chatScrollRef.current?.scrollToEnd({ animated: true }));

        setAiLoading(true);
        try {
            const prompt = quoted ? `En réponse à : "${quoted}"\n\n${question}` : question;
            const response = await agent(prompt);
            const answer = response.success && response.answer
                ? response.answer
                : "Désolé, je n'ai pas pu générer de réponse. Réessayez plus tard.";

            setConversation((el) => [...el, { id: uuidv4(), iduser: noteId, role: "assistant", content: answer, created: new Date().toISOString(), modified: new Date().toISOString() }]);
            AiStore.set({ iduser: noteId, role: "assistant", content: answer });
            requestAnimationFrame(() => chatScrollRef.current?.scrollToEnd({ animated: true }));
        } catch (error) {
            if (__DEV__) console.log('[AI Agent] Erreur:', error);
            setConversation((el) => [...el, { id: uuidv4(), iduser: noteId, role: "assistant", content: "Une erreur est survenue. Réessayez plus tard.", created: new Date().toISOString(), modified: new Date().toISOString() }]);
        } finally {
            setAiLoading(false);
        }
    };

    const handlePublish = async () => {
        const note = notesQuery?.findById(data.id as string)
        if (note) {
            const obj_article = {
                title: JSON.parse(note.body as string).content[0].content[0].text,
                html: note.html as string,
                body: note.body as string,
                creator: note.creator as string,
                version: note.version,
                noteid: note.id
            }

            router.navigate({
                pathname: "/newarticle",
                params: obj_article
            })
        }
    }

    const handleUpdateArticle = () => {
        const note = notesQuery?.findById(data.id as string)
        if (!note || !note.publishId) return
        try {
            const { articleid } = JSON.parse(note.publishId as string) as { articleid: string }
            const obj_article = {
                mode: "edit",
                articleid,
                title: JSON.parse(note.body as string).content[0].content[0].text,
                html: note.html as string,
                body: note.body as string,
                creator: note.creator as string,
                version: note.version,
                noteid: note.id
            }

            router.navigate({
                pathname: "/newarticle",
                params: obj_article
            })
        } catch (error) {
            if (__DEV__) console.log('[Publish] Erreur parsing publishId:', error)
        }
    }

    const handleDeleteArticleAndNote = () => {
        const note = notesQuery?.findById(data.id as string)
        if (!note || !note.publishId) return

        Alert.alert(
            "Delete note and article?",
            "This will permanently delete the note and its published article. This cannot be undone.",
            [
                { text: "Cancel", style: "cancel" },
                {
                    text: "Delete",
                    style: "destructive",
                    onPress: async () => {
                        try {
                            const { articleid } = JSON.parse(note.publishId as string) as { articleid: string }
                            await apiRequest(`${server_url}/articles/${session?.iduser}/doc/${articleid}`, { method: 'DELETE' })
                        } catch (error) {
                            if (__DEV__) console.log('[Publish] Erreur suppression article:', error)
                        }
                        await deleteNote(note.id)
                        setIsOpen(false)
                        router.back()
                    }
                }
            ]
        )
    }

    const handleDeleteNoteOnly = () => {
        const note = notesQuery?.findById(data.id as string)
        if (!note) return

        Alert.alert(
            "Delete this note?",
            "This cannot be undone.",
            [
                { text: "Cancel", style: "cancel" },
                {
                    text: "Delete",
                    style: "destructive",
                    onPress: async () => {
                        await deleteNote(note.id)
                        setIsOpen(false)
                        router.back()
                    }
                }
            ]
        )
    }

    return (

        <GestureHandlerRootView style={{
            flex: 1,
            backgroundColor: 'white',
            position: 'relative',
            paddingTop: insets.top,

        }}>
            <Stack.Screen options={{ animation: "fade_from_bottom", headerShown: false }} />
            <View style={{ height: convert(62), backgroundColor: 'white', flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: convert(16) }}>
                <TouchableOpacity onPress={handleBack}>
                    <IcBaselineArrowBack width={24} height={24} color={'black'} />
                </TouchableOpacity>
                <View style={{ flexDirection: "row", alignItems: 'center', gap: convert(16), marginRight: convert(4) }}>
                    <TouchableOpacity onPress={() => handleAiSnapPress(0)}>
                        <FluentSparkle32Regular width={24} height={24} color={'black'} />
                    </TouchableOpacity>
                    <TouchableOpacity
                        onPress={() => spellState.count > 0 ? editorRef.current?.applyAllCorrections() : editorRef.current?.runSpellCheck()}
                        disabled={spellState.isChecking || spellState.isApplying}
                        style={(spellState.isChecking || spellState.isApplying || spellState.count > 0) ? {
                            width: 26, height: 26, borderRadius: 13,
                            backgroundColor: 'rgba(255, 59, 48, 0.15)',
                            alignItems: 'center', justifyContent: 'center',
                        } : undefined}
                    >
                        {spellState.isChecking || spellState.isApplying ? (
                            <ActivityIndicator size="small" color="#ff3b30" />
                        ) : spellState.count > 0 ? (
                            <Text style={{ color: '#ff3b30', fontWeight: '700', fontSize: 13 }}>{spellState.count}</Text>
                        ) : (
                            <FluentTextProofingToolsAbc16Regular width={24} height={24} color={'black'} />
                        )}
                    </TouchableOpacity>
                    <TouchableOpacity onPress={() => handleSnapPress(0)}>
                        <FluentMoreVertical32Filled width={24} height={24} color={'black'} />
                    </TouchableOpacity>
                </View>
            </View>
            <KeyboardAvoidingView
                behavior={Platform.OS === 'ios' ? 'padding' : "height"}
                style={{
                    flex: 1
                }}
            >
                {
                    Note === undefined
                        ? <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}><View style={{ alignItems: 'center', justifyContent: 'center' }}><ActivityIndicator size={'large'} color={'black'} /><Text>Page Loading...</Text> </View></View>
                        : <EditorJS note={Note} updateNote={(data) => handleUpdate(data)} biblemetadatState={bible as BibleMetadata[]} trie={filterBible} correctText={handleCorrectSelection} onSpellStateChange={setSpellState} ref={editorRef} />
                }
            </KeyboardAvoidingView>

            {
                isOpen && <Pressable onPress={() => setIsOpen(false)} style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0, 0, 0, 0.2)', width: '100%', height: '100%' }}></Pressable>
            }
            {
                aiOpen && <Pressable onPress={() => setAiOpen(false)} style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0, 0, 0, 0.2)', width: '100%', height: '100%' }}></Pressable>
            }
            {
                isOpen && <BottomSheet
                    ref={sheetRef}
                    snapPoints={snapPoints}
                    enableDynamicSizing={false}
                    enablePanDownToClose={true}
                    onClose={() => setIsOpen(false)}

                >
                    <BottomSheetView style={{
                        flex: 1,
                        paddingHorizontal: convert(16),
                    }}>
                        {Note && (() => {
                            let noteTitle = "Untitled";
                            try {
                                const parsed = JSON.parse(Note.body as string);
                                if (parsed?.content?.[0]?.type === "heading" && parsed.content[0].content?.[0]?.text) {
                                    noteTitle = parsed.content[0].content[0].text;
                                }
                            } catch { }
                            return (
                                <View style={{ paddingVertical: convert(12), paddingHorizontal: convert(12), borderBottomWidth: 1, borderColor: '#e2e8f0', gap: convert(2) }}>
                                    <Text style={{ fontSize: convert(14), fontWeight: '600' }} numberOfLines={2}>{noteTitle}</Text>
                                    <Text style={{ fontSize: convert(13), color: '#0009' }}>Created on {moment(Note.created).format('MMM D, YYYY')}</Text>
                                    <Text style={{ fontSize: convert(13), color: '#0009' }}>Last updated {moment(Note.modified).format('MMM D, YYYY [at] HH:mm')}</Text>
                                </View>
                            );
                        })()}
                        <TouchableOpacity
                            onPress={onShare}
                            style={{ flexDirection: 'row', alignItems: 'center', gap: convert(12), paddingVertical: convert(14), borderBottomWidth: 1, borderColor: '#e2e8f0', paddingHorizontal: convert(12) }}>
                            <FluentShare32Regular width={24} height={24} color={'black'} />
                            <Text style={{ fontSize: convert(18) }}>Share</Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                            onPress={() => { setIsOpen(false); setGroupPickerOpen(true) }}
                            style={{ flexDirection: 'row', alignItems: 'center', gap: convert(12), paddingVertical: convert(14), borderBottomWidth: 1, borderColor: '#e2e8f0', paddingHorizontal: convert(12) }}>
                            <FluentFolderLink32Regular width={24} height={24} color={'black'} />
                            <Text style={{ fontSize: convert(18) }}>Link to group</Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                            onPress={handleWhatsapp}
                            style={{ flexDirection: 'row', alignItems: 'center', gap: convert(12), paddingVertical: convert(14), borderBottomWidth: 1, borderColor: '#e2e8f0', paddingHorizontal: convert(12) }}
                        >
                            <IcTwotoneWhatsapp width={24} height={24} color={'black'} />
                            <Text style={{ fontSize: convert(18) }}>Share on Whatsapp</Text>
                        </TouchableOpacity>
                        {
                            Note.publishId ? (
                                <TouchableOpacity style={{ flexDirection: 'row', alignItems: 'center', gap: convert(12), paddingVertical: convert(14), borderBottomWidth: 1, borderColor: '#e2e8f0', paddingHorizontal: convert(12) }} onPress={handleUpdateArticle}>
                                    <FluentGlobeArrowForward32Regular width={24} height={24} color={'black'} />
                                    <Text style={{ fontSize: convert(18) }}>Updated the article</Text>
                                </TouchableOpacity>
                            ) : (
                                <TouchableOpacity style={{ flexDirection: 'row', alignItems: 'center', gap: convert(12), paddingVertical: convert(14), borderBottomWidth: 1, borderColor: '#e2e8f0', paddingHorizontal: convert(12) }} onPress={handlePublish}>
                                    <FluentGlobeArrowForward32Regular width={24} height={24} color={'black'} />
                                    <Text style={{ fontSize: convert(18) }}>Publish as article</Text>
                                </TouchableOpacity>
                            )
                        }
                        {
                            Note.publishId ? (
                                <TouchableOpacity style={{ flexDirection: 'row', alignItems: 'center', gap: convert(12), paddingVertical: convert(14), borderBottomWidth: 1, borderColor: '#e2e8f0', paddingHorizontal: convert(12) }} onPress={handleDeleteArticleAndNote}>
                                    <FluentDelete32Regular width={24} height={24} color={'black'} />
                                    <Text style={{ fontSize: convert(18) }}>Deleted the note and article</Text>
                                </TouchableOpacity>
                            ) : (
                                <TouchableOpacity style={{ flexDirection: 'row', alignItems: 'center', gap: convert(12), paddingVertical: convert(14), borderColor: '#e2e8f0', paddingHorizontal: convert(12) }} onPress={handleDeleteNoteOnly}>
                                    <FluentDelete32Regular width={24} height={24} color={'black'} />
                                    <Text style={{ fontSize: convert(18) }}>Deleted this note</Text>
                                </TouchableOpacity>
                            )
                        }
                    </BottomSheetView>
                </BottomSheet>
            }
            {
                aiOpen && <BottomSheet
                    ref={aisheetRef}
                    snapPoints={aisnapPoints}
                    enableDynamicSizing={false}
                    enablePanDownToClose={true}
                    onClose={() => setAiOpen(false)}

                >
                    <KeyboardAvoidingView
                        behavior={Platform.OS === "ios" ? "padding" : "height"}
                        style={{ flex: 1 }}
                    >
                        <BottomSheetView style={{
                            flex: 1,
                            height: isKeyboard ? isKeyboard.screenY as number - 50 : '100%',
                            position: 'relative'
                        }}>
                            <View style={{ flex: 1, }}>
                                <View style={{ paddingHorizontal: convert(16), height: convert(62), justifyContent: 'center', borderBottomColor: '#cfdfeeff', borderBottomWidth: 1, zIndex: 10 }}>
                                    <Text style={{ fontSize: convert(13), color: "#0009" }}>Assistant</Text>
                                    <Text style={{ fontSize: convert(20), fontWeight: '600' }}>{title?.length > 34 ? `${title?.substring(0, 34)}...` : title}</Text>
                                </View>
                                <ScrollView
                                    ref={chatScrollRef}
                                    showsVerticalScrollIndicator={true}
                                    style={{ flex: 1 }}
                                    contentContainerStyle={{ paddingHorizontal: convert(20), paddingBottom: convert(50), paddingTop: convert(12) }}
                                    onLayout={(e) => setChatHeight(e.nativeEvent.layout.height)}
                                    onContentSizeChange={() => {
                                        if (!hasScrolledOnOpenRef.current) {
                                            hasScrolledOnOpenRef.current = true;
                                            chatScrollRef.current?.scrollToEnd({ animated: false });
                                        }
                                    }}
                                    inverted invertStickyHeaders
                                >

                                    <View>
                                        {ai_conversation?.map((item, index) => {
                                            const isPendingQuestion = item.role === "user" && aiLoading && index === ai_conversation.length - 1;
                                            return item.role === "user"
                                                ? (
                                                    <View
                                                        key={index}
                                                        style={isPendingQuestion ? { minHeight: chatHeight * .75, justifyContent: 'flex-start' } : undefined}
                                                    >
                                                        <View
                                                            style={{ width: '90%', borderRadius: convert(4), backgroundColor: "#008cff08", borderWidth: 1, borderColor: '#008cff18' }}
                                                        >
                                                            {item.replyContent && (
                                                                <View style={{ paddingLeft: convert(8), backgroundColor: '#008cff18' }}>
                                                                    <Text numberOfLines={2} style={{ fontSize: convert(13), color: '#0009', paddingVertical: convert(5) }}>{item.replyContent}</Text>
                                                                </View>
                                                            )}
                                                            <Text style={{ fontSize: convert(16), fontWeight: '500', paddingHorizontal: convert(12), paddingVertical: convert(8), lineHeight: convert(20) }}>{item.content}</Text>
                                                            {/* <Text style={{ fontSize: convert(12), color: "#0009", textAlign: 'right' }}>{moment(item.created).fromNow()}</Text> */}
                                                        </View>
                                                        {isPendingQuestion && <ThinkingIndicator />}
                                                    </View>
                                                )
                                                : (
                                                    <Response_Ai item={item} key={index} onReply={setReplyTo} />
                                                );
                                        })}
                                    </View>

                                </ScrollView>
                            </View>
                            {replyTo && (
                                <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: convert(16), paddingVertical: convert(8), borderTopWidth: 1, borderColor: '#cfdfeeff', backgroundColor: '#f7fafc' }}>
                                    <View style={{ flex: 1, backgroundColor: '#f7fafc' }}>
                                        <Text style={{ fontSize: convert(12), color: '#238dffff', fontWeight: '600' }}>Reply to</Text>
                                        <Text numberOfLines={1} style={{ fontSize: convert(13), color: '#0009' }}>{replyTo.content}</Text>
                                    </View>
                                    <Pressable onPress={() => setReplyTo(null)} style={{ paddingLeft: convert(12) }}>
                                        <FluentDismiss32Filled width={16} height={16} color={'#0009'} />
                                    </Pressable>
                                </View>
                            )}
                            <View style={{ bottom: 0, zIndex: 12, width: w, borderTopWidth: 1, borderColor: '#cfdfeeff', paddingHorizontal: convert(16), minHeight: convert(56), paddingTop: convert(8), paddingBottom: convert(12), height: 'auto', maxHeight: convert(150), flexDirection: 'row', gap: 12, alignItems: "flex-end" }}>
                                <TextInput
                                    multiline={true}
                                    value={inputValue}
                                    onChangeText={setInputValue}
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
                                        onPress={handleAgent}
                                        disabled={!inputValue.trim() || aiLoading}
                                        style={{ width: 40, aspectRatio: 1, borderRadius: 26, alignItems: 'center', justifyContent: "center", backgroundColor: "#238dffff", opacity: aiLoading ? 0.6 : 1 }}>
                                        {aiLoading
                                            ? <ActivityIndicator size={'small'} color={'white'} />
                                            : <FluentArrowUp32Filled width={20} height={20} color={"white"} />}
                                    </TouchableOpacity>
                                </View>
                            </View>
                        </BottomSheetView>
                    </KeyboardAvoidingView>
                </BottomSheet>
            }
            {
                groupPickerOpen && <GroupPicker
                    noteId={data.id as string}
                    currentGroup={(Note?.grouped as string | null) ?? null}
                    onClose={() => setGroupPickerOpen(false)}
                />
            }
        </GestureHandlerRootView >
    )

}

function GroupPicker({ noteId, currentGroup, onClose }: { noteId: string, currentGroup: string | null, onClose: () => void }) {
    const sheetRef = useRef<BottomSheet>(null);
    const { groupsQuery, addGroup, addNotetoGroup, session } = useDatabase()
    const [value, setValue] = useState('')

    useBottomSheetBackHandler(true, () => onClose?.());

    const handleSelect = async (groupId: string | null) => {
        await addNotetoGroup({ id: noteId, grouped: groupId, creator: session?.iduser })
        onClose?.()
    }

    const handleCreate = async () => {
        const name = value.trim()
        if (!name || !session?.iduser) return
        const created = await addGroup({ name }, session.iduser)
        if (created?.id) {
            setValue('')
            await handleSelect(created.id)
        }
    }

    return (
        <BottomSheet
            ref={sheetRef}
            snapPoints={[400]}
            enableDynamicSizing={false}
            enablePanDownToClose={true}
            containerStyle={{ backgroundColor: '#0003' }}
            onClose={onClose}
        >
            <BottomSheetView style={{ flex: 1, height: '100%', position: 'relative' }}>
                <View style={{ paddingHorizontal: convert(20), }}>
                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: convert(8), paddingVertical: convert(4), borderRadius: convert(40), backgroundColor: '#f1f5f9' }}>
                        <TextInput
                            value={value}
                            onChangeText={setValue}
                            placeholder="New group name"
                            placeholderTextColor={"#8fa0acff"}
                            style={{ flex: 1, fontSize: convert(18), color: 'black', paddingLeft: convert(12) }}
                        />
                        <TouchableOpacity onPress={handleCreate} style={{ padding: convert(12) }}>
                            <MaterialIcons name="add" size={24} color="#0083ff" />
                        </TouchableOpacity>
                    </View>

                </View>
                <ScrollView showsVerticalScrollIndicator={true} style={{ flex: 1 }} contentContainerStyle={{ paddingHorizontal: convert(14), paddingBottom: convert(50), paddingTop: convert(12) }}>
                    {currentGroup && (
                        <TouchableOpacity onPress={() => handleSelect(null)} style={{ paddingVertical: convert(12), borderBottomWidth: 1, borderBottomColor: '#cfdfeeff' }}>
                            <Text style={{ fontSize: convert(16), color: '#c0392b' }}>No group</Text>
                        </TouchableOpacity>
                    )}
                    {(groupsQuery?.findAll() ?? []).map((group: { id: string, name: string }) => (
                        <TouchableOpacity
                            key={group.id}
                            onPress={() => handleSelect(group.id)}
                            style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingVertical: convert(12), paddingHorizontal: convert(6), borderBottomWidth: 1, borderBottomColor: '#cfdfeeff' }}
                        >
                            <Text style={{ fontSize: convert(16) }}>{group.name}</Text>
                            {currentGroup === group.id && <FluentCheckmark28Filled width={18} height={18} color={'#0083ff'} />}
                        </TouchableOpacity>
                    ))}
                </ScrollView>
            </BottomSheetView>
        </BottomSheet>
    )
}

function ThinkingIndicator() {
    const dot1 = useRef(new Animated.Value(0)).current;
    const dot2 = useRef(new Animated.Value(0)).current;
    const dot3 = useRef(new Animated.Value(0)).current;

    useEffect(() => {
        const animate = (value: Animated.Value, delay: number) => Animated.loop(
            Animated.sequence([
                Animated.delay(delay),
                Animated.timing(value, { toValue: 1, duration: 350, useNativeDriver: true }),
                Animated.timing(value, { toValue: 0, duration: 350, useNativeDriver: true }),
            ])
        );

        const anims = [animate(dot1, 0), animate(dot2, 150), animate(dot3, 300)];
        anims.forEach((a) => a.start());
        return () => anims.forEach((a) => a.stop());
    }, []);

    const dotStyle = (value: Animated.Value) => ({
        opacity: value.interpolate({ inputRange: [0, 1], outputRange: [0.3, 1] }),
        transform: [{ translateY: value.interpolate({ inputRange: [0, 1], outputRange: [0, -3] }) }],
    });

    return (
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: convert(6), paddingTop: convert(8), marginBottom: convert(12) }}>
            <Text style={{ fontSize: convert(14), color: '#0009', fontStyle: 'italic' }}>Thinking</Text>
            <View style={{ flexDirection: 'row', gap: 3 }}>
                <Animated.View style={[{ width: 5, height: 5, borderRadius: 3, backgroundColor: '#0009' }, dotStyle(dot1)]} />
                <Animated.View style={[{ width: 5, height: 5, borderRadius: 3, backgroundColor: '#0009' }, dotStyle(dot2)]} />
                <Animated.View style={[{ width: 5, height: 5, borderRadius: 3, backgroundColor: '#0009' }, dotStyle(dot3)]} />
            </View>
        </View>
    );
}

// Styles par type de nœud inline
const inlineStyles: Record<string, TextStyle> = {
    strong: { fontWeight: '700' },
    em: { fontStyle: 'italic' },
    s: { textDecorationLine: 'line-through' },
    code_inline: {
        fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
        backgroundColor: '#f1f5f9',
        fontSize: convert(14),
    },
    link: { color: '#238dff', textDecorationLine: 'underline' },
};

// Rendu récursif AST -> <Text> imbriqués stylés
function renderStyledNodes(node: any, inherited: TextStyle[] = []): React.ReactNode {
    const ownStyle = inlineStyles[node.type];
    const styles = ownStyle ? [...inherited, ownStyle] : inherited;

    // Nœud feuille avec du texte
    if (typeof node.content === "string" && node.content !== "") {
        return (
            <Text key={node.key} style={{ ...styles, backgroundColor: 'transparent' }}>
                {node.content}
            </Text>
        );
    }

    // Nœud avec enfants
    if (Array.isArray(node.children) && node.children.length > 0) {
        return (
            <Text key={node.key} style={styles}>
                {node.children.map((child: any) => renderStyledNodes(child, styles))}
            </Text>
        );
    }

    // Cas particuliers sans children ni content (softbreak, hardbreak)
    if (node.type === "softbreak" || node.type === "hardbreak") {
        return <Text key={node.key}>{"\n"}</Text>;
    }

    return null;
}

// Flatten ALIGNÉ sur le rendu : même parcours, même ordre, mêmes cas
function flattenNodeText(node: any): string {
    if (typeof node.content === "string" && node.content !== "") {
        return node.content;
    }
    if (Array.isArray(node.children) && node.children.length > 0) {
        return node.children.map(flattenNodeText).join("");
    }
    if (node.type === "softbreak" || node.type === "hardbreak") {
        return "\n";
    }
    return "";
}

function SelectableTextGroup({ node, styles, onReply }: { node: any, styles: any, onReply: (text: string) => void }) {
    const plainText = flattenNodeText(node);
    const [selection, setSelection] = useState<{ start: number, end: number }>({ start: 0, end: 0 })
    const hasSelection = selection.end > selection.start

    const handleCopy = async () => {
        await Clipboard.setStringAsync(plainText.substring(selection.start, selection.end))
        setSelection({ start: 0, end: 0 })
    }

    const handleReply = () => {
        onReply(plainText.substring(selection.start, selection.end))
        setSelection({ start: 0, end: 0 })
    }

    // Android efface la sélection native dès qu'il n'y a plus d'ActionMode (contextMenuHidden).
    // On ignore les évènements qui la collapsent pour garder Copy/Reply actifs sur la dernière plage sélectionnée.
    const handleSelectionChange = (e: { nativeEvent: { selection: { start: number, end: number } } }) => {
        const next = e.nativeEvent.selection
        if (next.end > next.start) setSelection(next)
    }

    const textLayoutStyle = [styles.textgroup, { padding: 0, margin: 0, lineHeight: 24, fontSize: convert(16) }];

    return (
        <View key={node.key} style={{ position: 'relative' }}>
            <TextInput
                multiline
                editable
                caretHidden
                showSoftInputOnFocus={false}
                // contextMenuHidden
                onChangeText={() => { }}
                onSelectionChange={handleSelectionChange}
                onBlur={() => setSelection({ start: 0, end: 0 })}
                selectionColor={"rgba(35, 141, 255, 0.25)"}
                style={[textLayoutStyle, { color: 'black' }]}
            >
                {renderStyledNodes(node)}
            </TextInput>
            {hasSelection && (
                <View style={{ flexDirection: 'row', gap: 8, marginTop: convert(4), marginBottom: convert(4) }}>
                    <TouchableOpacity onPress={handleCopy} style={{ paddingVertical: convert(4), paddingHorizontal: convert(10), backgroundColor: '#eef4ff', borderRadius: 2 }}>
                        <Text style={{ fontSize: convert(12), color: '#238dffff', fontWeight: '600' }}>Copy</Text>
                    </TouchableOpacity>
                    <TouchableOpacity onPress={handleReply} style={{ paddingVertical: convert(4), paddingHorizontal: convert(10), backgroundColor: '#238dffff', borderRadius: 2 }}>
                        <Text style={{ fontSize: convert(12), color: 'white', fontWeight: '600' }}>Reply</Text>
                    </TouchableOpacity>
                </View>
            )}
        </View>
    );
}

const getMarkdownRules = (onReply: (text: string) => void) => ({
    textgroup: (node: any, children: any, parent: any, styles: any) => (
        <SelectableTextGroup key={node.key} node={node} styles={styles} onReply={onReply} />
    ),
});

function Response_Ai({ item, onReply }: { item: AiHistoryType, onReply: (item: AiHistoryType) => void }) {
    const [menu, setMenu] = useState<{ x: number, y: number } | null>(null)

    const handleCopy = async () => {
        await Clipboard.setStringAsync(item.content)
        setMenu(null)
    }

    const handleReply = () => {
        onReply(item)
        setMenu(null)
    }

    const handleInlineReply = (text: string) => onReply({ ...item, content: text })

    return (
        <>
            <Pressable
                onLongPress={(e) => setMenu({ x: e.nativeEvent.pageX, y: e.nativeEvent.pageY })}
                className="reponse mb-3 px-1"
                style={{ paddingTop: convert(8), marginBottom: convert(12) }}


            >
                <Markdown mergeStyle={true} rules={getMarkdownRules(handleInlineReply)} style={{ body: { color: 'black', fontSize: convert(16), lineHeight: 23 } }}>
                    {item.content}
                </Markdown>
            </Pressable>
            <Modal visible={!!menu} transparent animationType="fade" onRequestClose={() => setMenu(null)}>
                <Pressable style={{ flex: 1 }} onPress={() => setMenu(null)}>
                    {menu && (
                        <View style={{ position: 'absolute', top: menu.y, left: Math.min(menu.x, w - convert(160)), width: convert(150), backgroundColor: 'white', borderRadius: 8, borderWidth: 1, borderColor: '#e2e8f0', shadowColor: '#000', shadowOpacity: 0.15, shadowRadius: 6, shadowOffset: { width: 0, height: 2 }, elevation: 4, overflow: 'hidden' }}>
                            <TouchableOpacity onPress={handleCopy} style={{ paddingVertical: convert(12), paddingHorizontal: convert(14), borderBottomWidth: 1, borderColor: '#e2e8f0' }}>
                                <Text style={{ fontSize: convert(15) }}>Copy</Text>
                            </TouchableOpacity>
                            <TouchableOpacity onPress={handleReply} style={{ paddingVertical: convert(12), paddingHorizontal: convert(14) }}>
                                <Text style={{ fontSize: convert(15) }}>Reply</Text>
                            </TouchableOpacity>
                        </View>
                    )}
                </Pressable>
            </Modal>
        </>
    )
}