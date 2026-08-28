import { ActivityIndicator, Alert, Image, ScrollView, StyleSheet, TextInput, TouchableOpacity } from 'react-native';

import { Text, View } from '@/components/Themed';
import { convert } from '@/constants/convert';
import { FluentEdit32Regular, FluentImageAdd32Regular } from '@/constants/icons';
import { server_url } from '@/constants/server_url';
import { useAuth } from '@/context/auth.context';
import { useDatabase } from '@/context/database.context';
import { User as UserType } from '@/Database/db';
import * as ImagePicker from 'expo-image-picker';
import { useNavigation } from 'expo-router';
import { useEffect, useLayoutEffect, useMemo, useState } from 'react';

interface Country {
    id: string;
    name: string;
    code_2: string;
    code_3: string;
    phoneCode: string;
}

const CHURCH_STATUSES: UserType['church_status'][] = ['Pastor', 'Elder', 'Deacon', 'Leader', 'Member'];

export default function Profils() {
    const { usersQuery, session, clearAllUserData, updatedUser } = useDatabase()
    const { logout } = useAuth()
    const navigation = useNavigation()
    const userinfo = usersQuery?.findById(session?.iduser as string)

    const [isLoading, setIsLoading] = useState(false)
    const [saving, setSaving] = useState(false)
    const [editing, setEditing] = useState(false)
    const [country, setCountry] = useState<Country | null>(null)

    const [image, setImage] = useState<string | null>(userinfo?.photo ?? null);
    const [file, setFile] = useState<{ name: string, mimeType: string, uri: string } | null>(null)
    const [name, setName] = useState(userinfo?.name ?? '')
    const [firstName, setFirstName] = useState(userinfo?.first_name ?? '')
    const [biography, setBiography] = useState(userinfo?.biography ?? '')
    const [churchStatus, setChurchStatus] = useState<UserType['church_status']>(userinfo?.church_status ?? 'Member')

    const initial = useMemo(() => ({
        name: userinfo?.name ?? '',
        first_name: userinfo?.first_name ?? '',
        biography: userinfo?.biography ?? '',
        church_status: userinfo?.church_status ?? 'Member',
        photo: userinfo?.photo ?? null,
    }), [userinfo?.name, userinfo?.first_name, userinfo?.biography, userinfo?.church_status, userinfo?.photo])

    const resetForm = () => {
        setName(initial.name)
        setFirstName(initial.first_name)
        setBiography(initial.biography)
        setChurchStatus(initial.church_status)
        setImage(initial.photo)
        setFile(null)
    }

    const handleLogout = () => {
        Alert.alert(
            'Log out',
            'This will delete all your local content. Continue?',
            [
                { text: 'Cancel', style: 'cancel' },
                {
                    text: 'Log out',
                    style: 'destructive',
                    onPress: async () => {
                        try {
                            setIsLoading(true)
                            await clearAllUserData()
                            await logout()
                        } finally {
                            setIsLoading(false)
                        }
                    },
                },
            ],
        )
    }

    const uploadPhoto = async (userId: string): Promise<string | null> => {
        if (!file) return null
        const form = new FormData()
        form.append('images', { uri: file.uri, type: file.mimeType, name: file.name } as any)
        const res = await fetch(`${server_url}/image/${userId}`, { method: 'POST', body: form })
        if (!res.ok) return null
        const json = await res.json()
        return json.url ?? null
    }

    const handleSave = async () => {
        if (!userinfo) return
        if (!name.trim() || !firstName.trim()) {
            Alert.alert('Missing fields', 'Name and last name are required.')
            return
        }
        try {
            setSaving(true)

            let nextPhoto = userinfo.photo
            if (file) {
                const uploaded = await uploadPhoto(userinfo.id)
                if (!uploaded) {
                    Alert.alert('Error', 'Photo upload failed. Please try again.')
                    return
                }
                nextPhoto = uploaded
            }

            const updated: UserType = {
                ...userinfo,
                name: name.trim(),
                first_name: firstName.trim(),
                biography: biography.trim(),
                church_status: churchStatus,
                photo: nextPhoto,
                modified: new Date().toISOString(),
            }

            const res = await fetch(`${server_url}/users/${userinfo.id}/update-infos`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(updated),
            })
            if (!res.ok) {
                Alert.alert('Error', 'Server update failed.')
                return
            }

            await updatedUser(updated)
            setFile(null)
            setEditing(false)
        } catch (e) {
            console.error('[Profils] save error:', e)
            Alert.alert('Error', 'Network error. Please try again.')
        } finally {
            setSaving(false)
        }
    }

    const revealCountry = async () => {
        try {
            const req = await fetch(`${server_url}/countries/all-country`)
            const res = await req.json()
            const match = res.data.filter((item: any) => item.id === userinfo?.country)
            setCountry(match[0] as Country)
        } catch (e) {
            if (__DEV__) console.log('[Profils] revealCountry:', e)
        }
    }

    const pickImage = async () => {
        if (!editing) {
            setEditing(true)
            return
        }
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
            const asset = result.assets[0]
            // allowsEditing:true renvoie souvent un asset recadré sans fileName/mimeType (surtout iOS)
            const mimeType = asset.mimeType ?? 'image/jpeg'
            const extension = mimeType.split('/')[1] ?? 'jpg'
            setFile({
                name: asset.fileName ?? `photo_${Date.now()}.${extension}`,
                mimeType,
                uri: asset.uri
            })
            const imagestring = `data:${mimeType};base64,${asset.base64}`;
            setImage(imagestring);
        }
    };

    useEffect(() => {
        revealCountry()
    }, [userinfo?.country])

    useLayoutEffect(() => {
        navigation.setOptions({
            headerRight: () =>
                editing ? null : (
                    <TouchableOpacity onPress={() => setEditing(true)} style={{ paddingHorizontal: convert(8), backgroundColor: 'rgb(233, 233, 233)', paddingVertical: convert(8), borderRadius: convert(20) }}>
                        <FluentEdit32Regular width={20} height={20} color="#000" />
                    </TouchableOpacity>
                ),
        })
    }, [navigation, editing])

    const renderField = (label: string, value: string, onChange: (v: string) => void, multiline = false) => (
        <View style={{ ...styles.fieldRow, paddingBottom: !editing ? convert(14) : 0 }}>
            <Text style={styles.entete}>{label}</Text>
            {editing ? (
                <TextInput
                    value={value}
                    onChangeText={onChange}
                    multiline={multiline}
                    style={[styles.input, multiline && { minHeight: convert(72), textAlignVertical: 'top' }]}
                    placeholderTextColor="#999"
                    placeholder={label}
                />
            ) : (
                <Text style={{ fontSize: convert(16) }}>{value || '—'}</Text>
            )}
        </View>
    )

    const photoUri = file
        ? image
        : image
            ? `https://${image}`
            : null

    return (
        <ScrollView style={styles.container} contentContainerStyle={{ padding: convert(16) }} >
            <View style={{ flexDirection: 'row', alignItems: "stretch", gap: convert(14), justifyContent: 'center' }}>
                <TouchableOpacity style={{ width: convert(150), height: convert(150), position: 'relative', }} onPress={pickImage}>
                    <View style={{ width: convert(150), height: convert(150), borderRadius: convert(150), overflow: 'hidden' }}>
                        {photoUri
                            ? <Image style={{ width: convert(150), height: convert(150) }} source={{ uri: photoUri }} />
                            : <Image style={{ width: convert(150), height: convert(150) }} source={require('@/assets/images/avatar.png')} />
                        }
                    </View>
                    {editing && (
                        <View
                            style={{ position: 'absolute', right: convert(0), bottom: convert(0), backgroundColor: '#048effff', borderRadius: convert(24), height: convert(48), width: convert(48), justifyContent: 'center', alignItems: 'center' }}>
                            <FluentImageAdd32Regular width={24} height={24} color={'#fff'} />
                        </View>
                    )}
                </TouchableOpacity>
            </View>

            <View style={{ marginTop: convert(16), paddingHorizontal: convert(8) }}>
                {renderField('First Name', name, setName)}
                {renderField('Last Name', firstName, setFirstName)}

                <View style={{ ...styles.fieldRow, paddingBottom: convert(14) }}>
                    <Text style={styles.entete}>Email adress</Text>
                    <Text style={{ fontSize: convert(16), color: editing ? '#999' : undefined }}>{userinfo?.email}</Text>
                </View>

                <View style={{ ...styles.fieldRow, paddingBottom: !editing ? convert(14) : convert(6) }}>
                    <Text style={styles.entete}>Church Status</Text>
                    {editing ? (
                        <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: convert(8), marginTop: convert(6) }}>
                            {CHURCH_STATUSES.map(s => {
                                const active = churchStatus === s
                                return (
                                    <TouchableOpacity
                                        key={s}
                                        onPress={() => setChurchStatus(s)}
                                        style={{
                                            paddingHorizontal: convert(12), paddingVertical: convert(6),
                                            borderRadius: convert(0), borderWidth: 1,
                                            borderColor: active ? '#048effff' : '#ccc',
                                            backgroundColor: active ? '#048effff' : 'transparent',
                                        }}>
                                        <Text style={{ color: active ? '#fff' : '#333', fontSize: convert(14), fontWeight: active ? 'bold' : 'regular' }}>{s}</Text>
                                    </TouchableOpacity>
                                )
                            })}
                        </View>
                    ) : (
                        <Text style={{ fontSize: convert(16) }}>{userinfo?.church_status}</Text>
                    )}
                </View>

                <View style={{ ...styles.fieldRow, paddingBottom: convert(14) }}>
                    <Text style={styles.entete}>Country</Text>
                    <Text style={{ fontSize: convert(16) }}>{country ? `${country.name}, ${country.code_2}` : '—'}</Text>
                </View>

                {renderField('Biography', biography, setBiography, true)}

                {editing ? (
                    <>
                        <TouchableOpacity
                            disabled={saving}
                            onPress={handleSave}
                            style={{ marginTop: convert(24), alignItems: 'center', borderWidth: 1, borderColor: '#048effff', paddingVertical: convert(12), backgroundColor: '#eaf6ffff', justifyContent: 'center', flexDirection: 'row', gap: convert(6) }}>
                            <Text style={{ fontSize: convert(16), fontWeight: 'bold', color: '#048effff' }}>Save</Text>
                            {saving && <ActivityIndicator size={'small'} color={'#048effff'} />}
                        </TouchableOpacity>
                        <TouchableOpacity
                            disabled={saving}
                            onPress={() => { resetForm(); setEditing(false) }}
                            style={{ marginTop: convert(12), alignItems: 'center', borderWidth: 1, borderColor: '#cccccc', paddingVertical: convert(12), backgroundColor: '#f7f7f7ff', justifyContent: 'center', flexDirection: 'row', gap: convert(6) }}>
                            <Text style={{ fontSize: convert(16), fontWeight: 'bold', color: '#333333' }}>Cancel</Text>
                        </TouchableOpacity>
                    </>
                ) : (
                    <TouchableOpacity onPress={handleLogout} style={{ marginTop: convert(24), alignItems: 'center', borderWidth: 1, borderColor: "rgba(250, 36, 36, 1)", paddingVertical: convert(12), backgroundColor: "#fff5f5ff", justifyContent: 'center', flexDirection: 'row', gap: convert(6) }}>
                        <Text style={{ fontSize: convert(16), fontWeight: 'bold', color: "rgba(250, 36, 36, 1)", }}>Log Out</Text>
                        {isLoading && <ActivityIndicator size={'small'} color={"rgba(250, 36, 36, 1)"} />}
                    </TouchableOpacity>
                )}
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
    fieldRow: {
        marginBottom: convert(14),
        borderBottomWidth: 1,
        borderColor: '#eee',
    },
    input: {
        fontSize: convert(16),
        paddingVertical: convert(6),
        paddingHorizontal: convert(8),
        borderWidth: 1,
        borderColor: 'rgba(247, 247, 247, 0.42)',
        backgroundColor: '#f7f7f7ff',
        borderRadius: convert(0),
        marginTop: convert(6),
        color: '#000',
    },
    btnPrimary: {
        backgroundColor: '#048effff',
        paddingHorizontal: convert(16),
        paddingVertical: convert(8),
        borderRadius: convert(6),
        alignItems: 'center',
        justifyContent: 'center',
        minWidth: convert(80),
    },
    btnSecondary: {
        backgroundColor: 'transparent',
        borderWidth: 1,
        borderColor: '#ccc',
        paddingHorizontal: convert(16),
        paddingVertical: convert(8),
        borderRadius: convert(6),
        alignItems: 'center',
        justifyContent: 'center',
        minWidth: convert(80),
    },
    separator: {
        marginVertical: 30,
        height: 1,
        width: '80%',
    },
});
