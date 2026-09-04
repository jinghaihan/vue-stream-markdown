import { describe, expect, it } from 'vitest'
import { completeEmphasis } from '../../../packages/markmend/core/src/completion/emphasis'
import { getTestCasesByCategories } from './test-cases'

describe('completeEmphasis', () => {
  for (const testCase of getTestCasesByCategories(['emphasis-asterisk', 'emphasis-underscore'])) {
    it(testCase.description, () => {
      expect(completeEmphasis(testCase.input, testCase.completionOptions)).toBe(testCase.expected)
    })
  }
})
