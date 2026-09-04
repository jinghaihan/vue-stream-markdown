import { describe, expect, it } from 'vitest'
import { completeInlineMath } from '../../../packages/markmend/core/src/completion/inline-math'
import { getTestCasesByCategories } from './test-cases'

describe('completeInlineMath', () => {
  for (const testCase of getTestCasesByCategories(['inline-math'])) {
    it(testCase.description, () => {
      expect(completeInlineMath(testCase.input)).toBe(testCase.expected)
    })
  }
})
