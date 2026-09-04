import { describe, expect, it } from 'vitest'
import { completeFootnote } from '../../../packages/markmend/core/src/completion/footnote'
import { getTestCasesByCategories } from './test-cases'

describe('completeFootnote', () => {
  for (const testCase of getTestCasesByCategories(['footnote'])) {
    it(testCase.description, () => {
      expect(completeFootnote(testCase.input)).toBe(testCase.expected)
    })
  }
})
