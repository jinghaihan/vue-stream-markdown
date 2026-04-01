import type { NodeType as ParserNodeType } from 'markmend'
import type { Component } from 'vue'

export type {
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
  MarkdownParserResult,
  MathNode,
  NodeType,
  ParagraphNode,
  ParsedNode,
  StrongNode,
  SyntaxTree,
  TableCellNode,
  TableNode,
  TableRowNode,
  TextNode,
  ThematicBreakNode,
  YamlNode,
} from 'markmend'

export type NodeRenderers = Partial<Record<ParserNodeType, Component>>
