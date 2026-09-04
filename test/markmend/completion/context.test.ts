import { describe, expect, it } from 'vitest'
import { completeCode } from '../../../packages/markmend/core/src/completion/code'
import { completeComparisonOperators } from '../../../packages/markmend/core/src/completion/comparison-operators'
import {
  createCompletionContext,
  getCompletionAnalysis,
} from '../../../packages/markmend/core/src/completion/context'
import { completeDelete } from '../../../packages/markmend/core/src/completion/delete'
import { completeEmphasis } from '../../../packages/markmend/core/src/completion/emphasis'
import { completeFootnote } from '../../../packages/markmend/core/src/completion/footnote'
import { completeHtml } from '../../../packages/markmend/core/src/completion/html'
import { completeInlineMath } from '../../../packages/markmend/core/src/completion/inline-math'
import { completeLink } from '../../../packages/markmend/core/src/completion/link'
import { completeMath } from '../../../packages/markmend/core/src/completion/math'
import { completeStrong } from '../../../packages/markmend/core/src/completion/strong'
import { completeTable } from '../../../packages/markmend/core/src/completion/table'
import { completeTaskList } from '../../../packages/markmend/core/src/completion/task-list'

describe('completion context', () => {
  it('reuses analysis for unchanged content', () => {
    const context = createCompletionContext()

    expect(getCompletionAnalysis('same', context))
      .toBe(getCompletionAnalysis('same', context))
  })

  it('invalidates analysis when content changes', () => {
    const context = createCompletionContext()
    const initial = getCompletionAnalysis('before', context)

    expect(getCompletionAnalysis('after', context)).not.toBe(initial)
  })

  it('does not share analysis between contexts', () => {
    const first = createCompletionContext()
    const second = createCompletionContext()

    expect(getCompletionAnalysis('same', first))
      .not
      .toBe(getCompletionAnalysis('same', second))
  })

  it('does not mutate the supplied context', () => {
    const supplied = { hideBareFormattingMarkers: false }
    const context = createCompletionContext(supplied)

    getCompletionAnalysis('content', context)

    expect(supplied).toEqual({ hideBareFormattingMarkers: false })
    expect(context).not.toBe(supplied)
  })

  it('caches paragraphs independently by trailing-empty behavior', () => {
    const analysis = getCompletionAnalysis('first\n\nlast\n')

    expect(analysis.getLastParagraph().content).toBe('')
    expect(analysis.getLastParagraph(true).content).toBe('last\n')
    expect(analysis.getLastParagraph(true))
      .toBe(analysis.getLastParagraph(true))
  })

  it('keeps every step usable without a context', () => {
    const completionSteps = {
      code: completeCode,
      comparisonOperators: completeComparisonOperators,
      delete: completeDelete,
      emphasis: completeEmphasis,
      footnote: completeFootnote,
      html: completeHtml,
      inlineMath: completeInlineMath,
      link: completeLink,
      math: completeMath,
      strong: completeStrong,
      table: completeTable,
      taskList: completeTaskList,
    }
    const inputs = {
      code: 'Text `code',
      comparisonOperators: '- > 25',
      delete: 'Text ~~deleted',
      emphasis: 'Text *italic',
      footnote: 'Text [^missing]',
      html: 'Text <span',
      inlineMath: 'Text $$x + y',
      link: 'Text [link](',
      math: '$$\nx + y',
      strong: 'Text **bold',
      table: '| a | b |\n| ---',
      taskList: 'Text\n- [',
    } as const

    for (const [name, step] of Object.entries(completionSteps)) {
      const input = inputs[name as keyof typeof inputs]
      expect(step(input)).toBe(step(input, createCompletionContext()))
    }
  })
})
