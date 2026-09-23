import { mergeAttributes, Node, type SingleCommands } from "@tiptap/core";
import { ReactNodeViewRenderer } from "@tiptap/react";

import LinkPreviewView from "./LinkPreviewView";

export type LinkPreviewData = {
  url: string;
  title?: string | null;
  description?: string | null;
  image?: string | null;
  domain?: string | null;
};

export type LinkPreviewAttrs = LinkPreviewData & {
  status: "loading" | "ready" | "error";
};

declare module "@tiptap/core" {
  interface Commands<ReturnType> {
    linkPreview: {
      /**
       * Insere une carte d'apercu de lien (titre, image, domaine) a la position courante.
       * @example editor.commands.setLinkPreview('https://example.com')
       */
      setLinkPreview: (url: string) => ReturnType;
    };
  }
}

export default Node.create<{ fetchPreview?: (url: string) => Promise<LinkPreviewData | null> }>({
  name: "linkPreview",

  group: "block",

  atom: true,

  draggable: true,

  addOptions() {
    return {
      fetchPreview: undefined,
    };
  },

  addAttributes() {
    return {
      url: { default: null },
      title: { default: null },
      description: { default: null },
      image: { default: null },
      domain: { default: null },
      status: { default: "loading" },
    };
  },

  parseHTML() {
    return [{ tag: "link-preview" }];
  },

  renderHTML({ HTMLAttributes }) {
    return ["link-preview", mergeAttributes(HTMLAttributes)];
  },

  addCommands() {
    return {
      setLinkPreview:
        (url: string) =>
        ({ commands }: { commands: SingleCommands }) => {
          return commands.insertContent({
            type: this.name,
            attrs: { url, status: "loading" },
          });
        },
    };
  },

  addNodeView() {
    return ReactNodeViewRenderer(LinkPreviewView);
  },
});
