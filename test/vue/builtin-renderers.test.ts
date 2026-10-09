// @vitest-environment happy-dom
import type { Component } from 'vue'
import type { CodeBlockNode, UIComponents } from 'vue-stream-markdown'
import { math } from '@stream-markdown/math'
import { flushPromises, mount } from '@vue/test-utils'
import { describe, expect, expectTypeOf, it, vi } from 'vitest'
import { defineComponent, h, markRaw, ref } from 'vue'
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
  it('composes a custom code body through pre while retaining the full source for fullscreen', async () => {
    expectTypeOf<Extract<keyof UIComponents, 'CodeBlock' | 'Table'>>().toEqualTypeOf<never>()
    const Button = markRaw(defineComponent({
      inheritAttrs: false,
      props: ['name'],
      setup(props, { attrs }) {
        return () => h('button', { ...attrs, 'data-custom-button': '' }, props.name)
      },
    }))
    const CustomCode = markRaw(defineComponent({
      inheritAttrs: false,
      props: ['node', 'nodeKey', 'loading'],
      setup(props) {
        return () => h(CodeBlockRenderer, props, {
          default: ({ node }: { node: CodeBlockNode }) => [
            h(CodeRenderer, { node: { ...node, value: node.value.slice(0, 4) }, nodeKey: props.nodeKey }),
            h('p', { 'data-display-notice': '' }, `${node.value.length} characters total`),
          ],
        })
      },
    }))
    const wrapper = mount(Markdown, {
      props: {
        content: '```js\nfull source\n```',
        mode: 'static',
        enableAnimate: false,
        components: { pre: CustomCode },
        uiComponents: { Button },
        controls: { code: { collapse: false, copy: false, download: false, fullscreen: true } },
      },
    })
    await vi.dynamicImportSettled()
    await flushPromises()
    expect(wrapper.get('[data-stream-markdown="code-line"]').text()).toBe('full')
    expect(wrapper.get('[data-display-notice]').text()).toBe('11 characters total')

    await wrapper.get('[data-custom-button]').trigger('click')
    await vi.dynamicImportSettled()
    await flushPromises()
    const fullscreen = document.querySelector('[data-stream-markdown="modal-body"]')
    expect(fullscreen?.textContent).toContain('full source')
    expect(fullscreen?.querySelector('[data-display-notice]')).toBeNull()
    wrapper.unmount()
  })

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

  it('renders only the code body by default and can enable its wrapper', async () => {
    const highlight = vi.fn(async () => ({ tokens: [[{ content: 'short', htmlStyle: { color: 'red' } }]] }))
    const showWrapper = ref<boolean>()
    const Body = markRaw(defineComponent({
      inheritAttrs: false,
      props: ['node', 'nodeKey'],
      setup(props) {
        return () => h(CodeRenderer, {
          node: { value: 'short', lang: 'js' },
          nodeKey: props.nodeKey,
          showWrapper: showWrapper.value,
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

    showWrapper.value = true
    await flushPromises()
    await vi.dynamicImportSettled()
    await flushPromises()
    expect(wrapper.find('[data-stream-markdown="code-block"]').exists()).toBe(true)
    expect(wrapper.get('[data-stream-markdown="code-line"]').text()).toBe('short')
    wrapper.unmount()
  })
})
