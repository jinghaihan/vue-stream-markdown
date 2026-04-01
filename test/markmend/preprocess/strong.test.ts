import { fixStrong } from '@markmend/preprocess/strong'
import { describe, expect, it } from 'vitest'
import { getTestCasesByCategories } from './test-cases'

describe('fixStrong', () => {
  for (const testCase of getTestCasesByCategories(['strong-asterisk', 'strong-underscore'])) {
    it(testCase.description, () => {
      expect(fixStrong(testCase.input, testCase.preprocessOptions)).toBe(testCase.expected)
    })
  }
})
