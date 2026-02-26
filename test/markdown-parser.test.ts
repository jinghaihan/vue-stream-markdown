import type { ParsedNode, SyntaxTree } from '../src/types'
import { describe, expect, it, vi } from 'vitest'
import { MarkdownParser } from '../src/markdown-parser'

function hasAnyLoading(nodes: ParsedNode[]): boolean {
  for (const node of nodes) {
    if (node.loading)
      return true

    const nodeWithChildren = node as { children?: ParsedNode[] }
    if (nodeWithChildren.children && hasAnyLoading(nodeWithChildren.children))
      return true
  }

  return false
}

function getFirstNodeTag(ast: SyntaxTree): string | undefined {
  const node = ast.children[0] as { data?: { tag?: string } } | undefined
  return node?.data?.tag
}

describe('markdown-parser', () => {
  it('should mark only the last block tail text as loading in streaming mode', () => {
    const parser = new MarkdownParser({
      mode: 'streaming',
    })

    const result = parser.parseMarkdown('# Title\n\nComplete paragraph.')
    const firstBlockNodes = result.asts[0]?.children as ParsedNode[] | undefined
    const lastBlockNodes = result.asts[result.asts.length - 1]?.children as ParsedNode[] | undefined
    const lastText = (lastBlockNodes?.[0] as { children?: ParsedNode[] } | undefined)?.children?.[0]

    expect(hasAnyLoading(firstBlockNodes ?? [])).toBe(false)
    expect(lastText?.type).toBe('text')
    expect(lastText?.loading).toBe(true)
    expect(parser.hasLoadingNode()).toBe(true)
  })

  it('should mark incomplete markdown as loading in streaming mode', () => {
    const parser = new MarkdownParser({
      mode: 'streaming',
    })

    parser.parseMarkdown('[incomplete link](https://example.com')

    expect(parser.hasLoadingNode()).toBe(true)
  })

  it('should not mark complete non-text tail node as loading in streaming mode', () => {
    const parser = new MarkdownParser({
      mode: 'streaming',
    })

    const result = parser.parseMarkdown('![ok](https://example.com/image.png)')
    const paragraph = result.asts[0]?.children[0] as { children?: ParsedNode[] } | undefined
    const image = paragraph?.children?.[0]

    expect(image?.type).toBe('image')
    expect(image?.loading).toBeFalsy()
  })

  it('should mark non-text tail node as loading when syntax is incomplete', () => {
    const parser = new MarkdownParser({
      mode: 'streaming',
    })

    const result = parser.parseMarkdown('![broken](https://example.com/image.png')
    const paragraph = result.asts[0]?.children[0] as { children?: ParsedNode[] } | undefined
    const image = paragraph?.children?.[0]

    expect(image?.type).toBe('image')
    expect(image?.loading).toBe(true)
  })

  it('should check sibling branches when detecting loading nodes', () => {
    const parser = new MarkdownParser({
      mode: 'streaming',
    })

    const nodes = [
      {
        type: 'paragraph',
        children: [
          {
            type: 'text',
            value: 'ready',
            loading: true,
          },
        ],
      },
      {
        type: 'paragraph',
        children: [
          {
            type: 'text',
            value: 'done',
          },
        ],
      },
    ] as ParsedNode[]

    expect(parser.hasLoadingNode(nodes)).toBe(true)
  })

  it('should clear loading state when switching to static mode without reparsing', () => {
    const parser = new MarkdownParser({
      mode: 'streaming',
    })

    const result = parser.parseMarkdown('# Title\n\nComplete paragraph.')
    const blockCount = result.asts.length
    const lastBlockNodes = result.asts[result.asts.length - 1]?.children as ParsedNode[] | undefined
    const lastText = (lastBlockNodes?.[0] as { children?: ParsedNode[] } | undefined)?.children?.[0]

    expect(parser.hasLoadingNode()).toBe(true)
    expect(lastText?.loading).toBe(true)

    parser.updateMode('static')

    expect(result.asts.length).toBe(blockCount)
    expect(lastText?.loading).toBe(false)
    expect(parser.hasLoadingNode()).toBe(false)
  })

  it('should mark tail text loading when switching back to streaming mode without reparsing', () => {
    const parser = new MarkdownParser({
      mode: 'streaming',
    })

    parser.parseMarkdown('Complete paragraph.')
    parser.updateMode('static')

    expect(parser.hasLoadingNode()).toBe(false)

    parser.updateMode('streaming')

    expect(parser.hasLoadingNode()).toBe(true)
  })

  it('should not share cached ast between parser instances', () => {
    const parserA = new MarkdownParser({
      mode: 'streaming',
      postprocess: (data) => {
        const node = data.children[0] as { data?: { tag?: string } } | undefined
        if (node)
          node.data = { tag: 'A' }
        return data
      },
    })
    const parserB = new MarkdownParser({
      mode: 'streaming',
      postprocess: (data) => {
        const node = data.children[0] as { data?: { tag?: string } } | undefined
        if (node)
          node.data = { tag: 'B' }
        return data
      },
    })

    const resultA = parserA.parseMarkdown('same-content')
    const resultB = parserB.parseMarkdown('same-content')

    expect(getFirstNodeTag(resultA.asts[0]!)).toBe('A')
    expect(getFirstNodeTag(resultB.asts[0]!)).toBe('B')
  })

  it('should return empty result for empty content', () => {
    const parser = new MarkdownParser({
      mode: 'streaming',
    })

    expect(parser.parseMarkdown('')).toEqual({ contents: [], asts: [] })
  })

  it('should return empty result when custom block parser returns no blocks', () => {
    const parser = new MarkdownParser({
      mode: 'streaming',
      parseMarkdownIntoBlocks: () => [],
    })

    expect(parser.parseMarkdown('non-empty')).toEqual({ contents: [], asts: [] })
  })

  it('should use custom normalize, preprocess and block parser hooks', () => {
    const normalize = vi.fn((content: string) => content.replace('RAW', 'normalized'))
    const preprocess = vi.fn((content: string) => `${content}\n`)
    const parseMarkdownIntoBlocks = vi.fn((content: string) => [content])

    const parser = new MarkdownParser({
      mode: 'streaming',
      normalize,
      preprocess,
      parseMarkdownIntoBlocks,
    })

    const result = parser.parseMarkdown('RAW')

    expect(normalize).toHaveBeenCalledTimes(1)
    expect(preprocess).toHaveBeenCalledTimes(1)
    expect(parseMarkdownIntoBlocks).toHaveBeenCalledTimes(1)
    expect(result.contents[0]).toBe('normalized\n')
  })

  it('should reuse cached ast within the same parser instance', () => {
    const parser = new MarkdownParser({
      mode: 'streaming',
    })
    const spy = vi.spyOn(parser as unknown as { markdownToAst: (content: string) => SyntaxTree }, 'markdownToAst')

    parser.parseMarkdown('cache me')
    parser.parseMarkdown('cache me')

    expect(spy).toHaveBeenCalledTimes(1)
  })

  it('should skip postprocess when mode is static', () => {
    const parser = new MarkdownParser({
      mode: 'static',
      postprocess: (data) => {
        const node = data.children[0] as { data?: { tag?: string } } | undefined
        if (node)
          node.data = { tag: 'streaming-only' }
        return data
      },
    })

    const result = parser.parseMarkdown('plain')

    expect(getFirstNodeTag(result.asts[0]!)).toBeUndefined()
  })

  it('should convert both root and non-root nodes in astToMarkdown', () => {
    const parser = new MarkdownParser({
      mode: 'streaming',
    })

    const result = parser.parseMarkdown('hello')
    const root = result.asts[0]!
    const paragraph = root.children[0]!

    expect(parser.astToMarkdown(root)).toContain('hello')
    expect(parser.astToMarkdown(paragraph)).toContain('hello')
  })

  it('should return false for empty node list in hasLoadingNode', () => {
    const parser = new MarkdownParser({
      mode: 'streaming',
    })

    expect(parser.hasLoadingNode([])).toBe(false)
  })
})
