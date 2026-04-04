import type { MarkdownProcessorOptions } from 'markmend'
import type { Root, RootContent } from 'mdast'
import type { Extension as FromMarkdownExtension } from 'mdast-util-from-markdown'
import type { Options as ToMarkdownExtension } from 'mdast-util-to-markdown'
import type { Extension as MicromarkExtension } from 'micromark-util-types'

export type SyntaxTree = Root

export type ParsedNode = RootContent & { loading?: boolean }

export type NodeType = ParsedNode['type']

export interface MarkdownAstParserResult {
  contents: string[]
  asts: SyntaxTree[]
}

export interface MarkdownAstParserOptions extends MarkdownProcessorOptions {
  mdastOptions?: MdastOptions
  postNormalize?: (data: SyntaxTree) => SyntaxTree
  postprocess?: (data: SyntaxTree) => SyntaxTree
}

export type MarkdownParserResult = MarkdownAstParserResult
export type MarkdownParserOptions = MarkdownAstParserOptions

export interface MdastOptions {
  from?: FromMarkdownExtension[]
  to?: ToMarkdownExtension[]
  micromark?: MicromarkExtension[]
  builtin?: {
    micromark?: BuiltinPluginControl<BuiltinMicromarkExtension, BuiltinPluginContext, MicromarkExtension>
    from?: BuiltinPluginControl<BuiltinFromMdastExtension, BuiltinPluginContext, FromMarkdownExtension>
    to?: BuiltinPluginControl<BuiltinToMdastExtension, BuiltinPluginContext, ToMarkdownExtension>
  }
  singleDollarTextMath?: boolean
}

export type BuiltinMicromarkExtension
  = | 'gfm'
    | 'math'
    | 'frontmatter'
    | 'cjkFriendlyExtension'
    | 'gfmStrikethroughCjkFriendly'

export type BuiltinFromMdastExtension
  = | 'gfmFromMarkdown'
    | 'mathFromMarkdown'
    | 'frontmatterFromMarkdown'

export type BuiltinToMdastExtension
  = | 'gfmToMarkdown'
    | 'mathToMarkdown'
    | 'frontmatterToMarkdown'

export type BuiltinPluginFactory<Ctx, Ext> = (ctx: Ctx) => Ext | Ext[]

export type BuiltinPluginControl<T extends string, Ctx, Ext> = Partial<Record<T, false | BuiltinPluginFactory<Ctx, Ext>>>

export interface BuiltinPluginContext {
  mdastOptions?: MdastOptions
}

// > Alpha bravo charlie.
export type BlockquoteNode = Extract<ParsedNode, { type: 'blockquote' }>

export type BreakNode = Extract<ParsedNode, { type: 'break' }>

// ```js
// foo()
// ```
export type CodeNode = Extract<ParsedNode, { type: 'code' }>

// [Alpha]: https://example.com
export type DefinitionNode = Extract<ParsedNode, { type: 'definition' }>

// ~~alpha~~
export type DeleteNode = Extract<ParsedNode, { type: 'delete' }>

// *alpha* _bravo_
export type EmphasisNode = Extract<ParsedNode, { type: 'emphasis' }>

// [^alpha]: bravo and charlie.
export type FootnoteDefinitionNode = Extract<ParsedNode, { type: 'footnoteDefinition' }>

// [^alpha]
export type FootnoteReferenceNode = Extract<ParsedNode, { type: 'footnoteReference' }>

// # Alpha
export type HeadingNode = Extract<ParsedNode, { type: 'heading' }>

// <div>
export type HtmlNode = Extract<ParsedNode, { type: 'html' }>

// ![alpha](https://example.com/favicon.ico "bravo")
export type ImageNode = Extract<ParsedNode, { type: 'image' }>

// ![alpha][bravo]
export type ImageReferenceNode = Extract<ParsedNode, { type: 'imageReference' }>

// `foo()`
export type InlineCodeNode = Extract<ParsedNode, { type: 'inlineCode' }>

// [alpha](https://example.com "bravo")
export type LinkNode = Extract<ParsedNode, { type: 'link' }>

// [alpha][Bravo]
export type LinkReferenceNode = Extract<ParsedNode, { type: 'linkReference' }>

// 1. foo
export type ListNode = Extract<ParsedNode, { type: 'list' }>

// * bar
export type ListItemNode = Extract<ParsedNode, { type: 'listItem' }>

// Alpha bravo charlie.
export type ParagraphNode = Extract<ParsedNode, { type: 'paragraph' }>

// **alpha** __bravo__
export type StrongNode = Extract<ParsedNode, { type: 'strong' }>

// | foo | bar |
// | :-- | :-: |
// | baz | qux |
export type TableNode = Extract<ParsedNode, { type: 'table' }>
export type TableCellNode = Extract<ParsedNode, { type: 'tableCell' }>
export type TableRowNode = Extract<ParsedNode, { type: 'tableRow' }>

// Alpha bravo charlie.
export type TextNode = Extract<ParsedNode, { type: 'text' }>

// ***
export type ThematicBreakNode = Extract<ParsedNode, { type: 'thematicBreak' }>

// ---
// foo: bar
// ---
export type YamlNode = Extract<ParsedNode, { type: 'yaml' }>

// $$
// L = \frac{1}{2} \rho v^2 S C_L
// $$
export type MathNode = Extract<ParsedNode, { type: 'math' }>

// $L$
export type InlineMathNode = Extract<ParsedNode, { type: 'inlineMath' }>

export type {
  FromMarkdownExtension,
  MicromarkExtension,
  ToMarkdownExtension,
}
