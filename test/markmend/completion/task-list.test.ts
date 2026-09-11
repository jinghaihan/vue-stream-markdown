import { describe, expect, it } from 'vitest'
import { completeTaskList } from '../../../packages/markmend/core/src/completion/task-list'
import { getTestCasesByCategories } from './test-cases'

describe('completeTaskList', () => {
  for (const testCase of getTestCasesByCategories(['task-list'])) {
    it(testCase.description, () => {
      expect(completeTaskList(testCase.input)).toBe(testCase.expected)
    })
  }

  it('eats an indented bare dash inside a streaming list item', () => {
    const parent = '- Stable blocks are reused as the tail grows\n- Only unfinished content keeps changing'

    expect(completeTaskList(`${parent}\n  -`)).toBe(parent)
    expect(completeTaskList(`${parent}\n  - `)).toBe(parent)
    expect(completeTaskList(`${parent}\n  - t`)).toBe(`${parent}\n  - t`)
  })
})
