import { describe, expect, it } from 'vitest'
import { fixFootnote } from '../../src/preprocess/footnote'
import { getTestCasesByCategories } from './test-cases'

describe('fixFootnote', () => {
  for (const testCase of getTestCasesByCategories(['footnote'])) {
    it(testCase.description, () => {
      expect(fixFootnote(testCase.input)).toBe(testCase.expected)
    })
  }
})
