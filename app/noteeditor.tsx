import { filterBible } from "@/components/bible_component/livre";
import { useDatabase } from '@/context/database.context';
import type { BibleMetadata, Notes } from "@/Database/db";
import EditorJS from "@/editor";
import { router, Stack, useLocalSearchParams } from "expo-router";
import { useCallback, useMemo, useRef, useState } from "react";
import { Keyboard, KeyboardAvoidingView, Platform, Pressable, TextInput, TouchableOpacity } from "react-native";

import { PageLayout_3 } from "@/components/page";
import { Text, View } from "@/components/Themed";
import { w } from "@/constants/Colors";
import { convert } from "@/constants/convert";
import { FluentDelete32Regular, FluentFolderLink32Regular, FluentGlobeArrowForward32Regular, FluentMoreVertical32Filled, FluentSparkle32Regular, IcBaselineArrowBack, IcTwotoneWhatsapp } from "@/constants/icons";
import BottomSheet, { BottomSheetView } from "@gorhom/bottom-sheet";
import { GestureHandlerRootView } from 'react-native-gesture-handler';

export default function NoteEditor() {
    const [isKeyboard, setIskeyboard] = useState<{ height: number | string, screenY: number | string, width?: number } | undefined>(undefined)
    const data = useLocalSearchParams()
    const { notesQuery, updateNote, biblemetadatState } = useDatabase()
    const [isOpen, setIsOpen] = useState(false)
    const [aiOpen, setAiOpen] = useState(false)

    const bible = biblemetadatState?.findAll()
    const sheetRef = useRef<BottomSheet>(null);
    const aisheetRef = useRef<BottomSheet>(null)
    // variables
    const snapPoints = useMemo(() => ["40%"], []);
    const aisnapPoints = useMemo(() => ['100%'], [])


    const Note = notesQuery?.findById(data.id as string) as Notes

    const handleUpdate = async (data: Partial<Notes>) => {
        await updateNote(data)
    }

    // listening to keyboadEvent
    Keyboard.addListener('keyboardDidShow', (event) => {
        console.log(event)
        setIskeyboard(event.endCoordinates)
    })
    Keyboard.addListener('keyboardDidHide', (event) => {
        console.log(event)
        setIskeyboard(undefined)
    })


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

    return (
        <PageLayout_3>
            <GestureHandlerRootView style={{
                flex: 1,
                backgroundColor: 'white',
                position: 'relative'
            }}>
                <Stack.Screen options={{ animation: "fade_from_bottom", headerShown: false }} />
                <View style={{ height: convert(62), backgroundColor: 'white', flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: convert(16) }}>
                    <TouchableOpacity onPress={() => { router.back() }}>
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
                    <EditorJS note={Note} updateNote={(data) => handleUpdate(data)} biblemetadatState={bible as BibleMetadata[]} trie={filterBible} />
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
                            <TouchableOpacity style={{ flexDirection: 'row', alignItems: 'center', gap: convert(12), paddingVertical: convert(14), borderBottomWidth: 1, borderColor: '#e2e8f0', paddingHorizontal: convert(12) }}>
                                <FluentFolderLink32Regular width={24} height={24} color={'black'} />
                                <Text style={{ fontSize: convert(18) }}>Link to a groups</Text>
                            </TouchableOpacity>
                            <TouchableOpacity style={{ flexDirection: 'row', alignItems: 'center', gap: convert(12), paddingVertical: convert(14), borderBottomWidth: 1, borderColor: '#e2e8f0', paddingHorizontal: convert(12) }}>
                                <IcTwotoneWhatsapp width={24} height={24} color={'black'} />
                                <Text style={{ fontSize: convert(18) }}>Share on Whatsapp</Text>
                            </TouchableOpacity>
                            <TouchableOpacity style={{ flexDirection: 'row', alignItems: 'center', gap: convert(12), paddingVertical: convert(14), borderBottomWidth: 1, borderColor: '#e2e8f0', paddingHorizontal: convert(12) }}>
                                <FluentGlobeArrowForward32Regular width={24} height={24} color={'black'} />
                                <Text style={{ fontSize: convert(18) }}>Publish as article</Text>
                            </TouchableOpacity>
                            <TouchableOpacity style={{ flexDirection: 'row', alignItems: 'center', gap: convert(12), paddingVertical: convert(14), borderColor: '#e2e8f0', paddingHorizontal: convert(12) }}>
                                <FluentDelete32Regular width={24} height={24} color={'black'} />
                                <Text style={{ fontSize: convert(18) }}>Deleted this note</Text>
                            </TouchableOpacity>
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
                                paddingHorizontal: convert(16),
                                height: isKeyboard ? isKeyboard.screenY as number - 50 : '100%',
                                position: 'relative'
                            }}>
                                <View style={{ flex: 1, width: '100%', height: '100%', borderColor: '#999' }}></View>
                                <View style={{ position: 'absolute', bottom: -30, zIndex: 12, width: w, borderTopWidth: 1, borderColor: '#cfdfeeff', paddingHorizontal: convert(16), height: convert(100), paddingTop: convert(5) }}>
                                    <TextInput
                                        multiline={true}
                                        autoFocus
                                        autoCapitalize="sentences"
                                        style={{
                                            height: 40

                                        }}
                                    />
                                </View>
                            </BottomSheetView>
                        </KeyboardAvoidingView>
                    </BottomSheet>
                }
            </GestureHandlerRootView>
        </PageLayout_3>
    )

}