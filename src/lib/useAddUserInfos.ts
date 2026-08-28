import { useDatabase } from "@/context/database.context";
import { User } from "@/Database/db";
import * as ImagePicker from 'expo-image-picker';
import { router, useLocalSearchParams } from "expo-router";
import { useState } from "react";
import { Alert } from 'react-native';

const SERVER_URL = "https://nuvelserver.godigital.workers.dev";

/**
 * Hook pour ajouter/mettre à jour les informations supplémentaires d'un utilisateur
 * 
 * Workflow:
 * 1. Upload de la photo de profil
 * 2. Envoi des infos au serveur
 * 3. Sauvegarde en base de données locale (SQLite)
 */
export default function useTakeUserInfos() {
    const params = useLocalSearchParams()
    const [userinfos, setUserinfos] = useState<User | null>(null)
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)
    
    // États pour les données utilisateur
    const [image, setImage] = useState<string | null>(null);
    const [file, setFile] = useState<{ name: string, mimeType: string, uri: string } | null>(null)
    const [biography, setBiography] = useState<string | null>(null)
    const [name, setName] = useState(params.name as string)
    const [first_name, setFirstName] = useState(params.first_name as string)
    const [email, setEmail] = useState(params.email as string)
    const [country, setCountry] = useState<{ id: string, name: string, code_2: string, code_3: string, phoneCode: string } | null>(null)
    const [churchrule, setChurchrule] = useState<string | null>(null)

    const { adduser, updatedUser } = useDatabase()

    /**
     * Sauvegarde les informations utilisateur (serveur + DB locale)
     */
    const handleSave = async () => {
        try {
            setLoading(true)
            setError(null)

            // Validation
            if (!file) {
                setError('Veuillez sélectionner une photo de profil');
                setLoading(false);
                return false;
            }

            if (!name || !first_name || !email) {
                setError('Veuillez remplir tous les champs obligatoires');
                setLoading(false);
                return false;
            }

            // 1. Upload de l'image
            const imageUrl = await uploadImage();

            if (!imageUrl) {
                setError('Échec de l\'upload de l\'image');
                setLoading(false)
                return false;
            }

            // 2. Créer l'objet utilisateur complet
            const userData: User = {
                id: params.id as string,
                name: name,
                first_name: first_name,
                email: email,
                country: country?.id || null,
                association: null,
                church_status: churchrule || 'Member',
                photo: imageUrl,
                biography: biography || '',
                created: new Date().toISOString(),
                modified: new Date().toISOString(),
                lastlogin: new Date().toISOString(),
                lastlogout: null
            }

            // 3. Envoyer au serveur
            const serverSuccess = await updateUserOnServer(userData);

            if (!serverSuccess) {
                setError('Échec de la mise à jour serveur');
                setLoading(false);
                return false;
            }

            // 4. Sauvegarder en base de données locale
            const localUser = await updatedUser(userData);

            if (!localUser) {
                setError('Échec de la sauvegarde locale');
                setLoading(false);
                return false;
            }

            setUserinfos(localUser);
            if (__DEV__) console.log('[useAddUserInfos] ✅ Utilisateur sauvegardé:', localUser.email);

            // 5. Navigation vers l'accueil
            router.replace('/(tabs)');
            setLoading(false);
            return true;

        } catch (error) {
            const message = error instanceof Error ? error.message : 'Erreur inconnue';
            setError(message);
            console.error('[useAddUserInfos] ❌ Erreur:', error);
            setLoading(false);
            return false;
        }
    }

    /**
     * Upload l'image sur le serveur
     */
    const uploadImage = async (): Promise<string | null> => {
        try {
            const formData = new FormData()

            formData.append('images', {
                uri: file?.uri,
                type: file?.mimeType,
                name: file?.name
            } as any)

            const response = await fetch(`${SERVER_URL}/image/${params.id as string}`, {
                method: 'POST',
                body: formData
            })

            if (!response.ok) {
                console.error('[useAddUserInfos] Erreur upload image:', await response.text())
                return null
            }

            const result = await response.json()
            return result.url

        } catch (error) {
            console.error('[useAddUserInfos] Erreur upload:', error)
            return null
        }
    };

    /**
     * Met à jour les infos utilisateur sur le serveur
     */
    const updateUserOnServer = async (userData: User): Promise<boolean> => {
        try {
            const response = await fetch(`${SERVER_URL}/users/${params.id as string}/update-infos`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(userData),
            })

            if (!response.ok) {
                console.error('[useAddUserInfos] Erreur serveur:', await response.text())
                return false
            }

            const result = await response.json()
            return !!result

        } catch (error) {
            console.error('[useAddUserInfos] Erreur update serveur:', error)
            return false
        }
    }

    /**
     * Sélectionne une image depuis la galerie
     */
    const pickImage = async () => {
        try {
            const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();

            if (!permissionResult.granted) {
                Alert.alert('Permission requise', 'L\'accès à la galerie est nécessaire.');
                return;
            }

            const result = await ImagePicker.launchImageLibraryAsync({
                mediaTypes: ['images'],
                allowsEditing: true,
                aspect: [1, 1],
                quality: 0.8, // Réduire la qualité pour optimiser la taille
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
        } catch (error) {
            console.error('[useAddUserInfos] Erreur sélection image:', error);
            Alert.alert('Erreur', 'Impossible de sélectionner l\'image');
        }
    };

    return {
        // États
        loading,
        error,
        image,
        userinfos,
        
        // Champs contrôlés
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
        
        // Méthodes
        handleSave,
        pickImage,
    }
}