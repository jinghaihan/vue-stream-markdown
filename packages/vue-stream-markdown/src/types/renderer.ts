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
  ParagraphNode,
  ParsedNode,
  NodeRendererListProps as SharedNodeRendererListProps,
  NodeRendererProps as SharedNodeRendererProps,
  StrongNode,
  TableCellNode,
  TableNode,
  TableRowNode,
  TextNode,
  ThematicBreakNode,
  YamlNode,
} from '@stream-markdown/core'
import type { NodeRenderers } from './core'

export type NodeRendererListProps = SharedNodeRendererListProps<NodeRenderers>

export type NodeRendererProps<TNode extends ParsedNode = ParsedNode>
  = SharedNodeRendererProps<TNode, NodeRenderers>

export interface BlockquoteNodeRendererProps extends NodeRendererProps<BlockquoteNode> {}

export interface BreakNodeRendererProps extends NodeRendererProps<BreakNode> {}

export interface CodeNodeRendererProps extends NodeRendererProps<CodeNode> {}

export interface DefinitionNodeRendererProps extends NodeRendererProps<DefinitionNode> {}

export interface DeleteNodeRendererProps extends NodeRendererProps<DeleteNode> {}

export interface EmphasisNodeRendererProps extends NodeRendererProps<EmphasisNode> {}

export interface FootnoteDefinitionNodeRendererProps extends NodeRendererProps<FootnoteDefinitionNode> {}

export interface FootnoteReferenceNodeRendererProps extends NodeRendererProps<FootnoteReferenceNode> {}

export interface HeadingNodeRendererProps extends NodeRendererProps<HeadingNode> {}

export interface HtmlNodeRendererProps extends NodeRendererProps<HtmlNode> {}

export interface ImageNodeRendererProps extends NodeRendererProps<ImageNode> {}

export interface ImageReferenceNodeRendererProps extends NodeRendererProps<ImageReferenceNode> {}

export interface InlineCodeNodeRendererProps extends NodeRendererProps<InlineCodeNode> {}

export interface LinkNodeRendererProps extends NodeRendererProps<LinkNode> {}

export interface LinkReferenceNodeRendererProps extends NodeRendererProps<LinkReferenceNode> {}

export interface ListNodeRendererProps extends NodeRendererProps<ListNode> {}

export interface ListItemNodeRendererProps extends NodeRendererProps<ListItemNode> {}

export interface ParagraphNodeRendererProps extends NodeRendererProps<ParagraphNode> {}

export interface StrongNodeRendererProps extends NodeRendererProps<StrongNode> {}

export interface TableNodeRendererProps extends NodeRendererProps<TableNode> {}

export interface TableRowNodeRendererProps extends NodeRendererProps<TableRowNode> {}

export interface TableCellNodeRendererProps extends NodeRendererProps<TableCellNode> {}

export interface TextNodeRendererProps extends NodeRendererProps<TextNode> {}

export interface ThematicBreakNodeRendererProps extends NodeRendererProps<ThematicBreakNode> {}

export interface YamlNodeRendererProps extends NodeRendererProps<YamlNode> {}

export interface MathNodeRendererProps extends NodeRendererProps<MathNode> {}

export interface InlineMathNodeRendererProps extends NodeRendererProps<InlineMathNode> {}
