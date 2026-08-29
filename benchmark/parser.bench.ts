import { createMarkmendParser } from '@markmend/parser'
import { createMarkdownParser } from 'comark'
import remarkGfm from 'remark-gfm'
import remarkParse from 'remark-parse'
import remend from 'remend'
import { parseMarkdownIntoBlocks as parseStreamdownBlocks } from 'streamdown'
import { unified } from 'unified'
import { afterAll, bench, describe } from 'vitest'

type MaybePromise<T> = Promise<T> | T

interface Implementation {
  coldParse: (content: string) => MaybePromise<number>
  name: string
  stream: (inputs: readonly string[]) => MaybePromise<number>
}

const standardOptions = { iterations: 50 }
const largeOptions = { iterations: 10 }
let benchmarkResult: unknown

afterAll(() => {
  if (benchmarkResult === undefined)
    throw new Error('Parser comparison did not produce a result')
})

function createStreamdownProcessor() {
  return unified().use(remarkParse).use(remarkGfm).freeze()
}

type StreamdownProcessor = ReturnType<typeof createStreamdownProcessor>

function parseStreamdownBlock(processor: StreamdownProcessor, content: string): number {
  const tree = processor.runSync(processor.parse(content), content) as {
    children?: unknown[]
  }
  return tree.children?.length ?? 0
}

const implementations: Implementation[] = [
  {
    name: 'markmend',
    async coldParse(content) {
      const parser = createMarkmendParser()
      return (await parser.parse(content, 'streaming')).nodes.length
    },
    async stream(inputs) {
      const parser = createMarkmendParser()
      let checksum = 0
      for (const input of inputs)
        checksum += (await parser.parse(input, 'streaming')).nodes.length
      return checksum
    },
  },
  {
    name: 'streamdown',
    coldParse(content) {
      const processor = createStreamdownProcessor()
      return parseStreamdownBlocks(remend(content)).reduce(
        (total, block) => total + parseStreamdownBlock(processor, block),
        0,
      )
    },
    stream(inputs) {
      const processor = createStreamdownProcessor()
      let checksum = 0
      let previousBlocks: string[] = []

      for (const input of inputs) {
        const blocks = parseStreamdownBlocks(remend(input))
        for (let index = 0; index < blocks.length; index += 1) {
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
    name: 'pure-comark',
    async coldParse(content) {
      const parse = createMarkdownParser()
      return (await parse(content, { streaming: true })).nodes.length
    },
    async stream(inputs) {
      const parse = createMarkdownParser()
      let checksum = 0
      for (const input of inputs)
        checksum += (await parse(input, { streaming: true })).nodes.length
      return checksum
    },
  },
]

function benchmarkCold(name: string, input: string, options = standardOptions): void {
  describe(`cold parse > ${name}`, () => {
    for (const implementation of implementations) {
      bench(implementation.name, async () => {
        benchmarkResult = await implementation.coldParse(input)
      }, options)
    }
  })
}

function benchmarkStream(
  name: string,
  inputs: readonly string[],
  options = standardOptions,
): void {
  describe(`streaming > ${name} (${inputs.length} ticks)`, () => {
    for (const implementation of implementations) {
      bench(implementation.name, async () => {
        benchmarkResult = await implementation.stream(inputs)
      }, options)
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

const shortDocument = createDocument(2)
const mediumDocument = createDocument(24)
const largeDocument = createDocument(96)
const growingParagraph = createGrowingInputs(
  'A single paragraph with **bold text**, *emphasis*, links, and inline code. '.repeat(12),
  48,
)
const stablePrefixInputs = createGrowingInputs(
  'The model is generating **one changing tail block** while every earlier block remains stable. '.repeat(8),
  48,
  `${createDocument(64)}\n\n## Live response\n\n`,
)
const appendingBlockInputs = createAppendingBlockInputs(16)

benchmarkCold('short document', shortDocument)
benchmarkCold('medium document', mediumDocument)
benchmarkCold('large document', largeDocument, largeOptions)
benchmarkStream('growing paragraph', growingParagraph)
benchmarkStream('large stable prefix', stablePrefixInputs, largeOptions)
benchmarkStream('appending complete blocks', appendingBlockInputs)
