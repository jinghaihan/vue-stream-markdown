import { completeCode, completeMarkdown, completeMarkdownResult } from '@markmend/core'
import { describe, expect, it } from 'vitest'
import { normalize } from '../../../packages/markmend/core/src/completion'
import { getTestCases, getTestCasesByCategory } from './test-cases'
import { getFixtureFiles, getSnapshotPath, readFixture } from './utils'

describe('normalize', () => {
  it('should convert LaTeX syntax and normalize content', () => {
    expect(normalize('\\[E = mc^2\\]')).toBe('$$E = mc^2$$')
    expect(normalize('\\(x = 1\\)')).toBe('$$x = 1$$')
  })
})

describe('completeMarkdown', () => {
  for (const testCase of getTestCases()) {
    it(testCase.description, () => {
      const expected = testCase.integrationExpected ?? testCase.expected
      expect(completeMarkdown(testCase.input, testCase.completionOptions)).toBe(expected)
    })
  }

  for (const fixtureFile of getFixtureFiles()) {
    it(fixtureFile, async () => {
      const fixture = readFixture(fixtureFile)
      const result = completeMarkdown(fixture)
      const snapshotPath = getSnapshotPath(fixtureFile)
      await expect(result).toMatchFileSnapshot(snapshotPath)
    })
  }
})

describe('completeMarkdownResult', () => {
  it.each([
    ['> ', '> '],
    ['> > ', '> > '],
    ['>> ', '>> '],
    ['- ', '  '],
    ['12. ', '    '],
    ['1. item\n\n    ', '    '],
    ['- item\n\n  ', '  '],
    ['- item\n\n  > ', '  > '],
    ['> - ', '>   '],
  ])('keeps the container prefix when closing nested fences (%j)', (opening, continuation) => {
    for (const fence of ['```', '~~~']) {
      const source = `${opening}${fence}js\n${continuation}abcdef`
      expect(completeMarkdownResult(source)).toEqual({
        markdown: `${source}\n${continuation}${fence}`,
        completion: { type: 'code' },
      })
      expect(completeMarkdown(`${source}\n${continuation}${fence}`)).toBe(`${source}\n${continuation}${fence}`)
    }
  })

  it('does not close a root tilde fence with a quoted marker or treat indented code as a fence', () => {
    const source = '~~~text\n> ~~~\nliteral'
    expect(completeMarkdown(source)).toBe(`${source}\n~~~`)
    expect(completeCode('    ~~~text\n    literal')).toBe('    ~~~text\n    literal')
  })

  it.each(['', '\n'])('completes an unclosed tilde fence without changing its JSON body (suffix %j)', (suffix) => {
    const source = '~~~json\n{"type":"card","text":"example"}'

    expect(completeMarkdownResult(source + suffix)).toEqual({
      markdown: `${source}\n~~~`,
      completion: { type: 'code' },
    })
  })

  it.each([
    '`literal',
    '``literal',
    '```js\n~~strike **bold [link',
    '\\(literal\\)\n$$\n- > 25',
    'line\n\n~~literal **bold `code \\(math\\)',
  ])('preserves literal syntax inside a tilde fence: %j', (body) => {
    const source = `~~~text\n${body}`

    expect(completeMarkdownResult(source)).toEqual({
      markdown: `${source}\n~~~`,
      completion: { type: 'code' },
    })
  })

  it('preserves closed tilde code while completing prose after it', () => {
    const code = '~~~text\n\n~~literal\n$$\n\\(literal\\)\n`literal\n~~~'

    expect(completeMarkdown(code)).toBe(code)
    expect(completeMarkdown(`${code}\n\nText ~~strike`)).toBe(`${code}\n\nText ~~strike~~`)
    expect(completeMarkdown(`${code}\nText ~~strike`)).toBe(`${code}\nText ~~strike~~`)
  })

  it('matches tilde closing fences by length and keeps shorter runs literal', () => {
    const source = '~~~~text\n~~~\n~~literal'

    expect(completeMarkdown(source)).toBe(`${source}\n~~~~`)
    expect(completeMarkdown('~~~text\n~~literal\n~~~~')).toBe('~~~text\n~~literal\n~~~~')
  })

  it('keeps tilde fences inside backtick code literal and still completes strikethrough', () => {
    const source = '```text\n~~~\n~~literal\n```'

    expect(completeMarkdown(source)).toBe(source)
    expect(completeMarkdown('Text ~~strike')).toBe('Text ~~strike~~')
  })

  it('returns the source unchanged when completion is disabled', () => {
    expect(completeMarkdownResult('**incomplete', false)).toEqual({
      markdown: '**incomplete',
      completion: undefined,
    })
    expect(completeMarkdown('**incomplete', false)).toBe('**incomplete')
  })

  it('can disable an individual completion step', () => {
    expect(completeMarkdown('[label', {
      completionSteps: {
        link: false,
      },
    })).toBe('[label')
  })

  it('allows overriding an individual completion step', () => {
    expect(completeMarkdown('plain', {
      completionSteps: {
        code: content => `${content}!`,
      },
    })).toBe('plain!')
  })

  it('reports the completion step that changed the markdown', () => {
    expect(completeMarkdownResult('**bold')).toEqual({
      markdown: '**bold**',
      completion: {
        type: 'strong',
      },
    })
  })

  it('identifies an incomplete link destination', () => {
    expect(completeMarkdownResult('[label](https://example.com')).toEqual({
      markdown: '[label](https://example.com)',
      completion: {
        type: 'link',
        phase: 'destination',
      },
    })
  })

  it('omits a phase when the link destination has not started', () => {
    expect(completeMarkdownResult('[label')).toEqual({
      markdown: '[label]()',
      completion: {
        type: 'link',
      },
    })
  })

  it('omits completion information for complete markdown', () => {
    expect(completeMarkdownResult('[label](https://example.com)')).toEqual({
      markdown: '[label](https://example.com)',
      completion: undefined,
    })
  })
})

describe('streaming completion idempotence', () => {
  for (const testCase of getTestCasesByCategory('streaming-completion')) {
    it(`keeps the expected output stable: ${testCase.description}`, () => {
      const expected = testCase.integrationExpected ?? testCase.expected
      expect(completeMarkdown(testCase.expected, testCase.completionOptions)).toBe(expected)
    })
  }
})
