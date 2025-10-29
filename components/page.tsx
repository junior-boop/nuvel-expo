import { NewNoteButton } from '@/app/styles/cards';
import { View } from '@/components/Themed';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { useNavigation } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useEffect, useState } from 'react';
import { StyleSheet, TouchableOpacity } from 'react-native';
import { EdgeInsets, Rect, SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';

export default function PageLayout({ children, addnote = true }: { children: React.ReactNode, addnote?: boolean }) {
    const navigation = useNavigation()

    return (
        <View style={styles.container}>
            <StatusBar style="dark" />
            <SafeAreaView style={{ flex: 1, position: 'relative' }}>
                {children}
                {
                    addnote && (<View style={NewNoteButton.container} >
                        <TouchableOpacity style={NewNoteButton.button} onPress={() => navigation.navigate("noteeditor")}>
                            <MaterialIcons name="add" size={32} color="white" />
                        </TouchableOpacity>
                    </View>)
                }
            </SafeAreaView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1
    },

});


export function PageLayout_2({ children, addnote = true }: { children: React.ReactNode, addnote?: boolean }) {
    const navigation = useNavigation()

    return (
        <View style={styles_2.container}>
            <StatusBar style="dark" />
            {children}
            {
                addnote && (<View style={NewNoteButton.container} >
                    <TouchableOpacity style={NewNoteButton.button} onPress={() => navigation.navigate("noteeditor")}>
                        <MaterialIcons name="add" size={32} color="white" />
                    </TouchableOpacity>
                </View>)
            }
        </View>
    );
}

export function PageLayout_3({ children, addnote = true }: { children: React.ReactNode, addnote?: boolean }) {
    const navigation = useNavigation()
    const [data, setData] = useState<{
        insets: EdgeInsets;
        frame: Rect;
    } | null>(null);

    useEffect(() => {
        console.log(data)
    }, [data])

    return (
        <SafeAreaProvider>
            <View style={styles_2.container}>
                <StatusBar style="dark" />
                <SafeAreaView style={{ flex: 1 }}>
                    {children}
                </SafeAreaView>
            </View>
        </SafeAreaProvider>
    );
}

const styles_2 = StyleSheet.create({
    container: {
        flex: 1,
        position: 'relative'
    },

});