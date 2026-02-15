import { PageLayout_3 } from "@/components/page";
import { Text, View } from "@/components/Themed";
// import * as WebView from 'react-native-webview';
import { useDatabase } from "@/context/database.context";
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { router, Stack, useLocalSearchParams, useNavigation } from "expo-router";
import { useEffect, useState } from "react";

import AllNotesFiltersGroup from "@/components/notes/allnoteingroup";
import { convert } from "@/constants/convert";
import { FluentNoteAdd28Regular } from "@/constants/icons";
import { Groups } from "@/Database/db";
import { ScrollView, TextInput, TouchableOpacity } from "react-native";
import { NewNoteButton } from "./styles/cards";

export default function GroupeItemps() {

    const { id } = useLocalSearchParams()
    const [group, setGroup] = useState<Partial<Groups> | null>(null)
    const [editTrue, setEditTrue] = useState(false)
    const [value, onChangeText] = useState<string>('')
    const navigation = useNavigation()

    // utilisation du contexte
    const { groupsQuery, deletedGroup, updatedGroup, addNote, notesQuery, session } = useDatabase()

    const getgroupe = () => {
        const items = groupsQuery?.findById(id as string)
        setGroup(items as Groups)
        if (items) onChangeText(items.name)
    }

    useEffect(() => {
        console.log(session)
    }, [id])


    const handleEdit = async (text: string) => {
        setGroup({ ...group, name: text })
        onChangeText(text)
    }

    const handleSaveEdit = async () => {
        await updatedGroup({ id: id as string, name: value })
        setEditTrue(false)
    }

    const handleDelete = async () => {
        const res = await deletedGroup(id as string, session?.iduser as string)
        if (res) navigation.goBack()
    }

    const handleNewNote = async () => {
        const placeholderText = `{"type":"doc","content":[{"type":"heading","attrs":{"textAlign":null,"level":1},"content":[{"type":"text","text":"Entrez votre titre"}]},{"type":"paragraph","attrs":{"textAlign":null},"content":[{"type":"text","text":"Écrivez votre note et autres ici."}]}]}`

        const result = await addNote({
            body: placeholderText,
            html: "<div>vide<vide>",
            pinned: false,
            archived: false,
            grouped: id as string,
            creator: session?.iduser
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

    useEffect(() => {
        getgroupe()
    }, [])
    return (
        <PageLayout_3>
            <Stack.Screen options={{
                headerRight: () => <TouchableOpacity style={{ width: 40, height: 40, justifyContent: 'center', alignItems: 'center' }} onPress={handleDelete}>
                    <MaterialIcons name="delete" size={24} color="black" />
                </TouchableOpacity>
            }} />
            <ScrollView >
                <View style={{ paddingHorizontal: 16 }}>
                    <View>
                        {
                            editTrue ? (
                                <TextInput multiline value={value} onChangeText={handleEdit} style={{ fontSize: 28, fontWeight: 'bold', marginTop: 10, padding: 0 }} autoFocus={true} />
                            ) : (
                                <Text style={{ fontSize: 28, fontWeight: 'bold', marginTop: 10 }}>{group?.name}</Text>

                            )}
                    </View>
                    <View style={{ flexDirection: "row" }}>
                        {
                            editTrue ? (
                                <View style={{ flexDirection: 'row', gap: 10 }}>
                                    <TouchableOpacity style={{ flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 7, paddingHorizontal: 10, paddingVertical: 5, backgroundColor: '#00e40b27', borderRadius: 3 }} onPress={handleSaveEdit}>
                                        <MaterialIcons name="check" size={18} color="#0d2c01ff" />
                                        <Text style={{ fontSize: 16, fontWeight: 'bold', color: "#0d2c01ff" }}>Save</Text>
                                    </TouchableOpacity>
                                    <TouchableOpacity style={{ flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 7, paddingHorizontal: 10, paddingVertical: 5, backgroundColor: '#0f0f0f17', borderRadius: 3 }} onPress={() => setEditTrue(false)}>
                                        <Text style={{ fontSize: 16, fontWeight: 'bold', color: "#0d2c01ff" }}>Cancel</Text>
                                    </TouchableOpacity>
                                </View>
                            ) : (
                                <TouchableOpacity style={{ flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 7, paddingHorizontal: 10, paddingVertical: 5, backgroundColor: '#f0f0f0', borderRadius: 3 }} onPress={() => setEditTrue(true)}>
                                    <MaterialIcons name="edit" size={18} color="black" />
                                    <Text style={{ fontSize: 16, fontWeight: 'bold', color: "#555" }}>Edit</Text>
                                </TouchableOpacity>
                            )
                        }
                    </View>
                </View>
                <View style={{ marginTop: convert(24) }}>
                    <AllNotesFiltersGroup id={id as string} />
                </View>
            </ScrollView>
            <View style={{ ...NewNoteButton.container, marginBottom: convert(14) }} >
                <TouchableOpacity style={NewNoteButton.button} onPress={handleNewNote}>
                    <FluentNoteAdd28Regular width={28} height={28} color={"white"} />
                </TouchableOpacity>
            </View>
        </PageLayout_3>
    )
}