import type { Processor } from 'unified'
import type { SyntaxTree } from '../packages/markmend/ast/src'
import { createMarkdownParser } from 'comark'
import remarkGfm from 'remark-gfm'
import remarkParse from 'remark-parse'
import remend from 'remend'
import { parseMarkdownIntoBlocks as parseStreamdownBlocks } from 'streamdown'
import { unified } from 'unified'
import { bench, describe } from 'vitest'
import { MarkdownAstParser } from '../packages/markmend/ast/src'
import {
  MarkdownProcessor,
  parseMarkdownIntoBlocks as parseMarkmendBlocks,
} from '../packages/markmend/core/src'

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
      const blocks = parseStreamdownBlocks(remend(content))
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
        const blocks = parseStreamdownBlocks(remend(input))
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

function normalizeSemanticBlocks(blocks: string[]): string[] {
  return blocks
    .filter(block => block.trim().length > 0)
    .map(block => block.trimEnd())
}

function assertEquivalentSemanticBlocks(
  name: string,
  inputs: readonly string[],
): void {
  for (let index = 0; index < inputs.length; index++) {
    const input = inputs[index]!
    const markmendBlocks = normalizeSemanticBlocks(parseMarkmendBlocks(input))
    const streamdownBlocks = normalizeSemanticBlocks(parseStreamdownBlocks(input))
    const differingBlockIndex = Math.max(
      markmendBlocks.findIndex((block, blockIndex) => block !== streamdownBlocks[blockIndex]),
      streamdownBlocks.findIndex((block, blockIndex) => block !== markmendBlocks[blockIndex]),
    )

    if (
      markmendBlocks.length !== streamdownBlocks.length
      || differingBlockIndex !== -1
    ) {
      throw new Error(
        [
          `Semantic block segmentation differs for ${name} input ${index + 1}`,
          `at block ${differingBlockIndex + 1}`,
          `(counts: ${markmendBlocks.length}/${streamdownBlocks.length})`,
          `(Markmend: ${JSON.stringify(markmendBlocks[differingBlockIndex])}`,
          `Streamdown: ${JSON.stringify(streamdownBlocks[differingBlockIndex])})`,
        ].join(' '),
      )
    }
  }
}

function benchmarkMarkmendPipeline(
  name: string,
  inputs: readonly string[],
  options = standardOptions,
): void {
  const processor = new MarkdownProcessor()
  const normalizedInputs = inputs.map(input => processor.normalize(input))
  const blockInputs = normalizedInputs.map(input => processor.parseMarkdownIntoBlocks(input))
  const astMissContents: string[] = []
  const recordingParser = new MarkdownAstParser({ mode: 'streaming' })
  const markdownToAst = recordingParser.markdownToAst.bind(recordingParser)
  recordingParser.markdownToAst = (content) => {
    astMissContents.push(content)
    return markdownToAst(content)
  }
  for (const input of inputs)
    recordingParser.parseMarkdown(input)

  describe(`markmend pipeline breakdown > ${name} (${inputs.length} ticks)`, () => {
    bench('normalize', () => {
      let checksum = 0
      for (const input of inputs)
        checksum += processor.normalize(input).length
      return checksum
    }, options)

    bench('block segmentation', () => {
      let checksum = 0
      for (const input of normalizedInputs)
        checksum += processor.parseMarkdownIntoBlocks(input).length
      return checksum
    }, options)

    bench('tail completion', () => {
      let checksum = 0
      for (const blocks of blockInputs) {
        const tail = blocks.at(-1)
        if (tail)
          checksum += processor.preprocess(tail, { singleDollarTextMath: false }).length
      }
      return checksum
    }, options)

    bench('ast conversion on cache misses', () => {
      const parser = new MarkdownAstParser({ mode: 'streaming' })
      let checksum = 0
      for (const content of astMissContents)
        checksum += parser.markdownToAst(content).children.length

      return checksum
    }, options)

    bench('pipeline excluding AST conversion', () => {
      const parser = new MarkdownAstParser({ mode: 'streaming' })
      const emptyAst: SyntaxTree = { type: 'root', children: [] }
      parser.markdownToAst = () => emptyAst

      let checksum = 0
      for (const input of inputs)
        checksum += parser.parseMarkdown(input).asts.length
      return checksum
    }, options)

    bench('full parser session', () => {
      const parser = new MarkdownAstParser({ mode: 'streaming' })
      let checksum = 0
      for (const input of inputs) {
        const result = parser.parseMarkdown(input)
        checksum += result.asts.length
      }
      return checksum
    }, options)
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

assertEquivalentSemanticBlocks('short document', [shortDocument])
assertEquivalentSemanticBlocks('medium document', [mediumDocument])
assertEquivalentSemanticBlocks('large document', [largeDocument])
assertEquivalentSemanticBlocks('growing single paragraph', growingParagraph)
assertEquivalentSemanticBlocks('large stable prefix with growing tail', stablePrefixInputs)
assertEquivalentSemanticBlocks('appending complete blocks', appendingBlockInputs)
assertEquivalentSemanticBlocks('editing a middle block', middleEditInputs)

benchmarkStreamingSession('growing single paragraph', growingParagraph)
benchmarkStreamingSession('large stable prefix with growing tail', stablePrefixInputs, largeOptions)
benchmarkStreamingSession('appending complete blocks', appendingBlockInputs)
benchmarkStreamingSession('editing a middle block', middleEditInputs, largeOptions)

benchmarkMarkmendPipeline('growing single paragraph', growingParagraph)
benchmarkMarkmendPipeline('large stable prefix with growing tail', stablePrefixInputs, largeOptions)
