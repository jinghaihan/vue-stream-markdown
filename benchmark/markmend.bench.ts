import { autoCloseMarkdown } from 'comark'
import remend from 'remend'
import { bench, describe } from 'vitest'
import { preprocess } from '../packages/markmend/core/src/preprocess'

type CompleteMarkdown = (content: string) => string

const implementations: Array<{
  name: string
  complete: CompleteMarkdown
}> = [
  { name: 'markmend', complete: preprocess },
  { name: 'streamdown/remend', complete: remend },
  { name: 'comark', complete: autoCloseMarkdown },
]

const standardOptions = { iterations: 1000 }
const pathologicalOptions = { iterations: 10 }

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
        () => implementation.complete(input),
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
            implementation.complete(input)
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

benchmarkInput('basic formatting', 'short text with incomplete bold', 'This is **bold text')
benchmarkInput('basic formatting', 'medium text with mixed formatting', mediumText)
benchmarkInput('basic formatting', 'long text with complex formatting', longText)

benchmarkInput('incomplete patterns', 'bold (**)', 'Some text with **incomplete bold')
benchmarkInput('incomplete patterns', 'italic (*)', 'Some text with *incomplete italic')
benchmarkInput('incomplete patterns', 'italic (__)', 'Some text with __incomplete italic')
benchmarkInput('incomplete patterns', 'inline code (`)', 'Some text with `incomplete code')
benchmarkInput('incomplete patterns', 'strikethrough (~~)', 'Some text with ~~incomplete strikethrough')
benchmarkInput('incomplete patterns', 'bold-italic (***)', 'Some text with ***incomplete bold-italic')
benchmarkInput('incomplete patterns', 'link destination', 'Some text with [incomplete link](')
benchmarkInput('incomplete patterns', 'link text', 'Some text with [incomplete')
benchmarkInput('incomplete patterns', 'block math ($$)', '$$\nE = mc^2\n')

const incompleteCodeBlock = '```javascript\nconst x = 1;\n'
const completeCodeBlock = '```javascript\nconst x = 1;\n```'
const multipleCodeBlocks = `
\`\`\`javascript
const x = 1;
\`\`\`

Some text

\`\`\`python
y = 2
`

benchmarkInput('code blocks', 'incomplete code block', incompleteCodeBlock)
benchmarkInput('code blocks', 'complete code block', completeCodeBlock)
benchmarkInput('code blocks', 'multiple code blocks (one incomplete)', multipleCodeBlocks)

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

benchmarkStream('streaming simulation', 'inline code (6 steps)', [
  '`',
  '`c',
  '`co',
  '`cod',
  '`code',
  '`code`',
])

benchmarkInput('edge cases', 'empty string', '')
benchmarkInput('edge cases', 'plain text', 'This is plain text without any markdown formatting.')
benchmarkInput('edge cases', 'many asterisks', '****************************')
benchmarkInput('edge cases', 'mixed emphasis markers', '**_*~`**_*~`**_*~`')
benchmarkInput('edge cases', 'list with emphasis', '- **bold\n- *italic\n- `code')
benchmarkInput('edge cases', 'underscores in math', '$x_1 + x_2 = x_')

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
benchmarkInput('large documents', '2x realistic size', largeDocument + largeDocument)

const bracketHeavyLine = 'const x = arr[i]; if (map[key]) { list[j] = grid[a][b]; }\n'
const bracketHeavyCodeBlock = `\`\`\`ts\n${bracketHeavyLine.repeat(1000)}`

benchmarkInput(
  'pathological inputs',
  'unclosed bracket-heavy code block (58k chars)',
  bracketHeavyCodeBlock,
  pathologicalOptions,
)
