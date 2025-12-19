import { describe, expect, it } from 'vitest'
import { fixEmphasis } from '../../src/preprocess/emphasis'
import { getTestCasesByCategories } from './test-cases'

describe('fixEmphasis', () => {
  for (const testCase of getTestCasesByCategories(['emphasis-asterisk', 'emphasis-underscore'])) {
    it(testCase.description, () => {
      expect(fixEmphasis(testCase.input)).toBe(testCase.expected)
    })
  }
})
