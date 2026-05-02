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

export interface MathRendererState {
  html: string
  errorMessage: string
  renderFlag: boolean
  renderingCode: string
}

export interface MathRendererResult {
  html?: string
  error?: string
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

export function createMathRendererState(
  state: Partial<MathRendererState> = {},
): MathRendererState {
  return {
    html: '',
    errorMessage: '',
    renderFlag: false,
    renderingCode: '',
    ...state,
  }
}

export function applyMathRendererResult(
  state: MathRendererState,
  code: string,
  result: MathRendererResult,
): MathRendererState {
  if (result.html !== undefined) {
    return {
      ...state,
      html: result.html,
      errorMessage: '',
      renderFlag: true,
      renderingCode: '',
    }
  }

  if (result.error !== undefined) {
    return {
      ...state,
      errorMessage: result.error,
      renderFlag: true,
      renderingCode: code,
    }
  }

  return {
    ...state,
    errorMessage: '',
    renderFlag: true,
    renderingCode: '',
  }
}
