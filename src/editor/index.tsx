"use dom"

import BibleVerset from '@/components/bible_component/extension'
import { BibleMetadata, Notes } from '@/Database/db'
import Image from '@tiptap/extension-image'
import { TaskItem, TaskList } from '@tiptap/extension-list'
import { TextStyleKit } from '@tiptap/extension-text-style'
import type { Editor } from '@tiptap/react'
import { EditorContent, useEditor, useEditorState } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import { useDOMImperativeHandle, type DOMImperativeFactory } from 'expo/dom'
import React, { forwardRef, useCallback, useEffect, useImperativeHandle, useMemo, useRef, useState } from 'react'

// --- Helpers --------------------------------------------------------------

/** Parse défensif : body peut être "", null, ou HTML legacy → on retombe sur un doc vide. */
const safeParseBody = (body: unknown): any => {
    if (!body || typeof body !== 'string') return { type: 'doc', content: [] };
    try {
        return JSON.parse(body);
    } catch {
        if (__DEV__) console.log('[Editor] body non-JSON, fallback doc vide');
        return { type: 'doc', content: [] };
    }
};

/** Redimensionne une image (DataURL) à largeur max + qualité JPEG. Réduit le poids du body. */
const MAX_IMAGE_WIDTH = 1280;
const IMAGE_QUALITY = 0.8;
const resizeDataUrl = (dataUrl: string): Promise<string> => new Promise((resolve) => {
    const img = new window.Image();
    img.onload = () => {
        if (img.width <= MAX_IMAGE_WIDTH) { resolve(dataUrl); return; }
        const ratio = MAX_IMAGE_WIDTH / img.width;
        const canvas = document.createElement('canvas');
        canvas.width = MAX_IMAGE_WIDTH;
        canvas.height = Math.round(img.height * ratio);
        const ctx = canvas.getContext('2d');
        if (!ctx) { resolve(dataUrl); return; }
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
        resolve(canvas.toDataURL('image/jpeg', IMAGE_QUALITY));
    };
    img.onerror = () => resolve(dataUrl);
    img.src = dataUrl;
});
import { BxsBible, FluentAppsList20Filled, FluentArrowEnterLeft24Filled, FluentCode24Regular, FluentCodeBlock32Regular, FluentImageAdd32Regular, FluentLineHorizontal128Regular, FluentTaskList24Filled, FluentTextBold24Regular, FluentTextHeader1Lines24Regular, FluentTextHeader2Lines24Regular, FluentTextHeader3Lines24Regular, FluentTextItalic24Filled, FluentTextNumberList24Regular, FluentTextQuote32Filled, FluentTextStrikethroughS24Regular, IcSharpArrowDownward } from './editor_icons'
import SpellcheckExtension, { SpellErrorClickInfo } from './spellcheckExtension'
import { computeSpellHunks, getTextWithPositions, SpellHunk } from './spellcheckDiff'
import styles from './styles'


type bibleverst = {
    n: string | number | undefined;
    text: string | undefined;
}[]

const MenuBar = forwardRef(({ editor, biblemetadatState, trie, menubtn }: {
    editor: Editor | null, biblemetadatState: BibleMetadata[], menubtn?: { teste: () => void }, trie: (data: [book_id: string, book_name: string, chapter: string, vers1?: string, vers2?: string]) => Promise<{
        ref_bible: string;
        content: string;
    } | undefined>,
}, ref) => {
    const [bible_id, setBible_id] = useState<string | null>(null)
    const [openBible, setOpenBible] = useState(false)
    const [verse, setVerse] = useState<string>("")

    const handleImage = ({ target }: { target: HTMLInputElement }) => {
        if (!target.files || target.files.length === 0) return;
        const file = target.files[0];

        // Garde-fou : refuse > 8 MB (avant resize)
        const MAX_INPUT_BYTES = 8 * 1024 * 1024;
        if (file.size > MAX_INPUT_BYTES) {
            window.alert(`Image trop lourde (${(file.size / 1024 / 1024).toFixed(1)} MB). Maximum 8 MB.`);
            target.value = '';
            return;
        }

        const readfile = new FileReader()
        readfile.onload = async () => {
            const original = readfile.result as string;
            const resized = await resizeDataUrl(original);
            if (__DEV__) console.log(`[Editor] image: ${original.length} → ${resized.length} chars`);
            editor.chain().focus().setImage({ src: resized }).run()
        }
        readfile.readAsDataURL(file)
        target.value = '';
    }

    // Read the current editor's state, and re-render the component when it changes
    const editorState = useEditorState({
        editor,
        selector: ctx => {
            // Garde-fou : editor peut être null le temps que Tiptap se monte
            if (!ctx.editor) {
                return {
                    isBold: false, canBold: false, isItalic: false, canItalic: false,
                    isStrike: false, canStrike: false, isCode: false, canCode: false,
                    canClearMarks: false, isParagraph: false,
                    isHeading1: false, isHeading2: false, isHeading3: false,
                    isHeading4: false, isHeading5: false, isHeading6: false,
                    isBulletList: false, isOrderedList: false,
                    isCodeBlock: false, isBlockquote: false,
                    canUndo: false, canRedo: false,
                    selectionEmpty: true,
                };
            }
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
                selectionEmpty: ctx.editor.state.selection.empty,
            }
        },
    })

    const handleBible = (el: BibleMetadata) => {
        setBible_id(el.id)
    }

    useImperativeHandle(ref, () => ({
        test() {
            if (__DEV__) console.log("test from menubar")
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

    // Pattern muté sur prop retiré (anti-pattern React) — exposé via ref si besoin.
    void menubtn;

    // Tiptap n'est pas encore monté : ne rien rendre plutôt que crash sur editor.isActive(...)
    if (!editor) return <div className="control-group" />;


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


export interface EditorJSRef extends DOMImperativeFactory {
    runSpellCheck: () => void;
    applyAllCorrections: () => void;
}

const EditorJS = forwardRef<EditorJSRef, { note: Notes, keyboardState?: { height: number, screenY: number, width: number } | undefined, updateNote: (data: Partial<Notes>) => void, biblemetadatState: BibleMetadata[], trie: (data: any) => any, menubtn?: { teste: () => void }, correctText?: (text: string) => Promise<string | null>, onSpellStateChange?: (state: { isChecking: boolean; count: number }) => void }>(({ note, updateNote, biblemetadatState, trie, menubtn, correctText, onSpellStateChange }, ref) => {
    const [isFocus, setIsFocus] = useState(false)
    const [content, setContent] = useState<any>(() => safeParseBody(note?.body))
    const [isTyping, setIsTyping] = useState(false)
    const [savingState, setSavingState] = useState<'idle' | 'typing' | 'saving' | 'saved'>('idle')
    const [version, setVersion] = useState(0)
    const [html, setHtml] = useState("")
    const [spellHunks, setSpellHunks] = useState<SpellHunk[]>([])
    const [spellPopup, setSpellPopup] = useState<SpellHunk | null>(null)
    const [isChecking, setIsChecking] = useState(false)
    const onErrorClickRef = useRef<(info: SpellErrorClickInfo) => void>(() => { })

    // Sync sur changement de note (id) — l'ancienne version figeait à []
    const getinitnote = useCallback(async () => {
        if (note) {
            setVersion(note.version)
            setContent(safeParseBody(note.body))
            setHtml(note.html)
            setSpellHunks([])
            setSpellPopup(null)
            editor?.commands.clearSpellErrors()
        }
    }, [note?.id])

    const extensions = useMemo(() => [BibleVerset, TextStyleKit, StarterKit, Image, TaskList,
        TaskItem.configure({
            nested: true,
        }), SpellcheckExtension.configure({
            onErrorClick: (info: SpellErrorClickInfo) => onErrorClickRef.current(info),
        })], [])

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

    // --- AUTOSAVE V2 (actif) -----------------------------------------------
    // Vrai debounce 800ms : à chaque frappe on passe "typing", on annule le timer
    // précédent et on en repose un. À l'expiration : "saving" → updateNote → "saved".
    // La version est incrémentée à chaque save pour que le LWW serveur arbitre correctement.
    const isFirstRun = useRef(true);
    useEffect(() => {
        if (isFirstRun.current) { isFirstRun.current = false; return; }
        setIsTyping(true);
        setSavingState('typing');

        const t = setTimeout(async () => {
            if (!note?.id) return;
            setSavingState('saving');
            const nextVersion = version + 1;
            await Promise.resolve(updateNote({
                id: note.id as string,
                body: JSON.stringify(content),
                version: nextVersion,
                html: html,
            }));
            setVersion(nextVersion);
            setSavingState('saved');
            setIsTyping(false);
        }, 800);

        return () => clearTimeout(t);
    }, [content]);

    // --- CORRECTION À LA DEMANDE (un seul appel serveur par clic) ----------
    // Le bouton flottant reste au repos ("Correction") tant qu'aucune vérification
    // n'a été demandée. Au clic : un unique appel au serveur renvoie le texte
    // corrigé, diffé mot à mot vs. l'original pour localiser les segments fautifs
    // (encadrés en rouge via l'extension `spellcheck`). Le bouton devient alors
    // "Fix all (N)" pour une correction globale ; chaque segment reste cliquable
    // pour une correction indépendante via le popup.
    const runSpellCheck = async () => {
        if (!editor || !correctText || isChecking) return;
        setIsChecking(true);
        setSpellPopup(null);
        try {
            const { text, map } = getTextWithPositions(editor.state.doc);
            if (!text.trim()) return;
            const corrected = await correctText(text);
            if (!corrected) return;
            const hunks = computeSpellHunks(text, corrected, map);
            editor.commands.setSpellErrors(hunks);
            setSpellHunks(hunks);
        } catch (error) {
            if (__DEV__) console.log('[Spellcheck] Erreur:', error);
        } finally {
            setIsChecking(false);
        }
    };

    // Clic sur un segment souligné : ouvre le popup avec la suggestion correspondante.
    onErrorClickRef.current = (info: SpellErrorClickInfo) => {
        const hunk = spellHunks.find(h => h.from === info.from && h.to === info.to);
        if (hunk) setSpellPopup(hunk);
    };

    // Navigation entre fautes depuis le popup : parcourt spellHunks dans l'ordre du texte.
    const sortedSpellHunks = [...spellHunks].sort((a, b) => a.from - b.from);
    const spellPopupIndex = spellPopup
        ? sortedSpellHunks.findIndex(h => h.from === spellPopup.from && h.to === spellPopup.to)
        : -1;

    const goToRelativeError = (direction: 1 | -1) => {
        if (!editor || spellPopupIndex === -1 || sortedSpellHunks.length === 0) return;
        const nextIndex = (spellPopupIndex + direction + sortedSpellHunks.length) % sortedSpellHunks.length;
        const next = sortedSpellHunks[nextIndex];
        setSpellPopup(next);
        editor.chain().setTextSelection({ from: next.from, to: next.to }).scrollIntoView().run();
    };

    const applyAllCorrections = () => {
        if (!editor || spellHunks.length === 0) return;
        const sorted = [...spellHunks].sort((a, b) => b.from - a.from);
        let chain = editor.chain().focus();
        sorted.forEach(h => {
            chain = chain.insertContentAt({ from: h.from, to: h.to }, h.replacement);
        });
        chain.run();
        editor.commands.clearSpellErrors();
        setSpellHunks([]);
        setSpellPopup(null);
    };

    // Applique uniquement la correction affichée dans le popup, et décale les
    // positions des autres segments encore en attente en conséquence.
    const applySingleCorrection = (hunk: SpellHunk) => {
        if (!editor) return;
        const delta = hunk.replacement.length - (hunk.to - hunk.from);
        editor.chain().focus().insertContentAt({ from: hunk.from, to: hunk.to }, hunk.replacement).run();
        const remaining = spellHunks
            .filter(h => h !== hunk)
            .map(h => h.from > hunk.from ? { ...h, from: h.from + delta, to: h.to + delta } : h);
        editor.commands.setSpellErrors(remaining);
        setSpellHunks(remaining);
        setSpellPopup(null);
    };

    // Expose le déclenchement de la correction au bouton natif du toolbar (hors webview).
    // useImperativeHandle (React) ne suffit pas pour un composant "use dom" : le ref natif
    // passe par le pont DOM d'Expo, qui nécessite useDOMImperativeHandle pour être peuplé.
    useDOMImperativeHandle(ref, () => ({ runSpellCheck, applyAllCorrections }), []);

    useEffect(() => {
        onSpellStateChange?.({ isChecking, count: spellHunks.length });
    }, [isChecking, spellHunks.length]);

    // --- AUTOSAVE V1 (inactif, conservé pour comparaison) ------------------
    // useEffect(() => {
    //     const t1 = setTimeout(() => {
    //         updateNote({
    //             id: note.id as string,
    //             body: JSON.stringify(content),
    //             version: version,
    //             html: html
    //         })
    //         setSavingState("Saved")
    //         setIsTyping(false)
    //     }, 500)
    //     const t2 = setTimeout(() => {
    //         setSavingState("Saving...")
    //     }, 500)
    //     return () => { clearTimeout(t1); clearTimeout(t2) }
    // }, [content])


    return (

        <div style={{ width: '100vw' }}>
            <style dangerouslySetInnerHTML={{ __html: styles }}></style>
            <div style={{ position: "relative", height: "100dvh" }}>
                <MenuBar editor={editor} biblemetadatState={biblemetadatState} trie={trie} menubtn={menubtn} />
                <EditorContent editor={editor} onFocus={() => setIsFocus(true)} onBlur={() => setIsFocus(false)} />
                <div style={{ height: 60 }}></div>
                {spellPopup && (
                    <div className="spell-popup-overlay" onClick={() => setSpellPopup(null)}>
                        <div className="spell-popup" onClick={(e) => e.stopPropagation()}>
                            <div className="spell-popup-header">
                                <div className="spell-popup-title">Correction</div>
                                {sortedSpellHunks.length > 1 && (
                                    <div className="spell-popup-nav">
                                        <button onClick={() => goToRelativeError(-1)} aria-label="Previous">‹</button>
                                        <span className="spell-popup-nav-count">{spellPopupIndex + 1} / {sortedSpellHunks.length}</span>
                                        <button onClick={() => goToRelativeError(1)} aria-label="Next">›</button>
                                    </div>
                                )}
                            </div>
                            <div className="spell-popup-suggestion">{spellPopup.replacement}</div>
                            <div className="spell-popup-actions">
                                <button className="spell-popup-close" onClick={() => setSpellPopup(null)}>Close</button>
                                <button className="spell-popup-apply" onClick={() => applySingleCorrection(spellPopup)}>Apply</button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    )
})

export default EditorJS