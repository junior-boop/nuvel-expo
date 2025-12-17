import { ActivityIndicator, Alert, Image, ScrollView, StyleSheet, TouchableOpacity } from 'react-native';

import { Text, View } from '@/components/Themed';
import { convert } from '@/constants/convert';
import { FluentImageAdd32Regular } from '@/constants/icons';
import { useDatabase } from '@/context/database.context';
import * as ImagePicker from 'expo-image-picker';
import { router } from 'expo-router';
import { useState } from 'react';


export default function Profils() {
    const { usersQuery, session, deletedUser } = useDatabase()
    const userinfo = usersQuery?.findById(session?.iduser as string)
    const [isLoading, setIsLoading] = useState(false)
    const [image, setImage] = useState<string | null>(null);
    const [file, setFile] = useState<{ name: string, mimeType: string, uri: string } | null>(null)



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

    const pickImage = async () => {
        const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();

        if (!permissionResult.granted) {
            Alert.alert('Permission required', 'Permission to access the media library is required.');
            return;
        }

        let result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ['images'],
            allowsEditing: true,
            aspect: [1, 1],
            quality: 1,
            base64: true
        });


        if (!result.canceled) {
            setFile({
                name: result.assets[0].fileName as string,
                mimeType: result.assets[0].mimeType as string,
                uri: result.assets[0].uri as string
            })
            const imagestring = `data:${result.assets[0].mimeType};base64,${result.assets[0].base64}`;
            setImage(imagestring);
        }
    };

    return (
        <ScrollView style={styles.container} contentContainerStyle={{ padding: convert(16) }} >
            <View style={{ flexDirection: 'row', alignItems: "stretch", gap: convert(14), justifyContent: 'center' }}>
                <TouchableOpacity style={{ width: convert(150), height: convert(150), position: 'relative', }} onPress={pickImage}>
                    <View style={{ width: convert(150), height: convert(150), borderRadius: convert(150), overflow: 'hidden' }}>
                        {
                            image
                                ? <Image
                                    style={{ width: convert(150), height: convert(150) }}
                                    source={{ uri: image }} />
                                : <Image
                                    style={{ width: convert(150), height: convert(150) }}
                                    source={require('@/assets/images/avatar.png')} />
                        }
                    </View>
                    <View
                        style={{ position: 'absolute', right: convert(0), bottom: convert(0), backgroundColor: '#048effff', borderRadius: convert(24), height: convert(48), width: convert(48), justifyContent: 'center', alignItems: 'center' }}>
                        <FluentImageAdd32Regular width={24} height={24} color={'#fff'} />
                    </View>
                </TouchableOpacity>
            </View>
            <View style={{ marginTop: convert(32), paddingHorizontal: convert(8) }}>
                <View style={{ marginBottom: convert(14), borderBottomWidth: 1, paddingBottom: convert(14), borderColor: '#eee' }}>
                    <Text style={styles.entete}>First Name</Text>
                    <Text style={{ fontSize: convert(16) }}>{userinfo?.name}</Text>
                </View>
                <View style={{ marginBottom: convert(14), borderBottomWidth: 1, paddingBottom: convert(14), borderColor: '#eee' }}>
                    <Text style={styles.entete}>Last Name</Text>
                    <Text style={{ fontSize: convert(16) }}>{userinfo?.first_name}</Text>
                </View>
                <View style={{ marginBottom: convert(14), borderBottomWidth: 1, paddingBottom: convert(14), borderColor: '#eee' }}>
                    <Text style={styles.entete}>Email adress</Text>
                    <Text style={{ fontSize: convert(16) }}>{userinfo?.email}</Text>
                </View>
                <View style={{ marginBottom: convert(14), borderBottomWidth: 1, paddingBottom: convert(14), borderColor: '#eee' }}>
                    <Text style={styles.entete}>Chruch Status</Text>
                    <Text style={{ fontSize: convert(16) }}>{userinfo?.church_status}</Text>
                </View>
                <View style={{ marginBottom: convert(14), borderBottomWidth: 1, paddingBottom: convert(14), borderColor: '#eee' }}>
                    <Text style={styles.entete}>Country</Text>
                    <Text style={{ fontSize: convert(16) }}>{userinfo?.country}</Text>
                </View>
                <View style={{ marginBottom: convert(14), borderBottomWidth: 1, paddingBottom: convert(14), borderColor: '#eee' }}>
                    <Text style={styles.entete}>Biography</Text>
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
    entete: {
        fontSize: convert(14),
        fontWeight: 'bold',
        color: '#000000ff',
    },
    separator: {
        marginVertical: 30,
        height: 1,
        width: '80%',
    },
});
