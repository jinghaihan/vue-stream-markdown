// @vitest-environment happy-dom
import type { Component } from 'vue'
import { math } from '@stream-markdown/math'
import { flushPromises, mount } from '@vue/test-utils'
import { describe, expect, it, vi } from 'vitest'
import { defineComponent, h, markRaw } from 'vue'
import { CodeBlockRenderer, CodeRenderer, ImageRenderer, LinkRenderer, Markdown, MathRenderer, TableRenderer } from 'vue-stream-markdown'

vi.mock('../../packages/vue/src/utils', async () => ({
  ...await vi.importActual<typeof import('../../packages/vue/src/utils')>('../../packages/vue/src/utils'),
  preloadAsyncComponents: async () => {},
}))

function wrapRenderer(renderer: Component) {
  return markRaw(defineComponent({
    inheritAttrs: false,
    props: ['node', 'loading', 'nodeKey'],
    setup(props) {
      return () => h(renderer, props)
    },
  }))
}

describe('public built-in renderers', () => {
  it.each([
    ['pre', CodeBlockRenderer, '```js\nconst value = 1\n```', '[data-stream-markdown="code-block"]'],
    ['a', LinkRenderer, '[**Example**](https://example.com)', '[data-stream-markdown="link"]'],
    ['img', ImageRenderer, '![Example](https://example.com/image.png)', '[data-stream-markdown="image-figure"]'],
    ['math', MathRenderer, '$$\nx^2\n$$', '[data-stream-markdown="math"]'],
    ['table', TableRenderer, '| Name |\n| --- |\n| **Example** |', '[data-stream-markdown="table"]'],
  ] as const)('preserves official rendering when wrapping %s', async (tag, renderer, content, selector) => {
    const Strong = markRaw(defineComponent({
      setup(_props, { slots }) {
        return () => h('strong', { 'data-custom-strong': '' }, slots.default?.())
      },
    }))
    const props = {
      content,
      mode: 'static' as const,
      enableAnimate: false,
      linkOptions: { favicon: false },
      codeOptions: { lineNumbers: false },
      extensions: { math: math() },
    }
    const original = mount(Markdown, { props: { ...props, components: { strong: Strong } } })
    const wrapped = mount(Markdown, { props: { ...props, components: { strong: Strong, [tag]: wrapRenderer(renderer) } } })
    await vi.dynamicImportSettled()
    await flushPromises()

    expect(original.find(selector).exists()).toBe(true)
    const renderedElements = (wrapper: typeof original) => wrapper.findAll('*').map(element => ({
      tag: element.element.tagName,
      attributes: element.attributes(),
      text: element.element.textContent,
    }))
    await vi.waitFor(() => expect(renderedElements(wrapped)).toEqual(renderedElements(original)))
    original.unmount()
    wrapped.unmount()
  })

  it('retains link destination feedback when wrapping a streaming link', async () => {
    const wrapper = mount(Markdown, {
      props: {
        components: { a: wrapRenderer(LinkRenderer) },
        content: '[Example](https://exa',
        mode: 'streaming',
        enableAnimate: false,
      },
    })
    await vi.dynamicImportSettled()
    await flushPromises()
    expect(wrapper.find('[data-stream-markdown="spin"]').exists()).toBe(true)
    expect(wrapper.find('[data-stream-markdown="caret"]').exists()).toBe(false)

    const testWrapper = wrapper as unknown as { setProps: (props: { content: string }) => Promise<void> }
    await testWrapper.setProps({ content: '[Example](https://example.com)\n\nDone' })
    await flushPromises()
    expect(wrapper.find('[data-stream-markdown="spin"]').exists()).toBe(false)
    expect(wrapper.get('a').attributes('href')).toBe('https://example.com/')
    wrapper.unmount()
  })

  it('renders a code body without a header using the configured highlighting extension', async () => {
    const highlight = vi.fn(async () => ({ tokens: [[{ content: 'short', htmlStyle: { color: 'red' } }]] }))
    const Body = markRaw(defineComponent({
      inheritAttrs: false,
      props: ['node', 'nodeKey'],
      setup(props) {
        return () => h(CodeRenderer, {
          node: { value: 'short', lang: 'js' },
          nodeKey: props.nodeKey,
          showHeader: false,
        })
      },
    }))
    const wrapper = mount(Markdown, {
      props: {
        components: { pre: Body },
        content: '```js\nfull source\n```',
        mode: 'static',
        extensions: { code: { preload: async () => {}, dispose: () => {}, highlight } },
      },
    })
    await vi.dynamicImportSettled()
    await flushPromises()
    expect(wrapper.find('[data-stream-markdown="code-block"]').exists()).toBe(false)
    expect(wrapper.get('[data-stream-markdown="code-line"]').text()).toBe('short')
    expect(highlight).toHaveBeenCalledWith({ code: 'short', language: 'js', isDark: false })
    expect(wrapper.get('[data-stream-markdown="code-line"] span').attributes('style')).toContain('color: red')
    wrapper.unmount()
  })
})
