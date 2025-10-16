"use dom"

import { marked } from "marked";
import moment from 'moment';
import { useCallback, useEffect, useRef, useState } from "react";
import { useLocation, useParams } from "react-router-dom";
import { v4 as uuidv4 } from "uuid";
import { SimpleEditor } from "../../../@/components/tiptap-templates/simple/simple-editor";
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from "../../../components/ui/sheet";
import { Toaster } from "../../../components/ui/sonner";
import { Textarea } from "../../../components/ui/textarea";
import { QueryForTable } from "../../../src/communs/context/Queryuilder_2";
import { AiHistoryType } from "../../../src/lib/database";
import { useDatabase } from "../../communs/context/databaseprovide";
import { FluentArrowUp32Filled, FluentCloudArrowUp32Regular, FluentSlideTextSparkle32Regular } from "../../lib/icons";

import {
    Tooltip,
    TooltipContent,
    TooltipTrigger,
} from "../../../components/ui/tooltip";


export default function EditorPage() {
    const [content, setContent] = useState<string>("")
    const { id } = useParams()
    const location = useLocation()
    const [isTyping, setIsTyping] = useState(false)
    const [savingState, setSavingState] = useState('Enregistrement...')
    const { updateNote } = useDatabase()
    const editorRef = useRef<HTMLDivElement>(null)
    const [version, setVersion] = useState(0)
    const [html, setHtml] = useState("")

    const getinitnote = useCallback(async () => {
        const noteid = location.state.note.id
        const note = await window.api.db.getnotesid(noteid)
        setVersion(note.version)
        setContent(note.body)
        setHtml(note.html)
    }, [])



    useEffect(() => {
        getinitnote()
    }, [getinitnote])


    useEffect(() => {

        const t1 = setTimeout(() => {
            console.log("active")
            updateNote({
                id: id as string,
                body: content,
                version: version,
                html: html
            })
            setSavingState("Enregistré!")
            setIsTyping(false)
        }, 3000)


        const t2 = setTimeout(() => {
            console.log("desactive")
            setSavingState("Enregistrement...")
        }, 500)


        return () => {
            clearTimeout(t1)
            clearTimeout(t2)
        }

    }, [content])

    const handlegoback = () => {
        console.log("active")
        updateNote({
            id: id,
            body: content,
            version: version,
            html: html
        })
    }



    return (
        <div className="flex-1 overflow-hidden w-full h-full relative">
            {
                content.length > 0 && (
                    <SimpleEditor
                        content={content}

                        onChange={(data) => {
                            setIsTyping(true)
                            setContent(data)
                        }}

                        onHtmlChange={(data) => {
                            setHtml(data)
                        }}
                        onBack={handlegoback}
                        ref={editorRef}
                    />
                )
            }
            <SheetDemo />
            <PublishArticles html={html} />
            <Toaster position="bottom-center" />
        </div>
    )
}

function SheetDemo() {
    const { id } = useParams()
    const { notesQuery } = useDatabase();
    const [title, setTitle] = useState<string>("")
    const [body, setBody] = useState<string>("")
    const [history, setHistory] = useState<AiHistoryType[] | null>(null);
    const [inputValue, setInputValue] = useState<string>("")

    // Ref pour le conteneur de scroll et l'élément de fin
    const scrollContainerRef = useRef<HTMLDivElement>(null);
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const messagesContent = useRef<HTMLDivElement>(null);


    const titre = useCallback(() => {
        const note = notesQuery && notesQuery.where(note => note.id === id)
        if (note && note.length > 0) {
            const data = note[0]
            const body = JSON.parse(data?.body)

            setBody(data?.body || "")
            if (body && body.content && body.content.length > 0) {
                if (body.content[0].type === "heading" && body.content[0].content) {
                    setTitle(body.content[0].content[0].text || "Note sans titre")
                }
            }
        }
    }, [id, notesQuery])

    const history_ai = new QueryForTable<AiHistoryType>()

    useEffect(() => {
        titre()
    }, [titre])

    // Fonction pour scroller vers le bas
    const scrollToBottom = useCallback(() => {
        if (scrollContainerRef.current && scrollContainerRef.current?.scrollTop === 0) {
            scrollContainerRef.current.scrollTop = scrollContainerRef.current.scrollHeight;
        }
        scrollContainerRef.current?.addEventListener('scroll', () => {
            console.log(scrollContainerRef.current?.scrollTop)
        })
        // Alternative avec scrollIntoView
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [scrollContainerRef.current]);

    // Scroller vers le bas à chaque changement de l'historique
    useEffect(() => {
        if (history && history.length > 0) {
            // Petit délai pour s'assurer que le DOM est mis à jour
            setTimeout(() => {
                scrollToBottom();
            }, 50);
        }
    }, [history, scrollToBottom, scrollContainerRef.current]);

    const agent = useCallback(async (prompt: string) => {
        const response = await window.api.agent({
            content: body,
            iduser: id as string
        }, prompt);
        return response;
    }, [body]);

    useEffect(() => {
        async function fetch_ai_history() {
            const ai_history = await window.api.db.getaihistory(id as string)
            console.log('je suis dans la joie', id)
            history_ai.addMany(ai_history)
            setHistory(history_ai.findAll())
        }
        fetch_ai_history()
    }, [])

    const handleAgent = async () => {
        // Ajouter immédiatement le message de l'utilisateur pour un feedback instantané
        const userMessage = { role: "user", content: inputValue };
        const currentHistory = history || [];
        const newMessage = [...currentHistory, userMessage];
        setHistory(newMessage);

        const response = await agent(inputValue);

        setHistory((el) => [...el, { id: uuidv4(), ...response.history.slice(-1)[0], created: new Date().toISOString(), modified: new Date().toISOString() }]);
        setInputValue("")
    };

    // Gestion de l'envoi avec Enter
    const handleKeyPress = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            if (inputValue.trim()) {
                handleAgent();
            }
        }
    };

    const handleOpen = () => {
        scrollToBottom();
    }

    return (
        <Sheet>
            <SheetTrigger asChild>
                <ButtonAvecTooltip title="Ouvrir l'assistant" onClick={handleOpen} className="absolute bottom-8 right-8 bg-blue-500 hover:bg-blue-600 flex items-center justify-center w-[52px] aspect-square rounded-full text-white shadow-lg">
                    <FluentSlideTextSparkle32Regular className="w-6 h-6" />
                </ButtonAvecTooltip>
            </SheetTrigger>
            <SheetContent>
                <SheetHeader>
                    <SheetDescription>
                        Assistant - Context :
                    </SheetDescription>
                    <div>
                        <SheetTitle className="text-lg font-semibold">
                            {title.length > 35 ? `${title.substring(0, 35)}...` : title}
                        </SheetTitle>
                    </div>
                </SheetHeader>

                <div className="h-[calc(100vh-75px)] relative">
                    {/* Conteneur de scroll avec ref */}
                    <div
                        ref={scrollContainerRef}
                        className="h-full overflow-y-auto"
                        style={{ scrollBehavior: 'smooth' }}
                    >
                        <div ref={messagesContent} className="chat-container flex flex-col overflow-x-scroll pl-4 py-4 pr-2 max-w-none gap-2">
                            {history?.map((item, index) => {
                                return item.role === "user"
                                    ? (
                                        <div
                                            key={index}
                                            className="question w-full rounded-xs bg-blue-50 px-3 py-2 text-left font-semibold text-[14px] flex flex-col gap-1"
                                        >
                                            {item.content}
                                            <span className="text-xs font-normal">{moment(item.created).fromNow()}</span>
                                        </div>
                                    )
                                    : (
                                        <div
                                            key={index}
                                            className="reponse mb-3 px-1"
                                            dangerouslySetInnerHTML={{ __html: marked.parse(item.content) }}
                                        />
                                    );
                            })}

                            {/* Élément invisible pour marquer la fin des messages */}
                            <div ref={messagesEndRef} className="h-0" />

                            {/* Espacement pour éviter que le dernier message soit caché par l'input */}
                            <div className="h-[50px]" />
                        </div>
                    </div>

                    {/* Input fixé en bas */}
                    <div className="p-3 absolute bottom-0 left-0 w-full z-50">
                        <div className="w-full flex items-start gap-2 border rounded-lg p-2 border-slate-200 bg-white shadow-xl">
                            <Textarea
                                placeholder="Écrire ici..."
                                className="min-h-[48px] max-h-[124px] border-none outline-none px-1 resize-none"
                                value={inputValue}
                                onChange={({ target }) => setInputValue(target.value)}
                                onKeyPress={handleKeyPress}
                            />
                            <button
                                onClick={handleAgent}
                                disabled={!inputValue.trim()}
                                className="bg-blue-500 hover:bg-blue-600 disabled:bg-blue-300 flex items-center justify-center w-[48px] aspect-square rounded-full text-white shadow-lg scale-100 active:scale-95 transition-transform ease-in-out"
                            >
                                <FluentArrowUp32Filled className="w-6 h-6" />
                            </button>
                        </div>
                    </div>
                </div>
            </SheetContent>
        </Sheet>
    )
}


function PublishArticles({ html }: { html: string }) {
    const { id } = useParams()
    const { notesQuery } = useDatabase();
    const [title, setTitle] = useState<string>("")
    const [body, setBody] = useState<string>("")



    const titre = useCallback(() => {
        const note = notesQuery && notesQuery.where(note => note.id === id)
        if (note && note.length > 0) {
            const data = note[0]
            const body = JSON.parse(data?.body)

            setBody(data?.body || "")
            if (body && body.content && body.content.length > 0) {
                if (body.content[0].type === "heading" && body.content[0].content) {
                    setTitle(body.content[0].content[0].text || "Note sans titre")
                }
            }
        }
    }, [id, notesQuery])

    useEffect(() => {
        titre()
    }, [titre])

    // Fonction pour scroller vers le bas


    useEffect(() => {
        console.log(html)
    }, [html])



    return (
        <Sheet>
            <SheetTrigger asChild>
                <ButtonAvecTooltip title="Publier l'article" className="absolute bottom-26 right-8 bg-fuchsia-300 hover:bg-fuchsia-700 flex items-center justify-center w-[52px] aspect-square rounded-full text-fuchsia-700 hover:text-white shadow-lg">
                    <FluentCloudArrowUp32Regular className="w-7 h-7" />
                </ButtonAvecTooltip>
            </SheetTrigger>
            <SheetContent side="bottom">
                <div className="flex gap-4 h-dvh">
                    <div className="w-[54px] h-full"></div>
                    <div className="flex-1 h-full">
                        <SheetHeader>
                            <SheetDescription>
                                Publication
                            </SheetDescription>
                            <div>
                                <SheetTitle className="text-xl font-semibold">
                                    {title}
                                </SheetTitle>
                            </div>
                        </SheetHeader>
                        <div className="pl-4 pr-6">
                            <div className="grid grid-cols-3 gap-4">
                                <div className="col-span-2">
                                    <div className="w-full aspect-video bg-red-200 rounded-lg"></div>
                                </div>
                                <div><div className="h-full bg-red-200 rounded-lg w-full"></div></div>
                            </div>
                            <div></div>
                        </div>
                    </div>
                </div>


            </SheetContent>
        </Sheet>
    )
}


function ButtonAvecTooltip(props: React.ComponentProps<'button'>) {
    return (
        <Tooltip>
            <TooltipTrigger asChild>
                <button {...props}>{props.children}</button>
            </TooltipTrigger>
            <TooltipContent side="left">
                <p className="text-white" style={{ color: "white" }}>{props.title}</p>
            </TooltipContent>
        </Tooltip>
    )
}
