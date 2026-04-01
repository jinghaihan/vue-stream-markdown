import { fixHtml } from '@markmend/preprocess/html'
import { describe, expect, it } from 'vitest'
import { getTestCasesByCategory } from './test-cases'

describe('fixHtml', () => {
  for (const testCase of getTestCasesByCategory('html')) {
    it(testCase.description, () => {
      expect(fixHtml(testCase.input)).toBe(testCase.expected)
    })
  }
})
