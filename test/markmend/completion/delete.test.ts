import { describe, expect, it } from 'vitest'
import { fixDelete } from '../../../packages/markmend/core/src/completion/delete'
import { getTestCasesByCategories } from './test-cases'

describe('fixDelete', () => {
  for (const testCase of getTestCasesByCategories(['delete'])) {
    it(testCase.description, () => {
      expect(fixDelete(testCase.input, testCase.completionOptions)).toBe(testCase.expected)
    })
  }
})
