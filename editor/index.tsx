"use dom"

import { Notes } from '@/Database/db'
import { TextStyleKit } from '@tiptap/extension-text-style'
import type { Editor } from '@tiptap/react'
import { EditorContent, useEditor, useEditorState } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import React, { useCallback, useEffect, useState } from 'react'
import { FluentAppsList20Filled, FluentArrowEnterLeft24Filled, FluentCode24Regular, FluentCodeBlock32Regular, FluentLineHorizontal128Regular, FluentTextBold24Regular, FluentTextHeader1Lines24Regular, FluentTextHeader2Lines24Regular, FluentTextHeader3Lines24Regular, FluentTextItalic24Filled, FluentTextNumberList24Regular, FluentTextQuote32Filled, FluentTextStrikethroughS24Regular } from './editor_icons'
import './style.css'

const extensions = [TextStyleKit, StarterKit]

function MenuBar({ editor }: { editor: Editor }) {
    // Read the current editor's state, and re-render the component when it changes
    const editorState = useEditorState({
        editor,
        selector: ctx => {
            return {
                isBold: ctx.editor.isActive('bold') ?? false,
                canBold: ctx.editor.can().chain().toggleBold().run() ?? false,
                isItalic: ctx.editor.isActive('italic') ?? false,
                canItalic: ctx.editor.can().chain().toggleItalic().run() ?? false,
                isStrike: ctx.editor.isActive('strike') ?? false,
                canStrike: ctx.editor.can().chain().toggleStrike().run() ?? false,
                isCode: ctx.editor.isActive('code') ?? false,
                canCode: ctx.editor.can().chain().toggleCode().run() ?? false,
                canClearMarks: ctx.editor.can().chain().unsetAllMarks().run() ?? false,
                isParagraph: ctx.editor.isActive('paragraph') ?? false,
                isHeading1: ctx.editor.isActive('heading', { level: 1 }) ?? false,
                isHeading2: ctx.editor.isActive('heading', { level: 2 }) ?? false,
                isHeading3: ctx.editor.isActive('heading', { level: 3 }) ?? false,
                isHeading4: ctx.editor.isActive('heading', { level: 4 }) ?? false,
                isHeading5: ctx.editor.isActive('heading', { level: 5 }) ?? false,
                isHeading6: ctx.editor.isActive('heading', { level: 6 }) ?? false,
                isBulletList: ctx.editor.isActive('bulletList') ?? false,
                isOrderedList: ctx.editor.isActive('orderedList') ?? false,
                isCodeBlock: ctx.editor.isActive('codeBlock') ?? false,
                isBlockquote: ctx.editor.isActive('blockquote') ?? false,
                canUndo: ctx.editor.can().chain().undo().run() ?? false,
                canRedo: ctx.editor.can().chain().redo().run() ?? false,
            }
        },
    })

    return (
        <div className="control-group">
            <div>
                <div className="button-group">
                    <button
                        onClick={() => editor.chain().focus().toggleBold().run()}
                        disabled={!editorState.canBold}
                        className={editorState.isBold ? 'is-active' : ''}
                    >
                        <FluentTextBold24Regular className='w-5 h-5' />
                    </button>
                    <button
                        onClick={() => editor.chain().focus().toggleItalic().run()}
                        disabled={!editorState.canItalic}
                        className={editorState.isItalic ? 'is-active' : ''}
                    >
                        <FluentTextItalic24Filled className="w-5 h-5" />
                    </button>
                    <button
                        onClick={() => editor.chain().focus().toggleStrike().run()}
                        disabled={!editorState.canStrike}
                        className={editorState.isStrike ? 'is-active' : ''}
                    >
                        <FluentTextStrikethroughS24Regular className="w-5 h-5" />
                    </button>
                    <button
                        onClick={() => editor.chain().focus().toggleCode().run()}
                        disabled={!editorState.canCode}
                        className={editorState.isCode ? 'is-active' : ''}
                    >
                        <FluentCode24Regular className='w-5 h-5' />
                    </button>
                    {/* <button onClick={() => editor.chain().focus().toggleMark("italic").run()}>Clear marks</button>
                    <button onClick={() => editor.chain().focus().clearNodes().run()}>Clear nodes</button> */}

                    <button
                        onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
                        className={editorState.isHeading1 ? 'is-active' : ''}
                    >
                        <FluentTextHeader1Lines24Regular className='h-5 w-5' />
                    </button>
                    <button
                        onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
                        className={editorState.isHeading2 ? 'is-active' : ''}
                    >
                        <FluentTextHeader2Lines24Regular className='w-5 h-5' />
                    </button>
                    <button
                        onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
                        className={editorState.isHeading3 ? 'is-active' : ''}
                    >
                        <FluentTextHeader3Lines24Regular className="w-5 h-5" />
                    </button>
                    <button
                        onClick={() => editor.chain().focus().toggleBulletList().run()}
                        className={editorState.isBulletList ? 'is-active' : ''}
                    >
                        <FluentAppsList20Filled className="w-5 h-5" />
                    </button>
                    <button
                        onClick={() => editor.chain().focus().toggleOrderedList().run()}
                        className={editorState.isOrderedList ? 'is-active' : ''}
                    >
                        <FluentTextNumberList24Regular className='w-5 h-5' />
                    </button>
                    <button
                        onClick={() => editor.chain().focus().toggleCodeBlock().run()}
                        className={editorState.isCodeBlock ? 'is-active' : ''}
                    >
                        <FluentCodeBlock32Regular className='w-5 h-5' />
                    </button>
                    <button
                        onClick={() => editor.chain().focus().toggleBlockquote().run()}
                        className={editorState.isBlockquote ? 'is-active' : ''}
                    >
                        <FluentTextQuote32Filled className='w-5 h-5' />
                    </button>
                    <button onClick={() => editor.chain().focus().setHorizontalRule().run()}> <FluentLineHorizontal128Regular className='w-5 h-5' /> </button>
                    <button onClick={() => editor.chain().focus().setHardBreak().run()}>
                        <FluentArrowEnterLeft24Filled className="w-5 h-5" />
                    </button>
                    <button onClick={() => editor.chain().focus().undo().run()} disabled={!editorState.canUndo}>
                        Undo
                    </button>
                    <button onClick={() => editor.chain().focus().redo().run()} disabled={!editorState.canRedo}>
                        Redo
                    </button>
                </div>
            </div>
        </div>
    )
}

export default function EditorJS({ note, updateNote }: { note: Notes, keyboardState?: { height: number, screenY: number, width: number } | undefined, updateNote: (data: Partial<Notes>) => void }) {
    const [isFocus, setIsFocus] = useState(false)
    const [content, setContent] = useState(note !== undefined && JSON.parse(note.body))
    const [isTyping, setIsTyping] = useState(false)
    const [savingState, setSavingState] = useState('Saving...')
    const [version, setVersion] = useState(0)
    const [html, setHtml] = useState("")

    const getinitnote = useCallback(async () => {
        if (note) {
            setVersion(note.version)
            setContent(JSON.parse(note.body))
            setHtml(note.html)
        }
    }, [])

    const editor = useEditor({
        extensions,
        content: content,
        onUpdate: (data) => {
            setContent(data.editor.getJSON())
            setHtml(data.editor.getHTML())
        }
    })


    useEffect(() => {
        getinitnote()
    }, [getinitnote])


    useEffect(() => {

        const t1 = setTimeout(() => {
            console.log("active")
            updateNote({
                id: note.id as string,
                body: JSON.stringify(content),
                version: version,
                html: html
            })
            setSavingState("Saved")
            setIsTyping(false)
        }, 3000)


        const t2 = setTimeout(() => {
            console.log("desactive")
            setSavingState("Saving...")
        }, 500)


        return () => {
            clearTimeout(t1)
            clearTimeout(t2)
        }

    }, [content])

    const handlegoback = () => {
        updateNote({
            id: note.id,
            body: content,
            version: version,
            html: html
        })
    }

    return (
        <div className="relative h-svh">
            <MenuBar editor={editor} />
            <EditorContent editor={editor} onFocus={() => setIsFocus(true)} onBlur={() => setIsFocus(false)} />
        </div>
    )
}