// @vitest-environment happy-dom
import type { MarkdownElement } from 'vue-stream-markdown'
import { flushPromises, mount } from '@vue/test-utils'
import { describe, expect, it, vi } from 'vitest'
import { defineComponent, h, markRaw, onMounted, onUnmounted } from 'vue'
import Markdown from '../../packages/vue/src/index.vue'

// These tests exercise Markdown processing, not background UI component loading.
vi.mock('../../packages/vue/src/utils', () => ({
  preloadAsyncComponents: async () => {},
}))

interface MarkdownTestVm {
  getDocument: () => { nodes: unknown[] }
}

interface MarkdownTestWrapper {
  setProps: (props: { content?: string, mode?: 'static' | 'streaming' }) => Promise<void>
}

describe('stream markdown', () => {
  it('runs extension lifecycle hooks', async () => {
    const preload = vi.fn(async () => {})
    const dispose = vi.fn(() => {})
    const wrapper = mount(Markdown, {
      props: {
        content: 'Paragraph',
        extensions: {
          mermaid: {
            preload,
            dispose,
            supports: () => true,
            render: async () => ({ valid: true }),
          },
        },
        mode: 'static',
      },
    })

    await flushPromises()
    expect(preload).toHaveBeenCalledOnce()
    expect(dispose).not.toHaveBeenCalled()

    wrapper.unmount()
    expect(dispose).toHaveBeenCalledOnce()
  })

  it('renders a Comark document asynchronously', async () => {
    const wrapper = mount(Markdown, {
      props: {
        content: '# Heading\n\nParagraph',
        enableAnimate: false,
        mode: 'streaming',
      },
    })

    await flushPromises()

    expect(wrapper.get('h1').text()).toBe('Heading')
    expect(wrapper.get('p').text()).toBe('Paragraph')
    expect((wrapper.vm as unknown as MarkdownTestVm).getDocument().nodes).toHaveLength(2)
    wrapper.unmount()
  })

  it('applies code fence line number metadata', async () => {
    const wrapper = mount(Markdown, {
      props: {
        content: '```ts startLine=10 noLineNumbers\nconst value = 1\n```',
        mode: 'static',
      },
    })

    await vi.dynamicImportSettled()
    await flushPromises()

    const code = wrapper.get('[data-stream-markdown="code"]')
    expect(code.attributes('data-start-line')).toBe('10')
    expect(code.attributes('data-show-line-numbers')).toBe('false')
    expect(code.attributes('style')).toContain('counter-reset: line 9')
    wrapper.unmount()
  })

  it('provides every document image to the image renderer', async () => {
    let sources: string[] | undefined
    const Image = markRaw(defineComponent({
      inheritAttrs: false,
      props: {
        sources: Array<string>,
        src: String,
      },
      setup(props) {
        sources = props.sources
        return () => h('img', { src: props.src })
      },
    }))
    const wrapper = mount(Markdown, {
      props: {
        content: [
          '![First](https://example.com/first.png)',
          '![Second](https://example.com/second.png)',
        ].join('\n\n'),
        mode: 'static',
        uiComponents: { Image },
      },
    })

    await flushPromises()
    await vi.dynamicImportSettled()
    await flushPromises()

    expect(sources).toEqual([
      'https://example.com/first.png',
      'https://example.com/second.png',
    ])
    wrapper.unmount()
  })

  it('preserves stable block elements while the tail grows', async () => {
    const wrapper = mount(Markdown, {
      props: {
        content: '# Stable\n\nTail',
        mode: 'streaming',
      },
    })
    const testWrapper = wrapper as unknown as MarkdownTestWrapper
    await flushPromises()
    const heading = wrapper.get('h1').element

    await testWrapper.setProps({ content: '# Stable\n\nTail grows' })
    await flushPromises()

    expect(wrapper.get('h1').element).toBe(heading)
    expect(wrapper.get('p').text()).toBe('Tail grows')
    wrapper.unmount()
  })

  it.each([
    '| Name | Age |\n| --- | --- |',
    '| Name | Age |\n| --- | --- |\n| Alice | 30 |',
  ])('hides the streaming caret inside tables without clearing table loading', async (content) => {
    const wrapper = mount(Markdown, {
      props: {
        caret: 'block',
        content,
        enableAnimate: false,
        mode: 'streaming',
      },
    })

    await vi.dynamicImportSettled()
    await flushPromises()

    expect(wrapper.get('[data-stream-markdown="table"]')).toBeTruthy()
    expect(wrapper.find('[data-stream-markdown="caret"]').exists()).toBe(false)
    expect(wrapper.find('[data-stream-markdown="spin"]').exists()).toBe(true)
    wrapper.unmount()
  })

  it('shows the streaming caret in text following a table', async () => {
    const wrapper = mount(Markdown, {
      props: {
        caret: 'circle',
        content: [
          '| Name | Age |',
          '| --- | --- |',
          '| Alice | 30 |',
          '',
          'Following text',
        ].join('\n'),
        enableAnimate: false,
        mode: 'streaming',
      },
    })

    await vi.dynamicImportSettled()
    await flushPromises()

    expect(wrapper.get('p [data-stream-markdown="caret"]').text()).toBe('●')
    expect(wrapper.find('table [data-stream-markdown="caret"]').exists()).toBe(false)
    wrapper.unmount()
  })

  it('parses emphasis next to CJK text consistently', async () => {
    const wrapper = mount(Markdown, {
      props: {
        content: '**中文加粗。**后文\n\n*日本語の強調。*後文\n\n~~한국어 삭제.~~다음',
        enableAnimate: false,
        mode: 'static',
      },
    })

    await flushPromises()

    expect(wrapper.get('strong').text()).toBe('中文加粗。')
    expect(wrapper.get('em').text()).toBe('日本語の強調。')
    expect(wrapper.get('del').text()).toBe('한국어 삭제.')
    expect(wrapper.text()).not.toContain('**')
    expect(wrapper.text()).not.toContain('~~')
    wrapper.unmount()
  })

  it('ignores code content when detecting text direction', async () => {
    const wrapper = mount(Markdown, {
      props: {
        content: [
          'مرحبا `const englishIdentifierContainsManyLetters = true`',
          'Hello `مرحبا بالعالم هذا نص عربي طويل`',
        ].join('\n\n'),
        dir: 'auto',
        enableAnimate: false,
        mode: 'static',
      },
    })

    await flushPromises()

    const paragraphs = wrapper.findAll('p')
    expect(paragraphs[0]?.attributes('dir')).toBe('rtl')
    expect(paragraphs[1]?.attributes('dir')).toBe('ltr')
    expect(wrapper.findAll('code').every(code => code.attributes('dir') === 'ltr')).toBe(true)
    wrapper.unmount()
  })

  it('does not expose transient math errors while streaming', async () => {
    const wrapper = mount(Markdown, {
      props: {
        content: '$$\n\\frac{1}{',
        enableAnimate: false,
        mode: 'streaming',
      },
    })

    await vi.dynamicImportSettled()
    await flushPromises()

    expect(wrapper.find('[data-stream-markdown="error-component"]').exists()).toBe(false)
    wrapper.unmount()
  })

  it('passes raw Comark nodes to custom components', async () => {
    let receivedNode: MarkdownElement | undefined
    const Callout = defineComponent({
      inheritAttrs: false,
      props: ['node', 'type'],
      setup(props, { slots }) {
        receivedNode = props.node as MarkdownElement
        return () => h('aside', { 'data-type': props.type }, slots.default?.())
      },
    })
    const wrapper = mount(Markdown, {
      props: {
        components: { callout: markRaw(Callout) },
        content: '::callout{type="info"}\nNotice\n::',
        mode: 'static',
      },
    })

    await flushPromises()

    expect(wrapper.get('aside').attributes('data-type')).toBe('info')
    expect(wrapper.get('aside').text()).toBe('Notice')
    expect(receivedNode?.[0]).toBe('callout')
    wrapper.unmount()
  })

  it('renders configured literal tag content without Markdown formatting', async () => {
    const Mention = markRaw(defineComponent({
      setup(_props, { slots }) {
        return () => h('span', { 'data-mention': '' }, slots.default?.())
      },
    }))
    const wrapper = mount(Markdown, {
      props: {
        components: { mention: Mention },
        content: '<mention>@_some_username_</mention>',
        literalTagContent: ['mention'],
        mode: 'static',
      },
    })

    await flushPromises()

    expect(wrapper.get('[data-mention]').text()).toBe('@_some_username_')
    expect(wrapper.find('em').exists()).toBe(false)
    wrapper.unmount()
  })

  it('keeps custom components mounted when switching to static mode', async () => {
    let mountCount = 0
    let unmountCount = 0
    const Heading = markRaw(defineComponent({
      inheritAttrs: false,
      setup(_props, { slots }) {
        onMounted(() => mountCount += 1)
        onUnmounted(() => unmountCount += 1)
        return () => h('h1', slots.default?.())
      },
    }))
    const wrapper = mount(Markdown, {
      props: {
        components: { h1: Heading },
        content: '# Heading',
        mode: 'streaming',
      },
    })
    const testWrapper = wrapper as unknown as MarkdownTestWrapper
    await flushPromises()

    expect(mountCount).toBe(1)
    expect(unmountCount).toBe(0)

    await testWrapper.setProps({ mode: 'static' })
    await flushPromises()

    expect(mountCount).toBe(1)
    expect(unmountCount).toBe(0)

    wrapper.unmount()
    expect(unmountCount).toBe(1)
  })

  it('disables only the loading link and restores it in static mode', async () => {
    const wrapper = mount(Markdown, {
      props: {
        content: '[Link](https://example.com)',
        mode: 'streaming',
      },
    })
    const testWrapper = wrapper as unknown as MarkdownTestWrapper
    await vi.dynamicImportSettled()
    await flushPromises()
    const link = wrapper.get('[data-stream-markdown="link"]')

    expect(link.attributes('data-stream-markdown-loading')).toBe('true')
    expect(link.classes()).toContain('data-[stream-markdown-loading=true]:no-underline')

    await testWrapper.setProps({ mode: 'static' })
    await flushPromises()

    expect(wrapper.get('[data-stream-markdown="link"]').element).toBe(link.element)
    expect(link.attributes('data-stream-markdown-loading')).toBeUndefined()
    expect(link.classes()).toContain('underline')
    wrapper.unmount()
  })

  it('renders footnote back references as icon buttons', async () => {
    const wrapper = mount(Markdown, {
      props: {
        content: 'Reference[^note]\n\n[^note]: Definition',
        enableAnimate: false,
        mode: 'static',
      },
    })

    await vi.dynamicImportSettled()
    await flushPromises()

    const control = wrapper.get('[data-stream-markdown="footnote-definition-button"]')
    const button = control.get('button')
    expect(button.attributes('aria-label')).toBe('Back')
    expect(button.find('svg').exists()).toBe(true)
    expect(wrapper.find('a.footnote-backref').exists()).toBe(false)
    wrapper.unmount()
  })
})
