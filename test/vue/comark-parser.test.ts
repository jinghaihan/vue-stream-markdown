import { describe, expect, it, vi } from 'vitest'
import { createComarkParserEngine } from '../../packages/vue/src/parser'

describe('comark parser engine', () => {
  it('completes only streaming input', async () => {
    const completion = vi.fn(markdown => `${markdown} completed`)
    const engine = createComarkParserEngine({ completion })

    const streaming = await engine.parse('streaming', 'streaming')
    const staticDocument = await engine.parse('static', 'static')

    expect(completion).toHaveBeenCalledOnce()
    expect(streaming.nodes[0]?.[2]).toBe('streaming completed')
    expect(staticDocument.nodes[0]?.[2]).toBe('static')
  })

  it('publishes queued parses in request order', async () => {
    const observed: string[] = []
    const engine = createComarkParserEngine({
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
    const engine = createComarkParserEngine({
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
})
