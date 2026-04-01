import type { SyntaxTree } from '../types'
import { flow } from '../utils'
import { postFixFootnote } from './footnote'

export function postNormalize(data: SyntaxTree): SyntaxTree {
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
