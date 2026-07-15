export default `
@import url('https://fonts.googleapis.com/css2?family=Andada+Pro:ital,wght@0,400..840;1,400..840&family=PT+Serif:ital,wght@0,400;0,700;1,400;1,700&display=swap');
@import "tailwindcss";


html {
    font-size: 16px;
}

* {
    box-sizing : border-box
}

/* Conteneur principal de l'éditeur Tiptap */
.tiptap {
    padding: 1.25rem;
    padding-buttom : 30px;
    /* min-height: 200px; */
    height: 100%;
    width: 100%;
    outline: none;
    margin-top: 48px
}

/* Paragraphes */
.tiptap p {
    margin: 0.75rem 0;
    line-height: 1.50;
    letter-spacing : 0.1px;
    font-size: 1.20rem;
    font-family: "PT Serif", serif;
}

p {
    font-family: "PT Serif", serif;
}

.tiptap p:first-child {
    margin-top: 0;
}

.tiptap p:last-child {
    margin-bottom: 0;
}

/* Titres */
.tiptap h1,
.tiptap h2,
.tiptap h3,
.tiptap h4,
.tiptap h5,
.tiptap h6 {
    line-height: 1.3;
    font-weight: 600;
    margin-top: 1.5rem;
    margin-bottom: 0.75rem;
}

.tiptap h1:first-child,
.tiptap h2:first-child,
.tiptap h3:first-child,
.tiptap h4:first-child,
.tiptap h5:first-child,
.tiptap h6:first-child {
    margin-top: 0;
}

.tiptap h1 {
    font-size: 2.25rem;
}

.tiptap h2 {
    font-size: 1.875rem;
}

.tiptap h3 {
    font-size: 1.5rem;
}

.tiptap h4 {
    font-size: 1.25rem;
}

.tiptap h5 {
    font-size: 1.125rem;
}

.tiptap h6 {
    font-size: 1rem;
}

/* Formatage de texte */
.tiptap strong {
    font-weight: 700;
}

.tiptap em {
    font-style: italic;
}

.tiptap u {
    text-decoration: underline;
}

.tiptap s {
    text-decoration: line-through;
}

.tiptap code {
    background-color: #f3f4f6;
    padding: 0.2rem 0.4rem;
    border-radius: 0.25rem;
    font-family: 'Courier New', Courier, monospace;
    font-size: 0.9em;
    color: #e11d48;
}

.tiptap mark {
    background-color: #fef08a;
    padding: 0.1rem 0.2rem;
    border-radius: 0.125rem;
}

.tiptap small {
    font-size: 0.875em;
}

/* Liens */
.tiptap a {
    color: #3b82f6;
    text-decoration: underline;
    cursor: pointer;
}

.tiptap a:hover {
    color: #2563eb;
}

/* Listes */
.tiptap ul,
.tiptap ol {
    padding-left: 1.5rem;
    margin: 0.75rem 0;
}

.tiptap ul {
    list-style-type: disc;
}

.tiptap ol {
    list-style-type: decimal;
}

.tiptap li {
    margin: 0.25rem 0;
}

.tiptap li p {
    margin: 0;
}

.tiptap ul ul,
.tiptap ol ol,
.tiptap ul ol,
.tiptap ol ul {
    margin: 0.25rem 0;
}

/* Liste de tâches */
.tiptap ul[data-type="taskList"] {
    list-style: none;
    padding-left: 0;
}

.tiptap ul[data-type="taskList"] li {
    display: flex;
    align-items: flex-start;
}

.tiptap ul[data-type="taskList"] li>label {
    flex: 0 0 auto;
    margin-right: 0.5rem;
    user-select: none;
}

.tiptap ul[data-type="taskList"] li>div {
    flex: 1 1 auto;
}

.tiptap input[type="checkbox"] {
    cursor: pointer;
}

/* Citations */
.tiptap blockquote {
    border-left: 4px solid #777;
    padding-left: 1rem;
    margin: 1rem 0;
    font-style: italic;
}

/* Blocs de code */
.tiptap pre {
    background-color: #1f2937;
    color: #f9fafb;
    padding: 1rem;
    border-radius: 0.5rem;
    overflow-x: auto;
    margin: 1rem 0;
}

.tiptap pre code {
    background: none;
    color: inherit;
    font-size: 0.875rem;
    padding: 0;
}

/* Règle horizontale */
.tiptap hr {
    border: none;
    border-top: 2px solid #e5e7eb;
    margin: 2rem 0;
}

/* Images */
.tiptap img {
    max-width: 100%;
    height: auto;
    border-radius: 0.1rem;
    margin: 1rem 0;
    display: block;
}

.tiptap img.ProseMirror-selectednode {
    outline: none;
}

/* Tableaux */
.tiptap table {
    border-collapse: collapse;
    table-layout: fixed;
    width: 100%;
    margin: 1rem 0;
    overflow: hidden;
}

.tiptap td,
.tiptap th {
    min-width: 1em;
    border: 1px solid #d1d5db;
    padding: 0.5rem;
    vertical-align: top;
    box-sizing: border-box;
    position: relative;
}

.tiptap th {
    font-weight: 600;
    text-align: left;
    background-color: #f9fafb;
}

.tiptap .selectedCell {
    background-color: #dbeafe;
}

.tiptap .column-resize-handle {
    position: absolute;
    right: -2px;
    top: 0;
    bottom: -2px;
    width: 4px;
    background-color: #3b82f6;
    pointer-events: none;
}

.tiptap .tableWrapper {
    overflow-x: auto;
    margin: 1rem 0;
}

/* Placeholder */
.tiptap p.is-editor-empty:first-child::before {
    content: attr(data-placeholder);
    float: left;
    color: #9ca3af;
    pointer-events: none;
    height: 0;
}

/* Sélection */
.tiptap ::selection {
    background-color: #bfdbfe;
}

/* Collaboration - curseurs */
.collaboration-cursor__caret {
    border-left: 1px solid #0d0d0d;
    border-right: 1px solid #0d0d0d;
    margin-left: -1px;
    margin-right: -1px;
    pointer-events: none;
    position: relative;
    word-break: normal;
}

.collaboration-cursor__label {
    border-radius: 3px 3px 3px 0;
    color: #fff;
    font-size: 12px;
    font-style: normal;
    font-weight: 600;
    left: -1px;
    line-height: normal;
    padding: 0.1rem 0.3rem;
    position: absolute;
    top: -1.4em;
    user-select: none;
    white-space: nowrap;
}

/* Bulle de menu */
.tiptap-bubble-menu {
    display: flex;
    background-color: #0d0d0d;
    padding: 0.25rem;
    border-radius: 0.5rem;
    box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1);
}

.tiptap-bubble-menu button {
    background: none;
    border: none;
    color: white;
    padding: 0.375rem 0.5rem;
    margin: 0 0.125rem;
    border-radius: 0.25rem;
    cursor: pointer;
    font-size: 0.875rem;
}

.tiptap-bubble-menu button:hover {
    background-color: #374151;
}

.tiptap-bubble-menu button.is-active {
    background-color: #3b82f6;
}

/* Menu flottant */
.tiptap-floating-menu {
    display: flex;
    background-color: #f3f4f6;
    padding: 0.25rem;
    border-radius: 0.5rem;
    box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
}

.tiptap-floating-menu button {
    background: none;
    border: none;
    padding: 0.375rem 0.5rem;
    margin: 0 0.125rem;
    border-radius: 0.25rem;
    cursor: pointer;
    font-size: 0.875rem;
    color: #374151;
}

.tiptap-floating-menu button:hover {
    background-color: #e5e7eb;
}

/* Mention (suggestions) */
.tiptap .mention {
    background-color: #dbeafe;
    border-radius: 0.25rem;
    padding: 0.1rem 0.3rem;
    color: #1e40af;
}

.suggestion-list {
    background: white;
    border-radius: 0.5rem;
    box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1);
    padding: 0.5rem;
    max-height: 200px;
    overflow-y: auto;
}

.suggestion-list-item {
    padding: 0.5rem;
    border-radius: 0.25rem;
    cursor: pointer;
}

.suggestion-list-item:hover,
.suggestion-list-item.is-selected {
    background-color: #f3f4f6;
}

/* Alignement de texte */
.tiptap .text-left {
    text-align: left;
}

.tiptap .text-center {
    text-align: center;
}

.tiptap .text-right {
    text-align: right;
}

.tiptap .text-justify {
    text-align: justify;
}

/* Couleurs de texte */
.tiptap[data-text-color] {
    color: var(--text-color);
}

/* Couleur de fond */
.tiptap[data-background-color] {
    background-color: var(--background-color);
}

/* Indentation */
.tiptap .indent-1 {
    margin-left: 2rem;
}

.tiptap .indent-2 {
    margin-left: 4rem;
}

.tiptap .indent-3 {
    margin-left: 6rem;
}

/* Focus */
.tiptap.ProseMirror-focused {
    outline: none;
}

/* Drag handle pour réorganiser */
.tiptap .drag-handle {
    position: absolute;
    left: -1.5rem;
    cursor: grab;
    opacity: 0;
    transition: opacity 0.2s;
}

.tiptap:hover .drag-handle {
    opacity: 1;
}

.tiptap .drag-handle:active {
    cursor: grabbing;
}

/* Vidéo/iframe */
.tiptap iframe {
    border: 0;
    width: 100%;
    max-width: 100%;
    margin: 1rem 0;
    border-radius: 0.5rem;
}

/* Détails/Résumé (collapsible) */
.tiptap details {
    margin: 1rem 0;
    border: 1px solid #e5e7eb;
    border-radius: 0.5rem;
    padding: 0.5rem;
}

.tiptap details summary {
    cursor: pointer;
    font-weight: 600;
    user-select: none;
}

.tiptap details summary:hover {
    color: #3b82f6;
}

/* Mode lecture seule */
.tiptap[contenteditable="false"] {
    cursor: default;
    background-color: #f9fafb;
}

/* Sous-script et super-script */
.tiptap sub {
    vertical-align: sub;
    font-size: smaller;
}

.tiptap sup {
    vertical-align: super;
    font-size: smaller;
}


.control-group {
    position: fixed;
    top: 0;
    z-index: 10;
    background-color: white;
    // /* height: 88px; */
    max-height: 102px;
    overflow-x: scroll;
    border-bottom: 1px solid #efefef;
    display: flex;
    width: 100vw;
    // /* overflow-y: hidden; */
    
}

.control-group button {
        display: inline-flex;
        height: 47px;
        padding: 0 12px;
        border : none;
        background-color : white;
        align-items: center;
    }
.control-group button.long-btn {
        display: inline-flex;
        height: 40px;
        padding: 0 12px;
        border : none;
        background-color : #00edff27;
        align-items: center;
        gap : 12px;
        font-size : 16px;
        font-weight : 600;
       /* margin:0 12px */
    }

.control-group > div {
        padding: 0 .2rem;
    }
.control-group .button-group {
    position: relative;
        width: max-content;
        display: flex;
        align-items: center;
        z-index : 10;
        background-color : white;
    }
.control-group .inputImage {
    appearance: none;
    visibility: hidden;
    width : 90px;
    height : 40px;
    position : absolute;
    background-color : red;
    top : 0;
    left : 0;
}

.control-group .inputImage::before {
    width: 90px;
    height: 40px;
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    background-color: trasparent;
    visibility: visible;
    appearance: none;
}
.control-group .input-group {
    position: fixed;
    top: 47px;
    background-color: white;
    z-index: 1;
    width: 100%;
    height : 80px;
    border-bottom: 1px solid #efefef;
    box-shadow: 0px 0px 20px -5px black;
}

.input-group .input {
    height:42px;
    width : 100%;
    display: flex;
    padding :0 8px;
    align-items: center;
    justify-content: space-between;
}

.input-group .input>button {
    width: 42px;
    height : 42px;
    display: flex;
    align-items: center;
    justify-content: center;
    background-color: white;
}

.input-group .input>input {
    height:42px;
    width : calc(100% - 42px);
    padding: 12px 7px;
    border: none;
    outline : none;
    font-size : 1.25rem;
    font-weight : 600;
    color : #333;
    background-color: white;
}


.input-group .books  {
    width: max-content;
    display: flex;
    align-items: center;
    background-color : white;
    margin-top : 3px;
}

.input-group > div  {
    padding : 0 6px;
}


.input-group .books button {
    display: inline-flex;
    height: 28px;
    padding: 0 10px;
    border-radius: 15px;
    border : none;
    background-color : white;
    font-weight : bold;
    margin-right : 5px
}

control-groupe .button-group bottom.is-active {
    color :rgb(16, 83, 170) ;
    background-color: rgba(0, 110, 255, 0.096);
}

.bible-ref {
    width: 100%;
    height: auto;
    padding: 12px 14px;
    background-color: rgba(255, 1, 1, 0.068);
    margin-bottom : 8px;
    border-radius : 5px
}

.spell-error {
    background-color: rgba(255, 59, 48, 0.15);
    border-bottom: 2px solid #ff3b30;
    cursor: pointer;
    border-radius: 2px;
}

.spell-popup-overlay {
    position: fixed;
    inset: 0;
    background-color: rgba(0, 0, 0, 0.4);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 30;
}

.spell-popup {
    background-color: white;
    border-radius: 12px;
    padding: 20px;
    width: min(320px, 85vw);
    box-shadow: 0 10px 30px rgba(0, 0, 0, 0.3);
}

.spell-popup-title {
    font-size: 13px;
    font-weight: 700;
    text-transform: uppercase;
    letter-spacing: 0.5px;
    color: #ff3b30;
    margin-bottom: 10px;
}

.spell-popup-suggestion {
    font-size: 17px;
    font-weight: 600;
    color: #111;
    background-color: rgba(255, 59, 48, 0.08);
    border-radius: 8px;
    padding: 10px 12px;
    margin-bottom: 16px;
    word-break: break-word;
}

.spell-popup-actions {
    display: flex;
    gap: 8px;
    justify-content: flex-end;
}

.spell-popup-actions button {
    border: none;
    border-radius: 999px;
    padding: 8px 16px;
    font-size: 14px;
    font-weight: 600;
    cursor: pointer;
}

.spell-popup-apply {
    background-color: #ff3b30;
    color: white;
}

.spell-popup-close {
    background-color: #f3f4f6;
    color: #374151;
}

.floating-correct-btn {
    position: fixed;
    bottom: 24px;
    right: 16px;
    z-index: 20;
    display: inline-flex;
    align-items: center;
    gap: 8px;
    padding: 10px 18px;
    border: none;
    border-radius: 999px;
    background-color: #ff3b30;
    color: white;
    font-size: 15px;
    font-weight: 600;
    box-shadow: 0 4px 14px rgba(0, 0, 0, 0.25);
    opacity: 1;
}

.floating-correct-btn:disabled {
    opacity: 0.5;
}

`;
