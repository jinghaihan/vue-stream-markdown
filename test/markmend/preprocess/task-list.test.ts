import { fixTaskList } from '@markmend/preprocess/task-list'
import { describe, expect, it } from 'vitest'
import { getTestCasesByCategories } from './test-cases'

describe('fixTaskList', () => {
  for (const testCase of getTestCasesByCategories(['task-list'])) {
    it(testCase.description, () => {
      expect(fixTaskList(testCase.input)).toBe(testCase.expected)
    })
  }
})
