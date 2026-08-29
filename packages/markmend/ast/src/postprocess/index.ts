import type { SyntaxTree } from '../types'
import { postFixFootnote } from './footnote'
import { omitPositions } from './position'

export function postnormalize(data: SyntaxTree): SyntaxTree {
  return omitPositions(postFixFootnote(data))
}

export function postprocess(data: SyntaxTree): SyntaxTree {
  return data
}

export {
  postFixFootnote,
}
