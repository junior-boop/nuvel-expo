
import PageLayout from '@/components/page';
import { Stack, useNavigation } from 'expo-router';

export const unstable_settings = {
    initialRouteName: 'index',
};

export default function TabTwoScreen() {
    const navigator = useNavigation();
    return (
        <PageLayout>
            <Stack screenOptions={{ animation: 'none' }} />
        </PageLayout >
    );
}

