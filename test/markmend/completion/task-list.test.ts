import { describe, expect, it } from 'vitest'
import { completeTaskList } from '../../../packages/markmend/core/src/completion/task-list'
import { getTestCasesByCategories } from './test-cases'

describe('completeTaskList', () => {
  for (const testCase of getTestCasesByCategories(['task-list'])) {
    it(testCase.description, () => {
      expect(completeTaskList(testCase.input)).toBe(testCase.expected)
    })
  }
})
