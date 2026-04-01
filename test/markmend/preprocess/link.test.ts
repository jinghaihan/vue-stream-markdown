import { fixLink } from '@markmend/preprocess/link'
import { describe, expect, it } from 'vitest'
import { getTestCasesByCategories } from './test-cases'

describe('fixLink', () => {
  for (const testCase of getTestCasesByCategories(['link', 'image'])) {
    it(testCase.description, () => {
      expect(fixLink(testCase.input)).toBe(testCase.expected)
    })
  }
})
