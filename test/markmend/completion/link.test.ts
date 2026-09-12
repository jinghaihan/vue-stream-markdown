import { describe, expect, it } from 'vitest'
import { completeLink } from '../../../packages/markmend/core/src/completion/link'
import { getTestCasesByCategories } from './test-cases'

describe('completeLink', () => {
  it('does not turn a complete footnote reference into an empty link', () => {
    expect(completeLink('Text [^note]')).toBe('Text [^note]')
    expect(completeLink('![^alt]')).toBe('![^alt]()')
  })

  for (const testCase of getTestCasesByCategories(['link', 'image'])) {
    it(testCase.description, () => {
      expect(completeLink(testCase.input)).toBe(testCase.expected)
    })
  }
})
