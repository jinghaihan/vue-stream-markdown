import type {
  MarkdownAstParser,
  ParsedNode,
  SyntaxTree,
} from '@markmend/ast'

export interface NodeRendererListProps<
  TNodeRenderers = unknown,
  TNode extends ParsedNode = ParsedNode,
> extends Omit<
    NodeRendererProps<TNode, TNodeRenderers>,
    'node' | 'nodeKey' | 'markdownParser' | 'nodeRenderers'
  > {
  markdownParser?: MarkdownAstParser
  nodeRenderers?: TNodeRenderers
  nodes?: ParsedNode[]
  nodeKey?: string
}

export interface NodeRendererProps<
  TNode extends ParsedNode = ParsedNode,
  TNodeRenderers = unknown,
> {
  markdownParser: MarkdownAstParser
  nodeRenderers: TNodeRenderers
  blockIndex?: number
  node: TNode
  parentNode?: ParsedNode
  prevNode?: ParsedNode
  nextNode?: ParsedNode
  nodeKey: string
  deep: number
  hideCaret?: boolean
  blocks?: SyntaxTree[]
}
