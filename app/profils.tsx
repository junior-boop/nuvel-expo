import { ActivityIndicator, Image, ScrollView, StyleSheet, TouchableOpacity } from 'react-native';

import { Text, View } from '@/components/Themed';
import { convert } from '@/constants/convert';
import { useDatabase } from '@/context/database.context';
import { router } from 'expo-router';
import { useState } from 'react';


export default function Profils() {
    const { usersQuery, session, deletedUser } = useDatabase()
    const userinfo = usersQuery?.findById(session?.iduser as string)
    const [isLoading, setIsLoading] = useState(false)



    const handleDelete = () => {
        setIsLoading(true)
        setTimeout(async () => {
            const result = await deletedUser(session?.iduser as string)
            if (result) {
                router.replace({
                    pathname: '/login'
                })
            }
        }, 2000)
        setIsLoading(false)
    }

    return (
        <ScrollView style={styles.container} contentContainerStyle={{ padding: convert(16) }} >
            <View style={{ flexDirection: 'row', alignItems: "stretch", gap: convert(14), justifyContent: 'center' }}>
                <View>
                    <Image
                        source={userinfo?.photo ? { uri: userinfo?.photo } : require("../assets/images/avatar.png")}
                        style={{ width: convert(100), height: convert(100), borderRadius: convert(60), borderWidth: 1, borderColor: '#eee' }}
                    />
                </View>
                <View style={{ justifyContent: 'flex-end', paddingBottom: convert(10) }}>
                    <Text style={{ fontSize: convert(24), fontWeight: 'bold', width: convert(180) }}>{userinfo?.name} {userinfo?.first_name}</Text>
                    <Text style={{ fontSize: convert(18), fontWeight: 'bold', color: '#777', width: convert(180) }}>{userinfo?.church_status} - {userinfo?.domination} - {userinfo?.email}</Text>
                </View>
            </View>
            <View style={{ marginTop: convert(32), paddingHorizontal: convert(8) }}>
                <Text style={{ ...styles.title, marginBottom: convert(16) }}>Profils information</Text>
                <View style={{ marginBottom: convert(14), borderBottomWidth: 1, paddingBottom: convert(14), borderColor: '#eee' }}>
                    <Text style={{ fontSize: convert(16), fontWeight: 'bold' }}>First Name</Text>
                    <Text style={{ fontSize: convert(16) }}>{userinfo?.name}</Text>
                </View>
                <View style={{ marginBottom: convert(14), borderBottomWidth: 1, paddingBottom: convert(14), borderColor: '#eee' }}>
                    <Text style={{ fontSize: convert(16), fontWeight: 'bold' }}>Last Name</Text>
                    <Text style={{ fontSize: convert(16) }}>{userinfo?.first_name}</Text>
                </View>
                <View style={{ marginBottom: convert(14), borderBottomWidth: 1, paddingBottom: convert(14), borderColor: '#eee' }}>
                    <Text style={{ fontSize: convert(16), fontWeight: 'bold' }}>Email adress</Text>
                    <Text style={{ fontSize: convert(16) }}>{userinfo?.email}</Text>
                </View>
                <View style={{ marginBottom: convert(14), borderBottomWidth: 1, paddingBottom: convert(14), borderColor: '#eee' }}>
                    <Text style={{ fontSize: convert(16), fontWeight: 'bold' }}>Chruch Status</Text>
                    <Text style={{ fontSize: convert(16) }}>{userinfo?.church_status}</Text>
                </View>
                <View style={{ marginBottom: convert(14), borderBottomWidth: 1, paddingBottom: convert(14), borderColor: '#eee' }}>
                    <Text style={{ fontSize: convert(16), fontWeight: 'bold' }}>Domination</Text>
                    <Text style={{ fontSize: convert(16) }}>{userinfo?.domination}</Text>
                </View>
                <View style={{ marginBottom: convert(14), borderBottomWidth: 1, paddingBottom: convert(14), borderColor: '#eee' }}>
                    <Text style={{ fontSize: convert(16), fontWeight: 'bold' }}>Biography</Text>
                    <Text style={{ fontSize: convert(16) }}>{userinfo?.biography}</Text>
                </View>

                <TouchableOpacity onPress={handleDelete} style={{ marginTop: convert(24), alignItems: 'center', borderWidth: 1, borderColor: "rgba(250, 36, 36, 1)", paddingVertical: convert(12), backgroundColor: "#fff5f5ff", justifyContent: 'center', flexDirection: 'row', gap: convert(6) }}>
                    <Text style={{ fontSize: convert(16), fontWeight: 'bold', color: "rgba(250, 36, 36, 1)", }}>Log Out</Text>
                    {
                        isLoading && <ActivityIndicator size={'small'} color={"rgba(250, 36, 36, 1)"} />
                    }
                </TouchableOpacity>
            </View>

        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1
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
