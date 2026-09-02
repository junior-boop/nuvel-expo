import { PageLayout_3 } from '@/components/page';
import { Text, View } from '@/components/Themed';
import { convert } from '@/constants/convert';
import { server_url } from '@/constants/server_url';
import { useAuth } from '@/context/auth.context';
import { useDatabase } from '@/context/database.context';
import { router } from 'expo-router';
import { useState } from 'react';
import { ActivityIndicator, TouchableOpacity } from 'react-native';

const LANGUAGES: { code: 'fr' | 'en' | 'es'; label: string }[] = [
    { code: 'fr', label: 'Français' },
    { code: 'en', label: 'English' },
    { code: 'es', label: 'Español' },
];

export default function OnboardingLanguage() {
    const { user, refreshUser } = useAuth();
    const { updatedUser } = useDatabase();
    const [saving, setSaving] = useState<string | null>(null);

    const handleSelect = async (code: 'fr' | 'en' | 'es') => {
        if (!user || saving) return;
        setSaving(code);
        try {
            await fetch(`${server_url}/users/${user.id}/update-infos`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ language: code }),
            });
        } catch (e) {
            if (__DEV__) console.log('[language] update serveur échoué', e);
        }
        await updatedUser({ ...user, language: code });
        await refreshUser();
        setSaving(null);
        router.replace('/(tabs)');
    };

    return (
        <PageLayout_3>
            <View style={{ flex: 1, paddingHorizontal: convert(24), paddingTop: convert(48) }}>
                <Text style={{ fontSize: convert(24), fontWeight: '700', marginBottom: convert(8) }}>Choisissez votre langue</Text>
                <Text style={{ fontSize: convert(15), color: '#777', marginBottom: convert(32) }}>
                    Cette préférence sera utilisée pour votre expérience dans l'application.
                </Text>
                <View style={{ gap: convert(12) }}>
                    {LANGUAGES.map((lang) => (
                        <TouchableOpacity
                            key={lang.code}
                            onPress={() => handleSelect(lang.code)}
                            disabled={!!saving}
                            style={{ borderWidth: 1, borderColor: '#ccc', paddingVertical: convert(16), paddingHorizontal: convert(16), flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}
                        >
                            <Text style={{ fontSize: convert(18), fontWeight: '600' }}>{lang.label}</Text>
                            {saving === lang.code && <ActivityIndicator size="small" color="#0083ff" />}
                        </TouchableOpacity>
                    ))}
                </View>
            </View>
        </PageLayout_3>
    );
}
