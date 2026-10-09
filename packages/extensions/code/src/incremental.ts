/*!
 * Adapted from Streamdown's incremental highlighting (Vercel, Inc., 2023).
 * Licensed under Apache-2.0; see LICENSE.streamdown.
 * Modified to isolate Shiki configurations and bound the shared cache.
 */
import type { BundledLanguage, BundledTheme, CodeToTokensOptions, GrammarState, Highlighter, ThemedToken, TokensResult } from 'shiki'

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

export function incrementalCodeToTokens(highlighter: Highlighter, code: string, options: TokenOptions): TokensResult {
  const key = configurationKey(options)
  const lastNewline = code.lastIndexOf('\n')
  // A bare CR can become CRLF in the next chunk; don't cache that boundary.
  if (!key || lastNewline < 0 || /\r(?!\n)/.test(code))
    return highlighter.codeToTokens(code, options)

  const pool = states.get(highlighter) ?? []
  const index = pool.findIndex(state => state.key === key && code.startsWith(state.prefix))
  const previous = index < 0 ? undefined : pool.splice(index, 1)[0]
  const prefix = code.slice(0, lastNewline + 1)
  const start = previous?.prefix.length ?? 0
  let rows = previous?.rows ?? []
  let grammarState = previous?.grammarState
  let completed: TokensResult | undefined

  if (prefix.length > start) {
    completed = highlighter.codeToTokens(prefix.slice(start), { ...options, grammarState })
    const newRows = completed.tokens.slice(0, -1)
    shiftOffsets(newRows, start)
    rows = rows.concat(newRows)
    grammarState = completed.grammarState
  }

  if (!grammarState)
    return highlighter.codeToTokens(code, options)

  pool.unshift({ key, prefix, rows, grammarState })
  pool.length = Math.min(pool.length, MAX_STATES)
  states.set(highlighter, pool)

  const tail = code.slice(prefix.length)
  // A completed block already includes the final empty row.
  const result = !tail && completed
    ? { ...completed, tokens: completed.tokens.slice(-1) }
    : highlighter.codeToTokens(tail, { ...options, grammarState })
  shiftOffsets(result.tokens, !tail && completed ? start : prefix.length)
  return { ...result, tokens: rows.concat(result.tokens) }
}
