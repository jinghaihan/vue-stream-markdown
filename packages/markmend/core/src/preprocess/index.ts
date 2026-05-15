import type { PreprocessContext, PreprocessStep, PreprocessStepName, PreprocessSteps } from '../types'
import { flow } from '../utils'
import { fixCode } from './code'
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
import { parseMarkdownIntoBlocks, preprocessLaTeX } from './vendored'

export * from './pattern'

function proprocessContent(content: string): string {
  return content.replace(crlfPattern, '\n').trimEnd()
}

export function normalize(content: string): string {
  return flow([
    proprocessContent,
    preprocessLaTeX,
  ])(content)
}

const DEFAULT_PREPROCESS_STEP_NAMES: PreprocessStepName[] = [
  'code',
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

export const DEFAULT_PREPROCESS_STEPS = {
  code: fixCode,
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
} satisfies Record<PreprocessStepName, PreprocessStep>

export function preprocess(
  content: string,
  options?: PreprocessContext,
  steps: PreprocessSteps = {},
): string {
  return DEFAULT_PREPROCESS_STEP_NAMES.reduce((result, name) => {
    const step = steps[name] ?? DEFAULT_PREPROCESS_STEPS[name]
    return step(result, options)
  }, content)
}

export {
  fixCode,
  fixDelete,
  fixEmphasis,
  fixFootnote,
  fixHtml,
  fixInlineMath,
  fixLink,
  fixMath,
  fixStrong,
  fixTable,
  fixTaskList,
  parseMarkdownIntoBlocks,
  preprocessLaTeX,
  proprocessContent,
}
