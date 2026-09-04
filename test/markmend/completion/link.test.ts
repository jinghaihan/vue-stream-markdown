import { describe, expect, it } from 'vitest'
import { completeLink } from '../../../packages/markmend/core/src/completion/link'
import { getTestCasesByCategories } from './test-cases'

describe('completeLink', () => {
  for (const testCase of getTestCasesByCategories(['link', 'image'])) {
    it(testCase.description, () => {
      expect(completeLink(testCase.input)).toBe(testCase.expected)
    })
  }
})
