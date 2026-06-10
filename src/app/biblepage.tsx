import { StatusBar } from 'expo-status-bar';
import { ActivityIndicator, Animated, Easing, ScrollView, StyleSheet, TouchableOpacity } from 'react-native';

import { Text, View, } from '@/components/Themed';
import { convert } from '@/constants/convert';
import { FluentArrowDownload32Filled, FluentCheckmark28Filled } from '@/constants/icons';
import { useDatabase } from '@/context/database.context';
import * as BibleContent from '@/Database/bible.content';
import { bibleDownloader } from '@/Database/bibledownload';
import { BibleData, BibleMetadata } from '@/Database/db';
import { useCallback, useEffect, useRef, useState } from 'react';


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
    const [liste, setListe] = useState<BibleData[] | []>([])
    const [isLoading, setIsLoading] = useState(true)

    const { biblemetadatState } = useDatabase()

    const bible = useCallback(async () => {
        const response = await fetch('https://nuvelserver.godigital.workers.dev/bible')
        const result = await response.json()
        // setListe(result.fichiers)
        const arr = result.fichiers.map((el) => `https://nuvelserver.godigital.workers.dev/bible/version?name=${el.nom}`)
        const resultat = await fetchSequentielAvecDelai(arr, 500, (loading) => setIsLoading(loading))

        setListe(resultat)
    }, [liste])

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

const BibleItems = ({ item }: { item: BibleData }) => {
    const [progress, setProgress] = useState<{
        current: number;
        total: number;
        percent: number;
    } | null>({
        current: 0,
        total: 0,
        percent: 0,
    })
    const [download, setDownload] = useState(false)
    const [btnstate, setBtnstate] = useState(false)

    const { biblemetadatState, addBible } = useDatabase()
    const animatedWidth = useRef(new Animated.Value(0)).current;

    const alreadyDownload = biblemetadatState?.filter(el => el.module === item.metadata.module)?.count() > 0

    useEffect(() => {
        Animated.timing(animatedWidth, {
            toValue: progress?.percent || 0,
            duration: 500,
            easing: Easing.out(Easing.ease),
            useNativeDriver: false,
        }).start();
    }, [progress]);

    useEffect(() => {
        if (alreadyDownload) setBtnstate(true)
    }, [])

    useEffect(() => {
        if (download) setBtnstate(true)
    }, [progress, download])


    const handleBibleMetadata = async (data: Partial<BibleData>) => {
        setDownload(true)
        const bible = await addBible(data.metadata as BibleMetadata)
        if (bible) {
            // const download = new BibleDownloader()

            async function initApp() {
                try {
                    await bibleDownloader.init();
                    if (__DEV__) console.log("App prête");
                } catch (error) {
                    console.error("Erreur init:", error);
                }
            }

            async function download(link: string, bible_id: string, pourcentage: (value: {
                current: number;
                total: number;
                percent: number;
            }) => void) {
                try {
                    await bibleDownloader.downloadVersion(
                        link,
                        bible_id,
                        pourcentage
                    );
                } catch (error) {
                    console.error("Erreur:", error);
                }
            }

            try {
                await initApp()
                await download(data.lien as string, bible?.id, (value) => setProgress(value))
            } catch (e) {
                if (__DEV__) console.log("il y a une erreur", e)
            }
        }
        setDownload(false)
        setBtnstate(true)
    }

    const widthInterpolated = animatedWidth.interpolate({
        inputRange: [0, 100],
        outputRange: ['0%', '100%'],
    });

    return (
        <View style={{ position: 'relative' }}>
            <View style={{ borderWidth: 1, borderColor: '#ccccccff', padding: convert(12), flexDirection: "row", alignItems: "center", justifyContent: 'space-between' }} >
                <View>
                    <Text style={{ fontSize: convert(16), fontWeight: 'bold' }}>{item.metadata.name}</Text>
                    <Text style={{ fontSize: convert(16) }}>{item.metadata.module} {item.metadata.year}</Text>
                    <Text style={{ fontSize: convert(16), fontStyle: "italic", color: "#777" }}>{item.metadata.lang}, {item.metadata.lang_short}</Text>
                </View>
                <View>
                    <TouchableOpacity onPress={() => handleBibleMetadata(item)} style={{ width: 42, height: 42, alignItems: 'center', justifyContent: 'center', borderRadius: 21, backgroundColor: !alreadyDownload ? '#eee' : "#00c51a25" }} disabled={btnstate}>
                        {
                            download
                                ? <ActivityIndicator size={'small'} color={'black'} />
                                : <>
                                    {alreadyDownload
                                        ? <FluentCheckmark28Filled width={25} height={25} color={"#00c51aff"} />
                                        : <FluentArrowDownload32Filled width={20} height={20} />}
                                </>

                        }
                    </TouchableOpacity>
                </View>
            </View>
            <View style={{ height: 3, width: '99.4%', position: "absolute", bottom: 1, marginLeft: 1 }}>
                <Animated.View style={{ height: 3, width: widthInterpolated, backgroundColor: "#1f78ffff" }}></Animated.View>
            </View>
        </View>
    )
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
