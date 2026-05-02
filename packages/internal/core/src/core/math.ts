import type { InlineMathNode, MathNode } from '@markmend/ast'

export function isDisplayMathNode(node: InlineMathNode | MathNode): boolean {
  return node.type !== 'inlineMath'
}

export interface MathRendererModelOptions {
  node: InlineMathNode | MathNode
  installed: boolean
  renderFlag?: boolean
  renderingCode?: string
  errorMessage?: string
}

export function createMathRendererModel(options: MathRendererModelOptions) {
  const code = options.node.value
  const loading = !!options.node.loading
  const isDisplayMode = isDisplayMathNode(options.node)
  const error = !options.installed
    || (!loading
      && !!options.errorMessage
      && !!options.renderFlag
      && options.renderingCode === code)

  return {
    code,
    loading,
    isDisplayMode,
    error,
  }
}
