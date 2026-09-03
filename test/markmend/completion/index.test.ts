import { completeMarkdown, completeMarkdownResult } from '@markmend/core'
import { describe, expect, it } from 'vitest'
import { normalize } from '../../../packages/markmend/core/src/completion'
import { getTestCases, getTestCasesByCategory } from './test-cases'
import { getFixtureFiles, getSnapshotPath, readFixture } from './utils'

describe('normalize', () => {
  it('should convert LaTeX syntax and normalize content', () => {
    expect(normalize('\\[E = mc^2\\]')).toBe('$$E = mc^2$$')
    expect(normalize('\\(x = 1\\)')).toBe('$$x = 1$$')
  })
})

describe('completeMarkdown', () => {
  for (const testCase of getTestCases()) {
    it(testCase.description, () => {
      const expected = testCase.integrationExpected ?? testCase.expected
      expect(completeMarkdown(testCase.input, testCase.completionOptions)).toBe(expected)
    })
  }

  for (const fixtureFile of getFixtureFiles()) {
    it(fixtureFile, async () => {
      const fixture = readFixture(fixtureFile)
      const result = completeMarkdown(fixture)
      const snapshotPath = getSnapshotPath(fixtureFile)
      await expect(result).toMatchFileSnapshot(snapshotPath)
    })
  }
})

describe('completeMarkdownResult', () => {
  it('reports the completion step that changed the markdown', () => {
    expect(completeMarkdownResult('**bold')).toEqual({
      markdown: '**bold**',
      completion: {
        type: 'strong',
      },
    })
  })

  it('identifies an incomplete link destination', () => {
    expect(completeMarkdownResult('[label](https://example.com')).toEqual({
      markdown: '[label](https://example.com)',
      completion: {
        type: 'link',
        phase: 'destination',
      },
    })
  })

  it('omits a phase when the link destination has not started', () => {
    expect(completeMarkdownResult('[label')).toEqual({
      markdown: '[label]()',
      completion: {
        type: 'link',
      },
    })
  })

  it('omits completion information for complete markdown', () => {
    expect(completeMarkdownResult('[label](https://example.com)')).toEqual({
      markdown: '[label](https://example.com)',
      completion: undefined,
    })
  })
})

describe('streaming completion idempotence', () => {
  for (const testCase of getTestCasesByCategory('streaming-completion')) {
    it(`keeps the expected output stable: ${testCase.description}`, () => {
      const expected = testCase.integrationExpected ?? testCase.expected
      expect(completeMarkdown(testCase.expected, testCase.completionOptions)).toBe(expected)
    })
  }
})
