import { createPreprocessContext, getPreprocessAnalysis } from '@markmend/core'
import { describe, expect, it } from 'vitest'

describe('preprocess context', () => {
  it('reuses analysis for unchanged content', () => {
    const context = createPreprocessContext()

    expect(getPreprocessAnalysis('same', context))
      .toBe(getPreprocessAnalysis('same', context))
  })

  it('invalidates analysis when content changes', () => {
    const context = createPreprocessContext()
    const initial = getPreprocessAnalysis('before', context)

    expect(getPreprocessAnalysis('after', context)).not.toBe(initial)
  })

  it('does not share analysis between contexts', () => {
    const first = createPreprocessContext()
    const second = createPreprocessContext()

    expect(getPreprocessAnalysis('same', first))
      .not
      .toBe(getPreprocessAnalysis('same', second))
  })

  it('does not mutate the supplied context', () => {
    const supplied = { hideBareFormattingMarkers: false }
    const context = createPreprocessContext(supplied)

    getPreprocessAnalysis('content', context)

    expect(supplied).toEqual({ hideBareFormattingMarkers: false })
    expect(context).not.toBe(supplied)
  })

  it('caches paragraphs independently by trailing-empty behavior', () => {
    const analysis = getPreprocessAnalysis('first\n\nlast\n')

    expect(analysis.getLastParagraph().content).toBe('')
    expect(analysis.getLastParagraph(true).content).toBe('last\n')
    expect(analysis.getLastParagraph(true))
      .toBe(analysis.getLastParagraph(true))
  })
})
