import { describe, expect, it } from 'vitest'
import { completeCode } from '../../../packages/markmend/core/src/completion/code'
import { getTestCasesByCategories } from './test-cases'

describe('completeCode', () => {
  for (const testCase of getTestCasesByCategories(['code-inline', 'code-block', 'code-mixed'])) {
    it(testCase.description, () => {
      expect(completeCode(testCase.input)).toBe(testCase.expected)
    })
  }
})
