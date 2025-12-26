import { ActivityIndicator, KeyboardAvoidingView, Platform, StyleSheet, TextInput, TouchableOpacity } from 'react-native';

import { Text, View } from '@/components/Themed';
import { w } from '@/constants/Colors';
import { convert } from '@/constants/convert';

import { StatusBar } from 'expo-status-bar';
import { useState } from 'react';

import useLogin from '@/lib/useLogin';

export default function ModalScreen() {
    const [name, setName] = useState('')
    const [first_name, setFirstName] = useState('')
    const [email, setEmail] = useState('')
    const { handleUser, loading } = useLogin({ name, first_name, email })

    return (

        <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"} style={styles.container}>
            <StatusBar style="dark" />
            <View style={styles.container}>
                <View style={{ width: (w * 80 / 100), gap: convert(12) }}>
                    <Text style={{ fontSize: convert(32), fontWeight: "900" }}> Let Log In</Text>
                    <View>
                        <TextInput style={{ paddingHorizontal: convert(12), paddingVertical: convert(12), fontSize: convert(18), fontWeight: "700", color: '#444', borderWidth: 1, borderColor: "#ccc" }} placeholder='first name' placeholderTextColor={"#ccc"} onChangeText={(e) => { console.log(e); setName(e) }} keyboardType='default' />
                    </View>
                    <View>
                        <TextInput style={{ paddingHorizontal: convert(12), paddingVertical: convert(12), fontSize: convert(18), fontWeight: "700", color: '#444', borderWidth: 1, borderColor: "#ccc" }} placeholder='Last Name' placeholderTextColor={"#ccc"} onChangeText={(e) => { console.log(e); setFirstName(e) }} keyboardType='default' />
                    </View>
                    <View>
                        <TextInput style={{ paddingHorizontal: convert(12), paddingVertical: convert(12), fontSize: convert(18), fontWeight: "700", color: '#444', borderWidth: 1, borderColor: "#ccc" }} placeholder='Type your email address' placeholderTextColor={"#ccc"} inputMode='email' onChangeText={(e) => { console.log(e); setEmail(e) }} keyboardType='email-address' autoCapitalize='none' autoCorrect={false} />
                    </View>
                    <View>
                        <TouchableOpacity style={{ backgroundColor: "#0083ff", paddingHorizontal: convert(18), paddingVertical: convert(12), alignItems: 'center', flexDirection: 'row', gap: convert(8), justifyContent: 'center' }} onPress={handleUser} disabled={loading} >
                            <Text style={{ fontSize: convert(18), fontWeight: "700", color: '#fff' }}>Connect</Text>
                            {loading && <ActivityIndicator size="small" color="#fff" />}
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
