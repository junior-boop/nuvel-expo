import { StatusBar } from 'expo-status-bar';
import { ScrollView, StyleSheet } from 'react-native';

import { BibleItems, BibleListItem } from '@/components/bibleItem';
import { Text, View, } from '@/components/Themed';
import { convert } from '@/constants/convert';
import * as BibleContent from '@/Database/bible.content';
import { useCallback, useEffect, useState } from 'react';


function delay(ms: number) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

async function fetchSequentielAvecDelai(urls: string[], delaiMs: number, onStatusChange: (loading: boolean) => void) {
    const resultats = [];

    // Notifier le début du chargement
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
        // Notifier la fin du chargement (succès ou erreur)
        if (onStatusChange) onStatusChange(false);
    }
}




export default function BiblePage() {
    const [liste, setListe] = useState<BibleListItem[] | []>([])
    const [isLoading, setIsLoading] = useState(true)

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



    return (
        <View style={styles.container}>
            <StatusBar style="dark" />
            <ScrollView contentContainerStyle={{ paddingBottom: 100, paddingHorizontal: convert(16), paddingTop: convert(16) }}>
                <Text style={{ ...styles.title, marginBottom: convert(16) }}>Bible Library</Text>
                <View style={{ marginBottom: 24 }}>
                    <Text style={{ fontSize: convert(16), color: "#777", fontStyle: 'italic' }}>
                        Download the Bible version you need to use
                    </Text>
                </View>
                <View style={{ gap: convert(8) }}>
                    {
                        isLoading ? <Text>Loading...</Text>
                            : liste.map((item, index) => <BibleItems key={index} item={item} />)
                    }
                </View>
            </ScrollView>
        </View>
    );
}

async function addbiblebook(data, bible_id: string, pourcentage: (value: number) => void) {
    const t = data.verset | 0
    for (let i = 0; i < t; i++) {
        const verset = data.content[i]
        BibleContent.created({
            book_id: bible_id,
            ...verset
        })
        pourcentage(100 * ((i + 1) / t))


    }
}

const styles = StyleSheet.create({
    container: {
        flex: 1
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
});
