import { describe, expect, it } from 'vitest'
import { completeStrong } from '../../../packages/markmend/core/src/completion/strong'
import { getTestCasesByCategories } from './test-cases'

describe('completeStrong', () => {
  for (const testCase of getTestCasesByCategories(['strong-asterisk', 'strong-underscore'])) {
    it(testCase.description, () => {
      expect(completeStrong(testCase.input, testCase.completionOptions)).toBe(testCase.expected)
    })
  }
})
