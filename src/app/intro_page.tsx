import { PageLayout_3 } from "@/components/page";
import { Text, View } from "@/components/Themed";
import { convert } from "@/constants/convert";
import { Image } from "expo-image";
import { router } from "expo-router";
import { StyleSheet, TouchableOpacity } from "react-native";

export default function IntroPage() {
    return (
        <PageLayout_3 addnote={false}>
            <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', paddingHorizontal: convert(16) }}>
                <Image source={require("../../assets/images/intro_page.png")} style={{ width: "100%", height: 'auto', }} />

                <Text style={styles.tagline}>
                    A quiet place to read, reflect, and grow in your faith — one article at a time.
                </Text>

                <TouchableOpacity
                    style={styles.button}
                    onPress={() => router.replace('/login' as never)}
                >
                    <Text style={styles.buttonText}>Get Started</Text>
                </TouchableOpacity>
            </View>
        </PageLayout_3>
    );
}

const styles = StyleSheet.create({
    tagline: {
        fontSize: convert(16),
        fontWeight: '500',
        color: '#797979',
        textAlign: 'left',
        lineHeight: convert(24),
        marginTop: convert(24),
        marginBottom: convert(32),
    },
    button: {
        backgroundColor: '#0083ff',
        paddingHorizontal: convert(32),
        paddingVertical: convert(14),
        alignItems: 'center',
        justifyContent: 'center',
        width: '100%',
    },
    buttonText: {
        fontSize: convert(16),
        fontWeight: '700',
        color: '#fff',
    },
});