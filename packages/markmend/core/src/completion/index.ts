import type {
  BuiltinCompletionType,
  CompletionInfo,
  CompletionOptions,
  CompletionResult,
  CompletionStep,
} from '../types'
import { flow } from '../utils'
import { completeCode } from './code'
import { completeComparisonOperators } from './comparison-operators'
import { createCompletionContext } from './context'
import { completeDelete } from './delete'
import { completeEmphasis } from './emphasis'
import { completeFootnote } from './footnote'
import { completeHtml } from './html'
import { completeInlineMath } from './inline-math'
import { completeLink } from './link'
import { completeMath } from './math'
import { crlfPattern } from './pattern'
import { completeStrong } from './strong'
import { completeTable } from './table'
import { completeTaskList } from './task-list'
import { normalizeLaTeX } from './vendored/markdown-utils'

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

export const defaultCompletionSteps = {
  code: completeCode,
  comparisonOperators: completeComparisonOperators,
  html: completeHtml,
  footnote: completeFootnote,
  strong: completeStrong,
  emphasis: completeEmphasis,
  delete: completeDelete,
  taskList: completeTaskList,
  link: completeLink,
  table: completeTable,
  inlineMath: completeInlineMath,
  math: completeMath,
} satisfies Record<BuiltinCompletionType, CompletionStep>

export {
  completeCode,
  completeComparisonOperators,
  completeDelete,
  completeEmphasis,
  completeFootnote,
  completeHtml,
  completeInlineMath,
  completeLink,
  completeMath,
  completeStrong,
  completeTable,
  completeTaskList,
}

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
  const completionSteps: Record<BuiltinCompletionType, CompletionStep> = {
    ...defaultCompletionSteps,
    ...options?.completionSteps,
  }

  for (const type of COMPLETION_STEP_NAMES) {
    const before = markdown
    markdown = (completionSteps[type] ?? defaultCompletionSteps[type])(before, context)
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
