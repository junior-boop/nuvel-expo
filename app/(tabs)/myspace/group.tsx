import { ScrollView, StyleSheet, TextInput, TouchableOpacity } from 'react-native';

import HeaderPage from '@/components/headerpage';
import { Text, View } from '@/components/Themed';
import { w } from '@/constants/Colors';
import { FluentFolderOpenDown28Regular } from '@/constants/icons';
import { useDatabase } from '@/context/database.context';
import { Groups } from '@/Database/db';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { Link, Stack } from 'expo-router';
import moment from 'moment';
import { useEffect, useState } from 'react';


export default function TabTwoScreen() {
    const [value, onChangeText] = useState<string>('')
    const { addGroup, groupsQuery } = useDatabase();
    const [groups, setGroups] = useState<Groups[]>([]);


    const handleNewGroup = async () => {
        const newGroup = await addGroup({ name: value });
        onChangeText('');
    }

    useEffect(() => {
        setGroups(groupsQuery?.findAll() || []);
    }, [groupsQuery]);

    return (
        <View style={{ flex: 1 }}>
            <Stack.Screen options={{ headerShown: false }} />
            <HeaderPage />
            <View style={styles.container}>
                <View style={{ backgroundColor: '#f6f9ffff', paddingHorizontal: 11, borderBottomWidth: 1, borderColor: "#eff2fdff", height: 50, flexDirection: 'row', alignItems: 'center' }}>
                    <TextInput value={value} onChangeText={onChangeText} placeholderTextColor={"#8fa0acff"} placeholder="Ajouter un groupe" style={{ color: "#333", fontSize: 16, flex: 1, fontWeight: "bold" }} />
                    <TouchableOpacity style={{ padding: 8 }} onPress={handleNewGroup}>
                        <MaterialIcons name="add" size={28} color="#007AFF" />
                    </TouchableOpacity>
                </View>
                <ScrollView>
                    {
                        groups.map((group) => (
                            <Link href={{
                                pathname: "/groupeitems",
                                params: {
                                    id: group.id.toString()
                                }
                            }} style={{ padding: 14, borderBottomWidth: 1, borderColor: "#eee" }} key={group.id}>
                                <View>
                                    <Text style={{ fontSize: 18, marginBottom: 5, fontWeight: "bold", color: "#333", width: (w * 85 / 100), lineHeight: 25 }}>{group.name}</Text>
                                    <Text style={{ fontSize: 16, color: "#666", marginBottom: 5 }}>Créé le {moment(group.created).format('LL')}</Text>
                                </View>
                            </Link>
                        ))
                    }
                    {
                        groups.length === 0 && (<View style={{ height: "100%", width: w, paddingHorizontal: 14, alignItems: "center", marginTop: 40 }}>
                            <View style={{ height: 300, width: (w - 100), alignItems: "center", justifyContent: 'center' }}>
                                <FluentFolderOpenDown28Regular width={82} height={82} color={"#afafaf"} />
                                <Text style={{ fontSize: 18, color: "#999", fontWeight: 'bold' }}>Aucun dossier pour le moment</Text>
                            </View>
                        </View>)
                    }

                </ScrollView>
            </View>

        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    title: {
        fontSize: 20,
        fontWeight: 'bold',
    },
    separator: {
        marginVertical: 30,
        height: 1,
        width: '80%',
    },
});
