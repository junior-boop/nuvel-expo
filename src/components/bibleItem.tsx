import { Text, View } from '@/components/Themed';
import { convert } from '@/constants/convert';
import {
    BibleVersetIcon,
    FluentAlert32Regular,
    FluentArrowDownload32Filled,
    FluentCheckmark28Filled,
} from '@/constants/icons';
import { useDatabase } from '@/context/database.context';
import { bibleDownloader } from '@/Database/bibledownload';
import { BibleData, BibleMetadata } from '@/Database/db';
import { useEffect, useRef, useState } from 'react';
import { ActivityIndicator, Animated, Easing, TouchableOpacity } from 'react-native';

// /bible/version renvoie `verset` (nombre de versets) au niveau racine, et /bible
// (liste des fichiers) renvoie `tailleFormatee` : ni l'un ni l'autre n'appartient
// au type BibleData, qui ne modélise que la forme du fichier stocké sur R2.
export type BibleListItem = BibleData & {
    verset?: number;
    tailleFormatee?: string;
};

const FEATURE_BADGES: { key: keyof BibleMetadata; label: string }[] = [
    { key: 'strongs', label: "Strong's" },
    { key: 'red_letter', label: 'Paroles du Christ' },
    { key: 'italics', label: 'Italiques' },
    { key: 'paragraph', label: 'Paragraphes' },
    { key: 'official', label: 'Officielle' },
    { key: 'research', label: 'Recherche' },
];

export const BibleItems = ({ item }: { item: BibleListItem }) => {
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
    const activeBadges = FEATURE_BADGES.filter(b => Number(item.metadata[b.key]) === 1)
    const isRestricted = Number(item.metadata.restrict) === 1

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


    const handleBibleMetadata = async (data: Partial<BibleListItem>) => {
        setDownload(true)
        const bible = await addBible(data.metadata as BibleMetadata)
        if (bible) {
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
            <View style={{ borderWidth: 1, borderColor: '#ccccccff', padding: convert(12), flexDirection: "row", alignItems: "flex-start", justifyContent: 'space-between' }} >
                <View style={{ flex: 1, paddingRight: convert(12) }}>
                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: convert(8) }}>
                        <Text style={{ fontSize: convert(16), fontWeight: 'bold' }}>{item.metadata.name}</Text>
                        <View style={{ paddingHorizontal: convert(6), paddingVertical: 2, backgroundColor: '#eee', borderRadius: 4 }}>
                            <Text style={{ fontSize: convert(11), fontWeight: '600', color: '#555' }}>{item.metadata.shortname}</Text>
                        </View>
                    </View>
                    <Text style={{ fontSize: convert(13), color: "#555", marginTop: 2 }}>
                        {[item.metadata.lang, item.metadata.year, item.metadata.publisher].filter(Boolean).join(' · ')}
                    </Text>

                    {activeBadges.length > 0 && (
                        <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: convert(6), marginTop: convert(8) }}>
                            {activeBadges.map(b => (
                                <View key={b.key} style={{ paddingHorizontal: convert(8), paddingVertical: convert(3), backgroundColor: '#e8f2ff', borderRadius: 12 }}>
                                    <Text style={{ fontSize: convert(10), color: '#1f78ff', fontWeight: '600' }}>{b.label}</Text>
                                </View>
                            ))}
                        </View>
                    )}
                    <View style={{ flexDirection: 'row', alignItems: 'center', flexWrap: 'wrap', gap: convert(12), marginTop: convert(8) }}>
                        {!!item.verset && (
                            <View style={{ flexDirection: 'row', alignItems: 'center', gap: convert(4) }}>
                                <BibleVersetIcon width={12} height={12} color="#999" />
                                <Text style={{ fontSize: convert(11), color: '#999' }}>{item.verset.toLocaleString()} versets</Text>
                            </View>
                        )}
                        {!!item.tailleFormatee && (
                            <Text style={{ fontSize: convert(11), color: '#999' }}>{item.tailleFormatee}</Text>
                        )}
                        {isRestricted && (
                            <View style={{ flexDirection: 'row', alignItems: 'center', gap: convert(4) }}>
                                <FluentAlert32Regular width={12} height={12} color="#c77700" />
                                <Text style={{ fontSize: convert(11), color: '#c77700' }}>Usage restreint</Text>
                            </View>
                        )}
                    </View>
                </View>
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
            <View style={{ height: 3, width: '99.4%', position: "absolute", bottom: 1, marginLeft: 1 }}>
                <Animated.View style={{ height: 3, width: widthInterpolated, backgroundColor: "#1f78ffff" }}></Animated.View>
            </View>
        </View>
    )
}
