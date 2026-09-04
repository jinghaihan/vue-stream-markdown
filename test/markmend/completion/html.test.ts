import { describe, expect, it } from 'vitest'
import { completeHtml } from '../../../packages/markmend/core/src/completion/html'
import { getTestCasesByCategory } from './test-cases'

describe('completeHtml', () => {
  for (const testCase of getTestCasesByCategory('html')) {
    it(testCase.description, () => {
      expect(completeHtml(testCase.input)).toBe(testCase.expected)
    })
  }
})
