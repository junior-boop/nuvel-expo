import { StyleSheet } from 'react-native';

import HeaderPage from '@/components/headerpage';
import AllNotesArchived from '@/components/notes/allnotesarchived';
import { View } from '@/components/Themed';
import { Stack } from 'expo-router';

export default function TabTwoScreen() {
    return (
        <View style={{ flex: 1 }}>
            <Stack.Screen options={{ headerShown: false }} />
            <HeaderPage />
            <AllNotesArchived />

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
