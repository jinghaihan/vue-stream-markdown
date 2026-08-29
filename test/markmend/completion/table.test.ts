import { describe, expect, it } from 'vitest'
import { fixTable } from '../../../packages/markmend/core/src/completion/table'
import { getTestCasesByCategories } from './test-cases'

describe('fixTable', () => {
  for (const testCase of getTestCasesByCategories(['table'])) {
    it(testCase.description, () => {
      expect(fixTable(testCase.input)).toBe(testCase.expected)
    })
  }
})
