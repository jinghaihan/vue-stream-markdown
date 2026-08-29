// @vitest-environment happy-dom
import { flushPromises, mount } from '@vue/test-utils'
import { describe, expect, it, vi } from 'vitest'
import ShikiTokensRenderer from '../../packages/vue/src/components/renderers/code/shiki-token-renderer.vue'

function createTokens(htmlStyle?: Record<string, string>) {
  return {
    bg: '#fff',
    fg: '#000',
    themeName: 'test',
    tokens: [[{
      content: 'const',
      offset: 0,
      ...(htmlStyle ? { htmlStyle } : { color: '#f00' }),
    }]],
  }
}

describe('shiki token renderer', () => {
  it('loads the token style helper only when a result needs it', async () => {
    const getShiki = vi.fn(async () => ({
      getTokenStyleObject: () => ({ color: '#f00' }),
    }))
    const wrapper = mount(ShikiTokensRenderer, {
      props: {
        tokens: createTokens({ color: '#0f0' }) as never,
        getShiki: getShiki as never,
      },
    })

    await flushPromises()
    expect(getShiki).not.toHaveBeenCalled()

    await wrapper.setProps({ tokens: createTokens() } as never)
    await flushPromises()
    expect(getShiki).toHaveBeenCalledOnce()
  })
})
