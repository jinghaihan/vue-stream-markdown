import type { BenchRunOptions } from 'vitest'
import { resolve } from 'node:path'
import { pathToFileURL } from 'node:url'
import { code } from '@stream-markdown/code'
import { beforeAll, describe, it } from 'vitest'

const extensions = [{ name: 'current', extension: code() }]
const options: BenchRunOptions = { time: 1000, iterations: 5, warmupTime: 200, warmupIterations: 1 }
const APPENDS = 20
let session = 0

function source(lines: number): string {
  const body = Array.from({ length: lines }, (_, index) =>
    `const value${index}: string = "row ${index}"; // complete line`).join('\n')
  return `// session ${session += 1}\n${body}\n`
}

async function highlight(extension: ReturnType<typeof code>, content: string) {
  const result = await extension.highlight({ code: content, language: 'typescript', isDark: false })
  if (!result.tokens.length)
    throw new Error('Missing highlighted code')
}

beforeAll(async () => {
  const baseline = process.env.CODE_HIGHLIGHT_BASELINE
  if (baseline) {
    const module: typeof import('@stream-markdown/code') = await import(/* @vite-ignore */ pathToFileURL(resolve(baseline)).href)
    extensions.unshift({ name: 'before', extension: module.code() })
  }
  for (const { extension } of extensions)
    await highlight(extension, source(1))
}, 30000)

describe('code highlighting', () => {
  it('complete 200-line block', async ({ bench }) => {
    for (const { name, extension } of extensions)
      await bench(name, () => highlight(extension, source(200))).run(options)
  })

  for (const lines of [200, 1000]) {
    it(`${lines}-line block with ${APPENDS} streaming appends`, async ({ bench }) => {
      for (const { name, extension } of extensions) {
        await bench(name, async () => {
          let content = source(lines)
          await highlight(extension, content)
          const tail = Array.from({ length: APPENDS }, (_, index) =>
            `const appended${index} = value${index};\n`).join('')
          for (let index = 0; index < APPENDS; index += 1) {
            content += tail.slice(index * 24, (index + 1) * 24)
            await highlight(extension, content)
          }
        }).run(options)
      }
    })
  }
})
