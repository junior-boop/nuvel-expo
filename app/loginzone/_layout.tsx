import { View } from '@/components/Themed';
import { Stack } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export default function LoginLayout() {
    const frame = useSafeAreaInsets()
    return (
        <>
            <Stack screenOptions={{ headerShown: false }}>
                <Stack.Screen name="index" />
                <Stack.Screen name="usersinfos" />
            </Stack>
            <View style={{ height: frame.bottom }} />
        </>
    );
}