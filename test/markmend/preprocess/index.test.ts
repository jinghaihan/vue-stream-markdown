import { normalize, parseMarkdownIntoBlocks, preprocess } from '@markmend/core'
import { describe, expect, it } from 'vitest'
import { getTestCases, getTestCasesByCategory } from './test-cases'
import { getFixtureFiles, getSnapshotPath, readFixture } from './utils'

describe('normalize', () => {
  it('should convert LaTeX syntax and normalize content', () => {
    expect(normalize('\\[E = mc^2\\]')).toBe('$$E = mc^2$$')
    expect(normalize('\\(x = 1\\)')).toBe('$$x = 1$$')
  })
})

describe('parseMarkdownIntoBlocks', () => {
  it('should keep nested same-name HTML elements in one block', () => {
    const markdown = '<div>\n<div>\ninner\n</div>\n\nafter inner\n</div>\n\noutside'

    expect(parseMarkdownIntoBlocks(markdown)).toEqual([
      '<div>\n<div>\ninner\n</div>\n\nafter inner\n</div>\n\n',
      'outside',
    ])
  })

  it('should keep custom HTML elements and trailing whitespace together', () => {
    const markdown = '<my-box>\ninside\n</my-box>\n\noutside'

    expect(parseMarkdownIntoBlocks(markdown)).toEqual([
      '<my-box>\ninside\n</my-box>\n\n',
      'outside',
    ])
  })

  it('should merge lexer tokens until an open math span closes', () => {
    const markdown = 'Before $$\nx\n=\ny\n$$\n\nafter'

    expect(parseMarkdownIntoBlocks(markdown)).toEqual([
      'Before $$\nx\n=\ny\n$$',
      '\n\n',
      'after',
    ])
  })

  it('should not merge a code block containing shell variables with the next block', () => {
    const markdown = '```sh\necho $$\n```\n\nafter'

    expect(parseMarkdownIntoBlocks(markdown)).toEqual([
      '```sh\necho $$\n```',
      '\n\n',
      'after',
    ])
  })

  it('should not treat regex character classes as footnotes', () => {
    const markdown = 'Pattern [^\\s+] example.\n\nNext paragraph.'

    expect(parseMarkdownIntoBlocks(markdown)).toEqual([
      'Pattern [^\\s+] example.',
      '\n\n',
      'Next paragraph.',
    ])
  })
})

describe('preprocess', () => {
  for (const testCase of getTestCases()) {
    it(testCase.description, () => {
      const expected = testCase.integrationExpected ?? testCase.expected
      expect(preprocess(testCase.input, testCase.preprocessOptions)).toBe(expected)
    })
  }

  for (const fixtureFile of getFixtureFiles()) {
    it(fixtureFile, async () => {
      const fixture = readFixture(fixtureFile)
      const result = preprocess(fixture)
      const snapshotPath = getSnapshotPath(fixtureFile)
      await expect(result).toMatchFileSnapshot(snapshotPath)
    })
  }

  it('should allow overriding a single built-in step', () => {
    expect(preprocess('Hello <div', undefined, {
      html: content => `${content}>custom</div>`,
    })).toBe('Hello <div>custom</div>')
  })
})

describe('streaming completion idempotence', () => {
  for (const testCase of getTestCasesByCategory('streaming-completion')) {
    it(`keeps the expected output stable: ${testCase.description}`, () => {
      expect(preprocess(testCase.expected, testCase.preprocessOptions)).toBe(testCase.expected)
    })
  }
})
