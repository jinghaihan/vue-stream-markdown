import remend from 'remend'
import { flow } from '../utils'
import { fixCode } from './code'
import { fixDelete } from './delete'
import { fixEmphasis } from './emphasis'
import { fixInlineMath } from './inline-math'
import { fixLink } from './link'
import { crlfPattern } from './pattern'
import { fixStrong } from './strong'
import { fixTable } from './table'
import { preprocessLaTeX, preprocessThinkTag } from './vendored'

export * from './pattern'

function proprocessContent(content: string): string {
  return content.replace(crlfPattern, '\n').trimEnd()
}

export function normalize(content: string): string {
  return flow([
    proprocessContent,
    preprocessLaTeX,
    preprocessThinkTag,
  ])(content)
}

export function preprocess(content: string): string {
  return flow([
    fixStrong,
    fixEmphasis,
    fixDelete,
    fixLink,
    fixCode,
    fixTable,
    fixInlineMath,
    remend,
  ])(content)
}

export {
  fixCode,
  fixDelete,
  fixEmphasis,
  fixLink,
  fixStrong,
  fixTable,
  preprocessLaTeX,
  preprocessThinkTag,
  proprocessContent,
  remend,
}
