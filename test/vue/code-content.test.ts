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
  it('starts line numbers at the requested line', () => {
    const wrapper = mount(CodeContent, {
      props: {
        code: 'first\nsecond',
        lang: 'typescript',
        languageClass: 'language-typescript',
        startLine: 10,
      },
    })

    const pre = wrapper.get('pre')
    expect(pre.attributes('data-start-line')).toBe('10')
    expect(pre.attributes('style')).toContain('counter-reset: line 9')
  })

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

  it.each<[number, string, string]>([
    [98, '2ch', '3ch'],
    [998, '3ch', '4ch'],
    [9998, '4ch', '5ch'],
  ])('widens the line number gutter when code starting at %i crosses a digit boundary', async (startLine, before, after) => {
    const wrapper = mount(CodeContent, {
      props: {
        code: 'first\nsecond',
        lang: 'typescript',
        languageClass: 'language-typescript',
        startLine,
      },
    })
    const pre = wrapper.get('pre').element
    expect(pre.style.getPropertyValue('--stream-markdown-line-number-width')).toBe(before)
    await wrapper.setProps({ code: 'first\nsecond\nthird' } as never)
    expect(pre.style.getPropertyValue('--stream-markdown-line-number-width')).toBe(after)
    await wrapper.setProps({ showLineNumbers: false } as never)
    expect(pre.style.getPropertyValue('--stream-markdown-line-number-width')).toBe('')
    wrapper.unmount()
  })
})
