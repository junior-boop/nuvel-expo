
import { Text, View } from '@/components/Themed';
import { convert } from '@/constants/convert';
import { FluentImageAdd32Regular } from '@/constants/icons';
import * as ImagePicker from 'expo-image-picker';
import { useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import { Alert, Image, KeyboardAvoidingView, Platform, Pressable, ScrollView, TextInput } from 'react-native';

export default function NewArticle() {
    const params = useLocalSearchParams()
    const [image, setImage] = useState<string | null>(null);

    const pickImage = async () => {
        // No permissions request is necessary for launching the image library.
        // Manually request permissions for videos on iOS when `allowsEditing` is set to `false`
        // and `videoExportPreset` is `'Passthrough'` (the default), ideally before launching the picker
        // so the app users aren't surprised by a system dialog after picking a video.
        // See "Invoke permissions for videos" sub section for more details.
        const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();

        if (!permissionResult.granted) {
            Alert.alert('Permission required', 'Permission to access the media library is required.');
            return;
        }

        let result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ['images', 'videos'],
            allowsEditing: true,
            aspect: [4, 3],
            quality: 1,
            base64: true
        });

        if (!result.canceled) {
            const imagestring = `data:${result.assets[0].mimeType};base64,${result.assets[0].base64}`;
            setImage(imagestring);
        }
    };
    return (
        <KeyboardAvoidingView
            behavior={Platform.OS === "ios" ? "padding" : "height"}
            style={{ flex: 1 }}
        >
            <View style={{ flex: 1 }}>
                <ScrollView style={{ flex: 1, backgroundColor: '#fff' }} contentContainerStyle={{ paddingHorizontal: convert(16) }}>
                    <Text style={{ fontSize: convert(28), fontWeight: '600', marginBottom: convert(12) }}>{params.title}</Text>
                    {/* Cette partie est faite pour picker une image, pour prendre les images dans le telephone de l'utilisateur */}
                    <View style={{ position: 'relative' }}>
                        <Text style={{ fontSize: convert(16), fontWeight: '600', marginBottom: convert(12), color: '#929292ff' }}>add an image</Text>
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
                        <Text style={{ fontSize: convert(16), fontWeight: '600', marginBottom: convert(12), color: '#929292ff' }}>add a desciption</Text>
                        <TextInput
                            placeholder="Description"
                            placeholderTextColor="#9ca3af"
                            style={{ fontSize: convert(16), color: '#555', borderWidth: 1, borderColor: '#e5e7eb', borderRadius: convert(8), padding: convert(12), backgroundColor: '#fff' }}
                            multiline
                            numberOfLines={5}
                        />
                    </View>
                    <View style={{ marginTop: convert(12) }}>
                        <Text style={{ fontSize: convert(16), fontWeight: '600', marginBottom: convert(12), color: '#929292ff' }}>add a topic</Text>
                        <TextInput
                            placeholder="eg: Bible, Quran, Hadith"
                            placeholderTextColor="#9ca3af"
                            style={{ fontSize: convert(16), color: '#555', borderWidth: 1, borderColor: '#e5e7eb', borderRadius: convert(8), padding: convert(12), backgroundColor: '#fff' }}
                        />
                    </View>
                    <Pressable
                        // onPress={handleSave}
                        style={{ backgroundColor: '#048effff', borderRadius: convert(24), height: convert(48), width: '100%', justifyContent: 'center', alignItems: 'center', marginTop: convert(16) }}>
                        <Text style={{ fontSize: convert(18), color: '#fff', fontWeight: '600' }}>Save</Text>
                    </Pressable>
                </ScrollView>
            </View>
        </KeyboardAvoidingView>
    );
}
