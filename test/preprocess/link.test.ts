import { describe, expect, it } from 'vitest'
import { fixLink } from '../../src/preprocess/link'
import { getTestCasesByCategories } from './test-cases'

describe('fixLink', () => {
  for (const testCase of getTestCasesByCategories(['link', 'image'])) {
    it(testCase.description, () => {
      expect(fixLink(testCase.input)).toBe(testCase.expected)
    })
  }
})
