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

export function createTextParts(text: string, keyPrefix: string = `${STREAM_MARKDOWN_PREFIX}-text`): TextPart[] {
  let offset = 0
  return splitTextByWord(text).map((value) => {
    const start = offset
    offset += value.length

    return {
      key: `${keyPrefix}-${start}`,
      value,
      whitespace: value.trim().length === 0,
    }
  })
}
