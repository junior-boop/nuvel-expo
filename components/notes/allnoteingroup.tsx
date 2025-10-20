import { View } from '@/components/Themed';
import { useDatabase } from '@/context/database.context';
import type { Notes } from '@/Database/db';
import Column from './column';

export default function AllNotesFiltersGroup({ id }: { id: string }) {
    const { notesQuery } = useDatabase()

    const note = notesQuery?.where((item) => item.grouped === id)

    return (
        <View>
            {/* <View style={{ paddingHorizontal: 14 }}><Text style={{ fontSize: convert(18), fontWeight: "bold", marginBottom: convert(12) }}>Toutes les Notes</Text></View> */}
            <Column data={note as Notes[]} />
        </View>
    );
}

