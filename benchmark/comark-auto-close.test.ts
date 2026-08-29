import { createMarkdownParser } from 'comark'
import { describe, expect, it } from 'vitest'

describe('patched Comark autoClose', () => {
  it('runs a custom function on the unstable tail before pre plugins', async () => {
    const events: Array<[stage: string, markdown: string]> = []
    const parse = createMarkdownParser({
      autoClose(markdown) {
        events.push(['autoClose', markdown])
        return `${markdown}\n<!-- completed -->`
      },
      plugins: [{
        name: 'observe-pre',
        pre(state) {
          events.push(['pre', state.markdown])
        },
      }],
    })

    await parse('# Stable\n\nFirst paragraph', { streaming: true })
    events.length = 0
    await parse('# Stable\n\nFirst paragraph extended', { streaming: true })

    expect(events).toEqual([
      ['autoClose', '\nFirst paragraph extended'],
      ['pre', '\nFirst paragraph extended\n<!-- completed -->'],
    ])
  })
})
