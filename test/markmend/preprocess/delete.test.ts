import { fixDelete } from '@markmend/core'
import { describe, expect, it } from 'vitest'
import { getTestCasesByCategories } from './test-cases'

describe('fixDelete', () => {
  for (const testCase of getTestCasesByCategories(['delete'])) {
    it(testCase.description, () => {
      expect(fixDelete(testCase.input)).toBe(testCase.expected)
    })
  }
})
