
import { PageLayout_3 } from '@/components/page';
import { Stack } from 'expo-router';

export const unstable_settings = {
    initialRouteName: 'index',
};

export default function TabTwoScreen() {
    return (
        <PageLayout_3>
            <Stack screenOptions={{ animation: 'none' }} />
        </PageLayout_3>
    );
}

