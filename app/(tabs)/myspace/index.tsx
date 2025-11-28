import { Image, Pressable, ScrollView, Text, TouchableOpacity } from 'react-native';

import { NewNoteButton } from '@/app/styles/cards';
import HeaderPage from '@/components/headerpage';
import AllNotesFilters from '@/components/notes/allnotes';
import AllNotesPinned from '@/components/notes/notespinned';
import { View } from '@/components/Themed';
import { convert } from '@/constants/convert';
import { FluentNoteAdd28Regular, FluentSearch32Filled } from "@/constants/icons";
import { useDatabase } from '@/context/database.context';
import { Notes } from '@/Database/db';
import { Stack, router } from 'expo-router';
import { useEffect, useState } from 'react';

export default function TabTwoScreen() {
    const { addNote, notesQuery, session } = useDatabase()


    const handleNewNote = async () => {
        const placeholderText = `{"type":"doc","content":[{"type":"heading","attrs":{"textAlign":null,"level":1},"content":[{"type":"text","text":"Entrez votre titre"}]},{"type":"paragraph","attrs":{"textAlign":null},"content":[{"type":"text","text":"Écrivez votre note et autres ici."}]}]}`

        const result = await addNote({
            body: placeholderText,
            html: "<div>vide<vide>",
            pinned: false,
            archived: false,
            grouped: null,
            creator: session?.iduser as string
        })

        if (result) {
            router.navigate({
                pathname: '/noteeditor',
                params: {
                    id: result?.id,
                    userid: result?.creator,
                }
            })
        }
    }


    return (
        <View style={{ flex: 1 }}>
            <Stack.Screen options={{ headerShown: false }} />
            <HeaderPage />
            <ScrollView style={{ flex: 1 }} contentContainerStyle={{ paddingBottom: convert(72), paddingTop: convert(16) }}>
                <Pressable style={{ paddingHorizontal: convert(16), marginBottom: convert(16) }} onPress={() => router.push('/searchnotes')}>
                    <View style={{ flexDirection: "row", alignItems: "center", paddingHorizontal: convert(16), paddingVertical: convert(12), backgroundColor: "#d3e3f1ff", borderRadius: convert(24) }}>
                        <FluentSearch32Filled width={20} height={20} color={"black"} />
                        <Text style={{ fontSize: convert(16), fontWeight: "bold", marginLeft: convert(8) }}>Search a note </Text>
                    </View>
                </Pressable>
                <PublishSqare />
                <AllNotesPinned />
                <AllNotesFilters />
            </ScrollView>
            <View style={NewNoteButton.container} >
                <TouchableOpacity style={NewNoteButton.button} onPress={handleNewNote}>
                    <FluentNoteAdd28Regular width={28} height={28} color={"white"} />
                </TouchableOpacity>
            </View>
        </View>
    );
}



const PublishElement = ({ publishId }: { publishId: string }) => {

    const { articleid, imageUrl, title } = JSON.parse(publishId)

    return (<View style={{ width: convert(200), height: convert(200), backgroundColor: "#d3e3f1ff", borderRadius: convert(12), alignItems: "center", justifyContent: "center", position: 'relative' }}>
        <Image source={{ uri: `https://${imageUrl}` }} style={{ width: convert(200), height: convert(200), borderRadius: convert(12), resizeMode: "cover", position: 'absolute', zIndex: 1 }} />
        <View style={{ position: 'absolute', zIndex: 2, width: convert(200), height: convert(200), backgroundColor: "#0000004b", borderRadius: convert(12), padding: convert(16) }}>
            <Text style={{ fontSize: convert(20), fontWeight: "bold", color: "white" }}>{title}</Text>
        </View>
    </View>)
}


const PublishSqare = () => {
    const { addNote, notesQuery, session } = useDatabase()
    const [notes, setNotes] = useState<Notes[]>([])

    useEffect(() => {
        const query = notesQuery?.filter((note) => note.publishId !== null).findAll()
        setNotes(query)
    }, [])
    return (<View>
        <Text style={{ fontSize: convert(16), fontWeight: "bold", marginLeft: convert(16), marginBottom: convert(12) }}>Published Notes</Text>
        <ScrollView horizontal contentContainerStyle={{ paddingHorizontal: convert(16), paddingBottom: convert(16), gap: convert(16) }}>
            {
                notes?.map((note) => <PublishElement key={note.id} publishId={note.publishId} />)
            }
        </ScrollView>
    </View>)
}