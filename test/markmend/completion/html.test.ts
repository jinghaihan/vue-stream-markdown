import { completeMarkdown } from '@markmend/core'
import { describe, expect, it } from 'vitest'
import { completeHtml } from '../../../packages/markmend/core/src/completion/html'
import { getTestCasesByCategory } from './test-cases'

describe('completeHtml', () => {
  for (const testCase of getTestCasesByCategory('html')) {
    it(testCase.description, () => {
      expect(completeHtml(testCase.input)).toBe(testCase.expected)
    })
  }

  it.each([
    ['closed inline math', '$$ a <b $$\n\nAfter', '$$ a <b $$\n\nAfter'],
    ['closed block math', '$$\na <b\n$$\n\nAfter', '$$\na <b\n$$\n\nAfter'],
    ['streaming inline math', '$$ a <b', '$$ a <b$$'],
    ['streaming block math', '$$\na <b', '$$\na <b\n$$'],
  ])('preserves HTML-like comparisons inside %s', (_name, input, expected) => {
    expect(completeHtml(input)).toBe(input)
    expect(completeMarkdown(input)).toBe(expected)
  })

  it('protects single-dollar math when explicitly enabled', () => {
    const input = '$a <b$\n\nAfter'
    const options = { singleDollarTextMath: true }
    expect(completeHtml(input, options)).toBe(input)
    expect(completeMarkdown(input, options)).toBe(input)
  })

  it('protects normalized bracket and parenthesis math', () => {
    for (const delimiter of [['\\[', '\\]'], ['\\(', '\\)']]) {
      expect(completeMarkdown(`${delimiter[0]}a <b${delimiter[1]}\n\nAfter`))
        .toBe('$$a <b$$\n\nAfter')
    }
  })

  it.each([
    ['$$a <b$$\n\nText <span', '$$a <b$$\n\nText'],
    ['`$$` Text <span', '`$$` Text'],
    ['```text\n$$\n```\n\nText <span', '```text\n$$\n```\n\nText'],
    ['Price $7,000 and <span', 'Price $7,000 and'],
  ])('still completes HTML outside math: %s', (input, expected) => {
    expect(completeHtml(input)).toBe(expected)
    expect(completeMarkdown(input)).toBe(expected)
  })

  it('does not treat escaped dollar delimiters as math', () => {
    expect(completeHtml('\\$$ Text <span')).toBe('\\$$ Text')
  })
})
