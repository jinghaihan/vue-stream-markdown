// @vitest-environment happy-dom
import { mount } from '@vue/test-utils'
import { describe, expect, it } from 'vitest'
import CodeContent from '../../packages/vue/src/components/renderers/code/content.vue'

function createTokens(htmlStyle?: Record<string, string>) {
  return {
    bg: '#fff',
    fg: '#000',
    themeName: 'test',
    tokens: [[{
      content: 'const value = 1',
      htmlStyle,
    }]],
  }
}

describe('code content', () => {
  it('keeps the code DOM when highlighted tokens arrive', async () => {
    const wrapper = mount(CodeContent, {
      props: {
        code: 'const value = 1',
        lang: 'typescript',
        languageClass: 'language-typescript',
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
  })
})
