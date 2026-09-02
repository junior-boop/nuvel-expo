
import { Text, View } from '@/components/Themed';
import TopicPicker from '@/components/TopicPicker';
import { convert } from '@/constants/convert';
import { FluentImageAdd32Regular, IcBaselineArrowBack } from '@/constants/icons';
import { server_url } from '@/constants/server_url';
import { useDatabase } from '@/context/database.context';
import * as Session from '@/Database/session';
import { generateUUID as uuidv4 } from '@/Database/uuid';
import { createdArticleStats } from '@/lib/instantdb.articles';
import { apiRequest } from '@/lib/token_system';
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
    const isEditMode = params.mode === 'edit'
    const existingArticleId = isEditMode ? (params.articleid as string) : null
    const [image, setImage] = useState<string | null>(null);
    const [existingImageUrl, setExistingImageUrl] = useState<string | null>(null)
    const [keyboardState, setKeyboardState] = useState<{ height: number, width: number, screenX: number, screenY: number } | undefined>(undefined)
    const [valueDesc, setValueDesc] = useState<string>("")
    const [selectedTopics, setSelectedTopics] = useState<string[]>([])
    const [topicPickerOpen, setTopicPickerOpen] = useState(false)
    const [isSaving, setIsSaving] = useState(false)
    const db = useDatabase()

    const [file, setFile] = useState<{ name: string, mimeType: string, uri: string } | null>(null)

    useEffect(() => {
        if (!isEditMode || !existingArticleId) return
        (async () => {
            try {
                const res = await fetch(`${server_url}/articles/${existingArticleId}`)
                if (!res.ok) return
                const data = await res.json()
                const art = data.article
                if (!art) return
                setValueDesc(art.description ?? "")
                setExistingImageUrl(art.imageurl ?? null)
                setImage(art.imageurl ?? null)
                try {
                    const parsedTopics = JSON.parse(art.topic ?? "[]")
                    if (Array.isArray(parsedTopics)) setSelectedTopics(parsedTopics)
                } catch { }
            } catch (error) {
                console.error('Erreur chargement article existant:', error)
            }
        })()
    }, [isEditMode, existingArticleId])

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
            const asset = result.assets[0]
            // allowsEditing:true renvoie souvent un asset recadré sans fileName/mimeType (surtout iOS)
            const mimeType = asset.mimeType ?? 'image/jpeg'
            const extension = mimeType.split('/')[1] ?? 'jpg'
            setFile({
                name: asset.fileName ?? `photo_${Date.now()}.${extension}`,
                mimeType,
                uri: asset.uri
            })
            const imagestring = `data:${mimeType};base64,${asset.base64}`;
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

    const uploadNewImage = async (userid: string): Promise<string | null> => {
        const formData = new FormData()
        // React Native FormData nécessite un objet avec uri, type, name
        formData.append('images', {
            uri: file?.uri,
            type: file?.mimeType,
            name: file?.name
        } as any)

        try {
            const post_req = await fetch(`${server_url}/image/${userid}`, {
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

    const handleSave = async () => {
        if (isSaving) return

        // Verifie qu'une image a bien ete selectionnee AVANT de tenter l'upload —
        // evite d'afficher "ajoutez une image" quand l'image existe mais que l'upload echoue.
        if (!file && !existingImageUrl) {
            Alert.alert('Image requise', "Veuillez ajouter une image avant de publier.")
            return
        }

        setIsSaving(true)
        const session = await Session.get()
        const userid = session?.iduser as string

        // N'uploader que si une nouvelle image a été choisie, sinon garder l'image existante (mode édition)
        const imageUrl = file ? await uploadNewImage(userid) : existingImageUrl

        if (!imageUrl) {
            console.error('Échec upload image')
            Alert.alert('Échec de l\'envoi', "L'envoi de l'image a échoué. Vérifiez votre connexion et réessayez.")
            setIsSaving(false)
            return
        }

        const obj_article: Partial<ArticlesType> = {
            imageurl: imageUrl,
            userid: userid,
            noteid: params.noteid as string,
            body: params.html as string,
            description: valueDesc,
            topic: JSON.stringify(selectedTopics),
            title: params.title as string,
            version: 1
        }
        const articleid = isEditMode ? (existingArticleId as string) : `article_${uuidv4()}`
        if (__DEV__) console.log(articleid)

        try {
            const req = await apiRequest(`${server_url}/articles/${userid}/doc/${articleid}`, {
                method: isEditMode ? 'PUT' : 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(obj_article),
            })

            if (!req.ok) {
                console.error('Erreur sauvegarde article:', await req.text())
                Alert.alert('Erreur', "La publication de l'article a échoué. Réessayez.")
                setIsSaving(false)
                return
            }

            const response = await req.json()
            if (typeof response.status === 'string' && response.status.includes('200 OK')) {
                if (!isEditMode) {
                    const articleStatsId = await createdArticleStats(articleid)
                    if (__DEV__) console.log(articleStatsId)
                }

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
            } else {
                Alert.alert('Erreur', "La publication de l'article a échoué. Réessayez.")
            }
            setIsSaving(false)
        } catch (error) {
            console.error('Erreur sauvegarde article:', error)
            Alert.alert('Erreur', "Une erreur est survenue. Réessayez.")
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
                            <Pressable
                                onPress={() => setTopicPickerOpen(true)}
                                style={{ borderWidth: 1, borderColor: '#e5e7eb', borderRadius: convert(8), padding: convert(12), backgroundColor: '#fff', minHeight: convert(48), justifyContent: 'center' }}>
                                <Text style={{ fontSize: convert(16), color: selectedTopics.length ? '#555' : '#9ca3af' }}>
                                    {selectedTopics.length ? selectedTopics.join(', ') : 'Select topics'}
                                </Text>
                            </Pressable>
                        </View>
                        <Pressable
                            onPress={handleSave}
                            disabled={isSaving}
                            style={{ backgroundColor: '#048effff', opacity: isSaving ? 0.7 : 1, borderRadius: convert(24), height: convert(48), width: '100%', justifyContent: 'center', alignItems: 'center', marginTop: convert(16), flexDirection: 'row', gap: convert(12) }}>
                            <Text style={{ fontSize: convert(18), color: '#fff', fontWeight: '600' }}>{isEditMode ? 'Update' : 'Publish'}</Text>
                            {isSaving && <ActivityIndicator color="#fff" size={'small'} />}
                        </Pressable>
                    </ScrollView>
                </View>
                {topicPickerOpen && (
                    <TopicPicker
                        selected={selectedTopics}
                        onChange={setSelectedTopics}
                        onClose={() => setTopicPickerOpen(false)}
                    />
                )}
            </GestureHandlerRootView>
        </KeyboardAvoidingView>
    );
}
