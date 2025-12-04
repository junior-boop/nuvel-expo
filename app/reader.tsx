import { Text, View } from "@/components/Themed";
import { w } from "@/constants/Colors";
import { convert } from "@/constants/convert";
import { IcBaselineArrowBack, RiDownload2Line, RiMessageLine, RiOpenArmLine, RiShareForwardLine } from "@/constants/icons";
import ReaderHtml from "@/editor/readerhtml";
import BottomSheet, { BottomSheetFooter, BottomSheetView } from "@gorhom/bottom-sheet";
import { router, useLocalSearchParams } from "expo-router";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Keyboard, KeyboardAvoidingView, Platform, StyleSheet, TextInput, TouchableOpacity } from "react-native";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { useSafeAreaInsets } from "react-native-safe-area-context";

export default function ReaderPage() {
    const frame = useSafeAreaInsets()
    const { article } = useLocalSearchParams()
    const [author, setAuthor] = useState({})
    const [comment, setComment] = useState(false)
    const [keyboardHeight, setKeyboardHeight] = useState(0)
    const [keyboardState, setKeyboardState] = useState(false)
    const note = JSON.parse(article as string)

    const sheetRef = useRef<BottomSheet>(null);
    const snapPoints = useMemo(() => ["50%", "96%"], []);

    const fetchAutor = useCallback(async () => {
        const response = await fetch(`https://nuvelserver.godigital.workers.dev/users/${note.userid}`)
        const data = await response.json()
        setAuthor(data)
    }, [])

    const renderFooter = useCallback(
        props => (
            <BottomSheetFooter {...props} bottomInset={keyboardHeight}>
                <View style={{ backgroundColor: 'white', paddingVertical: convert(5), paddingHorizontal: convert(16) }}>
                    <TextInput
                        style={{ width: w - convert(32), minHeight: convert(42), borderRadius: convert(8), color: '#494949ff', fontSize: convert(16) }}
                        placeholder="Write a comment"
                        placeholderTextColor="#777"
                        multiline
                        numberOfLines={5}
                        textAlignVertical="top"
                        textAlign="left"
                        onPress={() => { sheetRef.current?.expand() }}
                        keyboardType="email-address"
                        textContentType="none"
                        autoCapitalize="none"
                        autoCorrect={true}

                    />
                </View>
            </BottomSheetFooter>
        ),
        [keyboardHeight]
    );

    // ✅ Gestion du clavier - CORRIGÉ
    useEffect(() => {
        // Enregistrer les deux listeners en même temps
        const showListener = Keyboard.addListener('keyboardDidShow', (e) => {
            setKeyboardHeight(e.endCoordinates.height)
            setKeyboardState(true)
        })

        const hideListener = Keyboard.addListener('keyboardDidHide', () => {
            setKeyboardHeight(0)
            setKeyboardState(false)
        })

        // Cleanup : supprimer les listeners au démontage
        return () => {
            showListener.remove()
            hideListener.remove()
        }
    }, []) // ✅ Dépendances vides = une seule fois au montage

    useEffect(() => {
        fetchAutor()
    }, [])

    return (
        <GestureHandlerRootView style={{
            flex: 1,
            backgroundColor: 'white',
            position: 'relative'
        }}>
            <View style={{ height: frame.top }} />
            <View style={{ height: convert(52), backgroundColor: 'white', flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: convert(16) }}>
                <TouchableOpacity onPress={() => { router.back() }}>
                    <IcBaselineArrowBack width={24} height={24} color={'black'} />
                </TouchableOpacity>
            </View>
            <ReaderHtml note={JSON.parse(article as string)} author={author} />
            <View style={{ height: 52, width: w, backgroundColor: 'white', elevation: convert(12), justifyContent: 'center' }}>
                <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-around', paddingHorizontal: convert(16) }}>
                    <TouchableOpacity style={styles.btn_appreciation}>
                        <RiOpenArmLine width={24} height={24} color={'#777'} />
                        <Text style={{ fontSize: convert(18), fontWeight: 'bold' }}>22</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                        onPress={() => { setComment(true) }}
                        style={styles.btn_appreciation}>
                        <RiMessageLine width={24} height={24} color={'#777'} />
                        <Text style={{ fontSize: convert(18), fontWeight: 'bold' }}>210</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.btn_appreciation}>
                        <RiShareForwardLine width={24} height={24} color={'#777'} />
                        <Text style={{ fontSize: convert(18), fontWeight: 'bold' }}>12</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.btn_appreciation}>
                        <RiDownload2Line width={24} height={24} color={'#777'} />
                    </TouchableOpacity>
                </View>
            </View>
            {
                comment && (<BottomSheet
                    ref={sheetRef}
                    snapPoints={snapPoints}
                    enableDynamicSizing={false}
                    enablePanDownToClose={true}
                    enableContentPanningGesture={true}
                    footerComponent={renderFooter}
                    onClose={() => { setComment(false); Keyboard.dismiss() }}
                    containerStyle={{ backgroundColor: '#0003' }}

                >
                    <KeyboardAvoidingView
                        behavior={Platform.OS === "ios" ? "padding" : "height"}
                        style={{ flex: 1 }}
                    >
                        <BottomSheetView style={{ flex: 1, height: '100%' }}>
                            <View style={{ height: convert(42), backgroundColor: 'white', flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: convert(16) }}>
                                <Text style={{ fontSize: convert(18), fontWeight: 'bold' }}>210 Comments</Text>
                            </View>
                            <View style={{ flex: 1, backgroundColor: '#555' }}>
                                <Text>Content</Text>
                            </View>
                        </BottomSheetView>
                    </KeyboardAvoidingView>
                </BottomSheet>)
            }
        </GestureHandlerRootView>
    )
}

const styles = StyleSheet.create({
    btn_appreciation: { flexDirection: 'row', alignItems: 'center', gap: convert(8), flex: 1, justifyContent: 'center', paddingVertical: convert(4) }
})