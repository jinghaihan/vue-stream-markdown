import type { MarkdownParser } from '../markdown-parser'
import type { StreamMarkdownContext } from './context'
import type {
  BlockquoteNode,
  BreakNode,
  CodeNode,
  DefinitionNode,
  DeleteNode,
  EmphasisNode,
  FootnoteDefinitionNode,
  FootnoteReferenceNode,
  HeadingNode,
  HtmlNode,
  ImageNode,
  ImageReferenceNode,
  InlineCodeNode,
  InlineMathNode,
  LinkNode,
  LinkReferenceNode,
  ListItemNode,
  ListNode,
  MathNode,
  NodeRenderers,
  ParagraphNode,
  ParsedNode,
  StrongNode,
  TableCellNode,
  TableNode,
  TableRowNode,
  TextNode,
  ThematicBreakNode,
  YamlNode,
} from './core'

export interface NodeRendererListProps extends Omit<NodeRendererProps, 'node' | 'indexKey'> {
  nodes?: ParsedNode[]
  indexKey?: number | string
}

export interface NodeRendererProps extends StreamMarkdownContext {
  markdownParser: MarkdownParser
  nodeRenderers: NodeRenderers
  node: ParsedNode
  indexKey: number | string
}

export interface BlockquoteNodeRendererProps extends NodeRendererProps {
  node: BlockquoteNode
}

export interface BreakNodeRendererProps extends NodeRendererProps {
  node: BreakNode
}

export interface CodeNodeRendererProps extends NodeRendererProps {
  node: CodeNode
}

export interface DefinitionNodeRendererProps extends NodeRendererProps {
  node: DefinitionNode
}

export interface DeleteNodeRendererProps extends NodeRendererProps {
  node: DeleteNode
}

export interface EmphasisNodeRendererProps extends NodeRendererProps {
  node: EmphasisNode
}

export interface FootnoteDefinitionNodeRendererProps extends NodeRendererProps {
  node: FootnoteDefinitionNode
}

export interface FootnoteReferenceNodeRendererProps extends NodeRendererProps {
  node: FootnoteReferenceNode
}

export interface HeadingNodeRendererProps extends NodeRendererProps {
  node: HeadingNode
}

export interface HtmlNodeRendererProps extends NodeRendererProps {
  node: HtmlNode
}

export interface ImageNodeRendererProps extends NodeRendererProps {
  node: ImageNode
}

export interface ImageReferenceNodeRendererProps extends NodeRendererProps {
  node: ImageReferenceNode
}

export interface InlineCodeNodeRendererProps extends NodeRendererProps {
  node: InlineCodeNode
}

export interface LinkNodeRendererProps extends NodeRendererProps {
  node: LinkNode
}

export interface LinkReferenceNodeRendererProps extends NodeRendererProps {
  node: LinkReferenceNode
}

export interface ListNodeRendererProps extends NodeRendererProps {
  node: ListNode
}

export interface ListItemNodeRendererProps extends NodeRendererProps {
  node: ListItemNode
}

export interface ParagraphNodeRendererProps extends NodeRendererProps {
  node: ParagraphNode
}

export interface StrongNodeRendererProps extends NodeRendererProps {
  node: StrongNode
}

export interface TableNodeRendererProps extends NodeRendererProps {
  node: TableNode
}

export interface TableRowNodeRendererProps extends NodeRendererProps {
  node: TableRowNode
}

export interface TableCellNodeRendererProps extends NodeRendererProps {
  node: TableCellNode
}

export interface TextNodeRendererProps extends NodeRendererProps {
  node: TextNode
}

export interface ThematicBreakNodeRendererProps extends NodeRendererProps {
  node: ThematicBreakNode
}

export interface YamlNodeRendererProps extends NodeRendererProps {
  node: YamlNode
}

export interface MathNodeRendererProps extends NodeRendererProps {
  node: MathNode
}

export interface InlineMathNodeRendererProps extends NodeRendererProps {
  node: InlineMathNode
}
