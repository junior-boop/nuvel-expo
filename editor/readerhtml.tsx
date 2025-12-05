"use dom"

import BibleVerset from '@/components/bible_component/extension'
import { Notes, User } from '@/Database/db'
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





const ReaderHtml = forwardRef(({ note, author }: { note: Notes, author: User }, ref) => {
    const [isFocus, setIsFocus] = useState(false)
    const [content, setContent] = useState(note.body)
    const [isTyping, setIsTyping] = useState(false)
    const [savingState, setSavingState] = useState('Saving...')
    const [version, setVersion] = useState(0)

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
        document.querySelector('h1')?.remove()
        const text = document.body.innerText
        console.log(tempslecture(text))

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
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <span style={{ fontSize: "1rem", color: "#444", display: 'block', marginTop: '8px', fontWeight: 'normal' }}>#{note.topic}</span> |
                        <span style={{ fontSize: "1rem", color: "#444", display: 'inline-block', marginTop: '8px', fontWeight: 'normal' }}>{tempslecture(note.body)} mins read</span>
                    </div>
                    <p style={{ fontSize: "1.20rem", color: "#444", fontStyle: "italic" }}>{note.description}</p>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <div style={{ backgroundColor: '#333', width: '42px', aspectRatio: 1, borderRadius: 21, overflow: 'hidden' }}>
                            <img src={`https://${author.imageurl}`} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                        </div>
                        <div>
                            <span style={{ fontSize: "1.15rem", color: "#444", display: 'block', marginBottom: 2, fontWeight: 'bold' }}>{author.name} {author.first_name}</span>
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