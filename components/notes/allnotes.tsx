import { Text, View } from '@/components/Themed';
import { convert } from '@/constants/convert';
import { useDatabase } from '@/context/database.context';
import type { Notes } from '@/Database/db';
import Column from './column';

export default function AllNotesFilters() {
    const { notesQuery } = useDatabase()

    const note = notesQuery?.where((item) => item.pinned === 0 && item.archived === 0 && item.grouped === null)
    // console.log(note)

    return (
        <View>
            <View style={{ paddingHorizontal: 14 }}><Text style={{ fontSize: convert(18), fontWeight: "bold", marginBottom: convert(12) }}>Toutes les Notes</Text></View>
            <Column data={note as Notes[]} />
        </View>
    );
}

