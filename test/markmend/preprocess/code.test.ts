import { fixCode } from '@markmend/preprocess/code'
import { describe, expect, it } from 'vitest'
import { getTestCasesByCategories } from './test-cases'

describe('fixCode', () => {
  for (const testCase of getTestCasesByCategories(['code-inline', 'code-block', 'code-mixed'])) {
    it(testCase.description, () => {
      expect(fixCode(testCase.input)).toBe(testCase.expected)
    })
  }
})
