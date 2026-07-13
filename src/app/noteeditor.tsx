import { filterBible } from "@/components/bible_component/livre";
import { useDatabase } from '@/context/database.context';
import type { AiHistoryType, BibleMetadata, Notes } from "@/Database/db";
import EditorJS from "@/editor";
import { router, Stack, useLocalSearchParams } from "expo-router";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { ActivityIndicator, Alert, Animated, Keyboard, KeyboardAvoidingView, Linking, Modal, Platform, Pressable, Share, TextInput, TouchableOpacity } from "react-native";

import { PageLayout_3 } from "@/components/page";
import { Text, View } from "@/components/Themed";
import { w } from "@/constants/Colors";
import { convert } from "@/constants/convert";
import { FluentArrowUp32Filled, FluentDelete32Regular, FluentDismiss32Filled, FluentFolderLink32Regular, FluentGlobeArrowForward32Regular, FluentMoreVertical32Filled, FluentShare32Regular, FluentSparkle32Regular, IcBaselineArrowBack, IcTwotoneWhatsapp } from "@/constants/icons";
import BottomSheet, { BottomSheetView } from "@gorhom/bottom-sheet";
import { GestureHandlerRootView, ScrollView } from 'react-native-gesture-handler';

import { generateUUID as uuidv4 } from "@/Database/uuid";

import htmlToWhatsApp from "@/components/bible_component/livre/convert_whatsapp";
import { QueryForTable } from "@/constants/Queryuilder";
import * as AiStore from '@/Database/ai';
import { askAiAgent } from "@/lib/aiAgent";
import * as Clipboard from 'expo-clipboard';
import moment from "moment";
import Markdown from 'react-native-markdown-display';

export default function NoteEditor() {
    const [isKeyboard, setIskeyboard] = useState<{ height: number | string, screenY: number | string, width?: number } | undefined>(undefined)
    const [note_whatsapp, set_note_whatsapp] = useState<string | null>(null)
    const [note_body, set_note_body] = useState<string | null>(null)
    const data = useLocalSearchParams()
    const { notesQuery, updateNote, biblemetadatState, usersQuery } = useDatabase()
    const [isOpen, setIsOpen] = useState(false)
    const [aiOpen, setAiOpen] = useState(false)
    const [title, setTitle] = useState<string | null>(null)
    const [inputValue, setInputValue] = useState("");
    const [ai_conversation, setConversation] = useState<AiHistoryType[]>([])
    const [aiLoading, setAiLoading] = useState(false)
    const [replyTo, setReplyTo] = useState<AiHistoryType | null>(null)
    const [note_data, set_note_data] = useState<Notes | null>(null)

    // menu de modification texte
    const editorRef = useRef<any | null>(null);
    const [isTest, setIsTest] = useState(false)

    const bible = biblemetadatState?.findAll()
    const sheetRef = useRef<BottomSheet>(null);
    const aisheetRef = useRef<BottomSheet>(null)
    // variables
    const snapPoints = useMemo(() => ["50%"], []);
    const aisnapPoints = useMemo(() => ['100%'], [])


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
        setConversation(result as AiHistoryType[])
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
                message: "partage depuis android"
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

    const fetch_ai_history = useCallback(async () => {
        const ai_history = await AiStore.get(data.id as string)
        history_ai.addMany(ai_history)
        setConversation(history_ai.findAll())

    }, [])

    useEffect(() => {
        fetch_ai_history()
    }, [])


    const handleAgent = async () => {
        const question = inputValue.trim();
        if (!question || aiLoading) return;

        const noteId = data.id as string;
        const quoted = replyTo?.content;

        // Ajouter immédiatement le message de l'utilisateur pour un feedback instantané
        const userMessage: AiHistoryType = { id: uuidv4(), iduser: noteId, role: "user", content: question, created: new Date().toISOString(), modified: new Date().toISOString() };
        setConversation((el) => [...el, userMessage]);
        setInputValue("")
        setReplyTo(null)
        AiStore.set({ iduser: noteId, role: "user", content: question });

        setAiLoading(true);
        try {
            const prompt = quoted ? `En réponse à : "${quoted}"\n\n${question}` : question;
            const response = await agent(prompt);
            const answer = response.success && response.answer
                ? response.answer
                : "Désolé, je n'ai pas pu générer de réponse. Réessayez plus tard.";

            setConversation((el) => [...el, { id: uuidv4(), iduser: noteId, role: "assistant", content: answer, created: new Date().toISOString(), modified: new Date().toISOString() }]);
            AiStore.set({ iduser: noteId, role: "assistant", content: answer });
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

    return (
        <PageLayout_3>
            <GestureHandlerRootView style={{
                flex: 1,
                backgroundColor: 'white',
                position: 'relative'
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
                        <TouchableOpacity onPress={() => handleSnapPress(0)}>
                            <FluentMoreVertical32Filled width={24} height={24} color={'black'} />
                        </TouchableOpacity>
                    </View>
                </View>
                <KeyboardAvoidingView
                    behavior={Platform.OS === "ios" ? "padding" : "height"}
                    style={{ flex: 1 }}
                >
                    {
                        Note === undefined
                            ? <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}><View style={{ alignItems: 'center', justifyContent: 'center' }}><ActivityIndicator size={'large'} color={'black'} /><Text>Page Loading...</Text> </View></View>
                            : <EditorJS note={Note} updateNote={(data) => handleUpdate(data)} biblemetadatState={bible as BibleMetadata[]} trie={filterBible} menubtn={handleTest} ref={editorRef} />
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
                            <TouchableOpacity style={{ flexDirection: 'row', alignItems: 'center', gap: convert(12), paddingVertical: convert(14), borderBottomWidth: 1, borderColor: '#e2e8f0', paddingHorizontal: convert(12) }}>
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
                                    <TouchableOpacity style={{ flexDirection: 'row', alignItems: 'center', gap: convert(12), paddingVertical: convert(14), borderBottomWidth: 1, borderColor: '#e2e8f0', paddingHorizontal: convert(12) }} onPress={handlePublish}>
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
                                    <TouchableOpacity style={{ flexDirection: 'row', alignItems: 'center', gap: convert(12), paddingVertical: convert(14), borderBottomWidth: 1, borderColor: '#e2e8f0', paddingHorizontal: convert(12) }} onPress={handlePublish}>
                                        <FluentDelete32Regular width={24} height={24} color={'black'} />
                                        <Text style={{ fontSize: convert(18) }}>Deleted the note and article</Text>
                                    </TouchableOpacity>
                                ) : (
                                    <TouchableOpacity style={{ flexDirection: 'row', alignItems: 'center', gap: convert(12), paddingVertical: convert(14), borderColor: '#e2e8f0', paddingHorizontal: convert(12) }}>
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
                                    <ScrollView showsVerticalScrollIndicator={true} style={{ flex: 1 }} contentContainerStyle={{ paddingHorizontal: convert(20), paddingBottom: convert(50), paddingTop: convert(12) }} inverted invertStickyHeaders>

                                        <View>
                                            {ai_conversation?.map((item, index) => {
                                                return item.role === "user"
                                                    ? (
                                                        <View

                                                            key={index}
                                                            style={{ width: '90%', borderRadius: convert(4), backgroundColor: "#008cff08", borderWidth: 1, borderColor: '#008cff18', paddingHorizontal: convert(12), paddingVertical: convert(8), gap: convert(2) }}
                                                        >
                                                            <Text style={{ fontSize: convert(16), fontWeight: '600' }}>{item.content}</Text>
                                                            {/* <Text style={{ fontSize: convert(12), color: "#0009", textAlign: 'right' }}>{moment(item.created).fromNow()}</Text> */}
                                                        </View>
                                                    )
                                                    : (
                                                        <Response_Ai item={item} key={index} onReply={setReplyTo} />
                                                    );
                                            })}
                                            {aiLoading && <ThinkingIndicator />}
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
            </GestureHandlerRootView>
        </PageLayout_3>
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

const markdownSelectableRules = {
    textgroup: (node: any, children: any, parent: any, styles: any) => (
        <Text key={node.key} style={styles.textgroup} selectable>
            {children}
        </Text>
    ),
};

function Response_Ai({ item, onReply }: { item: AiHistoryType, onReply: (item: AiHistoryType) => void }) {
    const [copier, setCopier] = useState<boolean>(false)
    const [menu, setMenu] = useState<{ x: number, y: number } | null>(null)

    const handleCopy = async () => {
        await Clipboard.setStringAsync(item.content)
        setMenu(null)
    }

    const handleReply = () => {
        onReply(item)
        setMenu(null)
    }

    return (
        <>
            <Pressable
                onLongPress={(e) => setMenu({ x: e.nativeEvent.pageX, y: e.nativeEvent.pageY })}
                className="reponse mb-3 px-1"
                style={{ paddingTop: convert(8), marginBottom: convert(12) }}


            >
                <Markdown mergeStyle={true} rules={markdownSelectableRules} style={{ body: { color: 'black', fontSize: convert(16), lineHeight: 23 } }}>
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