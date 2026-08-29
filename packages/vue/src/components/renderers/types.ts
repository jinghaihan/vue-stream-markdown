import type {
  AnimationSplit,
  AnimationType,
  MarkdownAstParser,
  NodeRendererProps,
  ParsedNode,
  TextDirectionConfig,
} from '@stream-markdown/core'
import type { VNode } from 'vue'

export interface VNodeRenderContext {
  animatedTextKeys: Set<string>
  animation: AnimationType
  animationSplit: AnimationSplit
  caret?: string
  direction?: TextDirectionConfig
  enableAnimate: boolean
  enableCaret?: boolean
  renderedTextKeys: Set<string>
  renderChildren: (
    nodes: ParsedNode[],
    options: {
      deep: number
      nodeKey: string
      parentNode?: ParsedNode
    },
  ) => VNode[]
}

export type VNodeRendererProps<TNode extends ParsedNode = ParsedNode>
  = Omit<NodeRendererProps<TNode>, 'markdownParser'>
    & { markdownParser?: MarkdownAstParser }

export type VNodeRenderer = (
  props: VNodeRendererProps,
  context: VNodeRenderContext,
) => VNode

export function renderNodeChildren(
  props: VNodeRendererProps,
  context: VNodeRenderContext,
  parentNode: ParsedNode | undefined,
  children: ParsedNode[],
) {
  return context.renderChildren(children, {
    deep: props.deep + 1,
    nodeKey: props.nodeKey,
    parentNode,
  })
}
