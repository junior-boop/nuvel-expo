import { PageLayout_3 } from "@/components/page";
import { View } from "@/components/Themed";
import { convert } from "@/constants/convert";
import { ScrollView, StyleSheet, Text } from "react-native";

export default function HistoryPage() {
    return (
        <PageLayout_3>
            <ScrollView contentContainerStyle={{ paddingBottom: 100, paddingHorizontal: convert(16), paddingTop: convert(16) }}>
                <Text style={{ ...styles.title, marginBottom: convert(16) }}>History</Text>
                <View style={{ marginBottom: 24 }}>
                    <Text style={{ fontSize: convert(16), color: "#777", fontStyle: 'italic' }}>
                        Download the Bible version you need to use
                    </Text>
                </View>
                <View style={{ gap: convert(8) }}>

                </View>
            </ScrollView>
        </PageLayout_3>
    )
}

const HistoryItem = () => {
    return (
        <View>
            <Text>History Item</Text>
        </View>
    )
}

const styles = StyleSheet.create({
    container: {
        flex: 1
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