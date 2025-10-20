import { KeyboardAvoidingView, Platform, StyleSheet, TextInput } from 'react-native';

import { Text, View } from '@/components/Themed';
import { w } from '@/constants/Colors';
import { convert } from '@/constants/convert';

export default function ModalScreen() {
    return (

        <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"} style={styles.container}>
            <View style={styles.container}>
                <View style={{ width: (w * 80 / 100), gap: convert(12) }}>
                    <Text style={{ fontSize: convert(32), fontWeight: "900" }}> Let Log In</Text>
                    <View>
                        <TextInput style={{ paddingHorizontal: convert(12), paddingVertical: convert(12), fontSize: convert(18), fontWeight: "700", color: '#444', borderWidth: 1, borderColor: "#ccc" }} placeholder='Complet name' placeholderTextColor={"#ccc"} />
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
