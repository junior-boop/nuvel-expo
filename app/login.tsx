import { KeyboardAvoidingView, Platform, StyleSheet, TextInput, TouchableOpacity } from 'react-native';

import { Text, View } from '@/components/Themed';
import { w } from '@/constants/Colors';
import { convert } from '@/constants/convert';
import { User } from '@/Database/db';

import { router } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useCallback, useState } from 'react';

import { useDatabase } from '@/context/database.context';

export default function ModalScreen() {
    const [name, setName] = useState('')
    const [first_name, setFirstName] = useState('')
    const [email, setEmail] = useState('')
    const [isloading, setIsloading] = useState(false)

    const { adduser } = useDatabase()

    const getuserinfo = useCallback(async (data: Partial<User>) => {
        setIsloading(true)
        const response = await fetch('https://nuvelserver.godigital.workers.dev/users/signin', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(data),
        });
        const result = await response.json() as { data: User, status: string };
        setIsloading(false)
        return await adduser(result.data)
    }, [])

    const handleUser = async () => {
        const user = await getuserinfo({ name, first_name, email })
        setName('')
        setEmail('')
        setFirstName('')
        router.replace({
            pathname: "/(tabs)",
            params: {
                id: user?.id,
                name: user?.name,
                email: user?.email
            }
        })
    }
    return (

        <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"} style={styles.container}>
            <StatusBar style="dark" />
            <View style={styles.container}>
                <View style={{ width: (w * 80 / 100), gap: convert(12) }}>
                    <Text style={{ fontSize: convert(32), fontWeight: "900" }}> Let Log In</Text>
                    <View>
                        <TextInput style={{ paddingHorizontal: convert(12), paddingVertical: convert(12), fontSize: convert(18), fontWeight: "700", color: '#444', borderWidth: 1, borderColor: "#ccc" }} placeholder='first name' placeholderTextColor={"#ccc"} onChangeText={(e) => setName(e)} />
                    </View>
                    <View>
                        <TextInput style={{ paddingHorizontal: convert(12), paddingVertical: convert(12), fontSize: convert(18), fontWeight: "700", color: '#444', borderWidth: 1, borderColor: "#ccc" }} placeholder='Last Name' placeholderTextColor={"#ccc"} onChangeText={(e) => setFirstName(e)} />
                    </View>
                    <View>
                        <TextInput style={{ paddingHorizontal: convert(12), paddingVertical: convert(12), fontSize: convert(18), fontWeight: "700", color: '#444', borderWidth: 1, borderColor: "#ccc" }} placeholder='Type your email address' placeholderTextColor={"#ccc"} inputMode='email' onChangeText={(e) => setEmail(e)} />
                    </View>
                    <View>
                        <TouchableOpacity style={{ backgroundColor: "#0083ff", paddingHorizontal: convert(18), paddingVertical: convert(12), alignItems: 'center' }} onPress={handleUser} disabled={isloading} >
                            <Text style={{ fontSize: convert(18), fontWeight: "700", color: '#fff' }}>Connect</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </View>
        </KeyboardAvoidingView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#fff'
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
