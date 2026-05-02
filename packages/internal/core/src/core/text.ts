import type { TextNode } from '@markmend/ast'
import type { AnimationType } from '../types'
import {
  createTextParts,
  getTransitionName,
} from '../utils'

export interface TextModelOptions {
  node: TextNode
  nodeKey: string
  enableAnimate: boolean
  animation: AnimationType
  hideCaret?: boolean
}

export function createTextModel(options: TextModelOptions) {
  const loading = !!options.node.loading
  const showCaret = loading && !options.hideCaret

  return {
    loading,
    showCaret,
    shouldAnimate: options.enableAnimate && options.node.value.trim().length > 0,
    transitionName: getTransitionName(options.animation),
    parts: createTextParts(options.node.value, options.nodeKey),
  }
}
