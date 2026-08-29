// @vitest-environment happy-dom
import { flushPromises, mount } from '@vue/test-utils'
import { describe, expect, it, vi } from 'vitest'
import CodeContent from '../../packages/vue/src/components/renderers/code/content.vue'

function createTokens(htmlStyle?: Record<string, string>) {
  return {
    bg: '#fff',
    fg: '#000',
    themeName: 'test',
    tokens: [[{
      content: 'const value = 1',
      offset: 0,
      ...(htmlStyle ? { htmlStyle } : { color: '#f00' }),
    }]],
  }
}

describe('code content', () => {
  it('keeps the code DOM when highlighted tokens arrive', async () => {
    const getShiki = vi.fn()
    const wrapper = mount(CodeContent, {
      props: {
        code: 'const value = 1',
        lang: 'typescript',
        languageClass: 'language-typescript',
        getShiki: getShiki as never,
      },
    })
    const container = wrapper.element
    const pre = wrapper.get('pre').element
    const line = wrapper.get('[data-stream-markdown="code-line"]').element

    await wrapper.setProps({
      tokens: createTokens({ color: '#0f0' }),
    } as never)

    expect(wrapper.element).toBe(container)
    expect(wrapper.get('pre').element).toBe(pre)
    expect(wrapper.get('[data-stream-markdown="code-line"]').element).toBe(line)
    expect(wrapper.attributes('data-stream-markdown')).toBe('shiki')
    expect(getShiki).not.toHaveBeenCalled()
  })

  it('loads the token style helper only when a result needs it', async () => {
    const getShiki = vi.fn(async () => ({
      getTokenStyleObject: () => ({ color: '#f00' }),
    }))
    const wrapper = mount(CodeContent, {
      props: {
        code: 'const value = 1',
        lang: 'typescript',
        languageClass: 'language-typescript',
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
