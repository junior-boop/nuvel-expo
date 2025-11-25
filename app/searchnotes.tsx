import { PageLayout_3 } from "@/components/page";
import { View } from "@/components/Themed";
// import * as WebView from 'react-native-webview';
import { router, Stack } from "expo-router";

import Column from "@/components/notes/column";
import { convert } from "@/constants/convert";
import { IcBaselineArrowBack } from "@/constants/icons";
import { useDatabase } from "@/context/database.context";
import { Notes } from "@/Database/db";
import { useCallback, useEffect, useState } from "react";
import { ScrollView, TextInput, TouchableOpacity } from "react-native";
// search notes
// L'objectif est d'avoir une page de recherche de notes
// la recherhche sera faitre uniquement sur les titre des notes pour le moment
// 
export default function SearchNotes() {
    const [value, setValue] = useState('');
    const [search, setSearch] = useState<Notes[] | null>(null)
    const { notesQuery } = useDatabase()
    const handleEdit = (text: string) => {
        setValue(text);
    }

    const searchResult = useCallback(() => {
        const escapedValue = value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
        const regex = new RegExp(escapedValue, 'i')
        return notesQuery?.where((item) => regex.test(JSON.parse(item.body).content[0].content[0].text))
    }, [value])


    useEffect(() => {
        searchResult()
        setSearch(searchResult() || null)
    }, [value])
    return (
        <PageLayout_3>
            <Stack.Screen options={{
                headerShown: false,
            }} />
            <View style={{ paddingHorizontal: 16 }}>

                <View style={{ flexDirection: "row", height: 62, alignItems: "center", gap: convert(12) }}>
                    <TouchableOpacity onPress={() => { router.back() }}>
                        <IcBaselineArrowBack width={24} height={24} color={'black'} />
                    </TouchableOpacity>
                    <TextInput multiline value={value} onChangeText={handleEdit} style={{ fontSize: convert(18), fontWeight: 'bold', padding: 0, color: 'black' }} autoFocus={true} placeholder="Type the title" placeholderTextColor={"#919191ff"} />
                </View>
            </View>
            <ScrollView contentContainerStyle={{ paddingTop: convert(24) }}>

                <View>
                    {search !== null && <Column data={search as Notes[]} />}
                </View>
            </ScrollView>
        </PageLayout_3>
    )
}