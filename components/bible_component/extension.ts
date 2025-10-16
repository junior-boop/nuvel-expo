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
       *   .setVerset({ entry: 'Matth 12: 4-12'})
       */
      setVerset: (options: { entry: string }) => ReturnType;
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
      entry: {
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
