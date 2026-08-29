import { describe, expect, it } from 'vitest'
import { fixDelete } from '../../../packages/markmend/core/src/preprocess/delete'
import { getTestCasesByCategories } from './test-cases'

describe('fixDelete', () => {
  for (const testCase of getTestCasesByCategories(['delete'])) {
    it(testCase.description, () => {
      expect(fixDelete(testCase.input, testCase.preprocessOptions)).toBe(testCase.expected)
    })
  }
})
