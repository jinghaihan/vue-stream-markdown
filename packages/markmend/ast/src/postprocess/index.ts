import type { SyntaxTree } from '../types'
import { flow } from '@markmend/core'
import { postFixFootnote } from './footnote'

export function postnormalize(data: SyntaxTree): SyntaxTree {
  return flow([
    postFixFootnote,
  ])(data)
}

export function postprocess(data: SyntaxTree): SyntaxTree {
  return data
}

export {
  postFixFootnote,
}
