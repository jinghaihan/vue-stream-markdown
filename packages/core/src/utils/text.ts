import type { AnimationSplit, ResolvedAnimationSplit } from '../types'
import { DEFAULT_ANIMATION_SPLIT, STREAM_MARKDOWN_PREFIX } from '../constants'

const WHITESPACE_RE = /\s/
const CJK_RE = /[\p{Script=Han}\p{Script=Hiragana}\p{Script=Katakana}\p{Script=Hangul}]/u

export interface TextPart {
  key: string
  value: string
  whitespace: boolean
  animationSplit: ResolvedAnimationSplit
}

export function splitTextByWord(text: string): string[] {
  const parts: string[] = []
  let current = ''
  let inWhitespace = false

  for (const char of text) {
    const isWhitespace = WHITESPACE_RE.test(char)
    if (isWhitespace !== inWhitespace && current) {
      parts.push(current)
      current = ''
    }

    current += char
    inWhitespace = isWhitespace
  }

  if (current)
    parts.push(current)

  return parts
}

export function splitTextByChar(text: string): string[] {
  const parts: string[] = []
  let whitespaceBuffer = ''

  for (const char of text) {
    if (WHITESPACE_RE.test(char)) {
      whitespaceBuffer += char
      continue
    }

    if (whitespaceBuffer) {
      parts.push(whitespaceBuffer)
      whitespaceBuffer = ''
    }

    parts.push(char)
  }

  if (whitespaceBuffer)
    parts.push(whitespaceBuffer)

  return parts
}

export function splitTextByAuto(text: string): string[] {
  const parts: string[] = []
  let current = ''
  let currentKind: 'word' | 'whitespace' | undefined

  for (const char of text) {
    if (CJK_RE.test(char)) {
      if (current) {
        parts.push(current)
        current = ''
        currentKind = undefined
      }

      parts.push(char)
      continue
    }

    const nextKind = WHITESPACE_RE.test(char) ? 'whitespace' : 'word'
    if (currentKind !== nextKind && current) {
      parts.push(current)
      current = ''
    }

    current += char
    currentKind = nextKind
  }

  if (current)
    parts.push(current)

  return parts
}

export function resolveTextAnimationSplit(
  text: string,
  split: AnimationSplit = DEFAULT_ANIMATION_SPLIT,
): ResolvedAnimationSplit {
  if (split !== 'auto')
    return split

  return CJK_RE.test(text) ? 'char' : 'word'
}

export function splitText(
  text: string,
  split: AnimationSplit = DEFAULT_ANIMATION_SPLIT,
): string[] {
  if (split === 'auto')
    return splitTextByAuto(text)

  return split === 'char' ? splitTextByChar(text) : splitTextByWord(text)
}

export function createTextParts(
  text: string,
  keyPrefix: string = `${STREAM_MARKDOWN_PREFIX}-text`,
  split: AnimationSplit = DEFAULT_ANIMATION_SPLIT,
): TextPart[] {
  let offset = 0
  return splitText(text, split).map((value) => {
    const start = offset
    offset += value.length

    return {
      key: `${keyPrefix}-${start}`,
      value,
      whitespace: value.trim().length === 0,
      animationSplit: resolveTextAnimationSplit(value, split),
    }
  })
}
