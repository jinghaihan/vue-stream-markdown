import type { SyntaxTree } from '../types'
import { flow } from '../utils'
import { postFixFootnote } from './footnote'
import { postFixText } from './text'

export function postprocess(data: SyntaxTree): SyntaxTree {
  return flow([
    postFixText,
    postFixFootnote,
  ])(data)
}

export {
  postFixFootnote,
  postFixText,
}
