import { fixFootnote } from '@markmend/core'
import { describe, expect, it } from 'vitest'
import { getTestCasesByCategories } from './test-cases'

describe('fixFootnote', () => {
  for (const testCase of getTestCasesByCategories(['footnote'])) {
    it(testCase.description, () => {
      expect(fixFootnote(testCase.input)).toBe(testCase.expected)
    })
  }
})
