import { describe, expect, it } from 'vitest'
import { completeTable } from '../../../packages/markmend/core/src/completion/table'
import { getTestCasesByCategories } from './test-cases'

describe('completeTable', () => {
  for (const testCase of getTestCasesByCategories(['table'])) {
    it(testCase.description, () => {
      expect(completeTable(testCase.input)).toBe(testCase.expected)
    })
  }
})
