import { View } from '@/components/Themed';
import { useDatabase } from '@/context/database.context';
import type { Notes } from '@/Database/db';
import Column from './column';

export default function AllNotesFiltersGroup({ id }: { id: string }) {
    const { notesQuery } = useDatabase()

    const note = notesQuery?.where((item) => item.grouped === id)

    return (
        <View>
            <Column data={note as Notes[]} />
        </View>
    );
}

