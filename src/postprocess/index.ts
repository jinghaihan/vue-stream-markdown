import type { SyntaxTree } from '../types'
import { flow } from '../utils'
import { postFixText } from './text'

export function postprocess(data: SyntaxTree): SyntaxTree {
  return flow([
    postFixText,
  ])(data)
}

export {
  postFixText,
}
