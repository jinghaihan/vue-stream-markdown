import { describe, expect, it } from 'vitest'
import { normalize, preprocess } from '../../src/preprocess'
import { getTestCases } from './test-cases'
import { getFixtureFiles, getSnapshotPath, readFixture } from './utils'

describe('normalize', () => {
  it('should convert LaTeX syntax and normalize content', () => {
    expect(normalize('\\[E = mc^2\\]')).toBe('$$E = mc^2$$')
    expect(normalize('\\(x = 1\\)')).toBe('$$x = 1$$')
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
    it(fixtureFile, () => {
      const fixture = readFixture(fixtureFile)
      const result = preprocess(fixture)
      const snapshotPath = getSnapshotPath(fixtureFile)
      expect(result).toMatchFileSnapshot(snapshotPath)
    })
  }
})
