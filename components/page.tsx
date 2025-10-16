import { NewNoteButton } from '@/app/styles/cards';
import { View } from '@/components/Themed';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { useNavigation } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useEffect } from 'react';
import { StyleSheet, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function PageLayout({ children, addnote = true }: { children: React.ReactNode, addnote?: boolean }) {
    const navigation = useNavigation()


    useEffect(() => {
        console.log(navigation)
    })

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