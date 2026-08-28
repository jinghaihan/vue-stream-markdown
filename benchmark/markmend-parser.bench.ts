import type { Processor } from 'unified'
import { createMarkdownParser } from 'comark'
import remarkGfm from 'remark-gfm'
import remarkParse from 'remark-parse'
import remend from 'remend'
import { parseMarkdownIntoBlocks } from 'streamdown'
import { unified } from 'unified'
import { bench, describe } from 'vitest'
import { MarkdownAstParser } from '../packages/markmend/ast/src'

type MaybePromise<T> = Promise<T> | T

interface ParserBenchmarkImplementation {
  coldParse: (content: string) => MaybePromise<number>
  name: string
  runStreamingSession: (inputs: readonly string[]) => MaybePromise<number>
}

const standardOptions = { iterations: 100 }
const largeOptions = { iterations: 20 }

function createStreamdownProcessor(): Processor {
  return unified()
    .use(remarkParse)
    .use(remarkGfm)
    .freeze()
}

function parseStreamdownBlock(processor: Processor, content: string): number {
  const tree = processor.runSync(processor.parse(content), content) as {
    children?: unknown[]
  }
  return tree.children?.length ?? 0
}

const implementations: ParserBenchmarkImplementation[] = [
  {
    name: 'markmend',
    coldParse(content) {
      const parser = new MarkdownAstParser({ mode: 'streaming' })
      const result = parser.parseMarkdown(content)
      return result.asts.reduce((total, ast) => total + ast.children.length, 0)
    },
    runStreamingSession(inputs) {
      const parser = new MarkdownAstParser({ mode: 'streaming' })
      let checksum = 0
      for (const input of inputs) {
        const result = parser.parseMarkdown(input)
        checksum += result.asts.reduce((total, ast) => total + ast.children.length, 0)
      }
      return checksum
    },
  },
  {
    name: 'streamdown/remend',
    coldParse(content) {
      const processor = createStreamdownProcessor()
      const blocks = parseMarkdownIntoBlocks(remend(content))
      return blocks.reduce(
        (total, block) => total + parseStreamdownBlock(processor, block),
        0,
      )
    },
    runStreamingSession(inputs) {
      const processor = createStreamdownProcessor()
      let checksum = 0
      let previousBlocks: string[] = []

      for (const input of inputs) {
        const blocks = parseMarkdownIntoBlocks(remend(input))
        for (let index = 0; index < blocks.length; index++) {
          const block = blocks[index]!
          if (block === previousBlocks[index])
            continue
          checksum += parseStreamdownBlock(processor, block)
        }
        previousBlocks = blocks
      }

      return checksum
    },
  },
  {
    name: 'comark',
    async coldParse(content) {
      const parser = createMarkdownParser()
      const result = await parser(content, { streaming: true })
      return result.nodes.length
    },
    async runStreamingSession(inputs) {
      const parser = createMarkdownParser()
      let checksum = 0
      for (const input of inputs) {
        const result = await parser(input, { streaming: true })
        checksum += result.nodes.length
      }
      return checksum
    },
  },
]

function benchmarkColdParse(
  name: string,
  input: string,
  options = standardOptions,
): void {
  describe(`cold AST parse > ${name}`, () => {
    for (const implementation of implementations) {
      bench(
        implementation.name,
        async () => implementation.coldParse(input),
        options,
      )
    }
  })
}

function benchmarkStreamingSession(
  name: string,
  inputs: readonly string[],
  options = standardOptions,
): void {
  describe(`stateful streaming > ${name} (${inputs.length} ticks)`, () => {
    for (const implementation of implementations) {
      bench(
        implementation.name,
        async () => implementation.runStreamingSession(inputs),
        options,
      )
    }
  })
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

function createGrowingInputs(content: string, chunkSize: number, prefix = ''): string[] {
  const inputs: string[] = []
  for (let end = chunkSize; end < content.length; end += chunkSize)
    inputs.push(prefix + content.slice(0, end))
  inputs.push(prefix + content)
  return inputs
}

function createAppendingBlockInputs(blockCount: number): string[] {
  const blocks = Array.from({ length: blockCount }, (_, index) => `
## Generated section ${index + 1}

Streaming block ${index + 1} contains **formatted text** and a short explanation.
`)
  return blocks.map((_, index) => blocks.slice(0, index + 1).join('\n'))
}

function createMiddleEditInputs(blockCount: number, editCount: number): string[] {
  const blocks = Array.from({ length: blockCount }, (_, index) => `
## Stable section ${index + 1}

Stable content for section ${index + 1}.
`)
  const middleIndex = Math.floor(blockCount / 2)

  return Array.from({ length: editCount }, (_, editIndex) => {
    const editedBlocks = [...blocks]
    editedBlocks[middleIndex] = `
## Edited section

Middle content revision ${editIndex + 1} with **changing text**.
`
    return editedBlocks.join('\n')
  })
}

const shortDocument = createDocument(2)
const mediumDocument = createDocument(24)
const largeDocument = createDocument(96)

benchmarkColdParse('short document', shortDocument)
benchmarkColdParse('medium document', mediumDocument)
benchmarkColdParse('large document', largeDocument, largeOptions)

const growingParagraph = createGrowingInputs(
  'A single paragraph with **bold text**, *emphasis*, links, and inline code. '.repeat(12),
  48,
)
const stablePrefix = `${createDocument(64)}\n\n## Live response\n\n`
const stablePrefixInputs = createGrowingInputs(
  'The model is generating **one changing tail block** while every earlier block remains stable. '.repeat(8),
  48,
  stablePrefix,
)
const appendingBlockInputs = createAppendingBlockInputs(16)
const middleEditInputs = createMiddleEditInputs(48, 8)

benchmarkStreamingSession('growing single paragraph', growingParagraph)
benchmarkStreamingSession('large stable prefix with growing tail', stablePrefixInputs, largeOptions)
benchmarkStreamingSession('appending complete blocks', appendingBlockInputs)
benchmarkStreamingSession('editing a middle block', middleEditInputs, largeOptions)
