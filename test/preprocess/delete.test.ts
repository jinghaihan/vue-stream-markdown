import { describe, expect, it } from 'vitest'
import { fixDelete } from '../../src/preprocess/delete'
import { getTestCasesByCategories } from './test-cases'

describe('fixDelete', () => {
  for (const testCase of getTestCasesByCategories(['delete'])) {
    it(testCase.description, () => {
      expect(fixDelete(testCase.input)).toBe(testCase.expected)
    })
  }
})
