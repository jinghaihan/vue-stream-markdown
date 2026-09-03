import type {
  BuiltinCompletionType,
  CompletionContext,
  CompletionInfo,
  CompletionOptions,
  CompletionResult,
} from '../types'
import { flow } from '../utils'
import { fixCode } from './code'
import { fixComparisonOperators } from './comparison-operators'
import { createCompletionContext } from './context'
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
import { normalizeLaTeX } from './vendored/markdown-utils'

type CompletionStep = (content: string, options?: CompletionContext) => string

function normalizeLineEndings(content: string): string {
  return content.replace(crlfPattern, '\n').trimEnd()
}

export function normalize(content: string): string {
  return flow([
    normalizeLineEndings,
    normalizeLaTeX,
  ])(content)
}

const COMPLETION_STEP_NAMES: BuiltinCompletionType[] = [
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
} satisfies Record<BuiltinCompletionType, CompletionStep>

function resolveCompletionInfo(
  type: BuiltinCompletionType,
  before: string,
  after: string,
): CompletionInfo {
  if (
    type === 'link'
    && after.length === before.length + 1
    && after.startsWith(before)
    && after.endsWith(')')
  ) {
    return { type, phase: 'destination' }
  }

  return { type }
}

export function completeMarkdownResult(
  content: string,
  options?: CompletionOptions,
): CompletionResult {
  const context = createCompletionContext(options)
  let markdown = normalize(content)
  let completion: CompletionInfo | undefined

  for (const type of COMPLETION_STEP_NAMES) {
    const before = markdown
    markdown = COMPLETION_STEPS[type](before, context)
    if (markdown !== before)
      completion = resolveCompletionInfo(type, before, markdown)
  }

  return { markdown, completion }
}

export function completeMarkdown(
  content: string,
  options?: CompletionOptions,
): string {
  return completeMarkdownResult(content, options).markdown
}
