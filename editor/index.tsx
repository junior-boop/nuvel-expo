"use dom"

import BibleVerset from '@/components/bible_component/extension'
import { BibleMetadata, Notes } from '@/Database/db'
import Image from '@tiptap/extension-image'
import { TaskItem, TaskList } from '@tiptap/extension-list'
import { TextStyleKit } from '@tiptap/extension-text-style'
import type { Editor } from '@tiptap/react'
import { EditorContent, useEditor, useEditorState } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import React, { forwardRef, useCallback, useEffect, useImperativeHandle, useState } from 'react'
import { BxsBible, FluentAppsList20Filled, FluentArrowEnterLeft24Filled, FluentCode24Regular, FluentCodeBlock32Regular, FluentImageAdd32Regular, FluentLineHorizontal128Regular, FluentTaskList24Filled, FluentTextBold24Regular, FluentTextHeader1Lines24Regular, FluentTextHeader2Lines24Regular, FluentTextHeader3Lines24Regular, FluentTextItalic24Filled, FluentTextNumberList24Regular, FluentTextQuote32Filled, FluentTextStrikethroughS24Regular, IcSharpArrowDownward } from './editor_icons'
import styles from './styles'

const extensions = [BibleVerset, TextStyleKit, StarterKit, Image, TaskList,
    TaskItem.configure({
        nested: true,
    })]


type bibleverst = {
    n: string | number | undefined;
    text: string | undefined;
}[]

const MenuBar = forwardRef(({ editor, biblemetadatState, trie, menubtn }: {
    editor: Editor, biblemetadatState: BibleMetadata[], menubtn?: { teste: () => void }, trie: (data: [book_id: string, book_name: string, chapter: string, vers1?: string, vers2?: string]) => Promise<{
        ref_bible: string;
        content: string;
    } | undefined>
}, ref) => {
    const [bible_id, setBible_id] = useState<string | null>(null)
    const [openBible, setOpenBible] = useState(false)
    const [verse, setVerse] = useState<string>("")

    const handleImage = ({ target }: { target: HTMLInputElement }) => {

        if (target.files) {
            const readfile = new FileReader()
            readfile.onload = () => {
                editor.chain().focus().setImage({ src: readfile.result as string }).run()
            }
            readfile.readAsDataURL(target.files[0])
        }
    }

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

    const handleBible = (el: BibleMetadata) => {
        // @ts-ignore
        setBible_id(el.id)
    }

    useImperativeHandle(ref, () => ({
        test() {
            console.log("test from menubar")
        }
    }))



    const handleVerse = async (verse: string) => {
        const check = /[;:\-v]/g
        const replace = verse.replace(RegExp(check), ' ')
        const spliter = replace.split(RegExp(/\s+/g)) as [book_name: string, chapter: string, vers1?: string, vers2?: string]
        if (bible_id !== null) {
            const result = await trie([bible_id, ...spliter])
            if (verse.trim() !== "") {
                if (result !== undefined) {
                    editor?.commands.setVerset(result)
                    setOpenBible(false)
                    setVerse("")
                }
            }
        }

    }

    useEffect(() => {
        if (menubtn) {
            menubtn.teste = () => editor.chain().focus().toggleBold().run()
        }
    }, [])


    return (
        <div className="control-group">
            <div>
                <div className="button-group">
                    <button
                        onClick={() => editor.chain().focus().toggleBold().run()}
                        disabled={!editorState.canBold}
                        className={editorState.isBold ? 'is-active' : ''}
                    >
                        <FluentTextBold24Regular width={20} height={20} />
                    </button>
                    <button
                        onClick={() => editor.chain().focus().toggleItalic().run()}
                        disabled={!editorState.canItalic}
                        className={editorState.isItalic ? 'is-active' : ''}
                    >
                        <FluentTextItalic24Filled width={20} height={20} />
                    </button>
                    <button
                        onClick={() => editor.chain().focus().toggleStrike().run()}
                        disabled={!editorState.canStrike}
                        className={editorState.isStrike ? 'is-active' : ''}
                    >
                        <FluentTextStrikethroughS24Regular width={20} height={20} />
                    </button>
                    <button
                        onClick={() => editor.chain().focus().toggleCode().run()}
                        disabled={!editorState.canCode}
                        className={editorState.isCode ? 'is-active' : ''}
                    >
                        <FluentCode24Regular width={20} height={20} />
                    </button>

                    <button
                        onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
                        className={editorState.isHeading1 ? 'is-active' : ''}
                    >
                        <FluentTextHeader1Lines24Regular width={20} height={20} />
                    </button>
                    <button
                        onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
                        className={editorState.isHeading2 ? 'is-active' : ''}
                    >
                        <FluentTextHeader2Lines24Regular width={20} height={20} />
                    </button>
                    <button
                        onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
                        className={editorState.isHeading3 ? 'is-active' : ''}
                    >
                        <FluentTextHeader3Lines24Regular width={20} height={20} />
                    </button>
                    <button
                        onClick={() => editor.chain().focus().toggleBulletList().run()}
                        className={editorState.isBulletList ? 'is-active' : ''}
                    >
                        <FluentAppsList20Filled width={20} height={20} />
                    </button>
                    <button
                        onClick={() => editor.chain().focus().toggleOrderedList().run()}
                        className={editorState.isOrderedList ? 'is-active' : ''}
                    >
                        <FluentTextNumberList24Regular width={20} height={20} />
                    </button>
                    <button
                        onClick={() => editor.chain().focus().toggleCodeBlock().run()}
                        className={editorState.isCodeBlock ? 'is-active' : ''}
                    >
                        <FluentCodeBlock32Regular width={20} height={20} />
                    </button>
                    <button
                        onClick={() => editor.chain().focus().toggleBlockquote().run()}
                        className={editorState.isBlockquote ? 'is-active' : ''}
                    >
                        <FluentTextQuote32Filled width={20} height={20} />
                    </button>
                    <button onClick={() => editor.chain().focus().setHorizontalRule().run()}> <FluentLineHorizontal128Regular className='w-5 h-5' /> </button>
                    <button onClick={() => editor.chain().focus().setHardBreak().run()}>
                        <FluentArrowEnterLeft24Filled width={20} height={20} />
                    </button>
                    <div style={{ position: 'relative' }}>
                        <button onClick={() => setOpenBible(!openBible)}>
                            <BxsBible width={20} height={20} />
                        </button>

                    </div>
                    <div style={{ position: 'relative' }}>
                        <input type='file' className='inputImage' onChange={handleImage} />
                        <button className='long-btn'>
                            <FluentImageAdd32Regular width={20} height={20} />
                            <span>Image</span>
                        </button>
                    </div>
                    <button
                        onClick={() => editor.chain().focus().toggleTaskList().run()}
                        className={editor.isActive('taskList') ? 'is-active' : ''}
                    >
                        <FluentTaskList24Filled width={20} height={20} />
                    </button>
                </div>
            </div>
            {
                openBible && (<div className='input-group'>
                    <div className='input'>
                        <input value={verse} onChange={({ target }) => setVerse(target.value)} type="text" placeholder='Type your bible ref' />
                        <button onClick={() => handleVerse(verse)}>
                            <IcSharpArrowDownward width={35} height={35} />
                        </button>
                    </div>
                    <div className='books'>
                        <div>
                            {
                                biblemetadatState?.map((el, key) => <BibleItem
                                    key={key} el={el}
                                    onClick={() => { handleBible(el) }}
                                    // @ts-ignore
                                    isActived={bible_id === el.id}
                                />)
                            }
                        </div>
                    </div>
                </div>)
            }
        </div>
    )
})


const BibleItem = ({ el, isActived, onClick }: { el: BibleMetadata, onClick: () => void, isActived: boolean }) => {
    return (<button onClick={onClick} style={{ backgroundColor: isActived ? "rgba(0, 153, 255, 0.14)" : "white", color: isActived ? "rgb(16, 83, 170)" : 'black' }}>{el.name}</button>)
}

// export default function EditorJS({ note, updateNote, biblemetadatState, trie, menubtn }: { note: Notes, keyboardState?: { height: number, screenY: number, width: number } | undefined, updateNote: (data: Partial<Notes>) => void, biblemetadatState: BibleMetadata[], trie: (data: any) => any, menubtn?: { teste: () => void } }) {

// }


const EditorJS = forwardRef(({ note, updateNote, biblemetadatState, trie, menubtn }: { note: Notes, keyboardState?: { height: number, screenY: number, width: number } | undefined, updateNote: (data: Partial<Notes>) => void, biblemetadatState: BibleMetadata[], trie: (data: any) => any, menubtn?: { teste: () => void } }, ref) => {
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


    return (

        <div style={{ width: '100vw' }}>
            <style dangerouslySetInnerHTML={{ __html: styles }}></style>
            <div style={{ position: "relative", height: "100svh" }}>
                <MenuBar editor={editor} biblemetadatState={biblemetadatState} trie={trie} menubtn={menubtn} />
                <EditorContent editor={editor} onFocus={() => setIsFocus(true)} onBlur={() => setIsFocus(false)} ref={ref} />
            </div>
        </div>
    )
})

export default EditorJS