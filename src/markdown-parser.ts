import type { BuiltinPluginContext, FromMarkdownExtension, MarkdownParserOptions, MarkdownParserResult, MicromarkExtension, ParsedNode, SyntaxTree, ToMarkdownExtension } from './types'
import { fromMarkdown } from 'mdast-util-from-markdown'
import { toMarkdown } from 'mdast-util-to-markdown'
import QuickLRU from 'quick-lru'
import {
  BUILTIN_FROM_MDAST_EXTENSIONS,
  BUILTIN_MICROMARK_EXTENSIONS,
  BUILTIN_TO_MDAST_EXTENSIONS,
} from './constants'
import { postNormalize, postprocess } from './postprocess'
import { normalize, parseMarkdownIntoBlocks, preprocess } from './preprocess'
import { findLastLeafNode, resolveBuiltinExtensions } from './utils'

export interface Options extends MarkdownParserOptions {
  mode: 'streaming' | 'static'
}

const astCache = new QuickLRU<string, SyntaxTree>({
  maxSize: 100,
})

export class MarkdownParser {
  private mode: Options['mode'] = 'streaming'
  private contents: string[] = []
  private asts: SyntaxTree[] = []

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
      BUILTIN_TO_MDAST_EXTENSIONS,
      ctx,
      options.mdastOptions?.builtin?.to,
    )
  }

  updateMode(mode: 'streaming' | 'static') {
    this.mode = mode
  }

  private update(data: string) {
    const normal = this.options.normalize ?? normalize
    const pre = this.options.preprocess ?? preprocess
    const parse = this.options.parseMarkdownIntoBlocks ?? parseMarkdownIntoBlocks

    data = normal(data)

    const blocks = this.mode === 'static' ? [data] : parse(data)

    const asts: SyntaxTree[] = []
    const contents: string[] = []

    for (let index = 0; index < blocks.length; index++) {
      const isLastBlock = index === blocks.length - 1
      let content = blocks[index]!
      // preprocess the last block
      if (isLastBlock)
        content = this.mode === 'streaming' ? pre(content) : content
      contents.push(content)

      const loading = blocks[index] !== content

      // check if the ast is cached
      if (astCache.has(content)) {
        const ast = astCache.get(content)!
        asts.push(this.updateAstLoading(ast, loading))
        continue
      }

      const ast = this.markdownToAst(content)
      astCache.set(content, ast)

      const resolvedAst = this.updateAstLoading(ast, loading)
      asts.push(resolvedAst)
    }

    this.asts = structuredClone(asts)
    this.contents = contents
  }

  private updateAstLoading(ast: SyntaxTree, loading: boolean) {
    loading = loading && this.mode === 'streaming'
    const node = findLastLeafNode(ast.children)
    if (!node)
      return ast
    return this.cloneAstNode(ast, node, loading)
  }

  private cloneAstNode(
    ast: SyntaxTree,
    targetNode: ParsedNode,
    loading: boolean,
  ): SyntaxTree {
    const cloneNode = (node: ParsedNode): ParsedNode => {
      if (node === targetNode)
        return { ...node, loading }

      const nodeWithChildren = node as { children?: ParsedNode[] }
      if (nodeWithChildren.children) {
        return {
          ...node,
          // @ts-expect-error - generate children array
          children: nodeWithChildren.children.map(cloneNode),
        }
      }

      return { ...node }
    }

    return {
      ...ast,
      children: ast.children.map(cloneNode),
    }
  }

  parseMarkdown(content: string): MarkdownParserResult {
    if (!content)
      return { contents: [], asts: [] }
    this.update(content)
    if (!this.asts.length)
      return { contents: [], asts: [] }

    return {
      contents: this.contents,
      asts: this.asts,
    }
  }

  markdownToAst(content: string): SyntaxTree {
    const data = fromMarkdown(content, {
      extensions: this.micromarkExtensions,
      mdastExtensions: this.fromMdastExtensions,
    })

    const normal = this.options.postNormalize ?? postNormalize
    const treeData = normal(data)

    const post = this.options.postprocess ?? postprocess
    const resolved = this.mode === 'streaming' ? post(treeData) : treeData
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
    nodes = nodes || this.asts[this.asts.length - 1]?.children || []
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
