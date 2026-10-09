import type { BundledLanguage, BundledTheme, CodeToTokensOptions, GrammarState, Highlighter, ThemedToken, TokensResult } from 'shiki'
/*!
 * Recent-state cache adapted from Streamdown (Vercel, Inc., 2023).
 * Licensed under Apache-2.0; see LICENSE.streamdown.
 * Tokenization delegates to the official ShikiStreamTokenizer.
 */
import { ShikiStreamTokenizer } from '@shikijs/stream'

type TokenOptions = CodeToTokensOptions<BundledLanguage, BundledTheme>

interface IncrementalState {
  key: string
  prefix: string
  rows: ThemedToken[][]
  grammarState: GrammarState
}

const states = new WeakMap<Highlighter, IncrementalState[]>()
const MAX_STATES = 4
const supportedOptions = new Set([
  'lang',
  'theme',
  'themes',
  'defaultColor',
  'colorsRendering',
  'cssVariablePrefix',
  'includeExplanation',
  'colorReplacements',
  'tokenizeMaxLineLength',
])

function configurationKey(options: TokenOptions): string | undefined {
  if (!options.lang || ['plaintext', 'text', 'txt', 'ansi'].includes(options.lang))
    return
  if (Object.keys(options).some(key => !supportedOptions.has(key)))
    return
  // Custom theme objects can contain hooks that JSON cannot identify safely.
  if ('theme' in options && typeof options.theme !== 'string')
    return
  if ('themes' in options && Object.values(options.themes).some(theme => typeof theme !== 'string'))
    return
  try {
    return JSON.stringify(options)
  }
  catch {
    return undefined
  }
}

function shiftOffsets(rows: ThemedToken[][], offset: number) {
  for (const row of rows) {
    for (const token of row)
      token.offset += offset
  }
}

export async function incrementalCodeToTokens(highlighter: Highlighter, code: string, options: TokenOptions): Promise<TokensResult> {
  const key = configurationKey(options)
  const lastNewline = code.lastIndexOf('\n')
  // A bare CR can become CRLF in the next chunk; don't cache that boundary.
  if (!key || lastNewline < 0 || /\r(?!\n)/.test(code))
    return highlighter.codeToTokens(code, options)

  const pool = states.get(highlighter) ?? []
  const index = pool.findIndex(state => state.key === key && code.startsWith(state.prefix))
  const previous = index < 0 ? undefined : pool.splice(index, 1)[0]
  const prefix = code.slice(0, lastNewline + 1)
  // Bootstrap an existing block in one Shiki call; stream only subsequent lines.
  const initial = previous ? undefined : highlighter.codeToTokens(prefix, options)
  const completedRows = previous?.rows ?? initial?.tokens.slice(0, -1) ?? []
  const grammarState = previous?.grammarState ?? initial?.grammarState
  if (!grammarState)
    return highlighter.codeToTokens(code, options)
  const start = previous?.prefix.length ?? prefix.length
  const newRows: ThemedToken[][] = []
  let offset = start
  let result: TokensResult | undefined
  const tokenizer = new ShikiStreamTokenizer({
    ...options,
    highlighter: {
      ...highlighter,
      codeToTokens(line: string, config: CodeToTokensOptions<string, string>) {
        const normalized = line.endsWith('\r') ? line.slice(0, -1) : line
        result = highlighter.codeToTokens(normalized, config as TokenOptions)
        shiftOffsets(result.tokens, offset)
        // The official tokenizer consumes only the first row, then appends a newline token.
        // Copy the row array so its synthetic newline doesn't change our row output.
        newRows.push(result.tokens[0]?.slice() ?? [])
        offset += line.length + 1
        return result
      },
    },
  })
  tokenizer.lastStableGrammarState = grammarState
  await tokenizer.enqueue(code.slice(start))
  const tail = newRows.pop() ?? []
  const rows = completedRows.concat(newRows)
  if (!result || !tokenizer.lastStableGrammarState)
    return highlighter.codeToTokens(code, options)
  pool.unshift({ key, prefix, rows, grammarState: tokenizer.lastStableGrammarState })
  pool.length = Math.min(pool.length, MAX_STATES)
  states.set(highlighter, pool)
  return { ...result, tokens: rows.concat([tail]) }
}
