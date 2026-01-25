import { filterBible } from "@/components/bible_component/livre";
import { useDatabase } from '@/context/database.context';
import type { AiHistoryType, BibleMetadata, Notes } from "@/Database/db";
import EditorJS from "@/editor";
import { router, Stack, useLocalSearchParams } from "expo-router";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { ActivityIndicator, Alert, Keyboard, KeyboardAvoidingView, Linking, Platform, Pressable, Share, TextInput, TouchableOpacity } from "react-native";

import { PageLayout_3 } from "@/components/page";
import { Text, View } from "@/components/Themed";
import { w } from "@/constants/Colors";
import { convert } from "@/constants/convert";
import { FluentArrowUp32Filled, FluentDelete32Regular, FluentDismiss32Filled, FluentFolderLink32Regular, FluentGlobeArrowForward32Regular, FluentMoreVertical32Filled, FluentShare32Regular, FluentSparkle32Regular, IcBaselineArrowBack, IcTwotoneWhatsapp } from "@/constants/icons";
import BottomSheet, { BottomSheetView } from "@gorhom/bottom-sheet";
import { GestureHandlerRootView, ScrollView } from 'react-native-gesture-handler';

import { generateUUID as uuidv4 } from "@/Database/uuid";

import aiAgent from "@/components/ai_agent/function";
import htmlToWhatsApp from "@/components/bible_component/livre/convert_whatsapp";
import { QueryForTable } from "@/constants/Queryuilder";
import * as AiStore from '@/Database/ai';
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
    const [note_data, set_note_data] = useState<Notes | null>(null)

    // menu de modification texte
    const editorRef = useRef<any | null>(null);
    const [isTest, setIsTest] = useState(false)

    const bible = biblemetadatState?.findAll()
    const sheetRef = useRef<BottomSheet>(null);
    const aisheetRef = useRef<BottomSheet>(null)
    // variables
    const snapPoints = useMemo(() => ["40%"], []);
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
                console.log("appel de la methode test");
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
                    console.log('result activity', result.activityType)
                } else {
                    // share
                }
            } else if (result.action === Share.dismissedAction) {
                Alert.alert('dismissed')
            }

        } catch (error) {
            console.log(error)
            Alert.alert(error.message)
        }
    }

    const agent = useCallback(async (prompt: string) => {
        const response = await aiAgent({
            content: note_body as string,
            iduser: data.id as string
        }, prompt);
        return response;
    }, [note_body]);

    const fetch_ai_history = useCallback(async () => {
        const ai_history = await AiStore.get(data.id as string)
        history_ai.addMany(ai_history)
        setConversation(history_ai.findAll())

    }, [])

    useEffect(() => {
        fetch_ai_history()
    }, [])


    const handleAgent = async () => {
        // Ajouter immédiatement le message de l'utilisateur pour un feedback instantané
        const userMessage = { role: "user", content: inputValue };
        const currentHistory = ai_conversation || [];
        const newMessage = [...currentHistory, userMessage];
        setConversation(newMessage);

        const response = await agent(inputValue);

        setConversation((el) => [...el, { id: uuidv4(), ...response.history.slice(-1)[0], created: new Date().toISOString(), modified: new Date().toISOString() }]);
        setInputValue("")
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
                                        <Text style={{ fontSize: convert(16), color: "#0009" }}>Assiatant - Context</Text>
                                        <Text style={{ fontSize: convert(20), fontWeight: '600' }}>{title?.length > 34 ? `${title?.substring(0, 34)}...` : title}</Text>
                                    </View>
                                    <ScrollView showsVerticalScrollIndicator={true} style={{ flex: 1 }} contentContainerStyle={{ paddingHorizontal: convert(16), paddingBottom: convert(50), paddingTop: convert(12) }} inverted invertStickyHeaders>

                                        <View>
                                            {ai_conversation?.map((item, index) => {
                                                return item.role === "user"
                                                    ? (
                                                        <View

                                                            key={index}
                                                            style={{ width: '100%', borderRadius: convert(12), backgroundColor: "#008cff18", paddingHorizontal: convert(12), paddingVertical: convert(8), gap: convert(2) }}
                                                        >
                                                            <Text style={{ fontSize: convert(16), fontWeight: '600' }}>{item.content}</Text>
                                                            <Text style={{ fontSize: convert(12), color: "#0009", textAlign: 'right' }}>{moment(item.created).fromNow()}</Text>
                                                        </View>
                                                    )
                                                    : (
                                                        <Response_Ai item={item} key={index} />
                                                    );
                                            })}
                                        </View>

                                    </ScrollView>
                                </View>
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
                                            disabled={!inputValue.trim()}
                                            style={{ width: 40, aspectRatio: 1, borderRadius: 26, alignItems: 'center', justifyContent: "center", backgroundColor: "#238dffff" }}>
                                            <FluentArrowUp32Filled width={20} height={20} color={"white"} />
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

function Response_Ai({ item }: { item: AiHistoryType }) {
    const [copier, setCopier] = useState<boolean>(false)



    return (
        <>
            {
                !copier
                    ? (<Pressable
                        onLongPress={() => setCopier(true)}
                        className="reponse mb-3 px-1"
                        style={{ paddingTop: convert(8), marginBottom: convert(12) }}
                    >
                        <Markdown mergeStyle={true} style={{ body: { color: 'black', fontSize: convert(16) } }}>

                            {item.content}
                        </Markdown>
                    </Pressable>)
                    : (
                        <View
                            style={{ marginBottom: convert(12), borderWidth: 1, borderColor: "#f05", marginTop: convert(12) }}
                        >
                            <View style={{ paddingVertical: convert(4), paddingHorizontal: convert(12), backgroundColor: "#f05", flexDirection: 'row', justifyContent: 'space-between' }}>
                                <Text style={{ fontSize: convert(14), fontWeight: '600', color: 'white' }}>Selection box</Text>
                                <Pressable onPress={() => setCopier(false)}>
                                    <FluentDismiss32Filled width={15} height={15} color={'white'} />
                                </Pressable>
                            </View>
                            <View style={{ paddingTop: convert(8), paddingHorizontal: convert(12), paddingBottom: convert(12) }}>
                                <Text style={{ fontSize: convert(16) }} selectable selectionColor={"rgba(255, 5, 5, 0.13)"}>
                                    {item.content}
                                </Text>
                            </View>
                        </View>
                    )
            }
        </>
    )
}