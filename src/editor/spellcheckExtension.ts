import { Extension } from '@tiptap/core'
import { Plugin, PluginKey } from '@tiptap/pm/state'
import { Decoration, DecorationSet } from '@tiptap/pm/view'

export interface SpellErrorRange {
    from: number
    to: number
}

declare module '@tiptap/core' {
    interface Commands<ReturnType> {
        spellcheck: {
            setSpellErrors: (ranges: SpellErrorRange[]) => ReturnType
            clearSpellErrors: () => ReturnType
        }
    }
}

export const spellcheckPluginKey = new PluginKey<DecorationSet>('spellcheck')

export default Extension.create({
    name: 'spellcheck',

    addProseMirrorPlugins() {
        return [
            new Plugin<DecorationSet>({
                key: spellcheckPluginKey,
                state: {
                    init: () => DecorationSet.empty,
                    apply(tr, old) {
                        const ranges = tr.getMeta(spellcheckPluginKey) as SpellErrorRange[] | undefined
                        if (ranges) {
                            const decorations = ranges
                                .filter(r => r.from >= 0 && r.to <= tr.doc.content.size && r.from < r.to)
                                .map(r => Decoration.inline(r.from, r.to, { class: 'spell-error' }))
                            return DecorationSet.create(tr.doc, decorations)
                        }
                        return old.map(tr.mapping, tr.doc)
                    },
                },
                props: {
                    decorations(state) {
                        return spellcheckPluginKey.getState(state)
                    },
                },
            }),
        ]
    },

    addCommands() {
        return {
            setSpellErrors:
                (ranges: SpellErrorRange[]) =>
                ({ tr, dispatch }) => {
                    if (dispatch) tr.setMeta(spellcheckPluginKey, ranges)
                    return true
                },
            clearSpellErrors:
                () =>
                ({ tr, dispatch }) => {
                    if (dispatch) tr.setMeta(spellcheckPluginKey, [])
                    return true
                },
        }
    },
})
