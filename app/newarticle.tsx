
import { Text, View } from '@/components/Themed';
import { convert } from '@/constants/convert';
import { FluentImageAdd32Regular, IcBaselineArrowBack } from '@/constants/icons';
import { useDatabase } from '@/context/database.context';
import * as Session from '@/Database/session';
import { generateUUID as uuidv4 } from '@/Database/uuid';
import * as ImagePicker from 'expo-image-picker';
import { router, useLocalSearchParams } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useEffect, useState } from 'react';
import { ActivityIndicator, Alert, Image, Keyboard, KeyboardAvoidingView, Platform, Pressable, TextInput, TouchableOpacity } from 'react-native';
import { GestureHandlerRootView, ScrollView } from 'react-native-gesture-handler';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

interface ArticlesType {
    id?: string;
    imageurl: string;
    userid: string;
    noteid: string;
    body: string;
    description: string;
    topic: string;
    title: string;
    appreciation: string;
    createdAt: string;
    updatedAt: string;
    version: number | 1;
}

export default function NewArticle() {
    const frame = useSafeAreaInsets()
    const params = useLocalSearchParams()
    const [image, setImage] = useState<string | null>(null);
    const [keyboardState, setKeyboardState] = useState<{ height: number, width: number, screenX: number, screenY: number } | undefined>(undefined)
    const [valueDesc, setValueDesc] = useState<string>("")
    const [valueTopic, setValueTopic] = useState<string>("")
    const [isSaving, setIsSaving] = useState(false)
    const db = useDatabase()

    const [file, setFile] = useState<{ name: string, mimeType: string, uri: string } | null>(null)

    const pickImage = async () => {
        const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();

        if (!permissionResult.granted) {
            Alert.alert('Permission required', 'Permission to access the media library is required.');
            return;
        }

        let result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ['images'],
            allowsEditing: true,
            aspect: [4, 3],
            quality: 1,
            base64: true
        });


        if (!result.canceled) {
            setFile({
                name: result.assets[0].fileName as string,
                mimeType: result.assets[0].mimeType as string,
                uri: result.assets[0].uri as string
            })
            const imagestring = `data:${result.assets[0].mimeType};base64,${result.assets[0].base64}`;
            setImage(imagestring);
        }
    };


    useEffect(() => {
        Keyboard.addListener('keyboardDidShow', () => {
            setKeyboardState(Keyboard.metrics())
        })

        Keyboard.addListener('keyboardDidHide', () => {
            setKeyboardState(undefined)
        })
        return () => {
            Keyboard.removeAllListeners('keyboardDidShow')
            Keyboard.removeAllListeners('keyboardDidHide')
        }


    }, [])

    const handleSave = async () => {
        setIsSaving(true)
        const session = await Session.get()
        const formData = new FormData()

        // React Native FormData nécessite un objet avec uri, type, name
        formData.append('images', {
            uri: file?.uri,
            type: file?.mimeType,
            name: file?.name
        } as any)
        const save_image_first = async () => {
            try {
                const post_req = await fetch(`https://nuvelserver.godigital.workers.dev/image/${session?.iduser as string}`, {
                    method: 'POST',
                    // Ne pas définir Content-Type, fetch le fait automatiquement pour FormData
                    body: formData
                })

                if (!post_req.ok) {
                    console.error('Erreur upload image:', await post_req.text())
                    return null
                }

                const response = await post_req.json()
                return response.url
            } catch (error) {
                console.error('Erreur upload:', error)
                return null
            }
        };

        // Appeler une seule fois et stocker le résultat
        const imageUrl = await save_image_first()

        if (imageUrl) {
            const obj_article: Partial<ArticlesType> = {
                imageurl: imageUrl, // Utiliser le résultat stocké
                userid: session?.iduser as string,
                noteid: params.noteid as string,
                body: params.html as string,
                description: valueDesc,
                topic: valueTopic,
                title: params.title as string,
                version: 1
            }
            const articleid = `article_${uuidv4()}`
            console.log(articleid)

            try {
                const post_req = await fetch(`https://nuvelserver.godigital.workers.dev/articles/${session?.iduser as string}/doc/${articleid}`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify(obj_article),
                })

                if (!post_req.ok) {
                    console.error('Erreur création article:', await post_req.text())
                    setIsSaving(false)
                    return
                }

                const response = await post_req.json()
                if (response.status === '/articles 200 OK succes') {

                    db.publishNote({
                        id: params.noteid as string,
                        publishId: JSON.stringify({
                            articleid: articleid,
                            title: params.title as string,
                            imageUrl: imageUrl
                        }),
                        version: parseInt(params.version as string)
                    })
                    router.back()
                }
                setIsSaving(false)
            } catch (error) {
                console.error('Erreur création article:', error)
                setIsSaving(false)
            }
        } else {
            console.error('Échec upload image')
            setIsSaving(false)
        }
    }
    return (
        <KeyboardAvoidingView
            behavior={Platform.OS === "ios" ? "padding" : "height"}
            style={{ flex: 1, height: keyboardState?.screenY || '100%' }}
        >
            <StatusBar style="dark" />

            <View style={{ height: frame.top }} />
            <GestureHandlerRootView style={{
                flex: 1,
                backgroundColor: 'white'
            }}>
                <View style={{ height: convert(52), backgroundColor: 'white', flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: convert(16) }}>
                    <TouchableOpacity onPress={() => { router.back() }}>
                        <IcBaselineArrowBack width={24} height={24} color={'black'} />
                    </TouchableOpacity>

                </View>
                <View style={{ flex: 1 }}>

                    <ScrollView style={{ flex: 1, backgroundColor: '#fff' }} contentContainerStyle={{ paddingHorizontal: convert(16), paddingBottom: convert(100) }}>
                        <Text style={{ fontSize: convert(28), fontWeight: '600', marginBottom: convert(12) }}>{params.title}</Text>
                        {/* Cette partie est faite pour picker une image, pour prendre les images dans le telephone de l'utilisateur */}
                        <View style={{ position: 'relative' }}>
                            <Text style={{ fontSize: convert(16), fontWeight: '600', marginBottom: convert(12), color: '#929292ff' }}>Add an image</Text>
                            <View style={{ width: "100%", aspectRatio: 4 / 3, backgroundColor: '#f0f0f0', borderRadius: convert(12) }}>
                                {image && <Image source={{ uri: image }} style={{ width: "100%", height: "100%", borderRadius: convert(12) }} />}
                            </View>
                            <Pressable
                                onPress={pickImage}
                                style={{ position: 'absolute', right: convert(12), bottom: convert(12), backgroundColor: '#048effff', borderRadius: convert(24), height: convert(48), width: convert(48), justifyContent: 'center', alignItems: 'center' }}>
                                <FluentImageAdd32Regular width={24} height={24} color={'#fff'} />
                            </Pressable>
                        </View>
                        <View style={{ marginTop: convert(12) }}>
                            <Text style={{ fontSize: convert(16), fontWeight: '600', marginBottom: convert(12), color: '#929292ff' }}>Add a desciption</Text>
                            <TextInput
                                value={valueDesc}
                                onChangeText={setValueDesc}
                                placeholder="Description"
                                placeholderTextColor="#9ca3af"
                                style={{ fontSize: convert(16), color: '#555', borderWidth: 1, borderColor: '#e5e7eb', borderRadius: convert(8), padding: convert(12), backgroundColor: '#fff' }}
                                multiline
                                numberOfLines={5}
                            />
                        </View>
                        <View style={{ marginTop: convert(12) }}>
                            <Text style={{ fontSize: convert(16), fontWeight: '600', marginBottom: convert(12), color: '#929292ff' }}>Add a topic</Text>
                            <TextInput
                                value={valueTopic}
                                onChangeText={setValueTopic}
                                placeholder="eg: Bible, Quran, Hadith"
                                placeholderTextColor="#9ca3af"
                                style={{ fontSize: convert(16), color: '#555', borderWidth: 1, borderColor: '#e5e7eb', borderRadius: convert(8), padding: convert(12), backgroundColor: '#fff' }}
                            />
                        </View>
                        <Pressable
                            onPress={handleSave}
                            style={{ backgroundColor: '#048effff', borderRadius: convert(24), height: convert(48), width: '100%', justifyContent: 'center', alignItems: 'center', marginTop: convert(16), flexDirection: 'row', gap: convert(12) }}>
                            <Text style={{ fontSize: convert(18), color: '#fff', fontWeight: '600' }}>Saved</Text>
                            {isSaving && <ActivityIndicator color="#fff" size={'small'} />}
                        </Pressable>
                    </ScrollView>
                </View>
            </GestureHandlerRootView>
        </KeyboardAvoidingView>
    );
}
