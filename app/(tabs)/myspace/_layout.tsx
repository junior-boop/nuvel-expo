import { Image } from 'react-native';

import { HeaderStyles } from '@/app/styles/cards';
import { Text, View } from '@/components/Themed';
import PageLayout from '@/components/page';
import { Link, Stack, useNavigation } from 'expo-router';

export const unstable_settings = {
    initialRouteName: 'index',
};

export default function TabTwoScreen() {
    const navigator = useNavigation();
    return (
        <PageLayout>
            <View style={{ ...HeaderStyles.container }}>
                <Image source={require("../../../assets/images/My_Space.png")} style={HeaderStyles.image} />
            </View>
            <View style={{ height: 32, borderBottomWidth: 1, borderBottomColor: '#eee', paddingHorizontal: 14, flexDirection: "row", gap: 25, alignItems: "flex-start", marginTop: 12 }}>
                <Link href="/myspace">
                    <Text style={{ fontSize: 16, fontWeight: 'bold' }}>Notes</Text>
                </Link>
                <Link href="/myspace/group">
                    <Text style={{ fontSize: 16 }}>Groupes</Text>
                </Link>
                <Link href="/myspace/archives">
                    <Text style={{ fontSize: 16 }}>Archives</Text>
                </Link>
            </View>
            <Stack screenOptions={{ animation: 'none' }} />
        </PageLayout >
    );
}