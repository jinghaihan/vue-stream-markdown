import { describe, expect, it } from 'vitest'
import { fixInlineMath } from '../../src/preprocess/inline-math'
import { getTestCasesByCategories } from './test-cases'

describe('fixInlineMath', () => {
  for (const testCase of getTestCasesByCategories(['inline-math'])) {
    it(testCase.description, () => {
      expect(fixInlineMath(testCase.input)).toBe(testCase.expected)
    })
  }
})
