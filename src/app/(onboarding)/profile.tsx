import { ActivityIndicator, Image, KeyboardAvoidingView, Platform, StyleSheet, TextInput, TouchableOpacity } from 'react-native';

import { PageLayout_3 } from '@/components/page';
import { Text, View } from '@/components/Themed';
import { w } from '@/constants/Colors';
import { convert } from '@/constants/convert';
import { FluentChevronDown24Filled, FluentImageAdd32Regular } from '@/constants/icons';
import useTakeUserInfos from '@/lib/useAddUserInfos';
import BottomSheet, { BottomSheetView } from '@gorhom/bottom-sheet';
import { StatusBar } from 'expo-status-bar';
import { useCallback, useEffect, useRef, useState } from 'react';
import { GestureHandlerRootView, ScrollView } from 'react-native-gesture-handler';

export default function ModalScreen() {
    // Utilisation du hook personnalisé
    const {
        loading,
        error,
        image,
        name,
        setName,
        first_name,
        setFirstName,
        email,
        setEmail,
        biography,
        setBiography,
        country,
        setCountry,
        churchrule,
        setChurchrule,
        handleSave,
        pickImage
    } = useTakeUserInfos();

    // États locaux pour l'UI
    const [countryOpen, setCountryOpen] = useState(false)
    const [churchruleOpen, setChurchruleOpen] = useState(false)

    return (
        <PageLayout_3>
            <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"} style={styles.container}>
                <StatusBar style="dark" />
                <GestureHandlerRootView style={{
                    flex: 1,
                    backgroundColor: 'white',
                    width: w,
                    alignItems: 'center',
                }}>
                    <View style={{ flex: 1, width: w, paddingHorizontal: convert(24) }}>
                        <View style={{ alignItems: 'center', gap: convert(24), marginTop: convert(24) }}>
                            <TouchableOpacity style={{ width: convert(150), height: convert(150), position: 'relative', }} onPress={pickImage}>
                                <View style={{ width: convert(150), height: convert(150), borderRadius: convert(150), overflow: 'hidden' }}>
                                    {
                                        image
                                            ? <Image
                                                style={{ width: convert(150), height: convert(150) }}
                                                source={{ uri: image }} />
                                            : <Image
                                                style={{ width: convert(150), height: convert(150) }}
                                                source={require('@/assets/images/avatar.png')} />
                                    }
                                </View>
                                <View
                                    style={{ position: 'absolute', right: convert(0), bottom: convert(0), backgroundColor: '#048effff', borderRadius: convert(24), height: convert(48), width: convert(48), justifyContent: 'center', alignItems: 'center' }}>
                                    <FluentImageAdd32Regular width={24} height={24} color={'#fff'} />
                                </View>
                            </TouchableOpacity>
                            <View style={{ alignItems: 'center' }}>
                                <Text style={{ fontSize: convert(24), fontWeight: "500" }}>{name} {first_name}</Text>
                                <Text style={{ fontSize: convert(15), fontWeight: "400" }}>{email}</Text>
                            </View>
                        </View>
                        <View style={{ width: '100%', gap: convert(12), marginTop: convert(34), flex: 1, justifyContent: 'space-between', paddingBottom: convert(24) }}>

                            <View style={{ gap: convert(12) }}>
                                <TouchableOpacity
                                    onPress={() => setCountryOpen(true)}
                                    style={[styles.input, { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: convert(12) }]}>
                                    <Text style={{ fontSize: convert(16), fontWeight: "500" }}>{country === null ? 'Country' : country.name}</Text>
                                    <FluentChevronDown24Filled width={convert(18)} height={convert(18)} color="#444" />
                                </TouchableOpacity>
                                <TouchableOpacity
                                    onPress={() => setChurchruleOpen(true)}
                                    style={[styles.input, { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: convert(12) }]}>
                                    <Text style={{ fontSize: convert(16), fontWeight: "500" }}>{churchrule === null ? 'Church Rule' : churchrule}</Text>
                                    <FluentChevronDown24Filled width={convert(18)} height={convert(18)} color="#444" />
                                </TouchableOpacity>

                                <View>
                                    <TextInput
                                        value={biography || ''}
                                        onChangeText={(e) => setBiography(e)}
                                        style={{ minHeight: convert(56), paddingHorizontal: convert(12), paddingVertical: convert(12), fontSize: convert(16), fontWeight: "500", color: '#000000ff', borderWidth: 1, borderColor: "#ccc" }} placeholder='Your biography' placeholderTextColor={"#000000ff"} multiline numberOfLines={5} />
                                </View>
                            </View>
                            <View>
                                {error && (
                                    <Text style={{ color: 'red', marginBottom: convert(8), fontSize: convert(14) }}>
                                        {error}
                                    </Text>
                                )}
                                <TouchableOpacity
                                    style={{ backgroundColor: "#0083ff", paddingHorizontal: convert(18), paddingVertical: convert(12), alignItems: 'center', flexDirection: 'row', gap: convert(8), justifyContent: 'center' }}
                                    onPress={handleSave}
                                    disabled={loading}
                                >
                                    <Text style={{ fontSize: convert(18), fontWeight: "700", color: '#fff' }}>
                                        {loading ? 'Saving...' : 'Save'}
                                    </Text>
                                    {loading && <ActivityIndicator size="small" color="#fff" />}
                                </TouchableOpacity>
                            </View>
                        </View>
                    </View>
                    {churchruleOpen && <ChurchRulePicker onClose={() => setChurchruleOpen(false)} onChange={(churchrule) => setChurchrule(churchrule)} />}
                    {countryOpen && <CountryPicker onClose={() => setCountryOpen(false)} onChange={(country) => setCountry(country)} />}
                </GestureHandlerRootView>
            </KeyboardAvoidingView>
        </PageLayout_3>
    );
}



const CountryPicker = ({ onClose, onChange }: { onClose?: () => void, onChange?: (country: { id: string, name: string, code_2: string, code_3: string, phoneCode: string }) => void }) => {
    const sheetRef = useRef<BottomSheet>(null);
    const [countries, setCountries] = useState<{ id: string, name: string, code_2: string, code_3: string, phoneCode: string }[]>([])
    const countryfetch = useCallback(async () => {
        const req = await fetch('https://nuvelserver.godigital.workers.dev/countries/all-country')
        const res = await req.json() as { message: string, data: { id: string, name: string, code_2: string, code_3: string, phoneCode: string }[] }
        setCountries(res.data)
    }, [])

    useEffect(() => {
        countryfetch()
    }, [])
    return (
        <BottomSheet
            ref={sheetRef}
            snapPoints={[400]}
            enableDynamicSizing={false}
            enablePanDownToClose={true}
            containerStyle={{ backgroundColor: '#0003' }}
            onClose={onClose}

        >
            <BottomSheetView style={{
                flex: 1,
                height: '100%',
                position: 'relative'
            }}>
                <View style={{ flex: 1 }}>
                    <ScrollView showsVerticalScrollIndicator={true} style={{ flex: 1 }} contentContainerStyle={{ paddingHorizontal: convert(20), paddingBottom: convert(50), paddingTop: convert(12) }}>
                        {
                            countries.length === 0 ? (
                                <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
                                    <ActivityIndicator size="large" color="#0083ff" />
                                </View>
                            ) : (
                                countries.map((country, index) => (
                                    <TouchableOpacity key={index} style={{ paddingVertical: convert(12), borderBottomWidth: 1, borderBottomColor: '#cfdfeeff' }} onPress={() => { onClose?.(); onChange?.(country) }}>
                                        <Text style={{ fontSize: convert(16), fontWeight: "400" }}>{country.name}</Text>
                                    </TouchableOpacity>
                                ))
                            )
                        }
                    </ScrollView>
                </View>
            </BottomSheetView>
        </BottomSheet>
    )
}

const ChurchRulePicker = ({ onClose, onChange }: { onClose?: () => void, onChange?: (country: string) => void }) => {
    const sheetRef = useRef<BottomSheet>(null);

    const churchrules = [
        { id: 1, name: "Member" },
        { id: 2, name: "Leader" },
        { id: 3, name: "Deacon" },
        { id: 4, name: "Elder" },
        { id: 5, name: "Pastor" },
    ]
    return (
        <BottomSheet
            ref={sheetRef}
            snapPoints={[350]}
            enableDynamicSizing={false}
            enablePanDownToClose={true}
            containerStyle={{ backgroundColor: '#0003' }}
            onClose={onClose}

        >
            <BottomSheetView style={{
                flex: 1,
                height: '100%',
                position: 'relative'
            }}>
                <View style={{ paddingVertical: convert(12), borderBottomWidth: 1, borderBottomColor: '#cfdfeeff', paddingHorizontal: convert(20) }}>
                    <Text style={{ fontSize: convert(18), fontWeight: "600" }}>Status</Text>
                </View>
                <View style={{ flex: 1, paddingHorizontal: convert(20) }}>
                    {
                        churchrules.map((rule, index) => (
                            <TouchableOpacity key={index} style={{ paddingVertical: convert(12), borderBottomWidth: 1, borderBottomColor: '#cfdfeeff' }} onPress={() => { onClose?.(); onChange?.(rule.name) }}>
                                <Text style={{ fontSize: convert(16) }}>{rule.name}</Text>
                            </TouchableOpacity>
                        ))
                    }
                </View>
            </BottomSheetView>
        </BottomSheet>
    )
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#fff'
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

    input: {

        paddingHorizontal: convert(12),
        paddingVertical: convert(12),
        fontSize: convert(18),
        fontWeight: "700",
        color: '#444',
        borderBottomWidth: 1,
        borderColor: "#ccc"
    }
});
