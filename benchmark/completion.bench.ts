import { autoCloseMarkdown } from 'comark'
import remend from 'remend'
import { afterAll, bench, describe } from 'vitest'
import { completeMarkdown } from '../packages/markmend/core/src/completion'

type CompleteMarkdown = (content: string) => string
type BenchOptions = NonNullable<Parameters<typeof bench>[2]>

const implementations: Array<{
  name: string
  complete: CompleteMarkdown
}> = [
  { name: 'markmend', complete: completeMarkdown },
  { name: 'remend (streamdown)', complete: remend },
  { name: 'comark', complete: autoCloseMarkdown },
]

const standardOptions: BenchOptions = { time: 500, warmupTime: 100 }
const pathologicalOptions: BenchOptions = { iterations: 10, warmupIterations: 2 }
let benchmarkResult: unknown

afterAll(() => {
  if (benchmarkResult === undefined)
    throw new Error('Completion benchmarks did not produce a result')
})

function benchmarkInput(
  category: string,
  name: string,
  input: string,
  options = standardOptions,
): void {
  describe(`${category} > ${name}`, () => {
    for (const implementation of implementations) {
      bench(
        implementation.name,
        () => {
          benchmarkResult = implementation.complete(input)
        },
        options,
      )
    }
  })
}

function benchmarkStream(
  category: string,
  name: string,
  inputs: readonly string[],
): void {
  describe(`${category} > ${name}`, () => {
    for (const implementation of implementations) {
      bench(
        implementation.name,
        () => {
          for (const input of inputs)
            benchmarkResult = implementation.complete(input)
        },
        standardOptions,
      )
    }
  })
}

const mediumText = '# Heading\n\nThis is **bold** and *italic* text with `code` and ~~strikethrough~~'
const longText = `
# Complex Document

This document contains **bold**, *italic*, and ***bold-italic*** text.
It also has \`inline code\` and ~~strikethrough~~ formatting.

Here's a [link](https://example.com) and an incomplete link [text](

## Math Support

Inline math: $E = mc^2$ and block math:

$$
\\int_0^\\infty x^2 dx
`

benchmarkInput('basic formatting', 'medium text with mixed formatting', mediumText)
benchmarkInput('basic formatting', 'long text with complex formatting', longText)

benchmarkInput('incomplete patterns', 'inline code (`)', 'Some text with `incomplete code')
benchmarkInput('incomplete patterns', 'link destination', 'Some text with [incomplete link](')
benchmarkInput('incomplete patterns', 'block math ($$)', '$$\nE = mc^2\n')

const incompleteCodeBlock = '```javascript\nconst x = 1;\n'

benchmarkInput('code blocks', 'incomplete code block', incompleteCodeBlock)

benchmarkStream('streaming simulation', 'bold text (10 steps)', [
  '**',
  '**B',
  '**Bo',
  '**Bol',
  '**Bold',
  '**Bold ',
  '**Bold t',
  '**Bold te',
  '**Bold tex',
  '**Bold text',
])

benchmarkInput('edge cases', 'plain text', 'This is plain text without any markdown formatting.')
benchmarkInput('edge cases', 'mixed emphasis markers', '**_*~`**_*~`**_*~`')

const largeDocument = `
# Large Document Benchmark

${'## Section\n\nThis is a paragraph with **bold**, *italic*, and `code` formatting.\n\n'.repeat(50)}

## Code Section

\`\`\`javascript
${'const x = 1;\n'.repeat(100)}
\`\`\`

## More Content

${'Regular paragraph text with some [links](https://example.com) and more content.\n\n'.repeat(50)}
`

benchmarkInput('large documents', 'realistic size', largeDocument)

const bracketHeavyLine = 'const x = arr[i]; if (map[key]) { list[j] = grid[a][b]; }\n'
const bracketHeavyCodeBlock = `\`\`\`ts\n${bracketHeavyLine.repeat(1000)}`

benchmarkInput(
  'pathological inputs',
  'unclosed bracket-heavy code block (58k chars)',
  bracketHeavyCodeBlock,
  pathologicalOptions,
)
