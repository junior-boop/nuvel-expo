import PageLayout from "@/components/page";
import { Text, View } from "@/components/Themed";
// import * as WebView from 'react-native-webview';

export default function NoteEditor() {
    return (
        <PageLayout>
            <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
                <View>
                    <View style={{ marginBottom: 20 }}>
                        <Text style={{ fontSize: 24, fontWeight: 'bold' }}>Note Editor</Text>
                    </View>
                    <View>
                        <Text style={{ fontSize: 16, color: '#666' }}>This is where the note editor will be implemented.</Text>
                    </View>
                </View>
            </View>

        </PageLayout>
    )
}