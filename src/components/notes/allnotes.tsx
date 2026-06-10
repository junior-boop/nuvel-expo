import { Text, View } from '@/components/Themed';
import { convert } from '@/constants/convert';
import { useDatabase } from '@/context/database.context';
import type { Notes } from '@/Database/db';
import Column from './column';

export default function AllNotesFilters() {
    const { notesQuery } = useDatabase()

    const note = notesQuery?.where((item) => item.pinned === 0 && item.archived === 0 && item.grouped === null)
    const notepinned = notesQuery?.where((item) => item.pinned === 1 && item.archived === 0 && item.grouped === null)
    const notepublished = notesQuery?.where((item) => item.publishId !== null)

    return (
        <View>
            {notepinned?.length > 0 || notepublished?.length > 0 ? <View style={{ paddingHorizontal: 14 }}><Text style={{ fontSize: convert(18), fontWeight: "bold", marginBottom: convert(12) }}>Toutes les Notes</Text></View> : null}
            <Column data={note as Notes[]} />
        </View>
    );
}

