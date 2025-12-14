import type { MarkdownParserOptions, ParsedNode, SyntaxTree } from './types'
import { MarkdownItAsync } from 'markdown-it-async'
import { fromMarkdown } from 'mdast-util-from-markdown'
import { frontmatterFromMarkdown, frontmatterToMarkdown } from 'mdast-util-frontmatter'
import { gfmFromMarkdown, gfmToMarkdown } from 'mdast-util-gfm'
import { mathFromMarkdown, mathToMarkdown } from 'mdast-util-math'
import { toMarkdown } from 'mdast-util-to-markdown'
import { cjkFriendlyExtension } from 'micromark-extension-cjk-friendly'
import { gfmStrikethroughCjkFriendly } from 'micromark-extension-cjk-friendly-gfm-strikethrough'
import { frontmatter } from 'micromark-extension-frontmatter'
import { gfm } from 'micromark-extension-gfm'
import { math } from 'micromark-extension-math'
import { postNormalize, postprocess } from './postprocess'
import { normalize, preprocess } from './preprocess'
import { findLastLeafNode } from './utils'

export interface Options extends MarkdownParserOptions {
  mode: 'streaming' | 'static'
}

export class MarkdownParser {
  private mode: Options['mode'] = 'streaming'
  private md: MarkdownItAsync
  private content: string = ''
  private syntaxTree: SyntaxTree | null = null

  private options: Options

  constructor(options: Options) {
    this.mode = options.mode
    this.options = options
    this.md = new MarkdownItAsync()
    this.options.extendMarkdownIt?.(this.md)
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

  markdownToHtml(content: string): string {
    return this.md.render(content)
  }

  markdownToAst(content: string, loading: boolean = false): SyntaxTree {
    const data = fromMarkdown(content, {
      extensions: [
        gfm(),
        math(),
        frontmatter(),
        cjkFriendlyExtension(),
        gfmStrikethroughCjkFriendly(),
        ...(this.options.mdastOptions?.micromark ?? []),
      ],
      mdastExtensions: [
        gfmFromMarkdown(),
        mathFromMarkdown(),
        frontmatterFromMarkdown(),
        ...(this.options.mdastOptions?.from ?? []),
      ],
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
      extensions: [
        gfmToMarkdown(),
        mathToMarkdown(),
        frontmatterToMarkdown(),
        ...(this.options.mdastOptions?.to ?? []),
      ],
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
