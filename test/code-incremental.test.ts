import { code, createShikiRuntime, disposeShikiHighlighter } from '@stream-markdown/code'
import { afterAll, beforeAll, describe, expect, it, vi } from 'vitest'
import { incrementalCodeToTokens } from '../packages/extensions/code/src/incremental'

const options = { lang: 'typescript', themes: { light: 'github-light', dark: 'github-dark' } } as const
type CodeToTokensOptions = Parameters<typeof incrementalCodeToTokens>[2]
let highlighter: Awaited<ReturnType<ReturnType<typeof createShikiRuntime>['getHighlighter']>>

beforeAll(async () => {
  highlighter = await createShikiRuntime({ lang: 'typescript', langs: ['javascript', 'python', 'html', 'css', 'json', 'bash', 'markdown'] }).getHighlighter()
})
afterAll(disposeShikiHighlighter)

async function compare(source: string, config: CodeToTokensOptions = options) {
  const actual = await incrementalCodeToTokens(highlighter, source, config)
  const expected = highlighter.codeToTokens(source, config)
  expect(actual.tokens).toEqual(expected.tokens)
  expect(actual.fg).toEqual(expected.fg)
  expect(actual.bg).toEqual(expected.bg)
  return actual
}

describe('incremental Shiki highlighting', () => {
  it('matches full highlighting across partial lines, comments, templates and CRLF', async () => {
    for (const newline of ['\n', '\r\n']) {
      let source = ''
      const chunks = [
        `// ${newline === '\n' ? 'lf' : 'crlf'}${newline}`,
        '/* open',
        newline,
        `comment */${newline}`,
        'const message = `first',
        newline,
        'second ${',
        '1 + 2}',
        '`;',
        newline,
        'const pattern = /[a-z]+/;',
        newline,
        `\tconsole.log(message)${newline}`,
      ]
      for (const chunk of chunks) {
        source += chunk
        await compare(source)
      }
      await compare(source)
    }
  })

  it('reuses completed lines without mutating earlier results', async () => {
    const prefix = '// work-counter\nconst value = 1;\n'
    const original = await compare(prefix)
    const snapshot = structuredClone(original.tokens)
    const spy = vi.spyOn(highlighter, 'codeToTokens')
    const next = await incrementalCodeToTokens(highlighter, `${prefix}const next =`, options)
    expect(spy.mock.calls.map(call => call[0])).toEqual(['const next ='])
    expect(next.tokens[0]).toBe(original.tokens[0])
    expect(original.tokens).toEqual(snapshot)
    spy.mockRestore()
    await compare(`${prefix}const next = 2;\n`)
  })

  it.each([
    ['python', '# python\nvalue = """first\nsecond\nthird"""\nprint(value)\n'],
    ['html', '<div>\n<!-- comment\nstill comment -->\n<script>\nconst value = 1;\n</script>\n</div>'],
    ['css', '/* comment\ncomment end */\na {\n  color: red;\n}\n'],
    ['json', '{\n  "value": [1,\n2,3]\n}\n'],
    ['bash', 'cat <<EOF\nhello\nEOF\necho "done"\n'],
    ['markdown', '# Heading\n\n```js\nconst value = 1;\n```\n\n**bold**\n'],
  ] as const)('matches full highlighting while streaming %s', async (lang, source) => {
    for (let end = 3; end < source.length; end += 5)
      await compare(source.slice(0, end), { ...options, lang })
    await compare(source, { ...options, lang })
  })

  it('isolates concurrent blocks, edits, languages and theme options', async () => {
    const prefixes = Array.from({ length: 4 }, (_, index) => `// concurrent ${index}\nconst value = ${index};\n`)
    for (const prefix of prefixes)
      await compare(prefix)
    for (const prefix of prefixes)
      await compare(`${prefix}console.log(value)`)
    await compare(prefixes[0]?.replace('value', 'renamed') ?? '')
    await compare(`${prefixes[0]}let other = true`, { ...options, lang: 'javascript' })
    await compare(`${prefixes[0]}let other = true`, { ...options, defaultColor: false })
    await compare(`${prefixes[0]}let other = true`, { ...options, themes: { light: 'github-dark', dark: 'github-light' } })
  })

  it('evicts older blocks beyond the four-entry limit', async () => {
    const prefixes = Array.from({ length: 5 }, (_, index) => `// eviction ${index}\nconst item = ${index};\n`)
    for (const prefix of prefixes)
      await compare(prefix)
    const spy = vi.spyOn(highlighter, 'codeToTokens')
    await incrementalCodeToTokens(highlighter, `${prefixes[0]}item++`, options)
    expect(spy.mock.calls[0]?.[0]).toContain('// eviction 0')
    spy.mockRestore()
  })

  it('falls back to full highlighting for explicit context, hooks, time limits and bare CR', async () => {
    const source = '// fallback\nconst value = 1;\n'
    const configurations: CodeToTokensOptions[] = [
      { ...options, grammarContextCode: '/*' },
      { ...options, tokenizeTimeLimit: 0 },
      { ...options, transformers: [] } as CodeToTokensOptions,
      { ...options, lang: 'plaintext' },
    ]
    for (const config of configurations) {
      const spy = vi.spyOn(highlighter, 'codeToTokens')
      await incrementalCodeToTokens(highlighter, source, config)
      expect(spy.mock.calls.map(call => call[0])).toEqual([source])
      spy.mockRestore()
      await compare(source, config)
    }
    await compare('// bare CR\rconst value = 1;\n')
  })

  it('reuses converted extension rows and respects changing option getters', async () => {
    let defaultColor: string | false = 'light'
    const extension = code({ codeToTokenOptions: () => ({ ...options, defaultColor }) })
    const prefix = '// converted\nconst value = 1;\n'
    const first = await extension.highlight({ code: prefix, language: 'typescript', isDark: false })
    const next = await extension.highlight({ code: `${prefix}value++`, language: 'typescript', isDark: true })
    expect(next.tokens[0]).toBe(first.tokens[0])
    defaultColor = false
    const changed = await extension.highlight({ code: `${prefix}value++`, language: 'typescript', isDark: false })
    expect(changed.tokens[0]).not.toBe(first.tokens[0])
    expect(changed.tokens[1]?.[0]?.htmlStyle).toEqual(highlighter.codeToTokens(prefix, { ...options, defaultColor }).tokens[1]?.[0]?.htmlStyle)
  })
})
