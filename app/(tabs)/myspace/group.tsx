import { ScrollView, StyleSheet, TextInput, TouchableOpacity } from 'react-native';

import HeaderPage from '@/components/headerpage';
import { Text, View } from '@/components/Themed';
import { Groups } from '@/Database/db';
import * as Group from '@/Database/groups';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { Link, Stack } from 'expo-router';
import moment from 'moment';
import { useEffect, useState } from 'react';

const fetchGroups = async () => {
    const groupsData = await Group.getall();
    return groupsData;
};

const addGroup = async (name: string) => {
    const items = await Group.created({ name });
    return items;
}

export default function TabTwoScreen() {
    const [value, onChangeText] = useState<string>('')
    const [groups, setGroups] = useState<Groups[]>([]);

    useEffect(() => {
        (async () => {
            const data = await fetchGroups();
            setGroups(data);
        })();
    }, []);

    const handleNewGroup = async () => {
        const newGroup = await addGroup(value);
        setGroups([newGroup, ...groups]);
        onChangeText('');
    }


    return (
        <View style={{ flex: 1 }}>
            <Stack.Screen options={{ headerShown: false }} />
            <HeaderPage />
            <View style={styles.container}>
                <View style={{ backgroundColor: '#efefef', paddingHorizontal: 11, borderBottomWidth: 1, borderColor: "#eee", height: 50, flexDirection: 'row', alignItems: 'center' }}>
                    <TextInput value={value} onChangeText={onChangeText} placeholderTextColor={"#999"} placeholder="Ajouter un groupe" style={{ color: "#333", fontSize: 16, flex: 1, fontWeight: "bold" }} />
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
                                    <Text style={{ fontSize: 18, marginBottom: 5, fontWeight: "bold", color: "#333", width: "90%", lineHeight: 25 }}>{group.name}</Text>
                                    <Text style={{ fontSize: 16, color: "#666", marginBottom: 5 }}>Créé le {moment(group.created).format('LL')}</Text>
                                </View>
                            </Link>
                        ))
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
