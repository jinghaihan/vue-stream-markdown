import { describe, expect, it } from 'vitest'
import { fixMath, preprocess } from '../../src/preprocess'
import { getTestCasesByCategories } from './test-cases'

describe('fixMath', () => {
  for (const testCase of getTestCasesByCategories(['math'])) {
    it(testCase.description, () => {
      // If test case has preprocessOptions, use preprocess instead of fixMath
      if (testCase.preprocessOptions) {
        const expected = testCase.integrationExpected ?? testCase.expected
        expect(preprocess(testCase.input, testCase.preprocessOptions)).toBe(expected)
      }
      else {
        expect(fixMath(testCase.input)).toBe(testCase.expected)
      }
    })
  }
})
