import { ActivityIndicator, Alert, KeyboardAvoidingView, Platform, StyleSheet, TextInput, TouchableOpacity } from 'react-native';

import { Text, View } from '@/components/Themed';
import { w } from '@/constants/Colors';
import { convert } from '@/constants/convert';
import { server_url } from '@/constants/server_url';
import { User } from '@/Database/db';
import { useAuthDB } from '@/lib/useAuthDB';

import { router } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useCallback, useState } from 'react';

interface SignInResponse {
    data: User;
    status: string;
    accessToken?: string;
    refreshToken?: string;
}

export default function LoginScreen() {
    const [name, setName] = useState('');
    const [first_name, setFirstName] = useState('');
    const [email, setEmail] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    // Utiliser le hook useAuthDB pour la gestion complète de l'authentification
    const { login, loading: authLoading, error } = useAuthDB();

    /**
     * Appel API pour authentifier l'utilisateur
     */
    const authenticateUser = useCallback(async (data: Partial<User>): Promise<SignInResponse | null> => {
        try {
            const response = await fetch(`${server_url}/auth/login`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(data),
            });

            if (!response.ok) {
                throw new Error('Échec de l\'authentification');
            }

            const result = await response.json() as SignInResponse;
            return result;
        } catch (err) {
            console.error('[Login] ❌ Erreur API:', err);
            Alert.alert('Erreur', 'Impossible de se connecter. Vérifiez votre connexion.');
            return null;
        }
    }, []);

    /**
     * Gère le processus de connexion complet
     */
    const handleLogin = useCallback(async () => {
        // Validation des champs
        if (!name.trim() || !first_name.trim() || !email.trim()) {
            Alert.alert('Champs requis', 'Veuillez remplir tous les champs');
            return;
        }

        // Validation email basique
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            Alert.alert('Email invalide', 'Veuillez entrer une adresse email valide');
            return;
        }

        setIsLoading(true);

        try {
            // 1. Authentifier l'utilisateur auprès de l'API
            if (__DEV__) console.log('[Login] 🔐 Authentification en cours...');
            const authResult = await authenticateUser({ name, first_name, email });

            if (!authResult || !authResult.data) {
                throw new Error('Aucune donnée utilisateur reçue');
            }

            const { data: userData, accessToken, refreshToken } = authResult;

            // 2. Créer la session locale et sauvegarder les tokens
            if (__DEV__) console.log('[Login] 💾 Sauvegarde de la session...');
            const loginSuccess = await login(userData, {
                accessToken,
                refreshToken
            });

            if (!loginSuccess) {
                throw new Error('Impossible de créer la session locale');
            }

            // 3. Réinitialiser les champs
            setName('');
            setFirstName('');
            setEmail('');

            if (__DEV__) console.log('[Login] ✅ Connexion réussie');

            // 4. Naviguer en fonction du profil utilisateur
            if (!userData.photo || !userData.biography) {
                if (__DEV__) console.log('[Login] 📝 Profil incomplet, redirection vers usersinfos');
                router.replace({
                    pathname: '/loginzone/usersinfos',
                    params: {
                        id: userData.id,
                        name: userData.name,
                        first_name: userData.first_name,
                        email: userData.email
                    }
                });
            } else {
                if (__DEV__) console.log('[Login] 🏠 Profil complet, redirection vers app');
                router.replace('/(tabs)');
            }

        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'Erreur inconnue';
            console.error('[Login] ❌ Erreur connexion:', err);
            Alert.alert(
                'Erreur de connexion',
                errorMessage,
                [{ text: 'OK' }]
            );
        } finally {
            setIsLoading(false);
        }
    }, [name, first_name, email, login, authenticateUser]);

    // Afficher les erreurs d'authentification
    if (error) {
        console.error('[Login] ⚠️ Erreur auth:', error);
    }

    const isButtonDisabled = isLoading || authLoading;

    return (
        <KeyboardAvoidingView
            behavior={Platform.OS === "ios" ? "padding" : "height"}
            style={styles.container}
        >
            <StatusBar style="dark" />
            <View style={styles.container}>
                <View style={styles.formContainer}>
                    <Text style={styles.title}>Let's Log In</Text>

                    {/* Afficher les erreurs */}
                    {error && (
                        <View style={styles.errorContainer}>
                            <Text style={styles.errorText}>{error}</Text>
                        </View>
                    )}

                    {/* Champ First Name */}
                    <View>
                        <TextInput
                            style={styles.input}
                            placeholder='First name'
                            placeholderTextColor="#ccc"
                            value={name}
                            onChangeText={setName}
                            editable={!isButtonDisabled}
                            autoCapitalize="words"
                        />
                    </View>

                    {/* Champ Last Name */}
                    <View>
                        <TextInput
                            style={styles.input}
                            placeholder='Last Name'
                            placeholderTextColor="#ccc"
                            value={first_name}
                            onChangeText={setFirstName}
                            editable={!isButtonDisabled}
                            autoCapitalize="words"
                        />
                    </View>

                    {/* Champ Email */}
                    <View>
                        <TextInput
                            style={styles.input}
                            placeholder='Type your email address'
                            placeholderTextColor="#ccc"
                            value={email}
                            onChangeText={setEmail}
                            inputMode='email'
                            keyboardType='email-address'
                            autoCapitalize='none'
                            editable={!isButtonDisabled}
                        />
                    </View>

                    {/* Bouton de connexion */}
                    <View>
                        <TouchableOpacity
                            style={[
                                styles.button,
                                isButtonDisabled && styles.buttonDisabled
                            ]}
                            onPress={handleLogin}
                            disabled={isButtonDisabled}
                        >
                            <Text style={styles.buttonText}>
                                {isLoading ? 'Connexion...' : 'Connect'}
                            </Text>
                            {isButtonDisabled && (
                                <ActivityIndicator size="small" color="#fff" />
                            )}
                        </TouchableOpacity>
                    </View>
                </View>
            </View>
        </KeyboardAvoidingView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#fff'
    },
    formContainer: {
        width: w * 80 / 100,
        gap: convert(12)
    },
    title: {
        fontSize: convert(32),
        fontWeight: "900",
        marginBottom: convert(8)
    },
    input: {
        paddingHorizontal: convert(12),
        paddingVertical: convert(12),
        fontSize: convert(18),
        fontWeight: "700",
        color: '#444',
        borderWidth: 1,
        borderColor: "#ccc",
        borderRadius: convert(8)
    },
    button: {
        backgroundColor: "#0083ff",
        paddingHorizontal: convert(18),
        paddingVertical: convert(12),
        alignItems: 'center',
        flexDirection: 'row',
        gap: convert(8),
        justifyContent: 'center',
        borderRadius: convert(8)
    },
    buttonDisabled: {
        backgroundColor: "#6bb0ff",
        opacity: 0.7
    },
    buttonText: {
        fontSize: convert(18),
        fontWeight: "700",
        color: '#fff'
    },
    errorContainer: {
        backgroundColor: '#ffe6e6',
        padding: convert(12),
        borderRadius: convert(8),
        borderWidth: 1,
        borderColor: '#ff4444'
    },
    errorText: {
        color: '#cc0000',
        fontSize: convert(14),
        fontWeight: '600'
    }
});
