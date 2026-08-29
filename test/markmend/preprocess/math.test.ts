import { completeMarkdown } from '@markmend/core'
import { describe, expect, it } from 'vitest'
import { fixMath } from '../../../packages/markmend/core/src/preprocess/math'
import { getTestCasesByCategories } from './test-cases'

describe('fixMath', () => {
  for (const testCase of getTestCasesByCategories(['math'])) {
    it(testCase.description, () => {
      // If test case has preprocessOptions, use preprocess instead of fixMath
      if (testCase.preprocessOptions) {
        const expected = testCase.integrationExpected ?? testCase.expected
        expect(completeMarkdown(testCase.input, testCase.preprocessOptions)).toBe(expected)
      }
      else {
        expect(fixMath(testCase.input)).toBe(testCase.expected)
      }
    })
  }
})
