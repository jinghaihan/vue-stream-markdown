import type { MarkdownElement } from './comark'

export interface MarkdownControlContext<TNode = MarkdownElement> {
  node: TNode
  nodeKey: string
}

export interface CodeBlockNode {
  value: string
  lang?: string | null
  loading?: boolean
}

export type CodeBlockProps = MarkdownControlContext<CodeBlockNode>

export interface MathRenderNode {
  value: string
  display: boolean
  loading?: boolean
}

export interface MathRenderProps {
  node: MathRenderNode
}
