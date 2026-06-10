import { Text, View } from '@/components/Themed';
import { convert } from '@/constants/convert';
import { useDatabase } from '@/context/database.context';
import type { Notes } from '@/Database/db';
import Column from './column';

export default function AllNotesPinned() {
    const { notesQuery } = useDatabase()

    const note = notesQuery?.where((item) => item.pinned === 1 && item.archived === 0)
    // if (__DEV__) console.log(note)
    if (note?.length === 0) {
        return null
    }
    return (
        <View style={{ marginBottom: convert(24) }}>
            <View style={{ paddingHorizontal: 14 }}><Text style={{ fontSize: convert(18), fontWeight: "bold", marginBottom: convert(12) }}>Notes épinglés</Text></View>
            <Column data={note as Notes[]} />
        </View>
    );
}
