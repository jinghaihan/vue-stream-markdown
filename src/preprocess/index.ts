import { flow } from '../utils'
import { fixCode } from './code'
import { fixDelete } from './delete'
import { fixEmphasis } from './emphasis'
import { fixFootnote } from './footnote'
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

export function preprocess(content: string): string {
  const tasks: ((content: string) => string)[] = [
    fixCode,
    fixFootnote,
    fixStrong,
    fixEmphasis,
    fixDelete,
    fixTaskList,
    fixLink,
    fixTable,
    fixInlineMath,
    fixMath,
  ]

  return flow(tasks)(content)
}

export {
  fixCode,
  fixDelete,
  fixEmphasis,
  fixFootnote,
  fixLink,
  fixMath,
  fixStrong,
  fixTable,
  fixTaskList,
  parseMarkdownIntoBlocks,
  preprocessLaTeX,
  proprocessContent,
}
