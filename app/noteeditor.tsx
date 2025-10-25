import { filterBible } from "@/components/bible_component/livre";
import { useDatabase } from '@/context/database.context';
import type { BibleMetadata, Notes } from "@/Database/db";
import EditorJS from "@/editor";
import { Stack, useLocalSearchParams } from "expo-router";
import { useCallback, useMemo, useRef, useState } from "react";
import { KeyboardAvoidingView, Platform, Pressable, TouchableOpacity } from "react-native";

import { Text, View } from "@/components/Themed";
import { convert } from "@/constants/convert";
import { FluentDelete32Regular, FluentMoreVertical32Filled, FluentShare32Regular, FluentSparkle32Regular, IcTwotoneWhatsapp } from "@/constants/icons";
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

    // bottom sheet
    const handleSnapPress = useCallback((index: number) => {
        sheetRef.current?.snapToIndex(index);
        setIsOpen(true)
    }, []);
    const handleAiSnapPress = useCallback((index: number) => {
        aisheetRef.current?.snapToIndex(index);
        setAiOpen(true)
    }, []);

    return (
        <GestureHandlerRootView style={{
            flex: 1,
            backgroundColor: 'white',
            position: 'relative'
        }}>
            <Stack.Screen options={{
                animation: "fade_from_bottom", headerShadowVisible: false, title: '', headerRight: () => {
                    return (
                        <View style={{ flexDirection: "row", alignItems: 'center', gap: convert(16), marginRight: convert(4) }}>

                            <TouchableOpacity onPress={() => handleAiSnapPress(0)}>
                                <FluentSparkle32Regular width={24} height={24} color={'black'} />
                            </TouchableOpacity>
                            <TouchableOpacity onPress={() => handleSnapPress(0)}>
                                <FluentMoreVertical32Filled width={24} height={24} color={'black'} />
                            </TouchableOpacity>
                        </View>
                    )
                }
            }} />

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
                        <TouchableOpacity style={{ flexDirection: 'row', alignItems: 'center', gap: convert(12), paddingVertical: convert(16), borderBottomWidth: 1, borderColor: '#e2e8f0', paddingHorizontal: convert(12) }}>
                            <IcTwotoneWhatsapp width={30} height={30} color={'black'} />
                            <Text style={{ fontSize: convert(18) }}>Share on Whatsapp</Text>
                        </TouchableOpacity>
                        <TouchableOpacity style={{ flexDirection: 'row', alignItems: 'center', gap: convert(12), paddingVertical: convert(16), borderBottomWidth: 1, borderColor: '#e2e8f0', paddingHorizontal: convert(12) }}>
                            <FluentShare32Regular width={30} height={30} color={'black'} />
                            <Text style={{ fontSize: convert(18) }}>Publish as article</Text>
                        </TouchableOpacity>
                        <TouchableOpacity style={{ flexDirection: 'row', alignItems: 'center', gap: convert(12), paddingVertical: convert(16), borderBottomWidth: 1, borderColor: '#e2e8f0', paddingHorizontal: convert(12) }}>
                            <FluentDelete32Regular width={30} height={30} color={'black'} />
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
                    <BottomSheetView style={{
                        flex: 1,
                        paddingHorizontal: convert(16),
                    }}>
                        <TouchableOpacity style={{ flexDirection: 'row', alignItems: 'center', gap: convert(12), paddingVertical: convert(16), borderBottomWidth: 1, borderColor: '#e2e8f0', paddingHorizontal: convert(12) }}>
                            <IcTwotoneWhatsapp width={30} height={30} color={'black'} />
                            <Text style={{ fontSize: convert(18) }}>Share on Whatsapp</Text>
                        </TouchableOpacity>
                        <TouchableOpacity style={{ flexDirection: 'row', alignItems: 'center', gap: convert(12), paddingVertical: convert(16), borderBottomWidth: 1, borderColor: '#e2e8f0', paddingHorizontal: convert(12) }}>
                            <FluentShare32Regular width={30} height={30} color={'black'} />
                            <Text style={{ fontSize: convert(18) }}>Publish as article</Text>
                        </TouchableOpacity>
                        <TouchableOpacity style={{ flexDirection: 'row', alignItems: 'center', gap: convert(12), paddingVertical: convert(16), borderBottomWidth: 1, borderColor: '#e2e8f0', paddingHorizontal: convert(12) }}>
                            <FluentDelete32Regular width={30} height={30} color={'black'} />
                            <Text style={{ fontSize: convert(18) }}>Deleted this note</Text>
                        </TouchableOpacity>
                    </BottomSheetView>
                </BottomSheet>
            }
        </GestureHandlerRootView>
    )

}