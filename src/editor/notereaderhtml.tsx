"use dom"

import BibleVerset from '@/components/bible_component/extension'
import { Notes } from '@/Database/db'
import Image from '@tiptap/extension-image'
import { TaskItem, TaskList } from '@tiptap/extension-list'
import { TextStyleKit } from '@tiptap/extension-text-style'
import { EditorContent, useEditor } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import moment from 'moment'
import React, { forwardRef, useState } from 'react'
import styles from './readerstyle'


const extensions = [BibleVerset, TextStyleKit, StarterKit, Image, TaskList,
    TaskItem.configure({
        nested: true,
    })]


const NoteReaderHtml = forwardRef(({ note }: { note: Notes }, ref) => {
    const [content] = useState(note.body)

    const editor = useEditor({
        extensions,
        content: JSON.parse(content),
        editable: false,
    })

    return (
        <div style={{ width: '100vw' }}>
            <style dangerouslySetInnerHTML={{ __html: styles }}></style>
            <div style={{ position: "relative", minHeight: "100svh", backgroundColor: 'white' }}>

                <EditorContent editor={editor} />
                <div style={{ height: 50 }} />
                <div style={{ padding: "5px 20px", position: 'fixed', bottom: 0, left: 0, right: 0, backgroundColor: 'white', borderTop: '1px solid #ccc', textAlign: 'center' }}>
                    <span style={{ fontSize: ".8rem", color: "#444" }}>
                        Last modification : {moment(note.modified).fromNow()}
                    </span>
                </div>
            </div>
        </div>
    )
})

export default NoteReaderHtml
