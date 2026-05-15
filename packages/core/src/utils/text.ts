import type { AnimationSplit } from '../types'
import { STREAM_MARKDOWN_PREFIX } from '../constants'

const WHITESPACE_RE = /\s/

export interface TextPart {
  key: string
  value: string
  whitespace: boolean
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

export function splitText(text: string, split: AnimationSplit = 'word'): string[] {
  return split === 'char' ? splitTextByChar(text) : splitTextByWord(text)
}

export function createTextParts(
  text: string,
  keyPrefix: string = `${STREAM_MARKDOWN_PREFIX}-text`,
  split: AnimationSplit = 'word',
): TextPart[] {
  let offset = 0
  return splitText(text, split).map((value) => {
    const start = offset
    offset += value.length

    return {
      key: `${keyPrefix}-${start}`,
      value,
      whitespace: value.trim().length === 0,
    }
  })
}
