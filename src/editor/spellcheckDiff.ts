// Compare le texte brut d'origine au texte corrigé par l'IA (mot à mot, via LCS)
// pour localiser les segments qui diffèrent, sans jamais reconstruire le document
// riche (headings, versets, images...) à partir du texte brut.

interface Token {
    word: string
    start: number
    end: number
}

const tokenize = (text: string): Token[] => {
    const tokens: Token[] = []
    const re = /\S+/g
    let m: RegExpExecArray | null
    while ((m = re.exec(text)) !== null) {
        tokens.push({ word: m[0], start: m.index, end: m.index + m[0].length })
    }
    return tokens
}

interface Hunk {
    aStart: number
    aEnd: number
    bStart: number
    bEnd: number
}

// Au-delà de ce nombre de mots, le DP en O(n*m) devient trop coûteux pour un webview mobile.
const MAX_WORDS_FOR_DIFF = 2000

const computeHunks = (wordsA: string[], wordsB: string[]): Hunk[] => {
    const n = wordsA.length
    const m = wordsB.length
    if (n * m > MAX_WORDS_FOR_DIFF * MAX_WORDS_FOR_DIFF) return []

    const dp: number[][] = Array.from({ length: n + 1 }, () => new Array(m + 1).fill(0))
    for (let i = n - 1; i >= 0; i--) {
        for (let j = m - 1; j >= 0; j--) {
            dp[i][j] = wordsA[i] === wordsB[j] ? dp[i + 1][j + 1] + 1 : Math.max(dp[i + 1][j], dp[i][j + 1])
        }
    }

    const ops: ('equal' | 'a' | 'b')[] = []
    let i = 0, j = 0
    while (i < n && j < m) {
        if (wordsA[i] === wordsB[j]) {
            ops.push('equal'); i++; j++
        } else if (dp[i + 1][j] >= dp[i][j + 1]) {
            ops.push('a'); i++
        } else {
            ops.push('b'); j++
        }
    }
    while (i < n) { ops.push('a'); i++ }
    while (j < m) { ops.push('b'); j++ }

    const hunks: Hunk[] = []
    let ai = 0, bi = 0, k = 0
    while (k < ops.length) {
        if (ops[k] === 'equal') { ai++; bi++; k++; continue }
        const aStart = ai, bStart = bi
        while (k < ops.length && ops[k] !== 'equal') {
            if (ops[k] === 'a') ai++
            else bi++
            k++
        }
        hunks.push({ aStart, aEnd: ai, bStart, bEnd: bi })
    }
    return hunks
}

export interface SpellHunk {
    from: number
    to: number
    replacement: string
}

/**
 * `map[charIndex]` = position ProseMirror du caractère `charIndex` du texte brut
 * (voir `getTextWithPositions`). Les hunks purement additifs (mot absent de l'original)
 * n'ont pas d'ancrage fiable dans le doc riche et sont ignorés.
 */
export function computeSpellHunks(original: string, corrected: string, map: number[]): SpellHunk[] {
    if (!original.trim() || !corrected.trim() || original === corrected) return []

    const tokensA = tokenize(original)
    const tokensB = tokenize(corrected)
    const hunks = computeHunks(tokensA.map(t => t.word), tokensB.map(t => t.word))

    const result: SpellHunk[] = []
    for (const h of hunks) {
        if (h.aEnd <= h.aStart) continue
        const firstTok = tokensA[h.aStart]
        const lastTok = tokensA[h.aEnd - 1]
        const from = map[firstTok.start]
        const to = map[lastTok.end - 1]
        if (from === undefined || to === undefined) continue
        const replacement = tokensB.slice(h.bStart, h.bEnd).map(t => t.word).join(' ')
        result.push({ from, to: to + 1, replacement })
    }
    return result
}

/**
 * Aplatit le doc ProseMirror en texte brut, en gardant la correspondance
 * `map[charIndex] -> position ProseMirror` pour pouvoir replacer les décorations
 * et les remplacements après coup.
 */
export function getTextWithPositions(doc: { descendants: (cb: (node: any, pos: number) => boolean | void) => void }): { text: string; map: number[] } {
    let text = ''
    const map: number[] = []
    doc.descendants((node: any, pos: number) => {
        if (node.isText) {
            const nodeText: string = node.text ?? ''
            for (let i = 0; i < nodeText.length; i++) map.push(pos + i)
            text += nodeText
        } else if (node.isBlock && text.length > 0 && !text.endsWith('\n')) {
            text += '\n'
            map.push(pos)
        }
        return true
    })
    return { text, map }
}
