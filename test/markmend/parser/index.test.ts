import { createMarkmendParser } from '@markmend/parser'
import { math } from '@stream-markdown/math'
import { describe, expect, it, vi } from 'vitest'
import footnoteContent from '../../../playground/nuxt/app/markdown/footnote.md?raw'

describe('markmend parser', () => {
  it('hides pending references only during streaming and resolves them when definitions arrive', async () => {
    const engine = createMarkmendParser()
    const pending = await engine.parse('Text[^note]', 'streaming')
    expect(pending.document.nodes).toEqual([['p', {}, 'Text', ['span', { hidden: true }, '^note']]])
    const resolved = await engine.parse('Text[^note]\n\n[^note]: Growing', 'streaming')
    expect(JSON.stringify(resolved.document.nodes)).toContain('fnref-note')
    expect(JSON.stringify(resolved.document.nodes)).not.toContain('"hidden":true')
    const unresolvedStatic = await engine.parse('Text[^note]', 'static')
    expect(JSON.stringify(unresolvedStatic.document.nodes)).not.toContain('"hidden":true')
  })

  it('does not hide literal caret text, code or references when footnotes are disabled', async () => {
    const engine = createMarkmendParser()
    const result = await engine.parse('Plain ^1 and `[^1]` and <span>^1</span> and [^pending]', 'streaming')
    const serialized = JSON.stringify(result.document.nodes)
    expect(serialized.match(/"hidden":true/g)).toHaveLength(1)
    expect(serialized).toContain('["code",{},"[^1]"]')
    const disabled = await createMarkmendParser({ syntax: { footnotes: false } }).parse('Text[^note]', 'streaming')
    expect(JSON.stringify(disabled.document.nodes)).not.toContain('"hidden":true')
  })

  it('resolves every streamed footnote definition without losing earlier references', async () => {
    const source = footnoteContent
    const engine = createMarkmendParser()
    let previousNodes
    for (let index = 1; index <= source.length; index++) {
      const input = source.slice(0, index)
      const { document } = await engine.parse(input, 'streaming')
      for (const match of input.matchAll(/^\[\^([1-4])\]:/gm))
        expect(JSON.stringify(document.nodes), `definition ${match[1]} at character ${index}`).toContain(`"fn-${match[1]}"`)
      // Once all references have resolved, later definition text must not
      // invalidate any of the four body blocks.
      if (index > source.indexOf('[^4]:') + 7 && previousNodes) {
        for (let block = 0; block < 4; block++)
          expect(document.nodes[block]).toBe(previousNodes[block])
      }
      previousNodes = document.nodes
    }
    const streamed = engine.getDocument().nodes
    const final = await engine.parse(source, 'static')
    expect(final.document.nodes).toEqual(streamed)
  })

  it('updates and removes footnote definitions after edits without retaining stale references', async () => {
    const engine = createMarkmendParser()
    const body = 'First[^a]\n\nSecond[^b]\n\n'
    await engine.parse(`${body}[^a]: Alpha\n\n[^b]: Beta`, 'streaming')
    const edited = await engine.parse(`${body}[^a]: Changed`, 'streaming')
    expect(JSON.stringify(edited.document.nodes)).toContain('Changed')
    expect(JSON.stringify(edited.document.nodes)).not.toContain('fn-b')
    const restored = await engine.parse(`${body}[^a]: Changed\n\n[^b]: Again`, 'streaming')
    expect(JSON.stringify(restored.document.nodes)).toContain('fn-b')
    expect(JSON.stringify(restored.document.nodes)).toContain('Again')
  })

  it('can disable completion while keeping streaming mode', async () => {
    const engine = createMarkmendParser({ completion: false })

    await expect(engine.parse('[label](', 'streaming')).resolves.toMatchObject({
      completion: undefined,
    })
  })

  it('completes only streaming input', async () => {
    const completion = vi.fn(markdown => `${markdown} completed`)
    const engine = createMarkmendParser({ completion })

    const streaming = await engine.parse('streaming', 'streaming')
    const staticDocument = await engine.parse('static', 'static')

    expect(completion).toHaveBeenCalledOnce()
    expect(streaming.document.nodes[0]?.[2]).toBe('streaming completed')
    expect(staticDocument.document.nodes[0]?.[2]).toBe('static')
  })

  it('completes the unstable tail before parser pre plugins', async () => {
    const events: Array<[stage: string, markdown: string]> = []
    const engine = createMarkmendParser({
      completion(markdown) {
        events.push(['completion', markdown])
        return `${markdown}\n<!-- completed -->`
      },
      parserOptions: {
        plugins: [{
          name: 'observe-pre',
          pre(state) {
            events.push(['pre', state.markdown])
          },
        }],
      },
    })

    await engine.parse('# Stable\n\nFirst paragraph', 'streaming')
    events.length = 0
    await engine.parse('# Stable\n\nFirst paragraph extended', 'streaming')

    expect(events).toEqual([
      ['completion', '\nFirst paragraph extended'],
      ['pre', '\nFirst paragraph extended\n<!-- completed -->'],
    ])
  })

  it('publishes queued parses in request order', async () => {
    const observed: string[] = []
    const engine = createMarkmendParser({
      parserOptions: {
        plugins: [{
          name: 'observe-order',
          async pre(state) {
            if (state.markdown.includes('first'))
              await new Promise(resolve => setTimeout(resolve, 10))
            observed.push(state.markdown)
          },
        }],
      },
    })

    const first = engine.parse('first', 'static')
    const second = engine.parse('second', 'static')
    const [firstResult, secondResult] = await Promise.all([first, second])

    expect(observed).toEqual(['first', 'second'])
    expect(firstResult.document.nodes).toEqual([['p', {}, 'first']])
    expect(secondResult.document.nodes).toEqual([['p', {}, 'second']])
    expect(engine.getDocument()).toBe(secondResult.document)
  })

  it('keeps the last successful document when parsing fails', async () => {
    const engine = createMarkmendParser({
      parserOptions: {
        plugins: [{
          name: 'reject-invalid',
          pre(state) {
            if (state.markdown === 'invalid')
              throw new Error('invalid markdown')
          },
        }],
      },
    })

    const validResult = await engine.parse('valid', 'static')
    const failedResult = await engine.parse('invalid', 'static')

    expect(failedResult).toBe(validResult)
    expect(engine.getDocument()).toBe(validResult.document)
    await expect(engine.parse('recovered', 'static')).resolves.toMatchObject({
      document: {
        nodes: [['p', {}, 'recovered']],
      },
    })
  })

  it('enables CJK-friendly emphasis by default', async () => {
    const engine = createMarkmendParser()
    const { document } = await engine.parse('**中文加粗。**后文', 'static')

    expect(document.nodes).toEqual([
      ['p', {}, ['strong', {}, '中文加粗。'], '后文'],
    ])
  })

  it('preserves configured literal tag content as text', async () => {
    const engine = createMarkmendParser({
      literalTagContent: ['mention'],
    })
    const { document } = await engine.parse(
      '<mention user_id="123">@_some_username_</mention> and <other>_italic_</other>',
      'static',
    )

    expect(document.nodes).toEqual([
      ['p', {}, ['mention', { $: { html: 1, block: 0 }, user_id: '123' }, '@_some_username_'], ' and ', ['other', { $: { html: 1, block: 0 } }, ['em', {}, 'italic']]],
    ])
  })

  it('flattens nested markup and preserves paragraph breaks in literal tags', async () => {
    const engine = createMarkmendParser({
      literalTagContent: ['artifact'],
    })
    const { document } = await engine.parse(
      '<artifact>First **line**\n\nSecond <strong>line</strong></artifact>',
      'static',
    )

    expect(document.nodes).toEqual([
      ['p', {}, ['artifact', { $: { html: 1, block: 0 } }, 'First **line**\n\nSecond line']],
    ])
  })

  it('protects closed literal tag content while streaming', async () => {
    const engine = createMarkmendParser({
      literalTagContent: ['mention'],
    })
    const { document } = await engine.parse('<mention>@_some_username_</mention>', 'streaming')

    expect(document.nodes).toEqual([
      ['p', { $: { line: 1 } }, ['mention', { $: { html: 1, block: 0 } }, '@_some_username_']],
    ])
  })

  it('enables math only when the extension contributes its parser plugin', async () => {
    const input = 'Inline $x^2$'
    const { document: plainDocument } = await createMarkmendParser().parse(input, 'static')
    const mathExtension = math()
    const { document: mathDocument } = await createMarkmendParser({
      parserOptions: {
        plugins: [mathExtension.parserPlugin],
      },
    }).parse(input, 'static')

    expect(plainDocument.nodes).toEqual([
      ['p', {}, input],
    ])
    expect(mathDocument.nodes).toEqual([
      ['p', {}, 'Inline ', ['math', { class: 'math inline', content: 'x^2' }, 'x^2']],
    ])
  })

  it('returns completion information with the parsed document', async () => {
    const engine = createMarkmendParser()

    await expect(engine.parse('[label](', 'streaming')).resolves.toMatchObject({
      completion: {
        type: 'link',
        phase: 'destination',
      },
    })
    await expect(engine.parse('[label](https://example.com)', 'streaming')).resolves.toMatchObject({
      completion: undefined,
    })
  })

  it('accepts completion information from a custom completion function', async () => {
    const engine = createMarkmendParser({
      completion(markdown) {
        return {
          markdown: `${markdown} completed`,
          completion: {
            type: 'custom',
          },
        }
      },
    })

    await expect(engine.parse('streaming', 'streaming')).resolves.toMatchObject({
      completion: {
        type: 'custom',
      },
      document: {
        nodes: [['p', { $: { line: 1 } }, 'streaming completed']],
      },
    })
  })
})
