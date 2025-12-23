import type { BuiltinPluginContext, FromMarkdownExtension, MarkdownParserOptions, MicromarkExtension, ParsedNode, SyntaxTree, ToMarkdownExtension } from './types'
import { fromMarkdown } from 'mdast-util-from-markdown'
import { toMarkdown } from 'mdast-util-to-markdown'
import {
  BUILTIN_FROM_MDAST_EXTENSIONS,
  BUILTIN_MICROMARK_EXTENSIONS,
  BUILTIN_TO_MARKDOWN_EXTENSIONS,
} from './constants'
import { postNormalize, postprocess } from './postprocess'
import { normalize, preprocess } from './preprocess'
import { findLastLeafNode, resolveBuiltinExtensions } from './utils'

export interface Options extends MarkdownParserOptions {
  mode: 'streaming' | 'static'
}

export class MarkdownParser {
  private mode: Options['mode'] = 'streaming'
  private content: string = ''
  private syntaxTree: SyntaxTree | null = null

  private micromarkExtensions: MicromarkExtension[] = []
  private fromMdastExtensions: FromMarkdownExtension[] = []
  private toMdastExtensions: ToMarkdownExtension[] = []

  private options: Options

  constructor(options: Options) {
    this.mode = options.mode
    this.options = options

    const ctx: BuiltinPluginContext = {
      mdastOptions: options.mdastOptions,
    }

    this.micromarkExtensions = resolveBuiltinExtensions(
      BUILTIN_MICROMARK_EXTENSIONS,
      ctx,
      options.mdastOptions?.builtin?.micromark,
    )
    this.fromMdastExtensions = resolveBuiltinExtensions(
      BUILTIN_FROM_MDAST_EXTENSIONS,
      ctx,
      options.mdastOptions?.builtin?.from,
    )
    this.toMdastExtensions = resolveBuiltinExtensions(
      BUILTIN_TO_MARKDOWN_EXTENSIONS,
      ctx,
      options.mdastOptions?.builtin?.to,
    )
  }

  private update(data: string) {
    const normal = this.options.normalize ?? normalize
    data = normal(data)

    const pre = this.options.preprocess ?? preprocess
    this.content = this.mode === 'streaming' ? pre(data) : data

    this.syntaxTree = this.markdownToAst(this.content, data !== this.content)
  }

  updateMode(mode: 'streaming' | 'static') {
    this.mode = mode
  }

  parseMarkdown(content: string): { content: string, nodes: ParsedNode[] } {
    if (!content)
      return { content: '', nodes: [] }
    this.update(content)
    if (!this.syntaxTree)
      return { content: this.content, nodes: [] }

    return {
      content: this.content,
      nodes: this.syntaxTree.children,
    }
  }

  markdownToAst(content: string, loading: boolean = false): SyntaxTree {
    // const singleDollarTextMath = this.options.mdastOptions?.singleDollarTextMath ?? false

    const data = fromMarkdown(content, {
      extensions: this.micromarkExtensions,
      mdastExtensions: this.fromMdastExtensions,
    })

    const normal = this.options.postprocess ?? postNormalize
    const treeData = normal(data)

    const post = this.options.postprocess ?? postprocess
    const resolved = this.mode === 'streaming' ? post(treeData) : treeData

    if (!loading || this.mode === 'static')
      return resolved

    const node = findLastLeafNode(resolved.children)
    if (node)
      (node as ParsedNode).loading = true

    return resolved
  }

  astToMarkdown(data: SyntaxTree | ParsedNode): string {
    data = data.type === 'root'
      ? data
      : {
          type: 'root',
          children: [data],
        }

    return toMarkdown(data, {
      extensions: this.toMdastExtensions,
    })
  }

  hasLoadingNode(nodes?: ParsedNode[]): boolean {
    nodes = nodes || this.syntaxTree?.children || []
    if (!nodes.length)
      return false

    for (let i = nodes.length - 1; i >= 0; i--) {
      const node = nodes[i]
      if (node?.loading)
        return true
      const nodeWithChildren = node as { children?: ParsedNode[] }
      if (nodeWithChildren.children && nodeWithChildren.children.length > 0)
        return this.hasLoadingNode(nodeWithChildren.children)
    }
    return false
  }
}
