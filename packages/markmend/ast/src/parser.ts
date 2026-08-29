import type {
  FromMarkdownExtension,
  MarkdownAstParserOptions,
  MarkdownAstParserResult,
  MicromarkExtension,
  ParsedNode,
  SyntaxTree,
  ToMarkdownExtension,
} from './types'
import { MarkdownProcessor } from '@markmend/core'
import { fromMarkdown } from 'mdast-util-from-markdown'
import { toMarkdown } from 'mdast-util-to-markdown'
import QuickLRU from 'quick-lru'
import {
  BUILTIN_FROM_MDAST_EXTENSIONS,
  BUILTIN_MICROMARK_EXTENSIONS,
  BUILTIN_TO_MDAST_EXTENSIONS,
} from './constants'
import { postnormalize, postprocess } from './postprocess'
import { findLastLeafNode, resolveBuiltinExtensions } from './utils'

export interface Options extends MarkdownAstParserOptions {
  mode: 'streaming' | 'static'
}

const SAFE_TEXT_APPEND_PATTERN = /^[\p{L}\p{N}\p{M} \t,.'!?-]+$/u
const FORMATTING_SUFFIX_PATTERN = /^[*_~]+$/
const FORMATTING_NODE_TYPES = new Set(['delete', 'emphasis', 'strong'])
const PARAGRAPH_CHANGING_PREFIX_PATTERN = /^(?: {0,3}(?:#{1,6}[ \t]|>[ \t]?|(?:[-+*]|\d+[.)])(?:[ \t]+|$))| {0,3}([-*_])(?:[ \t]*\1){2,}[ \t]*$)/

function canRemainParagraph(source: string): boolean {
  if (PARAGRAPH_CHANGING_PREFIX_PATTERN.test(source))
    return false

  const trailingToken = source.slice(Math.max(
    source.lastIndexOf(' '),
    source.lastIndexOf('\t'),
    source.lastIndexOf('\n'),
  ) + 1)
  return !trailingToken.includes('@')
    && !trailingToken.includes('/')
    && !/www\./i.test(trailingToken)
}

function hasCustomParserBehavior(options: Options): boolean {
  const builtin = options.mdastOptions?.builtin
  return Boolean(
    options.normalize
    || options.preprocess
    || (options.preprocessSteps && Object.keys(options.preprocessSteps).length > 0)
    || options.parseMarkdownIntoBlocks
    || options.postnormalize
    || options.postprocess
    || options.mdastOptions?.from?.length
    || options.mdastOptions?.micromark?.length
    || (builtin?.from && Object.values(builtin.from).some(value => typeof value === 'function'))
    || (builtin?.micromark && Object.values(builtin.micromark).some(value => typeof value === 'function')),
  )
}

function appendToTextNode(node: ParsedNode, value: string): ParsedNode | undefined {
  if (node.type === 'text') {
    const { loading: _loading, ...text } = node
    return {
      ...text,
      value: node.value + value,
    }
  }

  if (!FORMATTING_NODE_TYPES.has(node.type) || !('children' in node) || !node.children.length)
    return undefined

  const children = node.children as ParsedNode[]
  const lastIndex = children.length - 1
  const child = children[lastIndex]!
  const nextChild = appendToTextNode(child, value)
  if (!nextChild)
    return undefined

  const nextChildren = children.slice()
  nextChildren[lastIndex] = nextChild
  return {
    ...node,
    children: nextChildren,
  } as ParsedNode
}

export class MarkdownAstParser {
  private mode: Options['mode'] = 'streaming'
  private normalizedContent = ''
  private blocks: string[] = []
  private hasSegmentedBlocks = false
  private contents: string[] = []
  private asts: SyntaxTree[] = []
  private astCache = new QuickLRU<string, SyntaxTree>({
    maxSize: 100,
  })

  private micromarkExtensions: MicromarkExtension[] = []
  private fromMdastExtensions: FromMarkdownExtension[] = []
  private toMdastExtensions: ToMarkdownExtension[] = []

  private options: Options
  private processor: MarkdownProcessor
  private readonly useAppendTextFastPath: boolean

  constructor(options: Options) {
    this.mode = options.mode
    this.options = options
    this.processor = new MarkdownProcessor(options)
    this.useAppendTextFastPath = !hasCustomParserBehavior(options)

    const ctx = {
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

    const lastAst = this.asts.at(-1)
    if (!lastAst)
      return

    const lastLeafNode = findLastLeafNode(lastAst.children)
    if (lastLeafNode?.type === 'text')
      lastLeafNode.loading = true
  }

  private parseStreamingBlocks(data: string): string[] {
    // Custom splitters may have document-wide semantics. Footnotes also force
    // the default splitter to keep the entire document in one AST.
    const shouldParseFully = (
      Boolean(this.options.parseMarkdownIntoBlocks)
      || !this.hasSegmentedBlocks
      || !this.blocks.length
      || !data.startsWith(this.normalizedContent)
      || data.includes('[^')
    )

    if (shouldParseFully)
      return this.processor.parseMarkdownIntoBlocks(data)

    if (data === this.normalizedContent)
      return this.blocks

    // Reparse the previous tail block as well as the appended text because a
    // new line can turn it into a list, setext heading, fenced block, and more.
    // Skip trailing whitespace-only tokens so the semantic tail is included.
    let reparseIndex = this.blocks.length - 1
    while (reparseIndex > 0 && !this.blocks[reparseIndex]!.trim())
      reparseIndex -= 1

    const stableBlocks = this.blocks.slice(0, reparseIndex)
    let stableLength = 0
    for (const block of stableBlocks)
      stableLength += block.length

    const tailBlocks = this.processor.parseMarkdownIntoBlocks(data.slice(stableLength))
    return [...stableBlocks, ...tailBlocks]
  }

  private update(data: string) {
    data = this.processor.normalize(data)

    // Preserve multi-block segmentation when switching from streaming -> static at runtime.
    // Otherwise block keys collapse from N -> 1 and can trigger broad component remounts.
    let blocks: string[]
    let hasSegmentedBlocks: boolean
    if (this.mode === 'static' && this.contents.length <= 1) {
      blocks = [data]
      hasSegmentedBlocks = false
    }
    else if (this.mode === 'streaming') {
      blocks = this.parseStreamingBlocks(data)
      hasSegmentedBlocks = true
    }
    else if (this.hasSegmentedBlocks && data === this.normalizedContent) {
      blocks = this.blocks
      hasSegmentedBlocks = true
    }
    else {
      blocks = this.processor.parseMarkdownIntoBlocks(data)
      hasSegmentedBlocks = true
    }

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
      if (isLastBlock) {
        content = this.mode === 'streaming'
          ? this.processor.preprocess(content, {
              singleDollarTextMath: this.options.mdastOptions?.singleDollarTextMath ?? false,
            })
          : content
      }
      contents.push(content)

      const syntaxLoading = isLastBlock && blocks[index] !== content
      const tailTextLoading = isLastBlock && this.mode === 'streaming'

      // Reuse the AST from the previous parse when the block stayed at the
      // same position and its processed content did not change. This is the
      // primary reuse path for streaming documents and does not depend on the
      // bounded content-keyed cache retaining the whole stable prefix.
      const previousContent = this.contents[index]
      const previousAst = this.asts[index]
      if (previousAst && previousContent === content) {
        asts.push(applyLoadingState(previousAst, syntaxLoading, tailTextLoading))
        continue
      }

      // Fall back to the content-keyed cache for blocks that moved or
      // reappeared at a different position.
      if (this.astCache.has(content)) {
        const ast = this.astCache.get(content)!
        asts.push(applyLoadingState(ast, syntaxLoading, tailTextLoading))
        continue
      }

      const ast = this.tryAppendTextAst({
        content,
        previousAst,
        previousContent,
        previousSource: this.blocks[index],
        source: blocks[index]!,
      }) ?? this.markdownToAst(content)
      this.astCache.set(content, ast)

      asts.push(applyLoadingState(ast, syntaxLoading, tailTextLoading))
    }

    this.asts = asts
    this.contents = contents
    this.blocks = blocks
    this.normalizedContent = data
    this.hasSegmentedBlocks = hasSegmentedBlocks
  }

  private tryAppendTextAst(options: {
    content: string
    previousAst?: SyntaxTree
    previousContent?: string
    previousSource?: string
    source: string
  }): SyntaxTree | undefined {
    if (!this.useAppendTextFastPath || this.mode !== 'streaming')
      return undefined

    const {
      content,
      previousAst,
      previousContent,
      previousSource,
      source,
    } = options
    if (!previousAst || previousContent === undefined || previousSource === undefined)
      return undefined
    if (!source.startsWith(previousSource) || source.length === previousSource.length)
      return undefined

    const appended = source.slice(previousSource.length)
    if (!SAFE_TEXT_APPEND_PATTERN.test(appended))
      return undefined
    if (!canRemainParagraph(source))
      return undefined
    if (!previousContent.startsWith(previousSource))
      return undefined

    const completionSuffix = previousContent.slice(previousSource.length)
    if (content !== `${source}${completionSuffix}`)
      return undefined
    if (completionSuffix && !FORMATTING_SUFFIX_PATTERN.test(completionSuffix))
      return undefined

    if (previousAst.children.length !== 1)
      return undefined
    const paragraph = previousAst.children[0]
    if (paragraph?.type !== 'paragraph' || !paragraph.children.length)
      return undefined

    const lastIndex = paragraph.children.length - 1
    const lastChild = paragraph.children[lastIndex]!
    if (completionSuffix) {
      if (!FORMATTING_NODE_TYPES.has(lastChild.type))
        return undefined
    }
    else if (lastChild.type !== 'text') {
      return undefined
    }

    const nextLastChild = appendToTextNode(lastChild, appended)
    if (!nextLastChild)
      return undefined

    const children = paragraph.children.slice()
    children[lastIndex] = nextLastChild as typeof children[number]
    return {
      ...previousAst,
      children: [{
        ...paragraph,
        children,
      }],
    }
  }

  private updateAstLoading(ast: SyntaxTree, loading: boolean) {
    loading = loading && this.mode === 'streaming'
    const node = findLastLeafNode(ast.children)
    if (!node)
      return ast
    if (Boolean(node.loading) === loading)
      return ast
    return this.updateNodeLoading(ast, node, loading)
  }

  private markLastTextNodeLoading(ast: SyntaxTree) {
    if (this.mode !== 'streaming')
      return ast

    const node = findLastLeafNode(ast.children)
    if (!node || node.type !== 'text')
      return ast
    if (node.loading)
      return ast
    return this.updateNodeLoading(ast, node, true)
  }

  private updateNodeLoading(
    ast: SyntaxTree,
    targetNode: ParsedNode,
    loading: boolean,
  ): SyntaxTree {
    const cloneNode = (node: ParsedNode): [ParsedNode, boolean] => {
      if (node === targetNode) {
        if (Boolean(node.loading) === loading)
          return [node, false]
        return [{ ...node, loading }, true]
      }

      const nodeWithChildren = node as { children?: ParsedNode[] }
      const children = nodeWithChildren.children
      if (!children || !children.length)
        return [node, false]

      let changed = false
      const nextChildren: ParsedNode[] = Array.from({ length: children.length })
      for (let i = 0; i < children.length; i++) {
        const child = children[i]!
        const [nextChild, childChanged] = cloneNode(child)
        nextChildren[i] = nextChild
        changed = changed || childChanged
      }

      if (!changed)
        return [node, false]
      return [
        {
          ...node,
          // @ts-expect-error - generate children array
          children: nextChildren,
        },
        true,
      ]
    }

    let changed = false
    const nextChildren: ParsedNode[] = Array.from({ length: ast.children.length })
    for (let i = 0; i < ast.children.length; i++) {
      const child = ast.children[i]!
      const [nextChild, childChanged] = cloneNode(child)
      nextChildren[i] = nextChild
      changed = changed || childChanged
    }
    if (!changed)
      return ast

    return {
      ...ast,
      children: nextChildren,
    }
  }

  parseMarkdown(content: string): MarkdownAstParserResult {
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

    const normalize = this.options.postnormalize ?? postnormalize
    const treeData = normalize(data)

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
    nodes = nodes || this.asts.at(-1)?.children || []
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

export { MarkdownAstParser as MarkdownParser }
