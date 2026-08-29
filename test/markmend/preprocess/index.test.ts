import { completeMarkdown } from '@markmend/core'
import { describe, expect, it } from 'vitest'
import { normalize } from '../../../packages/markmend/core/src/preprocess'
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
      expect(completeMarkdown(testCase.input, testCase.preprocessOptions)).toBe(expected)
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

describe('streaming completion idempotence', () => {
  for (const testCase of getTestCasesByCategory('streaming-completion')) {
    it(`keeps the expected output stable: ${testCase.description}`, () => {
      const expected = testCase.integrationExpected ?? testCase.expected
      expect(completeMarkdown(testCase.expected, testCase.preprocessOptions)).toBe(expected)
    })
  }
})
