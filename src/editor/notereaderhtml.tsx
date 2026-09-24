"use dom"

import BibleVerset from '@/components/bible_component/extension'
import LinkPreview from '@/components/link_preview/extension'
import { Notes } from '@/Database/db'
import Image from '@tiptap/extension-image'
import Link from '@tiptap/extension-link'
import { TaskItem, TaskList } from '@tiptap/extension-list'
import { TextStyleKit } from '@tiptap/extension-text-style'
import { EditorContent, useEditor } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import moment from 'moment'
import React, { forwardRef, useEffect, useRef, useState } from 'react'
import styles from './readerstyle'


const extensions = [BibleVerset, TextStyleKit, StarterKit, Image.configure({ allowBase64: true }), TaskList,
    Link.configure({ openOnClick: false, autolink: true }),
    LinkPreview,
    TaskItem.configure({
        nested: true,
    })]


const NoteReaderHtml = forwardRef(({ note, onLinkPress }: { note: Notes, onLinkPress?: (url: string) => void }, ref) => {
    const [content] = useState(note.body)
    const onLinkPressRef = useRef<(url: string) => void>(() => { })
    onLinkPressRef.current = onLinkPress ?? (() => { })

    const editor = useEditor({
        extensions,
        content: JSON.parse(content),
        editable: false,
    })

    // Un <a> reste un lien natif dans la webview : le laisser suivre son comportement par
    // defaut la ferait naviguer DANS la webview au lieu d'ouvrir le navigateur. On ecoute en
    // phase de capture pour couper court avant que le navigateur ne traite le clic (meme
    // pattern que editor/index.tsx).
    useEffect(() => {
        if (!editor) return;
        const dom = editor.view.dom;
        const handleAnchorClick = (event: MouseEvent) => {
            const target = event.target as HTMLElement | null;
            const anchor = target?.closest?.('a');
            if (anchor?.href) {
                event.preventDefault();
                event.stopPropagation();
                onLinkPressRef.current(anchor.href);
            }
        };
        dom.addEventListener('click', handleAnchorClick, true);
        return () => dom.removeEventListener('click', handleAnchorClick, true);
    }, [editor])

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
