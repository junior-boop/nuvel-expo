"use dom"

import BibleVerset from '@/components/bible_component/extension'
import { Notes } from '@/Database/db'
import Image from '@tiptap/extension-image'
import { TaskItem, TaskList } from '@tiptap/extension-list'
import { TextStyleKit } from '@tiptap/extension-text-style'
import { EditorContent, useEditor } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import moment from 'moment'
import React, { forwardRef, useEffect, useState } from 'react'
import styles from './readerstyle'


const extensions = [BibleVerset, TextStyleKit, StarterKit, Image, TaskList,
    TaskItem.configure({
        nested: true,
    })]





const ReaderHtml = forwardRef(({ note }: { note: Notes, }, ref) => {
    const [content, setContent] = useState(note.body)
    const [readTime, setReadTime] = useState(0)

    const editor = useEditor({
        extensions,
        content: content,
        editable: false,
    })


    const tempslecture = (text: string) => {
        const mots = text.split(/\s+/).length
        const temps = Math.ceil(mots / 150)
        return temps
    }

    useEffect(() => {
        if (content) {
            document.querySelector('h1')?.remove()
            const text = document.body.innerText
            setReadTime(tempslecture(text))

            if (__DEV__) console.log('note.user', note.user.name)
        }
    }, [])


    return (
        <div style={{ width: '100vw' }}>
            <style dangerouslySetInnerHTML={{ __html: styles }}></style>
            <div style={{ position: "relative", height: "100svh", backgroundColor: 'white' }}>
                <div style={{ width: '100%', aspectRatio: 4 / 3, overflow: 'hidden' }}>
                    <img src={`https://${note.imageurl}`} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                </div>
                <div style={{ padding: "24px" }}>
                    <span style={{ fontSize: "2rem", fontWeight: "bold", color: "black" }}>{note.title}</span>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: "2rem", }}>
                        <span style={{ fontSize: "1rem", color: "#444", display: 'block', marginTop: '8px', fontWeight: 'normal' }}>#{note.topic}</span> <span style={{ display: 'inline-block', width: '5px', height: '1rem', verticalAlign: 'middle', marginBottom: '6px' }}>•</span>
                        <span style={{ fontSize: "1rem", color: "#444", display: 'inline-block', marginTop: '8px', fontWeight: 'normal' }}>{readTime} mins read</span>
                    </div>
                    <p style={{ fontSize: "1.20rem", color: "#444", fontStyle: "italic" }}>{note.description}</p>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <div style={{ backgroundColor: '#333', width: '42px', aspectRatio: 1, borderRadius: 21, overflow: 'hidden' }}>
                            <img src={`https://${note.user.photo}`} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                        </div>
                        <div>
                            <span style={{ fontSize: "1.15rem", color: "#444", display: 'block', marginBottom: 2, fontWeight: 'bold' }}>{note.user.name} {note.user.first_name}</span>
                            <span style={{ fontSize: "1rem", color: "#444", fontStyle: "italic" }}>published: {moment(note.createdAt).fromNow()}</span>
                        </div>
                    </div>
                </div>

                <EditorContent editor={editor} />
                <div style={{ height: 50 }} />
            </div>
        </div>
    )
})

export default ReaderHtml