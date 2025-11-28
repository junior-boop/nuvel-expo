import { View } from "@/components/Themed";
import { convert } from "@/constants/convert";
import { IcBaselineArrowBack } from "@/constants/icons";
import ReaderHtml from "@/editor/readerhtml";
import { router, useLocalSearchParams } from "expo-router";
import { useCallback, useEffect, useState } from "react";
import { TouchableOpacity } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

export default function ReaderPage() {
    const frame = useSafeAreaInsets()
    const { article } = useLocalSearchParams()
    const [author, setAuthor] = useState({})
    const note = JSON.parse(article as string)

    const fetchAutor = useCallback(async () => {
        const response = await fetch(`https://nuvelserver.godigital.workers.dev/users/${note.userid}`)
        const data = await response.json()
        setAuthor(data)
    }, [])

    useEffect(() => {
        fetchAutor()
    }, [])
    return (
        <View style={{ flex: 1 }}>
            <View style={{ height: frame.top }} />
            <View style={{ height: convert(52), backgroundColor: 'white', flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: convert(16) }}>
                <TouchableOpacity onPress={() => { router.back() }}>
                    <IcBaselineArrowBack width={24} height={24} color={'black'} />
                </TouchableOpacity>
            </View>
            <ReaderHtml note={JSON.parse(article as string)} author={author} />
        </View>
    )
}