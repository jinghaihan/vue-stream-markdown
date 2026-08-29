import type { TextDirection, TextDirectionConfig } from '../types'

const RTL_PATTERN = /[\u0590-\u08FF\uFB1D-\uFDFF\uFE70-\uFEFF]/
const LETTER_PATTERN = /\p{L}/u

/** Detect direction from the majority of strong Unicode letters. */
export function detectTextDirection(text: string): TextDirection {
  let firstStrong: TextDirection | undefined
  let ltrCount = 0
  let rtlCount = 0

  for (const char of text) {
    if (RTL_PATTERN.test(char)) {
      firstStrong ??= 'rtl'
      rtlCount += 1
      continue
    }

    if (LETTER_PATTERN.test(char)) {
      firstStrong ??= 'ltr'
      ltrCount += 1
    }
  }

  if (rtlCount > ltrCount)
    return 'rtl'
  if (ltrCount > rtlCount)
    return 'ltr'
  return firstStrong ?? 'ltr'
}

export function resolveTextDirection(
  text: string,
  direction: TextDirectionConfig | undefined,
): TextDirection | undefined {
  if (!direction)
    return undefined
  if (direction !== 'auto')
    return direction
  return detectTextDirection(text)
}
