import type { ParsedNode, SyntaxTree } from '@markmend/ast'
import { MarkdownAstParser } from '@markmend/ast'
import { describe, expect, it, vi } from 'vitest'

interface PositionableTestNode {
  children?: PositionableTestNode[]
  position?: unknown
}

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

function omitFalseLoading<T>(value: T): T {
  return JSON.parse(JSON.stringify(
    value,
    (key, nestedValue) => key === 'loading' && nestedValue === false
      ? undefined
      : nestedValue,
  )) as T
}

describe('markdown-parser', () => {
  it('should mark only the last block tail text as loading in streaming mode', () => {
    const parser = new MarkdownAstParser({
      mode: 'streaming',
    })

    const result = parser.parseMarkdown('# Title\n\nComplete paragraph.')
    const firstBlockNodes = result.asts[0]?.children as ParsedNode[] | undefined
    const lastBlockNodes = result.asts.at(-1)?.children as ParsedNode[] | undefined
    const lastText = (lastBlockNodes?.[0] as { children?: ParsedNode[] } | undefined)?.children?.[0]

    expect(hasAnyLoading(firstBlockNodes ?? [])).toBe(false)
    expect(lastText?.type).toBe('text')
    expect(lastText?.loading).toBe(true)
    expect(parser.hasLoadingNode()).toBe(true)
  })

  it('should mark incomplete markdown as loading in streaming mode', () => {
    const parser = new MarkdownAstParser({
      mode: 'streaming',
    })

    parser.parseMarkdown('[incomplete link](https://example.com')

    expect(parser.hasLoadingNode()).toBe(true)
  })

  it('should not mark complete non-text tail node as loading in streaming mode', () => {
    const parser = new MarkdownAstParser({
      mode: 'streaming',
    })

    const result = parser.parseMarkdown('![ok](https://example.com/image.png)')
    const paragraph = result.asts[0]?.children[0] as { children?: ParsedNode[] } | undefined
    const image = paragraph?.children?.[0]

    expect(image?.type).toBe('image')
    expect(image?.loading).toBeFalsy()
  })

  it('should mark non-text tail node as loading when syntax is incomplete', () => {
    const parser = new MarkdownAstParser({
      mode: 'streaming',
    })

    const result = parser.parseMarkdown('![broken](https://example.com/image.png')
    const paragraph = result.asts[0]?.children[0] as { children?: ParsedNode[] } | undefined
    const image = paragraph?.children?.[0]

    expect(image?.type).toBe('image')
    expect(image?.loading).toBe(true)
  })

  it('should check sibling branches when detecting loading nodes', () => {
    const parser = new MarkdownAstParser({
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
    const parser = new MarkdownAstParser({
      mode: 'streaming',
    })

    const result = parser.parseMarkdown('# Title\n\nComplete paragraph.')
    const blockCount = result.asts.length
    const lastBlockNodes = result.asts.at(-1)?.children as ParsedNode[] | undefined
    const lastText = (lastBlockNodes?.[0] as { children?: ParsedNode[] } | undefined)?.children?.[0]

    expect(parser.hasLoadingNode()).toBe(true)
    expect(lastText?.loading).toBe(true)

    parser.updateMode('static')

    expect(result.asts.length).toBe(blockCount)
    expect(lastText?.loading).toBe(false)
    expect(parser.hasLoadingNode()).toBe(false)
  })

  it('should mark tail text loading when switching back to streaming mode without reparsing', () => {
    const parser = new MarkdownAstParser({
      mode: 'streaming',
    })

    parser.parseMarkdown('Complete paragraph.')
    parser.updateMode('static')

    expect(parser.hasLoadingNode()).toBe(false)

    parser.updateMode('streaming')

    expect(parser.hasLoadingNode()).toBe(true)
  })

  it('should preserve block segmentation after switching from streaming to static', () => {
    const parser = new MarkdownAstParser({
      mode: 'streaming',
    })

    const content = '# Title\n\nFirst paragraph.\n\n## Subtitle\n\nSecond paragraph.'
    const initial = parser.parseMarkdown(content)

    expect(initial.asts.length).toBeGreaterThan(1)

    parser.updateMode('static')
    const reparsed = parser.parseMarkdown(content)

    expect(reparsed.asts.length).toBe(initial.asts.length)
  })

  it('should preserve unchanged block references when only loading state changes', () => {
    const parser = new MarkdownAstParser({
      mode: 'streaming',
    })

    const content = '# Title\n\nFirst paragraph.\n\n## Subtitle\n\nSecond paragraph.'
    const initial = parser.parseMarkdown(content)

    expect(initial.asts.length).toBeGreaterThan(1)

    parser.updateMode('static')
    const reparsed = parser.parseMarkdown(content)

    for (let i = 0; i < reparsed.asts.length - 1; i++)
      expect(reparsed.asts[i]).toBe(initial.asts[i])
  })

  it('should not share cached ast between parser instances', () => {
    const parserA = new MarkdownAstParser({
      mode: 'streaming',
      postprocess: (data) => {
        const node = data.children[0] as { data?: { tag?: string } } | undefined
        if (node)
          node.data = { tag: 'A' }
        return data
      },
    })
    const parserB = new MarkdownAstParser({
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
    const parser = new MarkdownAstParser({
      mode: 'streaming',
    })

    expect(parser.parseMarkdown('')).toEqual({ contents: [], asts: [] })
  })

  it('should return empty result when custom block parser returns no blocks', () => {
    const parser = new MarkdownAstParser({
      mode: 'streaming',
      parseMarkdownIntoBlocks: () => [],
    })

    expect(parser.parseMarkdown('non-empty')).toEqual({ contents: [], asts: [] })
  })

  it('should use custom normalize, preprocess and block parser hooks', () => {
    const normalize = vi.fn((content: string) => content.replace('RAW', 'normalized'))
    const preprocess = vi.fn((content: string) => `${content}\n`)
    const parseMarkdownIntoBlocks = vi.fn((content: string) => [content])

    const parser = new MarkdownAstParser({
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

  it('should only re-segment the changing tail for appended streaming content', () => {
    const parser = new MarkdownAstParser({ mode: 'streaming' })
    const initial = '# Stable title\n\nStable paragraph.\n\n- item one\n- item two'
    const updated = `${initial}\n\n## Live response\n\nGrowing tail`

    parser.parseMarkdown(initial)

    const processor = (parser as unknown as {
      processor: { parseMarkdownIntoBlocks: (content: string) => string[] }
    }).processor
    const split = vi.spyOn(processor, 'parseMarkdownIntoBlocks')
    const result = parser.parseMarkdown(updated)
    const freshResult = new MarkdownAstParser({ mode: 'streaming' }).parseMarkdown(updated)

    expect(split).toHaveBeenCalledTimes(1)
    expect(split.mock.calls[0]![0].length).toBeLessThan(updated.length)
    expect(omitFalseLoading(result)).toEqual(omitFalseLoading(freshResult))
  })

  it('should fully re-segment content after a non-append edit', () => {
    const parser = new MarkdownAstParser({ mode: 'streaming' })
    const initial = '# Stable title\n\nOriginal paragraph.\n\nTail paragraph.'
    const updated = '# Stable title\n\nEdited paragraph.\n\nTail paragraph.'

    parser.parseMarkdown(initial)

    const processor = (parser as unknown as {
      processor: { parseMarkdownIntoBlocks: (content: string) => string[] }
    }).processor
    const split = vi.spyOn(processor, 'parseMarkdownIntoBlocks')

    parser.parseMarkdown(updated)

    expect(split).toHaveBeenCalledOnce()
    expect(split).toHaveBeenCalledWith(updated)
  })

  it('should fully re-segment content when appended text introduces a footnote', () => {
    const parser = new MarkdownAstParser({ mode: 'streaming' })
    const initial = '# Stable title\n\nStable paragraph.'
    const updated = `${initial}\n\nFootnote[^1]\n\n[^1]: Definition`

    parser.parseMarkdown(initial)

    const processor = (parser as unknown as {
      processor: { parseMarkdownIntoBlocks: (content: string) => string[] }
    }).processor
    const split = vi.spyOn(processor, 'parseMarkdownIntoBlocks')
    const result = parser.parseMarkdown(updated)

    expect(split).toHaveBeenCalledOnce()
    expect(split).toHaveBeenCalledWith(updated)
    expect(result.asts).toHaveLength(1)
  })

  it('should preserve full parsing for custom block parsers', () => {
    const parseMarkdownIntoBlocks = vi.fn((content: string) => [content])
    const parser = new MarkdownAstParser({
      mode: 'streaming',
      parseMarkdownIntoBlocks,
    })

    parser.parseMarkdown('first')
    parser.parseMarkdown('first append')

    expect(parseMarkdownIntoBlocks).toHaveBeenCalledTimes(2)
    expect(parseMarkdownIntoBlocks).toHaveBeenLastCalledWith('first append')
  })

  it.each([
    ['setext heading', 'Paragraph', 'Paragraph\n---'],
    ['fenced code', '```ts\nconst value = 1', '```ts\nconst value = 1\n```'],
    ['math block', '$$\nx + y', '$$\nx + y\n$$'],
    ['html block', '<div>\ncontent', '<div>\ncontent\n</div>'],
  ])('should preserve %s parsing while appending', (_, firstTail, finalTail) => {
    const prefix = '# Stable title\n\nStable paragraph.\n\n'
    const parser = new MarkdownAstParser({ mode: 'streaming' })

    parser.parseMarkdown(prefix + firstTail)
    const result = parser.parseMarkdown(prefix + finalTail)
    const freshResult = new MarkdownAstParser({ mode: 'streaming' })
      .parseMarkdown(prefix + finalTail)

    expect(omitFalseLoading(result)).toEqual(omitFalseLoading(freshResult))
  })

  it.each([
    'A plain response continues one token at a time.',
    'Text with **bold**, *emphasis*, and ~~deleted text~~.',
    'Visit www.example.com or https://example.com/docs.',
    'www.example.com continues after the autolink.',
    'See (www.example.com) for details.',
    'Contact person@example.com for details.',
    'user@example.com continues after the autolink.',
    '1. ordered item',
    '1) alternate ordered item',
    '- unordered item',
    '+ alternate unordered item',
    '# heading text',
    '> quoted text',
    '---',
    'An &amp; entity remains correct.',
    '中文*测试*与_强调_继续输出。',
    '```ts\nconst value = `text`;\n\nconst next = value;',
  ])('should match fresh parsing at every prefix of %j', (document) => {
    const parser = new MarkdownAstParser({ mode: 'streaming' })

    for (let end = 1; end <= document.length; end++) {
      const content = document.slice(0, end)
      const result = parser.parseMarkdown(content)
      const freshResult = new MarkdownAstParser({ mode: 'streaming' })
        .parseMarkdown(content)

      expect(omitFalseLoading(result)).toEqual(omitFalseLoading(freshResult))
    }
  })

  it('should match fresh parsing across arbitrary streaming chunk boundaries', () => {
    const document = [
      '# Streaming document',
      '',
      'A paragraph with **bold**, *emphasis*, and [a link](https://example.com).',
      '',
      'Setext heading',
      '---',
      '',
      '- first item',
      '- second item',
      '',
      '> quoted text',
      '',
      '```ts',
      'const value = 1',
      '```',
      '',
      '$$',
      'x + y',
      '$$',
      '',
      '<div>',
      'HTML content',
      '</div>',
    ].join('\n')
    const parser = new MarkdownAstParser({ mode: 'streaming' })
    const chunkEnds = new Set<number>()
    for (let end = 1; end < document.length; end += 7)
      chunkEnds.add(end)
    chunkEnds.add(document.length)

    for (const end of chunkEnds) {
      const content = document.slice(0, end)
      const result = parser.parseMarkdown(content)
      const freshResult = new MarkdownAstParser({ mode: 'streaming' })
        .parseMarkdown(content)

      expect(omitFalseLoading(result)).toEqual(omitFalseLoading(freshResult))
    }
  })

  it('should reuse unchanged inline nodes for safe text appends', () => {
    const parser = new MarkdownAstParser({ mode: 'streaming' })
    const initial = parser.parseMarkdown('A **stable** phrase')
    const stableStrong = initial.asts[0]?.children[0]?.type === 'paragraph'
      ? initial.asts[0].children[0].children[1]
      : undefined

    const result = parser.parseMarkdown('A **stable** phrase continues')
    const freshResult = new MarkdownAstParser({ mode: 'streaming' })
      .parseMarkdown('A **stable** phrase continues')
    const paragraph = result.asts[0]?.children[0]

    expect(paragraph?.type).toBe('paragraph')
    expect(paragraph?.type === 'paragraph' ? paragraph.children[1] : undefined)
      .toBe(stableStrong)
    expect(omitFalseLoading(result)).toEqual(omitFalseLoading(freshResult))
  })

  it('should reuse an unterminated formatting tail for safe text appends', () => {
    const parser = new MarkdownAstParser({ mode: 'streaming' })
    parser.parseMarkdown('A **growing')

    const result = parser.parseMarkdown('A **growing phrase')
    const freshResult = new MarkdownAstParser({ mode: 'streaming' })
      .parseMarkdown('A **growing phrase')

    expect(omitFalseLoading(result)).toEqual(omitFalseLoading(freshResult))
  })

  it('should append to an unterminated fenced code AST without reparsing', () => {
    const parser = new MarkdownAstParser({ mode: 'streaming' })
    parser.parseMarkdown('```ts\nconst value = 1;')
    const markdownToAst = vi.spyOn(parser, 'markdownToAst')

    const content = '```ts\nconst value = 1;\nconst next = value + 1;'
    const result = parser.parseMarkdown(content)
    const freshResult = new MarkdownAstParser({ mode: 'streaming' })
      .parseMarkdown(content)

    expect(markdownToAst).not.toHaveBeenCalled()
    expect(omitFalseLoading(result)).toEqual(omitFalseLoading(freshResult))
  })

  it('should reuse the completed AST when the real closing fence arrives', () => {
    const parser = new MarkdownAstParser({ mode: 'streaming' })
    parser.parseMarkdown('```ts\nconst value = 1;')
    const markdownToAst = vi.spyOn(parser, 'markdownToAst')

    const content = '```ts\nconst value = 1;\n```'
    const result = parser.parseMarkdown(content)
    const freshResult = new MarkdownAstParser({ mode: 'streaming' })
      .parseMarkdown(content)

    expect(markdownToAst).not.toHaveBeenCalled()
    expect(omitFalseLoading(result)).toEqual(omitFalseLoading(freshResult))
  })

  it('should reparse indented fenced code blocks', () => {
    const parser = new MarkdownAstParser({ mode: 'streaming' })
    parser.parseMarkdown('  ```ts\n  const value = 1;')
    const markdownToAst = vi.spyOn(parser, 'markdownToAst')

    const content = '  ```ts\n  const value = 1;\n  const next = value + 1;'
    const result = parser.parseMarkdown(content)
    const freshResult = new MarkdownAstParser({ mode: 'streaming' })
      .parseMarkdown(content)

    expect(markdownToAst).toHaveBeenCalledOnce()
    expect(omitFalseLoading(result)).toEqual(omitFalseLoading(freshResult))
  })

  it('should fall back when appending after a completed inline node', () => {
    const parser = new MarkdownAstParser({ mode: 'streaming' })
    parser.parseMarkdown('[link](https://example.com)')

    const result = parser.parseMarkdown('[link](https://example.com) text')
    const freshResult = new MarkdownAstParser({ mode: 'streaming' })
      .parseMarkdown('[link](https://example.com) text')

    expect(omitFalseLoading(result)).toEqual(omitFalseLoading(freshResult))
  })

  it.each([
    ['GFM autolink', 'Visit www.', 'Visit www.example.com'],
    ['email autolink', 'Contact person@', 'Contact person@example.com'],
    ['ordered list', '1', '1. item'],
    ['ordered list with a closing parenthesis', '1', '1) item'],
    ['unordered list', '-', '- item'],
    ['unordered list with a plus marker', '+', '+ item'],
    ['heading', '#', '# title'],
    ['blockquote', '>', '> quote'],
    ['thematic break', '--', '---'],
  ])('should fall back when an append creates a %s', (_, initial, updated) => {
    const parser = new MarkdownAstParser({ mode: 'streaming' })
    parser.parseMarkdown(initial)

    const result = parser.parseMarkdown(updated)
    const freshResult = new MarkdownAstParser({ mode: 'streaming' })
      .parseMarkdown(updated)

    expect(omitFalseLoading(result)).toEqual(omitFalseLoading(freshResult))
  })

  it('should preserve custom AST lifecycle hooks while appending text', () => {
    const postprocess = vi.fn((tree: SyntaxTree) => tree)
    const parser = new MarkdownAstParser({
      mode: 'streaming',
      postprocess,
    })

    parser.parseMarkdown('Growing text')
    postprocess.mockClear()
    parser.parseMarkdown('Growing text continues')

    expect(postprocess).toHaveBeenCalledOnce()
  })

  it.each([
    [
      'nested HTML',
      '# Stable\n\n<div>\n<div>\ninner\n</div>\n\nafter inner\n</div>\n\noutside',
    ],
    [
      'custom HTML',
      '# Stable\n\n<my-box>\ninside\n</my-box>\n\noutside',
    ],
    [
      'math split across lexer tokens',
      '# Stable\n\nBefore $$\nx\n=\ny\n$$\n\nafter',
    ],
    [
      'regex-like text',
      '# Stable\n\nPattern [^\\s+] example.\n\nNext paragraph.',
    ],
  ])('should preserve %s block boundaries while appending', (_, document) => {
    const parser = new MarkdownAstParser({ mode: 'streaming' })

    for (let end = 1; end <= document.length; end += 5) {
      const content = document.slice(0, end)
      const result = parser.parseMarkdown(content)
      const freshResult = new MarkdownAstParser({ mode: 'streaming' })
        .parseMarkdown(content)

      expect(omitFalseLoading(result)).toEqual(omitFalseLoading(freshResult))
    }
  })

  it('should allow overriding a single preprocess step', () => {
    const html = vi.fn((content: string) => `${content}>`)
    const parser = new MarkdownAstParser({
      mode: 'streaming',
      preprocessSteps: {
        html,
      },
    })

    const result = parser.parseMarkdown('<div')

    expect(html).toHaveBeenCalledTimes(1)
    expect(result.contents[0]).toBe('<div>')
  })

  it('should ignore preprocessSteps when preprocess is replaced entirely', () => {
    const preprocess = vi.fn((content: string) => `${content}!`)
    const html = vi.fn((content: string) => `${content}>`)
    const parser = new MarkdownAstParser({
      mode: 'streaming',
      preprocess,
      preprocessSteps: {
        html,
      },
    })

    const result = parser.parseMarkdown('<div')

    expect(preprocess).toHaveBeenCalledTimes(1)
    expect(html).not.toHaveBeenCalled()
    expect(result.contents[0]).toBe('<div!')
  })

  it('should reuse cached ast within the same parser instance', () => {
    const parser = new MarkdownAstParser({
      mode: 'streaming',
    })
    const spy = vi.spyOn(parser as unknown as { markdownToAst: (content: string) => SyntaxTree }, 'markdownToAst')

    parser.parseMarkdown('cache me')
    parser.parseMarkdown('cache me')

    expect(spy).toHaveBeenCalledTimes(1)
  })

  it('should use the content cache when a block moves to another position', () => {
    const parser = new MarkdownAstParser({
      mode: 'streaming',
      parseMarkdownIntoBlocks: content => content.split('\n'),
    })
    const spy = vi.spyOn(parser as unknown as { markdownToAst: (content: string) => SyntaxTree }, 'markdownToAst')

    parser.parseMarkdown('first\nsecond')
    parser.parseMarkdown('new\nfirst\nsecond')

    expect(spy).toHaveBeenCalledTimes(3)
  })

  it('should reuse the previous ast for unchanged blocks beyond cache capacity', () => {
    const blocks = Array.from(
      { length: 150 },
      (_, index) => `block-${index}`,
    )
    const parser = new MarkdownAstParser({
      mode: 'streaming',
      parseMarkdownIntoBlocks: content => content.split('\n'),
    })
    const spy = vi.spyOn(parser as unknown as { markdownToAst: (content: string) => SyntaxTree }, 'markdownToAst')

    const initial = parser.parseMarkdown(blocks.join('\n'))

    spy.mockClear()
    blocks[149] += '-tail'
    const updated = parser.parseMarkdown(blocks.join('\n'))

    const changedCompletedBlocks = initial.asts
      .slice(0, -1)
      .filter((ast, index) => ast !== updated.asts[index])
      .length

    expect(spy).toHaveBeenCalledTimes(1)
    expect(changedCompletedBlocks).toBe(0)
  })

  it('should run postnormalize before postprocess', () => {
    const hooks: string[] = []
    const parser = new MarkdownAstParser({
      mode: 'streaming',
      postnormalize: (data) => {
        hooks.push('postnormalize')
        return data
      },
      postprocess: (data) => {
        hooks.push('postprocess')
        return data
      },
    })

    parser.parseMarkdown('plain')

    expect(hooks).toEqual(['postnormalize', 'postprocess'])
  })

  it('should omit positions from the default normalized ast', () => {
    const parser = new MarkdownAstParser({ mode: 'streaming' })
    const result = parser.parseMarkdown('# Heading\n\n- [x] **completed** item')

    const assertPositionless = (node: PositionableTestNode) => {
      expect(node.position).toBeUndefined()
      for (const child of node.children ?? [])
        assertPositionless(child)
    }

    for (const ast of result.asts)
      assertPositionless(ast)
  })

  it('should expose positions to a custom postnormalize hook', () => {
    let rootPosition: SyntaxTree['position']
    const parser = new MarkdownAstParser({
      mode: 'streaming',
      postnormalize: (data) => {
        rootPosition = data.position
        return data
      },
    })

    const result = parser.parseMarkdown('plain')

    expect(rootPosition).toBeDefined()
    expect(result.asts[0]?.position).toBeDefined()
  })

  it('should skip postprocess when mode is static', () => {
    const parser = new MarkdownAstParser({
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
    const parser = new MarkdownAstParser({
      mode: 'streaming',
    })

    const result = parser.parseMarkdown('hello')
    const root = result.asts[0]!
    const paragraph = root.children[0]!

    expect(parser.astToMarkdown(root)).toContain('hello')
    expect(parser.astToMarkdown(paragraph)).toContain('hello')
  })

  it('should return false for empty node list in hasLoadingNode', () => {
    const parser = new MarkdownAstParser({
      mode: 'streaming',
    })

    expect(parser.hasLoadingNode([])).toBe(false)
  })
})
