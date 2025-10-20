import { ScrollView, TouchableOpacity } from 'react-native';

import { NewNoteButton } from '@/app/styles/cards';
import HeaderPage from '@/components/headerpage';
import AllNotesFilters from '@/components/notes/allnotes';
import AllNotesPinned from '@/components/notes/notespinned';
import { View } from '@/components/Themed';
import { convert } from '@/constants/convert';
import { FluentNoteAdd28Regular } from "@/constants/icons";
import { useDatabase } from '@/context/database.context';
import { Stack, router } from 'expo-router';

export default function TabTwoScreen() {
    const { addNote, notesQuery } = useDatabase()


    const handleNewNote = async () => {
        const placeholderText = `{"type":"doc","content":[{"type":"heading","attrs":{"textAlign":null,"level":1},"content":[{"type":"text","text":"Entrez votre titre"}]},{"type":"paragraph","attrs":{"textAlign":null},"content":[{"type":"text","text":"Écrivez votre note et autres ici."}]}]}`

        const result = await addNote({
            body: placeholderText,
            html: "<div>vide<vide>",
            pinned: false,
            archived: false,
            grouped: null,
            creator: "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx"
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

