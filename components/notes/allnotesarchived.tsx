import { Text, View } from '@/components/Themed';
import { w } from '@/constants/Colors';
import { convert } from '@/constants/convert';
import { FluentArchive16Regular } from '@/constants/icons';
import { useDatabase } from '@/context/database.context';
import type { Notes } from '@/Database/db';
import { ScrollView } from 'react-native';
import Column from './column';

export default function AllNotesArchived() {
    const { notesQuery } = useDatabase()

    const note = notesQuery?.where((item) => item.archived === true)
    console.log(note)
    if (note?.length === 0) {
        return (
            <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
                <View style={{ alignItems: 'center', justifyContent: 'center', width: (w * 0.6) }}>
                    <FluentArchive16Regular width={82} height={82} color={"#afafaf"} />
                    <Text style={{ fontSize: 18, color: "#999", fontWeight: 'bold', textAlign: 'center' }}>Aucune note archivée pour le moment</Text>
                </View>
            </View>
        )
    }

    return (
        <ScrollView style={{ flex: 1 }} contentContainerStyle={{ paddingBottom: convert(72), paddingTop: convert(16) }}>
            <View>
                <Column data={note as Notes[]} />
            </View>
        </ScrollView>

    );
}

