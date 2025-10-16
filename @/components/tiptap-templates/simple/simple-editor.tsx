import { Editor, EditorContent, EditorContext, useEditor, } from "@tiptap/react"
import { BubbleMenu, FloatingMenu } from "@tiptap/react/menus"
import * as React from "react"
// --- Tiptap Core Extensions ---
import { Highlight } from "@tiptap/extension-highlight"
import { Image } from "@tiptap/extension-image"
import { TaskItem, TaskList } from "@tiptap/extension-list"
import { Subscript } from "@tiptap/extension-subscript"
import { Superscript } from "@tiptap/extension-superscript"
import { TextAlign } from "@tiptap/extension-text-align"
import { Typography } from "@tiptap/extension-typography"
import { Selection } from "@tiptap/extensions"
import { StarterKit } from "@tiptap/starter-kit"

// --- UI Primitives ---
import { Button } from "../../tiptap-ui-primitive/button"
import { Spacer } from "../../tiptap-ui-primitive/spacer"
import {
  Toolbar,
  ToolbarGroup,
  ToolbarSeparator,
} from "../../tiptap-ui-primitive/toolbar"

// --- Tiptap Node ---
import "../../tiptap-node/blockquote-node/blockquote-node.css"
import "../../tiptap-node/code-block-node/code-block-node.css"
import "../../tiptap-node/heading-node/heading-node.css"
import { HorizontalRule } from "../../tiptap-node/horizontal-rule-node/horizontal-rule-node-extension"
import "../../tiptap-node/horizontal-rule-node/horizontal-rule-node.css"
import "../../tiptap-node/image-node/image-node.css"
import { ImageUploadNode } from "../../tiptap-node/image-upload-node/image-upload-node-extension"
import "../../tiptap-node/list-node/list-node.css"
import "../../tiptap-node/paragraph-node/paragraph-node.css"

// --- Tiptap UI ---
import { BlockquoteButton } from "../../tiptap-ui/blockquote-button"
import { CodeBlockButton } from "../../tiptap-ui/code-block-button"
import {
  ColorHighlightPopover,
  ColorHighlightPopoverButton,
  ColorHighlightPopoverContent,
} from "../../tiptap-ui/color-highlight-popover"
import { HeadingDropdownMenu } from "../../tiptap-ui/heading-dropdown-menu"
import {
  LinkButton,
  LinkContent,
  LinkPopover,
} from "../../tiptap-ui/link-popover"
import { ListDropdownMenu } from "../../tiptap-ui/list-dropdown-menu"
import { MarkButton } from "../../tiptap-ui/mark-button"
import { TextAlignButton } from "../../tiptap-ui/text-align-button"

// --- Icons ---
import { ArrowLeftIcon } from "../../tiptap-icons/arrow-left-icon"
import { HighlighterIcon } from "../../tiptap-icons/highlighter-icon"
import { LinkIcon } from "../../tiptap-icons/link-icon"

// --- Hooks ---
import { useCursorVisibility } from "../../../hooks/use-cursor-visibility"
import { useIsMobile } from "../../../hooks/use-mobile"
import { useWindowSize } from "../../../hooks/use-window-size"

// --- Components ---
// import { ThemeToggle } from "../../tiptap-templates/simple/theme-toggle"

// --- Lib ---
import { handleImageUpload, MAX_FILE_SIZE } from "../../../lib/tiptap-utils"

// --- Styles ---
import { BibleVersetIcon, FluentArrowLeft32Filled, FluentArrowUp32Filled, FluentFolderLink32Regular, FluentImageAdd32Regular, IcSharpWhatsapp } from '../../../icons'
import "../../tiptap-templates/simple/simple-editor.css"

import BibleVerset from "@/components/bible_component/Bibleverset"



import { useCopyToClipboard } from "@uidotdev/usehooks"
import { toast } from "sonner"


const MainToolbarContent = ({
  onHighlighterClick,
  onBack,
  // onLinkClick,
  isMobile,
  editor
}: {
  editor?: Editor,
  onBack: () => void,
  onHighlighterClick: () => void
  onLinkClick: () => void
  isMobile: boolean
}) => {

  // const navigate = useNavigate()
  // const handleBack = () => { onBack(); navigate(-1) }
  const addVersetSection = () => {
    // Logic to add a new verse section
    const Box = document.createElement("div");
    Box.className = "bible-verset";
    Box.contentEditable = "false";
    Box.innerHTML = `<input type="text" placeholder='Votre verset' /><button class="add-verset-button">Add</button>`;
    editor?.view.dom.append(Box);
  }
  return (
    <>
      <div className="pl-2"></div>
      <button className="hover:bg-slate-100 w-[34px] h-[34px] rounded-xl flex justify-center items-center">
        <FluentArrowLeft32Filled className="h-5 w-5" />
      </button>
      <Spacer />

      {/* <ToolbarGroup> */}
      {/* <UndoRedoButton action="undo" /> */}
      {/* <UndoRedoButton action="redo" /> */}
      {/* </ToolbarGroup> */}

      {/* <ToolbarSeparator /> */}

      <ToolbarGroup>
        <HeadingDropdownMenu levels={[1, 2, 3, 4]} portal={isMobile} />
        <ListDropdownMenu
          types={["bulletList", "orderedList", "taskList"]}
          portal={isMobile}
        />
        <BlockquoteButton />
        {/* <CodeBlockButton /> */}
      </ToolbarGroup>

      <ToolbarSeparator />

      <ToolbarGroup>
        <MarkButton type="bold" />
        <MarkButton type="italic" />
        {/* <MarkButton type="strike" /> */}
        {/* <MarkButton type="code" /> */}
        {/* <MarkButton type="underline" /> */}
        {!isMobile ? (
          <ColorHighlightPopover />
        ) : (
          <ColorHighlightPopoverButton onClick={onHighlighterClick} />
        )}
        {/* {!isMobile ? <LinkPopover /> : <LinkButton onClick={onLinkClick} />} */}
      </ToolbarGroup>

      <ToolbarSeparator />

      {/* <ToolbarGroup>
        <MarkButton type="superscript" />
        <MarkButton type="subscript" />
      </ToolbarGroup> */}

      {/* <ToolbarSeparator /> */}

      <ToolbarGroup>
        <TextAlignButton align="left" />
        <TextAlignButton align="center" />
        <TextAlignButton align="right" />
      </ToolbarGroup>

      <ToolbarSeparator />

      <ToolbarGroup>
        <AddImage editor={editor as Editor} />
      </ToolbarGroup>
      <ToolbarGroup>
        <AddBibleVerset editor={editor as Editor} />
        <Whatsappbutton editor={editor as Editor} />
      </ToolbarGroup>

      {isMobile && <ToolbarSeparator />}

      {/* <ToolbarGroup>
        <ThemeToggle />
      </ToolbarGroup> */}
      <Spacer />

      {/* <button className="hover:bg-slate-100 w-[34px] h-[34px] rounded-xl flex justify-center items-center">
        <FluentFolderLink32Regular className="h-5 w-5" />
      </button> */}
      <DossierButton editor={editor as Editor} />
      <div className="pr-2"></div>
    </>
  )
}

const MenuFlottant = ({ editor, onHighlighterClick, onLinkClick, isMobile }: { editor: Editor, isMobile: boolean, onHighlighterClick: () => void, onLinkClick: () => void }) => {
  return (
    <BubbleMenu editor={editor} className="flex items-center px-1 bg-white border-slate-100 border rounded-xl shadow-md" >
      <ToolbarGroup>
        <MarkButton type="bold" />
        <MarkButton type="italic" />
        <MarkButton type="strike" />
        <MarkButton type="code" />
        <MarkButton type="underline" />
        {!isMobile ? (
          <ColorHighlightPopover />
        ) : (
          <ColorHighlightPopoverButton onClick={onHighlighterClick} />
        )}
        {!isMobile ? <LinkPopover /> : <LinkButton onClick={onLinkClick} />}
      </ToolbarGroup>
      <ToolbarSeparator />

      <ToolbarGroup>
        <MarkButton type="superscript" />
        <MarkButton type="subscript" />
      </ToolbarGroup>
    </BubbleMenu>
  )
}

const StartingMenu = ({ editor, isMobile }: { editor: Editor, isMobile: boolean }) => {
  return (
    <FloatingMenu editor={editor} className="border-slate-200 border rounded-lg bg-white">
      <ToolbarGroup>
        <HeadingDropdownMenu levels={[1, 2, 3, 4]} portal={isMobile} />
        <ListDropdownMenu
          types={["bulletList", "orderedList", "taskList"]}
          portal={isMobile}
        />
        <BlockquoteButton />
        <CodeBlockButton />
      </ToolbarGroup></FloatingMenu>
  )
}

const MobileToolbarContent = ({
  type,
  onBack,
}: {
  type: "highlighter" | "link"
  onBack: () => void
}) => (
  <>
    <ToolbarGroup>
      <Button data-style="ghost" onClick={onBack}>
        <ArrowLeftIcon className="tiptap-button-icon" />
        {type === "highlighter" ? (
          <HighlighterIcon className="tiptap-button-icon" />
        ) : (
          <LinkIcon className="tiptap-button-icon" />
        )}
      </Button>
    </ToolbarGroup>

    <ToolbarSeparator />

    {type === "highlighter" ? (
      <ColorHighlightPopoverContent />
    ) : (
      <LinkContent />
    )}
  </>
)

export function SimpleEditor({ onChange, content, onBack, ref, onHtmlChange }: { content: string, onChange: (data: string) => void, onBack: () => void, ref?: React.RefAttributes<HTMLDivElement>, onHtmlChange?: (data: string) => void }) {
  const isMobile = useIsMobile()
  const { height } = useWindowSize()
  const [mobileView, setMobileView] = React.useState<
    "main" | "highlighter" | "link"
  >("main")
  const toolbarRef = React.useRef<HTMLDivElement>(null)

  const editor = useEditor({
    immediatelyRender: false,
    shouldRerenderOnTransaction: false,
    editorProps: {
      attributes: {
        autocomplete: "off",
        autocorrect: "off",
        autocapitalize: "off",
        "aria-label": "Main content area, start typing to enter text.",
        class: "simple-editor",
      },
    },
    extensions: [
      StarterKit.configure({
        horizontalRule: false,
        link: {
          openOnClick: false,
          enableClickSelection: true,
        },
      }),
      HorizontalRule,
      TextAlign.configure({ types: ["heading", "paragraph"] }),
      TaskList,
      TaskItem.configure({ nested: true }),
      Highlight.configure({ multicolor: true }),
      Image.configure({
        inline: true,
        allowBase64: true,
      }),
      Typography,
      Superscript,
      Subscript,
      Selection,
      BibleVerset,
      ImageUploadNode.configure({
        accept: "image/*",
        maxSize: MAX_FILE_SIZE,
        limit: 3,
        upload: handleImageUpload,
        onError: (error) => console.error("Upload failed:", error),
      }),
    ],
    content: JSON.parse(content),
    onUpdate: (data) => {
      onChange(JSON.stringify(data.editor.getJSON()))
      onHtmlChange?.(data.editor.getHTML())
    }
  })

  const rect = useCursorVisibility({
    editor,
    overlayHeight: toolbarRef.current?.getBoundingClientRect().height ?? 0,
  })

  React.useEffect(() => {
    if (!isMobile && mobileView !== "main") {
      setMobileView("main")
    }
  }, [isMobile, mobileView])



  return (
    <div className="simple-editor-wrapper">
      <EditorContext.Provider value={{ editor }}>
        <Toolbar
          ref={toolbarRef}
          style={{
            ...(isMobile
              ? {
                bottom: `calc(100% - ${height - rect.y}px)`,
              }
              : {}),
          }}
        >
          {mobileView === "main" ? (
            <MainToolbarContent
              onBack={onBack}
              onHighlighterClick={() => setMobileView("highlighter")}
              onLinkClick={() => setMobileView("link")}
              isMobile={isMobile}
              editor={editor as Editor}
            />
          ) : (
            <MobileToolbarContent
              type={mobileView === "highlighter" ? "highlighter" : "link"}
              onBack={() => setMobileView("main")}
            />
          )}
        </Toolbar>

        <EditorContent
          ref={ref as React.RefAttributes<HTMLDivElement>}
          editor={editor}
          role="presentation"
          className="simple-editor-content"
        />

        <MenuFlottant editor={editor as Editor} isMobile={isMobile} />
        <StartingMenu editor={editor as Editor} isMobile={isMobile} />
        <div className="h-[100px]"></div>
      </EditorContext.Provider>
    </div>
  )
}


const AddBibleVerset = ({ editor }: { editor: Editor }) => {
  const [openVerset, setOpenVerset] = React.useState(false)
  const [isActive, setIsActived] = React.useState(false)

  const InputVerset = ({ onBlur }: { onBlur: () => void }) => {
    const [verse, setVerse] = React.useState<string>("")

    const handleVerse = () => {
      console.log("je suis dans la place")
      if (verse.trim() !== "") {
        editor?.commands.setVerset({ entry: verse })
        handleOpen()
        setVerse("")
      }
    }
    return (
      <div className="absolute top-[30px] left-[-100px] w-[210px] bg-white border border-slate-200 rounded-lg p-1 flex items-center gap-2 shadow-md">
        <input autoFocus={true} type="text" placeholder='Votre verset' value={verse} onChange={(e) => setVerse(e.target.value)} className="w-[155px] h-full px-1 focus:outline-none" />
        <button onClick={handleVerse} className="hover:bg-slate-100 rounded-xl w-[35px] aspect-square flex items-center justify-center">
          <FluentArrowUp32Filled className="h-5 w-5 text-slate-500 rotate-180" />
        </button>

      </div>
    )
  }

  const handleOpen = () => {
    setOpenVerset(!openVerset)
    setIsActived(!isActive)
  }
  return (
    <div className="relative">

      <Button
        type="button"
        disabled={false}
        data-style="ghost"
        data-active-state={isActive ? "on" : "off"}
        data-disabled={false}
        role="button"
        tabIndex={-1}
        aria-label={"verset biblique"}
        aria-pressed={isActive}
        tooltip={"Verset Biblique"}
        onClick={handleOpen}

      >
        <BibleVersetIcon className="h-4 w-4" />
        <span>Bible</span>
      </Button>
      {openVerset && <InputVerset onBlur={handleOpen} />}
    </div>
  )
}

const AddImage = ({ editor, text }: { editor: Editor, text?: boolean }) => {
  const inputRef = React.useRef<HTMLInputElement>(null);

  const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];

    if (!file || !editor) return;

    try {
      const reader = new FileReader();

      reader.onload = () => {
        if (typeof reader.result === 'string') {
          editor
            .chain()
            .focus()
            .setImage({ src: reader.result })
            .run();
        }
      };

      reader.readAsDataURL(file);
    } catch (error) {
      console.error('Erreur lors du chargement de l\'image:', error);
    }
  };

  const handleClick = () => {
    inputRef.current?.click();
  };
  return (
    <div className="relative">
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={handleImageUpload}
      />
      <Button
        type="button"
        data-style="ghost"
        onClick={handleClick}
        aria-label="Ajouter une image"
        tooltip="Ajouter une image"
      >
        <FluentImageAdd32Regular className="h-[18px] w-[18px]" />
        {/* {!text && <span className="tiptap-button-text">Ajouter</span>} */}
      </Button>
    </div>
  );
}


const DossierButton = ({ editor }: { editor: Editor }) => {
  const [openVerset, setOpenVerset] = React.useState(false)
  const [isActive, setIsActived] = React.useState(false)

  // const state = location.state.note
  const [note, setNote] = React.useState(null)

  const InputVerset = ({ onBlur }: { onBlur: () => void }) => {
    const [verse, setVerse] = React.useState<string>("")
    // const { groupedQuery, addNotetoGroup } = useDatabase()

    // console.log(location.pathname)
    // const d = groupedQuery?.orderBy("modified", "desc")
    // const handleNewState = async (groupId: string) => {
    //   setNote({ ...note, grouped: groupId })
    //   await addNotetoGroup({ id: state.id, grouped: groupId })
    //   setTimeout(() => {
    //     handleOpen()
    //   }, 1000)

    // }

    // const handleNoGroup = async () => {
    //   setNote({ ...note, grouped: "" })
    //   await addNotetoGroup({ id: state.id, grouped: null })
    //   setTimeout(() => {
    //     handleOpen()
    //   }, 1000)

    // }

    return (
      <div onBlur={onBlur} className="absolute top-[30px] right-[-12px] w-[210px] bg-white border border-slate-200 rounded-lg px-1 py-2 gap-2 shadow-md">
        <span className="text-[14px] font-semibold inline-block mb-2 px-2 mb-1">Liste des Dossiers</span>
        <button className={`flex items-center gap-2 justify-between w-full py-1 px-2 ${note.grouped === "" ? "bg-gray-50" : ""} rounded-md`}>
          <span className={`flex-1 ${note.grouped === "" ? "font-semibold" : ""} text-[14px]`}>Aucun Dossier</span>
          {note.grouped === "" && <span className="w-[8px] h-[8px] rounded-full bg-slate-700"></span>}
        </button>
        {/* {
          d && d.map((el, key) => (
            <button onClick={() => handleNewState(el.id)} className={`flex items-center gap-2 justify-between w-full py-1 ${note.grouped === el.id ? "bg-gray-50" : ""} px-2 rounded-md mb-1`} key={key}>
              <span className={`flex-1 ${note.grouped === el.id ? "font-semibold" : ""} text-[14px]`}>{el.name}</span>
              {note.grouped === el.id && <span className="w-[8px] h-[8px] rounded-full bg-slate-700"></span>}
            </button>
          ))
        } */}
      </div>
    )
  }

  const handleOpen = () => {
    setOpenVerset(!openVerset)
    setIsActived(!isActive)
  }
  return (
    <div className="relative">

      <Button
        type="button"
        disabled={false}
        data-style="ghost"
        data-active-state={isActive ? "on" : "off"}
        data-disabled={false}
        role="button"
        tabIndex={-1}
        aria-label={"Dossier"}
        aria-pressed={isActive}
        tooltip={"Dossier"}
        onClick={handleOpen}

      >
        <FluentFolderLink32Regular className="h-5 w-5" />
      </Button>
      {openVerset && <InputVerset onBlur={handleOpen} />}
    </div>
  )
}


export function Whatsappbutton({ editor }: { editor: Editor }) {
  const [copiedText, copyToClipboard] = useCopyToClipboard();
  const handleOpen = async () => {
    const copy = htmlToWhatsApp(editor.getHTML())
    console.log(copy)
    await copyToClipboard(copy)
    const hasCopiedText = Boolean(copiedText);
    console.log(hasCopiedText)
    toast("Le contenu est copié", {
      description: "Le contenu de cette notes est dans le presse-papier"
    })

  }
  return (
    <Button
      type="button"
      disabled={false}
      data-style="ghost"
      // data-active-state={isActive ? "on" : "off"}
      data-disabled={false}
      role="button"
      tabIndex={-1}
      aria-label={"Partage WhatsApp"}
      // aria-pressed={isActive}
      tooltip={"Partage WhatsApp"}
      onClick={handleOpen}

    > <IcSharpWhatsapp className="h-5 w-5" />
      {/* <span>whatsapp</span> */}
    </Button>
  )
}


/**
 * Convertit du HTML en formatage WhatsApp
 * @param {string} htmlString - La chaîne HTML à convertir
 * @returns {string} - Le texte formaté pour WhatsApp
 */
function htmlToWhatsApp(htmlString: string) {
  // console.log(htmlString)
  // Créer un élément temporaire pour parser le HTML
  const tempDiv = document.createElement('div');
  tempDiv.innerHTML = htmlString;

  // Fonction récursive pour traiter les noeuds
  function processNode(node) {
    let result = '';

    if (node.nodeType === Node.TEXT_NODE) {
      // Noeud texte simple
      return node.textContent;
    } else if (node.nodeType === Node.ELEMENT_NODE) {
      let content = '';

      // Traiter récursivement tous les enfants
      for (let child of node.childNodes) {
        content += processNode(child);
      }

      // Appliquer le formatage selon le tag HTML
      const tagName = node.tagName?.toLowerCase();
      // console.log(tagName)
      switch (tagName) {
        case 'b':
        case 'strong':
          return `*${content}*`;

        case 'i':
        case 'em':
          return `_${content}_`;

        case 's':
        case 'strike':
        case 'del':
          return `~${content}~`;

        case 'code':
          return `\`\`\`${content}\`\`\``;

        case 'pre':
          return `\`\`\`\n${content}\n\`\`\``;

        case 'blockquote':
          // Diviser en lignes et ajouter > à chaque ligne
          return content.split('\n').map(line => `> ${line}`).join('\n');

        case 'br':
          return '\n';

        case 'p':
          return content + '\n\n';

        case 'div':
          return content + '\n';
        case "bible-verset":
          const entry = node.getAttribute("entry")
          const check = /[;:\-v]/g
          const replace = entry.replace(RegExp(check), ' ')
          const spliter = replace.split(RegExp(/\s+/g))


          const verset = window.api.bible({ livre: spliter[0] as string, chap: spliter[1] as string, vers1: spliter[2], vers2: spliter[3] })
          let result = `*${verset?.reference}* \n> `
          if (verset) {
            for (let vers of verset.vers) {
              const construct = `[${vers.n}] ${vers?.v} `
              result += construct
            }

            result += "\n\n"
          }



          return result;
        case 'h1':
          return `*${content.toUpperCase()}*\n\n`;
        case 'h2':
        case 'h3':
        case 'h4':
        case 'h5':
        case 'h6':
          return `*${content}*\n\n`;

        case 'ul':
        case 'ol':
          return content + '\n';

        case 'li':
          // Déterminer si c'est dans une liste ordonnée ou non
          const parentList = node.parentElement;
          if (parentList?.tagName.toLowerCase() === 'ol') {
            // Liste numérotée - on utilise juste un tiret car WhatsApp ne supporte pas vraiment les listes numérotées complexes
            return `- ${content}\n`;
          } else {
            // Liste à puces
            return `- ${content}\n`;
          }

        case 'a':
          const href = node.getAttribute('href');
          return href ? `${content} (${href})` : content;

        default:
          return content;
      }
    }

    return result;
  }

  // Traiter tous les noeuds
  let result = '';
  for (let child of tempDiv.childNodes) {
    result += processNode(child);
  }

  // Nettoyer le résultat
  return result
    .replace(/\n{3,}/g, '\n\n') // Remplacer les multiples sauts de ligne par maximum 2
    .trim(); // Supprimer les espaces en début et fin
}

// Version alternative plus simple pour les cas basiques
function htmlToWhatsAppSimple(htmlString) {
  return htmlString
    // Gras
    .replace(/<(b|strong)>(.*?)<\/(b|strong)>/gi, '*$2*')
    // Italique
    .replace(/<(i|em)>(.*?)<\/(i|em)>/gi, '_$2_')
    // Barré
    .replace(/<(s|strike|del)>(.*?)<\/(s|strike|del)>/gi, '~$2~')
    // Code
    .replace(/<code>(.*?)<\/code>/gi, '```$1```')
    // Pre (code block)
    .replace(/<pre>(.*?)<\/pre>/gi, '```\n$1\n```')
    // Citation
    .replace(/<blockquote>(.*?)<\/blockquote>/gi, (match, content) => {
      return content.split('\n').map(line => `> ${line}`).join('\n');
    })
    // Sauts de ligne
    .replace(/<br\s*\/?>/gi, '\n')
    // Paragraphes
    .replace(/<p>(.*?)<\/p>/gi, '$1\n\n')
    // Listes
    .replace(/<li>(.*?)<\/li>/gi, '- $1\n')
    // Liens
    .replace(/<a[^>]*href="([^"]*)"[^>]*>(.*?)<\/a>/gi, '$2 ($1)')
    // Supprimer les autres balises HTML
    .replace(/<[^>]*>/g, '')
    // Décoder les entités HTML
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&amp;/g, '&')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    // Nettoyer les espaces multiples et sauts de ligne
    .replace(/\n{3,}/g, '\n\n')
    .trim();
}


// Exporter les fonctions
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { htmlToWhatsApp, htmlToWhatsAppSimple };
}

// Exemple d'utilisation
// testConversion();