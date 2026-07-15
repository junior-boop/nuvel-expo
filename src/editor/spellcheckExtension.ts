import { Extension } from '@tiptap/core'
import { Plugin, PluginKey } from '@tiptap/pm/state'
import { Decoration, DecorationSet } from '@tiptap/pm/view'

export interface SpellErrorRange {
    from: number
    to: number
    replacement?: string
}

export interface SpellErrorClickInfo {
    from: number
    to: number
    replacement: string
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

export default Extension.create<{ onErrorClick?: (info: SpellErrorClickInfo) => void }>({
    name: 'spellcheck',

    addOptions() {
        return {
            onErrorClick: undefined,
        }
    },

    addProseMirrorPlugins() {
        const { onErrorClick } = this.options
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
                                .map(r => Decoration.inline(r.from, r.to, {
                                    class: 'spell-error',
                                    'data-replacement': r.replacement ?? '',
                                    'data-from': String(r.from),
                                    'data-to': String(r.to),
                                }))
                            return DecorationSet.create(tr.doc, decorations)
                        }
                        return old.map(tr.mapping, tr.doc)
                    },
                },
                props: {
                    decorations(state) {
                        return spellcheckPluginKey.getState(state)
                    },
                    handleClick(_view, _pos, event) {
                        const raw = event.target as Node
                        const el = (raw.nodeType === 1 ? raw as HTMLElement : raw.parentElement)?.closest('.spell-error') as HTMLElement | null
                        if (!el) return false
                        onErrorClick?.({
                            from: Number(el.getAttribute('data-from')),
                            to: Number(el.getAttribute('data-to')),
                            replacement: el.getAttribute('data-replacement') ?? '',
                        })
                        return true
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
