import remend from 'remend'
import { flow } from '../utils'
import { fixCode } from './code'
import { fixDelete } from './delete'
import { fixEmphasis } from './emphasis'
import { fixFootnote } from './footnote'
import { fixInlineMath } from './inline-math'
import { fixLink } from './link'
import { crlfPattern } from './pattern'
import { fixStrong } from './strong'
import { fixTable } from './table'
import { fixTaskList } from './task-list'
import { preprocessLaTeX } from './vendored'

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
  return flow([
    fixFootnote,
    fixStrong,
    fixEmphasis,
    fixDelete,
    fixLink,
    fixCode,
    fixTable,
    fixInlineMath,
    fixTaskList,
    remend,
  ])(content)
}

export {
  fixCode,
  fixDelete,
  fixEmphasis,
  fixFootnote,
  fixLink,
  fixStrong,
  fixTable,
  fixTaskList,
  preprocessLaTeX,
  proprocessContent,
  remend,
}
