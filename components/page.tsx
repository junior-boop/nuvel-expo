import { NewNoteButton } from '@/app/styles/cards';
import { View } from '@/components/Themed';
import { FluentNoteAdd28Regular } from '@/constants/icons';
import { useDatabase } from '@/context/database.context';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { router, useNavigation } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useState } from 'react';
import { StyleSheet, TouchableOpacity } from 'react-native';
import { EdgeInsets, Rect, SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';

export default function PageLayout({ children, addnote = true }: { children: React.ReactNode, addnote?: boolean }) {
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
        <View style={styles.container}>
            <StatusBar style="dark" />
            <SafeAreaView style={{ flex: 1, position: 'relative' }}>
                {children}
                {
                    addnote && (<View style={NewNoteButton.container} >
                        <TouchableOpacity style={NewNoteButton.button} onPress={handleNewNote}>
                            <FluentNoteAdd28Regular width={28} height={28} color={"white"} />
                        </TouchableOpacity>
                    </View>)
                }
            </SafeAreaView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1
    },

});


export function PageLayout_2({ children, addnote = true }: { children: React.ReactNode, addnote?: boolean }) {
    const navigation = useNavigation()

    return (
        <View style={styles_2.container}>
            <StatusBar style="dark" />
            {children}
            {
                addnote && (<View style={NewNoteButton.container} >
                    <TouchableOpacity style={NewNoteButton.button} onPress={() => navigation.navigate("noteeditor")}>
                        <MaterialIcons name="add" size={32} color="white" />
                    </TouchableOpacity>
                </View>)
            }
        </View>
    );
}

export function PageLayout_3({ children, addnote = true }: { children: React.ReactNode, addnote?: boolean }) {

    const [data, setData] = useState<{
        insets: EdgeInsets;
        frame: Rect;
    } | null>(null);

    return (
        <SafeAreaProvider>
            <View style={styles_2.container}>
                <StatusBar style="dark" />
                <SafeAreaView style={{ flex: 1 }}>
                    {children}
                </SafeAreaView>
            </View>
        </SafeAreaProvider>
    );
}

const styles_2 = StyleSheet.create({
    container: {
        flex: 1,
        position: 'relative'
    },

});