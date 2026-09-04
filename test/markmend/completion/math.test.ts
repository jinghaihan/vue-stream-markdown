import { completeMarkdown } from '@markmend/core'
import { describe, expect, it } from 'vitest'
import { completeMath } from '../../../packages/markmend/core/src/completion/math'
import { getTestCasesByCategories } from './test-cases'

describe('completeMath', () => {
  for (const testCase of getTestCasesByCategories(['math'])) {
    it(testCase.description, () => {
      // Cases with shared options run through the complete pipeline.
      if (testCase.completionOptions) {
        const expected = testCase.integrationExpected ?? testCase.expected
        expect(completeMarkdown(testCase.input, testCase.completionOptions)).toBe(expected)
      }
      else {
        expect(completeMath(testCase.input)).toBe(testCase.expected)
      }
    })
  }
})
