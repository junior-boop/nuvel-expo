import { convert } from "@/constants/convert";
import { useDatabase } from "@/context/database.context";
import type { Notes as NotesType } from "@/Database/db";
import { MaterialIcons } from '@expo/vector-icons';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import { router } from 'expo-router';
import { useEffect, useMemo, useState } from "react";
import { ScrollView, StyleSheet, TouchableOpacity } from "react-native";
import { Text, View } from "../Themed";
import NoteLongPress_Btn from './btn_noteLongPress';

type contentType = {
    type: string,
    content: {
        type: string,
        text: string
    }[],
    attrs?: {}
}

interface DataType {
    type: string,
    content: contentType[]
}

export default function NoteItems({ note }: { note: NotesType }) {
    const data = JSON.parse(note.body) as DataType
    const [longSelection, setLongSelection] = useState(false)
    const { deleteNote, toggleNotePinned } = useDatabase()

    const Blocks_reference = useMemo(() => {
        const t = data.content.filter((el) => el.type === 'bibleverset')

        return t
    }, [data])
    const Blocks_talks = useMemo(() => {
        const t = data.content.filter((el) => el.type === 'taskList')
        if (t.length !== 0) return t;
    }, [data])

    const block_text = () => {
        const t = data.content.filter((el) => el.type === 'paragraph')
        let String = ''
        t.forEach((element, key) => {
            const p = element.content
            if (p !== undefined) {
                const text = element.content[0].text.replace('&nbsp;', '')
                if (key < 1) String += text
                if (key >= 1) String += "\n" + text
            }
        });
        return `${String.substring(0, 250)}...`
    }

    const block_titre = () => {
        const t = data.content.filter(el => el.type === "heading")
        if (t.length === 0) {
            return null
        } else {
            return t[0].content[0].text
        }
    }

    const handleCloseSelect = () => {
        setLongSelection(false)
    }

    const handledelete = async () => {
        await deleteNote(note.id)
        setLongSelection(false)
    }

    const handlepinned = async () => {
        await toggleNotePinned({ ...note, pinned: note.pinned === 0 ? 1 : 0 })
        setLongSelection(false)
    }

    useEffect(() => {
        console.log(Blocks_talks !== null && Blocks_talks !== undefined && Blocks_talks[0].content[0].attrs.checked)
    }, [data])

    return (
        <View style={{
            ...styles.View_1,
            borderRadius: 2,
            borderColor: longSelection ? '#000' : '#e2e8f0',
            overflow: 'hidden',
            position: 'relative',
        }}>

            {
                longSelection && (<View style={{
                    position: 'absolute',
                    top: 7,
                    left: 0,
                    width: "96%",
                    height: "100%",
                    zIndex: 3,
                    flexDirection: 'row',
                    gap: 4,
                    justifyContent: 'flex-end',
                    backgroundColor: "#fffa"

                }}>

                    {data !== null && <NoteLongPress_Btn icon={<MaterialCommunityIcons name="pin" size={18} color="white" />} onPress={handlepinned} />}
                    <NoteLongPress_Btn icon={<MaterialIcons name="delete-outline" size={18} color="white" />} onPress={handledelete} />
                    <NoteLongPress_Btn icon={<MaterialIcons name="close" color={'white'} size={18} />} onPress={handleCloseSelect} />

                </View>)
            }
            <TouchableOpacity

                onPress={() => {
                    router.navigate({
                        pathname: 'noteeditor',
                        params: {
                            id: note.id,
                            userid: note.creator,
                        }
                    })
                }}

                onLongPress={() => {
                    setLongSelection(true)
                }}
            >
                <View style={{ paddingHorizontal: convert(14) }}>
                    <Text style={styles.titre}>{block_titre()}</Text>
                    <View style={styles.View_2}>
                        {data !== null && <Text style={styles.texte} >{block_text()}</Text>}
                        {data === null && <Text style={{ color: '#999' }}>{valuetext}</Text>}
                    </View>

                </View>
            </TouchableOpacity>
            {Blocks_reference !== null && Blocks_reference !== undefined && (<ScrollView horizontal={true} contentContainerStyle={{ paddingHorizontal: 14, gap: 8, paddingTop: 12 }} showsHorizontalScrollIndicator={false}>
                {Blocks_reference.map((el, key) => (<Text style={styles.ref} key={key}>{el.attrs.ref_bible}</Text>))}
            </ScrollView>)}
        </View>
    )
}

const styles = StyleSheet.create({
    View_1: {
        width: '100%',
        backgroundColor: "white",
        borderWidth: convert(1),
        paddingVertical: convert(12),
        userSelect: 'none'
    },
    titre: {
        fontSize: convert(15),
        marginBottom: convert(5),
        lineHeight: convert(18),
        fontWeight: "bold",
        color: '#444'
    },
    View_2: {
        overflow: 'hidden',
        position: 'relative',
        height: 'auto',
        maxHeight: convert(150)
    },

    texte: {
        fontSize: convert(14),
        lineHeight: convert(17),
        color: '#444'
    },
    ref: {
        paddingHorizontal: convert(8),
        paddingVertical: (4),
        borderRadius: (1),
        color: '#1e293b',
        fontSize: convert(13),
        backgroundColor: '#e2e8f0',
        width: 'auto'
    }
})