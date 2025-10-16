import { PageLayout_2 } from "@/components/page";
import { Text, View } from "@/components/Themed";
// import * as WebView from 'react-native-webview';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { Stack, useLocalSearchParams, useNavigation } from "expo-router";
import { useCallback, useEffect, useState } from "react";

import { Groups } from "@/Database/db";
import * as Groupe from '@/Database/groups';
import { ScrollView, TextInput, TouchableOpacity } from "react-native";

const getGroupItems = async (id: string) => {
    const items = await Groupe.get(id);
    return items;
}

export default function GroupeItemps() {
    const { id } = useLocalSearchParams()
    const [group, setGroup] = useState<Partial<Groups> | null>(null)
    const [editTrue, setEditTrue] = useState(false)
    const navigation = useNavigation()

    const getgroupe = useCallback(async () => {
        const items = await getGroupItems(id as string);
        console.log(items)
        setGroup(items)
    }, [])

    const handleEdit = async (text: string) => {
        setGroup({ ...group, name: text })
        await Groupe.updated({ id: group?.id, name: text })
    }

    const handleDelete = async () => {
        const res = await Groupe.deleted(id as string)
        if (res) navigation.goBack()
    }

    useEffect(() => {
        getgroupe()
    }, [getgroupe])
    return (
        <PageLayout_2>
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
                                <TextInput multiline value={group?.name} onChangeText={handleEdit} style={{ fontSize: 28, fontWeight: 'bold', marginTop: 10, padding: 0 }} autoFocus={true} />
                            ) : (
                                <Text style={{ fontSize: 28, fontWeight: 'bold', marginTop: 10 }}>{group?.name}</Text>

                            )}
                    </View>
                    <View style={{ flexDirection: "row" }}>
                        {
                            editTrue ? (
                                <View style={{ flexDirection: 'row', gap: 10 }}>
                                    <TouchableOpacity style={{ flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 7, paddingHorizontal: 10, paddingVertical: 5, backgroundColor: '#00e40b27', borderRadius: 3 }} onPress={() => setEditTrue(false)}>
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
            </ScrollView>
        </PageLayout_2>
    )
}