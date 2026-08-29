import type { CompletionOptions, PreprocessContext } from '../types'
import { flow } from '../utils'
import { fixCode } from './code'
import { fixComparisonOperators } from './comparison-operators'
import { createPreprocessContext } from './context'
import { fixDelete } from './delete'
import { fixEmphasis } from './emphasis'
import { fixFootnote } from './footnote'
import { fixHtml } from './html'
import { fixInlineMath } from './inline-math'
import { fixLink } from './link'
import { fixMath } from './math'
import { crlfPattern } from './pattern'
import { fixStrong } from './strong'
import { fixTable } from './table'
import { fixTaskList } from './task-list'
import { preprocessLaTeX } from './vendored/markdown-utils'

function normalizeLineEndings(content: string): string {
  return content.replace(crlfPattern, '\n').trimEnd()
}

export function normalize(content: string): string {
  return flow([
    normalizeLineEndings,
    preprocessLaTeX,
  ])(content)
}

type CompletionStepName
  = | 'code'
    | 'comparisonOperators'
    | 'html'
    | 'footnote'
    | 'strong'
    | 'emphasis'
    | 'delete'
    | 'taskList'
    | 'link'
    | 'table'
    | 'inlineMath'
    | 'math'

type CompletionStep = (content: string, options?: PreprocessContext) => string

const COMPLETION_STEP_NAMES: CompletionStepName[] = [
  'code',
  'comparisonOperators',
  'html',
  'footnote',
  'strong',
  'emphasis',
  'delete',
  'taskList',
  'link',
  'table',
  'inlineMath',
  'math',
]

const COMPLETION_STEPS = {
  code: fixCode,
  comparisonOperators: fixComparisonOperators,
  html: fixHtml,
  footnote: fixFootnote,
  strong: fixStrong,
  emphasis: fixEmphasis,
  delete: fixDelete,
  taskList: fixTaskList,
  link: fixLink,
  table: fixTable,
  inlineMath: fixInlineMath,
  math: fixMath,
} satisfies Record<CompletionStepName, CompletionStep>

export function completeMarkdown(
  content: string,
  options?: CompletionOptions,
): string {
  const context = createPreprocessContext(options)
  return COMPLETION_STEP_NAMES.reduce(
    (result, name) => COMPLETION_STEPS[name](result, context),
    normalize(content),
  )
}
