import { StyleSheet } from 'react-native';

import HeaderPage from '@/components/headerpage';
import { Text, View } from '@/components/Themed';
import { Stack } from 'expo-router';

export default function TabTwoScreen() {
    return (
        <View style={{ flex: 1 }}>
            <Stack.Screen options={{ headerShown: false }} />
            <HeaderPage />
            <View style={styles.container}>
                <Text style={styles.title}>Tab Two</Text>
                <View style={styles.separator} lightColor="#eee" darkColor="rgba(255,255,255,0.1)" />
                <Text>archives</Text>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
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
