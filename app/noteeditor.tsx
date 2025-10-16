import PageLayout from "@/components/page";
import { View } from "@/components/Themed";
import * as WebView from 'react-native-webview';

export default function NoteEditor() {
    return (
        <PageLayout>
            <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
                <View>
                    <View style={{ marginBottom: 20 }}>
                        <View style={{ fontSize: 24, fontWeight: 'bold' }}>Note Editor</View>
                    </View>
                    <View>
                        <View style={{ fontSize: 16, color: '#666' }}>This is where the note editor will be implemented.</View>
                    </View>
                </View>
            </View>
            <WebView.WebView
                source={{ html: "<h1>Note Editor</h1>" }}
                style={{ flex: 1 }}
            />
        </PageLayout>
    )
}