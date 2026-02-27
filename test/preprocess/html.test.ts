import { describe, expect, it } from 'vitest'
import { fixHtml } from '../../src/preprocess/html'
import { getTestCasesByCategory } from './test-cases'

describe('fixHtml', () => {
  for (const testCase of getTestCasesByCategory('html')) {
    it(testCase.description, () => {
      expect(fixHtml(testCase.input)).toBe(testCase.expected)
    })
  }
})
