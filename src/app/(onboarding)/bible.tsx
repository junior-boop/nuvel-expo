import { StatusBar } from 'expo-status-bar';
import { ScrollView, StyleSheet, TouchableOpacity } from 'react-native';

import { BibleItems, BibleListItem } from '@/components/bibleItem';
import { PageLayout_3 } from '@/components/page';
import { Text, View } from '@/components/Themed';
import { convert } from '@/constants/convert';
import { useDatabase } from '@/context/database.context';
import { router } from 'expo-router';
import { useCallback, useEffect, useState } from 'react';

function delay(ms: number) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

async function fetchSequentielAvecDelai(urls: string[], delaiMs: number, onStatusChange: (loading: boolean) => void) {
    const resultats = [];

    if (onStatusChange) onStatusChange(true);

    try {
        for (const url of urls) {
            const reponse = await fetch(url);

            if (!reponse.ok) {
                throw new Error(`Erreur HTTP ${reponse.status} pour ${url}`);
            }

            const data = await reponse.json();
            resultats.push(data);
            await delay(delaiMs);
        }

        return resultats;
    } catch (erreur) {
        console.error("Une erreur est survenue durant la séquence :", erreur);
        throw erreur;
    } finally {
        if (onStatusChange) onStatusChange(false);
    }
}

export default function OnboardingBible() {
    const [liste, setListe] = useState<BibleListItem[] | []>([])
    const [isLoading, setIsLoading] = useState(true)

    const { biblemetadatState } = useDatabase()

    const bible = useCallback(async () => {
        const response = await fetch('https://nuvelserver.godigital.workers.dev/bible')
        const result = await response.json()
        const arr = result.fichiers.map((el) => `https://nuvelserver.godigital.workers.dev/bible/version?name=${el.nom}`)
        const resultat = await fetchSequentielAvecDelai(arr, 500, (loading) => setIsLoading(loading))
        // La taille formatée n'est renvoyée que par /bible (liste des fichiers) : on la
        // recolle ici sur chaque version, dans le même ordre que les urls appelées.
        const enrichi = resultat.map((item, index) => ({ ...item, tailleFormatee: result.fichiers[index]?.tailleFormatee }))

        setListe(enrichi)
    }, [])

    useEffect(() => {
        bible()
    }, [])

    const hasAtLeastOne = (biblemetadatState?.count() ?? 0) > 0

    const handleContinue = () => {
        router.replace('/language' as never)
    }

    return (
        <PageLayout_3>
            <View style={{ flex: 1 }}>
                <StatusBar style="dark" />
                <ScrollView contentContainerStyle={{ paddingBottom: convert(120), paddingHorizontal: convert(16), paddingTop: convert(24) }}>
                    <Text style={{ ...styles.title, marginBottom: convert(8) }}>Choisissez votre Bible</Text>
                    <View style={{ marginBottom: convert(24) }}>
                        <Text style={{ fontSize: convert(15), color: "#777" }}>
                            Téléchargez les versions de la Bible que vous utiliserez. Vous pourrez en ajouter d'autres plus tard.
                        </Text>
                    </View>
                    <View style={{ gap: convert(8) }}>
                        {
                            isLoading ? <Text>Chargement...</Text>
                                : liste.map((item, index) => <BibleItems key={index} item={item} />)
                        }
                    </View>
                </ScrollView>
                <View style={{ position: 'absolute', bottom: 0, left: 0, right: 0, padding: convert(16), backgroundColor: '#fff' }}>
                    <TouchableOpacity
                        style={{ backgroundColor: "#0083ff", paddingHorizontal: convert(18), paddingVertical: convert(14), alignItems: 'center', justifyContent: 'center' }}
                        onPress={handleContinue}
                    >
                        <Text style={{ fontSize: convert(18), fontWeight: "700", color: '#fff' }}>
                            {hasAtLeastOne ? 'Continuer' : 'Passer pour le moment'}
                        </Text>
                    </TouchableOpacity>
                </View>
            </View>
        </PageLayout_3>
    );
}

const styles = StyleSheet.create({
    title: {
        fontSize: 20,
        fontWeight: 'bold',
    },
});
