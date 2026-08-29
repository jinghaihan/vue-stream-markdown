import { createMarkmendParser } from '@markmend/parser'
import { describe, expect, it, vi } from 'vitest'

describe('markmend parser', () => {
  it('completes only streaming input', async () => {
    const completion = vi.fn(markdown => `${markdown} completed`)
    const engine = createMarkmendParser({ completion })

    const streaming = await engine.parse('streaming', 'streaming')
    const staticDocument = await engine.parse('static', 'static')

    expect(completion).toHaveBeenCalledOnce()
    expect(streaming.nodes[0]?.[2]).toBe('streaming completed')
    expect(staticDocument.nodes[0]?.[2]).toBe('static')
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
    const [firstDocument, secondDocument] = await Promise.all([first, second])

    expect(observed).toEqual(['first', 'second'])
    expect(firstDocument.nodes).toEqual([['p', {}, 'first']])
    expect(secondDocument.nodes).toEqual([['p', {}, 'second']])
    expect(engine.getDocument()).toBe(secondDocument)
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

    const validDocument = await engine.parse('valid', 'static')
    const failedDocument = await engine.parse('invalid', 'static')

    expect(failedDocument).toBe(validDocument)
    expect(engine.getDocument()).toBe(validDocument)
    await expect(engine.parse('recovered', 'static')).resolves.toMatchObject({
      nodes: [['p', {}, 'recovered']],
    })
  })

  it('enables CJK-friendly emphasis by default', async () => {
    const engine = createMarkmendParser()
    const document = await engine.parse('**中文加粗。**后文', 'static')

    expect(document.nodes).toEqual([
      ['p', {}, ['strong', {}, '中文加粗。'], '后文'],
    ])
  })
})
