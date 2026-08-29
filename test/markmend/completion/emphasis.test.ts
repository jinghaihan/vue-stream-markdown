import { describe, expect, it } from 'vitest'
import { fixEmphasis } from '../../../packages/markmend/core/src/completion/emphasis'
import { getTestCasesByCategories } from './test-cases'

describe('fixEmphasis', () => {
  for (const testCase of getTestCasesByCategories(['emphasis-asterisk', 'emphasis-underscore'])) {
    it(testCase.description, () => {
      expect(fixEmphasis(testCase.input, testCase.completionOptions)).toBe(testCase.expected)
    })
  }
})
