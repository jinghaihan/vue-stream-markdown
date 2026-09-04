import { describe, expect, it } from 'vitest'
import { completeDelete } from '../../../packages/markmend/core/src/completion/delete'
import { getTestCasesByCategories } from './test-cases'

describe('completeDelete', () => {
  for (const testCase of getTestCasesByCategories(['delete'])) {
    it(testCase.description, () => {
      expect(completeDelete(testCase.input, testCase.completionOptions)).toBe(testCase.expected)
    })
  }
})
