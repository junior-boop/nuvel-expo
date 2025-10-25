import { filterBible } from "@/components/bible_component/livre";
import { PageLayout_3 } from "@/components/page";
import { useDatabase } from '@/context/database.context';
import type { BibleMetadata, Notes } from "@/Database/db";
import EditorJS from "@/editor";
import { Stack, useLocalSearchParams } from "expo-router";
import { useEffect, useState } from "react";
import { Keyboard, KeyboardAvoidingView, Platform } from "react-native";

export default function NoteEditor() {
    const [isKeyboard, setIskeyboard] = useState<{ height: number | string, screenY: number | string, width?: number } | undefined>(undefined)
    const data = useLocalSearchParams()
    const { notesQuery, updateNote, biblemetadatState } = useDatabase()

    const bible = biblemetadatState?.findAll()



    const Note = notesQuery?.findById(data.id as string) as Notes
    useEffect(() => {
        Keyboard.addListener("keyboardDidHide", () => {
            setIskeyboard({ height: "100vh", screenY: "100vh" })
        })
        Keyboard.addListener("keyboardDidShow", () => {
            setIskeyboard(Keyboard.metrics())
        })

    }, [Keyboard.listenerCount])

    const handleUpdate = async (data: Partial<Notes>) => {
        await updateNote(data)
    }



    return (
        <PageLayout_3>
            <Stack.Screen options={{ animation: "fade_from_bottom", headerShadowVisible: false, title: '' }} />
            <KeyboardAvoidingView
                behavior={Platform.OS === "ios" ? "padding" : "height"}
                style={{ flex: 1 }}
            >
                <EditorJS note={Note} updateNote={(data) => handleUpdate(data)} biblemetadatState={bible as BibleMetadata[]} trie={filterBible} />
            </KeyboardAvoidingView>
        </PageLayout_3>
    )
}