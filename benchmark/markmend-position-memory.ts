import type { SyntaxTree } from '../packages/markmend/ast/src'
import process from 'node:process'
import { MarkdownAstParser, postFixFootnote } from '../packages/markmend/ast/src'

interface PositionableNode {
  children?: PositionableNode[]
  position?: unknown
}

function removePositions<T extends PositionableNode>(node: T): T {
  delete node.position
  const children = node.children
  if (!children)
    return node

  for (const child of children)
    removePositions(child)

  return node
}

function postnormalizeWithoutPositions(data: SyntaxTree): SyntaxTree {
  return removePositions(postFixFootnote(data))
}

function copyWithoutPositions<T extends PositionableNode>(node: T): T {
  const { children, position: _position, ...rest } = node
  if (!children)
    return rest as T

  return {
    ...rest,
    children: children.map(child => copyWithoutPositions(child)),
  } as T
}

function postnormalizeWithPositionlessCopy(data: SyntaxTree): SyntaxTree {
  return copyWithoutPositions(postFixFootnote(data))
}

function createDocument(sectionCount: number): string {
  return Array.from({ length: sectionCount }, (_, index) => `
## Section ${index + 1}

This paragraph contains **bold**, *italic*, a [link](https://example.com/${index}), and \`code\`.

- Item one
- Item two
- Item three
`).join('\n')
}

function collectGarbage(): void {
  const gc = (globalThis as typeof globalThis & { gc?: () => void }).gc
  if (!gc)
    throw new Error('Run this script with --expose-gc')

  for (let index = 0; index < 5; index++)
    gc()
}

const mode = process.argv[2]
if (
  mode !== 'baseline'
  && mode !== 'delete-position'
  && mode !== 'copy-no-position'
  && mode !== 'production'
) {
  throw new Error('Expected baseline, delete-position, copy-no-position, or production mode')
}

const content = createDocument(96)
let createParser: () => MarkdownAstParser
if (mode === 'production') {
  createParser = () => new MarkdownAstParser({ mode: 'streaming' })
}
else if (mode === 'baseline') {
  createParser = () => new MarkdownAstParser({
    mode: 'streaming',
    postnormalize: postFixFootnote,
  })
}
else {
  createParser = () => new MarkdownAstParser({
    mode: 'streaming',
    postnormalize: mode === 'delete-position'
      ? postnormalizeWithoutPositions
      : postnormalizeWithPositionlessCopy,
  })
}

for (let index = 0; index < 5; index++)
  createParser().parseMarkdown(content)

collectGarbage()
const before = process.memoryUsage().heapUsed
const retainedParsers = Array.from({ length: 50 }, () => {
  const parser = createParser()
  parser.parseMarkdown(content)
  return parser
})
collectGarbage()
const after = process.memoryUsage().heapUsed

console.warn(JSON.stringify({
  bytesPerParser: Math.round((after - before) / retainedParsers.length),
  heapDeltaBytes: after - before,
  mode,
  parserCount: retainedParsers.length,
}))
