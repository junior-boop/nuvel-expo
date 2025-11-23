import { mergeAttributes, Node, type SingleCommands } from "@tiptap/core";
import { ReactNodeViewRenderer } from "@tiptap/react";

import BibleVerset from "./Bibleverset";

declare module "@tiptap/core" {
  interface Commands<ReturnType> {
    verset: {
      /**
       * Add an verset
       * @param options The bible verset attributes (entry)
       * @example
       * editor
       *   .commands
       *   .setVerset({ ref_bible: 'string', content : {n:"string", text : "string"}[]})
       */
      setVerset: (options: {
        ref_bible: string;
        content: string;
      }) => ReturnType;
    };
  }
}

export default Node.create({
  name: "bibleverset",

  group: "block",

  atom: true,

  addCommands() {
    return {
      setVerset:
        (option) =>
        ({ commands }: { commands: SingleCommands }) => {
          return commands.insertContent({ type: this.name, attrs: option });
        },
    };
  },

  addAttributes() {
    return {
      ref_bible: {
        default: null,
      },
      content: {
        default: null,
      },
    };
  },

  parseHTML() {
    return [
      {
        tag: "bible-verset",
      },
    ];
  },

  renderHTML({ HTMLAttributes }) {
    return ["bible-verset", mergeAttributes(HTMLAttributes)];
  },

  addNodeView() {
    return ReactNodeViewRenderer(BibleVerset);
  },
});
