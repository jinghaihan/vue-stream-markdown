import type {
  BlockquoteNode,
  BreakNode,
  CodeNode,
  NodeRendererListProps as CoreNodeRendererListProps,
  NodeRendererProps as CoreNodeRendererProps,
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
  StrongNode,
  TableCellNode,
  TableNode,
  TableRowNode,
  TextNode,
  ThematicBreakNode,
  YamlNode,
} from '@stream-markdown/core'
import type { NodeRenderers } from './core'

export type NodeRendererListProps = CoreNodeRendererListProps<NodeRenderers>

export type NodeRendererProps<TNode extends ParsedNode = ParsedNode>
  = CoreNodeRendererProps<TNode, NodeRenderers>

export type BlockquoteNodeRendererProps = NodeRendererProps<BlockquoteNode>

export type BreakNodeRendererProps = NodeRendererProps<BreakNode>

export type CodeNodeRendererProps = NodeRendererProps<CodeNode>

export type DefinitionNodeRendererProps = NodeRendererProps<DefinitionNode>

export type DeleteNodeRendererProps = NodeRendererProps<DeleteNode>

export type EmphasisNodeRendererProps = NodeRendererProps<EmphasisNode>

export type FootnoteDefinitionNodeRendererProps = NodeRendererProps<FootnoteDefinitionNode>

export type FootnoteReferenceNodeRendererProps = NodeRendererProps<FootnoteReferenceNode>

export type HeadingNodeRendererProps = NodeRendererProps<HeadingNode>

export type HtmlNodeRendererProps = NodeRendererProps<HtmlNode>

export type ImageNodeRendererProps = NodeRendererProps<ImageNode>

export type ImageReferenceNodeRendererProps = NodeRendererProps<ImageReferenceNode>

export type InlineCodeNodeRendererProps = NodeRendererProps<InlineCodeNode>

export type LinkNodeRendererProps = NodeRendererProps<LinkNode>

export type LinkReferenceNodeRendererProps = NodeRendererProps<LinkReferenceNode>

export type ListNodeRendererProps = NodeRendererProps<ListNode>

export type ListItemNodeRendererProps = NodeRendererProps<ListItemNode>

export type ParagraphNodeRendererProps = NodeRendererProps<ParagraphNode>

export type StrongNodeRendererProps = NodeRendererProps<StrongNode>

export type TableNodeRendererProps = NodeRendererProps<TableNode>

export type TableRowNodeRendererProps = NodeRendererProps<TableRowNode>

export type TableCellNodeRendererProps = NodeRendererProps<TableCellNode>

export type TextNodeRendererProps = NodeRendererProps<TextNode>

export type ThematicBreakNodeRendererProps = NodeRendererProps<ThematicBreakNode>

export type YamlNodeRendererProps = NodeRendererProps<YamlNode>

export type MathNodeRendererProps = NodeRendererProps<MathNode>

export type InlineMathNodeRendererProps = NodeRendererProps<InlineMathNode>
