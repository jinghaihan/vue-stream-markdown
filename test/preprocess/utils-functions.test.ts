import { describe, expect, it } from 'vitest'
import {
  findLastParagraphStart,
  getLastNonEmptyLine,
  getLastParagraph,
  isWithinHtmlTag,
  isWithinLinkOrImageUrl,
  isWithinMathBlock,
  removeMathBlocksFromText,
} from '../../src/preprocess/utils'

describe('findLastParagraphStart', () => {
  it('skips undefined lines defensively', () => {
    const lines = ['a', 'b', undefined] as unknown as string[]
    expect(findLastParagraphStart(lines)).toBe(0)
  })
})

describe('getLastParagraph', () => {
  it('returns the last paragraph', () => {
    expect(getLastParagraph('a\n\nb')).toBe('b')
  })

  it('supports skipping a trailing empty line', () => {
    expect(getLastParagraph('a\n\nb\n', true)).toBe('b\n')
  })
})

describe('getLastNonEmptyLine', () => {
  it('returns undefined when all lines are empty', () => {
    expect(getLastNonEmptyLine(['', '  '])).toBeUndefined()
  })

  it('returns the last non-empty line', () => {
    expect(getLastNonEmptyLine(['', 'a', ' ', 'b'])).toBe('b')
  })
})

describe('isWithinLinkOrImageUrl', () => {
  it('returns true when position is inside a complete link URL', () => {
    const text = '[text](http://example.com)'
    const position = text.indexOf('example')
    expect(isWithinLinkOrImageUrl(text, position)).toBe(true)
  })

  it('returns false when position is after the closing paren', () => {
    const text = '[text](http://example.com)'
    expect(isWithinLinkOrImageUrl(text, text.length)).toBe(false)
  })

  it('returns true for an unclosed link URL on the same line', () => {
    const text = '[text](http://example'
    expect(isWithinLinkOrImageUrl(text, text.length)).toBe(true)
  })

  it('treats a newline after position as not having a closing paren', () => {
    const text = '[text](http://example.com\nmore)'
    const position = text.indexOf('example')
    expect(isWithinLinkOrImageUrl(text, position)).toBe(true)
  })

  it('returns false when encountering a bare opening paren', () => {
    const text = '(http://example.com'
    const position = text.indexOf('example')
    expect(isWithinLinkOrImageUrl(text, position)).toBe(false)
  })

  it('returns false when a paren in the URL is not preceded by ]', () => {
    const text = '[text](http://example.com/path_(with_parens'
    const position = text.indexOf('with_parens')
    expect(isWithinLinkOrImageUrl(text, position)).toBe(false)
  })
})

describe('isWithinHtmlTag', () => {
  it('returns true when position is inside an opening tag', () => {
    const text = '<a href="x">content'
    const position = text.indexOf('href') + 1
    expect(isWithinHtmlTag(text, position)).toBe(true)
  })

  it('returns false after the tag is closed', () => {
    expect(isWithinHtmlTag('<a>', 3)).toBe(false)
  })

  it('ignores escaped angle brackets', () => {
    expect(isWithinHtmlTag('\\<a>', 4)).toBe(false)
    expect(isWithinHtmlTag('<a\\>', 4)).toBe(true)
  })
})

describe('removeMathBlocksFromText', () => {
  it('keeps escaped dollar signs', () => {
    expect(removeMathBlocksFromText('cost \\$100')).toBe('cost \\$100')
  })

  it('removes an unclosed block math segment to end of text', () => {
    expect(removeMathBlocksFromText('text $$x^2')).toBe('text ')
  })

  it('removes an unclosed inline math segment to end of text when enabled', () => {
    expect(removeMathBlocksFromText('text $x^2', { singleDollarTextMath: true })).toBe('text ')
  })

  it('handles mixed closed and unclosed block math', () => {
    expect(removeMathBlocksFromText('a $$b$$ c $$d')).toBe('a  c ')
  })
})

describe('isWithinMathBlock', () => {
  it('does not treat escaped $ as a math delimiter', () => {
    const text = '\\$100 dollars'
    const position = text.indexOf('100') + 1
    expect(isWithinMathBlock(text, position, { singleDollarTextMath: true })).toBe(false)
  })

  it('supports inline $...$ when singleDollarTextMath is enabled', () => {
    const text = 'a $x$ b'
    const position = text.indexOf('x')
    expect(isWithinMathBlock(text, position, { singleDollarTextMath: true })).toBe(true)
    expect(isWithinMathBlock(text, position, { singleDollarTextMath: false })).toBe(false)
  })

  it('ignores single $ inside $$...$$ blocks even when enabled', () => {
    const text = '$$a$b$$'
    const position = text.indexOf('b')
    expect(isWithinMathBlock(text, position, { singleDollarTextMath: true })).toBe(true)
  })
})
