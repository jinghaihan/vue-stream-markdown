import { describe, expect, it } from 'vitest'
import { fixTaskList } from '../../packages/markmend/src/preprocess/task-list'
import { getTestCasesByCategories } from './test-cases'

describe('fixTaskList', () => {
  for (const testCase of getTestCasesByCategories(['task-list'])) {
    it(testCase.description, () => {
      expect(fixTaskList(testCase.input)).toBe(testCase.expected)
    })
  }
})
