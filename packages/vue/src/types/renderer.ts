import type { CompletionInfo } from '@markmend/parser'
import type { MarkdownComponents, MarkdownElement, MarkdownNode } from './comark'

export interface MarkdownNodesProps {
  nodes?: MarkdownNode[]
  nodeKey?: string
  loading?: boolean
  hideCaret?: boolean
  components?: MarkdownComponents
  completionInfo?: CompletionInfo
}

export interface MarkdownControlContext<TNode = MarkdownElement> {
  node: TNode
  nodeKey: string
}

export interface MarkdownRendererProps extends MarkdownControlContext {
  loading?: boolean
}

export interface CodeBlockNode {
  value: string
  lang?: string | null
  meta?: string
  loading?: boolean
}

export type CodeBlockProps = MarkdownControlContext<CodeBlockNode>

export interface CodeRendererProps extends CodeBlockProps {
  showWrapper?: boolean
}

export interface MathRenderNode {
  value: string
  display: boolean
  loading?: boolean
}

export interface MathRenderProps {
  node: MathRenderNode
}
