import type {
  BuiltinPluginContext,
  FromMarkdownExtension,
  MarkdownParserOptions,
  MarkdownParserResult,
  MicromarkExtension,
  ParsedNode,
  PreprocessContext,
  SyntaxTree,
  ToMarkdownExtension,
} from './types'
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

export class MarkdownParser {
  private mode: Options['mode'] = 'streaming'
  private contents: string[] = []
  private asts: SyntaxTree[] = []
  private astCache = new QuickLRU<string, SyntaxTree>({
    maxSize: 100,
  })

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
    if (this.mode === mode)
      return

    this.mode = mode
    this.syncAstsLoadingState()
  }

  private syncAstsLoadingState() {
    if (!this.asts.length)
      return

    const clearLoading = (nodes: ParsedNode[]) => {
      for (const node of nodes) {
        if (node.loading)
          node.loading = false
        const nodeWithChildren = node as { children?: ParsedNode[] }
        if (nodeWithChildren.children && nodeWithChildren.children.length > 0)
          clearLoading(nodeWithChildren.children)
      }
    }

    for (const ast of this.asts)
      clearLoading(ast.children)

    if (this.mode !== 'streaming')
      return

    const lastAst = this.asts[this.asts.length - 1]
    if (!lastAst)
      return

    const lastLeafNode = findLastLeafNode(lastAst.children)
    if (lastLeafNode?.type === 'text')
      lastLeafNode.loading = true
  }

  private getPreprocessContext(): PreprocessContext {
    return {
      singleDollarTextMath: this.options.mdastOptions?.singleDollarTextMath ?? false,
    }
  }

  private update(data: string) {
    const normal = this.options.normalize ?? normalize
    const pre = this.options.preprocess ?? preprocess
    const parse = this.options.parseMarkdownIntoBlocks ?? parseMarkdownIntoBlocks

    data = normal(data)

    const blocks = this.mode === 'static' ? [data] : parse(data)

    const asts: SyntaxTree[] = []
    const contents: string[] = []

    const applyLoadingState = (
      ast: SyntaxTree,
      syntaxLoading: boolean,
      tailTextLoading: boolean,
    ) => {
      const updated = this.updateAstLoading(ast, syntaxLoading)
      if (!tailTextLoading)
        return updated

      return this.markLastTextNodeLoading(updated)
    }

    for (let index = 0; index < blocks.length; index++) {
      const isLastBlock = index === blocks.length - 1
      let content = blocks[index]!

      // preprocess the last block
      if (isLastBlock)
        content = this.mode === 'streaming' ? pre(content, this.getPreprocessContext()) : content
      contents.push(content)

      const syntaxLoading = isLastBlock && blocks[index] !== content
      const tailTextLoading = isLastBlock && this.mode === 'streaming'

      // check if the ast is cached
      if (this.astCache.has(content)) {
        const ast = this.astCache.get(content)!
        asts.push(applyLoadingState(ast, syntaxLoading, tailTextLoading))
        continue
      }

      const ast = this.markdownToAst(content)
      this.astCache.set(content, ast)

      asts.push(applyLoadingState(ast, syntaxLoading, tailTextLoading))
    }

    this.asts = asts
    this.contents = contents
  }

  private updateAstLoading(ast: SyntaxTree, loading: boolean) {
    loading = loading && this.mode === 'streaming'
    const node = findLastLeafNode(ast.children)
    if (!node) {
      return {
        ...ast,
        children: [...ast.children],
      }
    }
    return this.updateNodeLoading(ast, node, loading)
  }

  private markLastTextNodeLoading(ast: SyntaxTree) {
    if (this.mode !== 'streaming')
      return ast

    const node = findLastLeafNode(ast.children)
    if (!node || node.type !== 'text')
      return ast
    return this.updateNodeLoading(ast, node, true)
  }

  private updateNodeLoading(
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
      if (
        nodeWithChildren.children
        && nodeWithChildren.children.length > 0
        && this.hasLoadingNode(nodeWithChildren.children)
      ) {
        return true
      }
    }
    return false
  }
}
