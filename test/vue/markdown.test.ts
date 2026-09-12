// @vitest-environment happy-dom
import type { MarkdownElement } from 'vue-stream-markdown'
import { flushPromises, mount } from '@vue/test-utils'
import { describe, expect, it, vi } from 'vitest'
import { defineComponent, h, markRaw, onMounted, onUnmounted } from 'vue'
import MinimalVariant from '../../packages/vue/src/components/code-block/variants/minimal.vue'
import Markdown from '../../packages/vue/src/index.vue'
import footnoteContent from '../../playground/nuxt/app/markdown/footnote.md?raw'

// These tests exercise Markdown processing, not background UI component loading.
vi.mock('../../packages/vue/src/utils', async () => ({
  ...await vi.importActual<typeof import('../../packages/vue/src/utils')>('../../packages/vue/src/utils'),
  preloadAsyncComponents: async () => {},
}))

interface MarkdownTestVm {
  getDocument: () => { nodes: unknown[] }
}

interface MarkdownTestWrapper {
  setProps: (props: { content?: string, enableAnimate?: boolean, mode?: 'static' | 'streaming' }) => Promise<void>
}

describe('stream markdown', () => {
  it.each(['static', 'streaming'] as const)('renders sanitized and empty HTML links as inert text in %s mode', async (mode) => {
    const wrapper = mount(Markdown, {
      props: {
        content: '<a href="javascript:alert(1)">Unsafe link</a>\n\n<a href="">Empty link</a>',
        enableAnimate: false,
        mode,
      },
    })

    await vi.dynamicImportSettled()
    await flushPromises()

    expect(wrapper.text()).toContain('Unsafe link')
    expect(wrapper.text()).toContain('Empty link')
    expect(wrapper.findAll('a').map(link => link.html())).toEqual([])
    expect(wrapper.find('[data-stream-markdown="link-favicon"]').exists()).toBe(false)
    wrapper.unmount()
  })

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

  it('emits end after the final static document is flushed', async () => {
    const end = vi.fn()
    const wrapper = mount(Markdown, {
      props: {
        content: 'Content with a footnote.[^note]\n\n[^note]: Definition',
        mode: 'static',
        onEnd: end,
      },
    })

    await flushPromises()

    expect(end).toHaveBeenCalledOnce()
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

  it.each(['modern', 'classic', 'minimal'] as const)('renders the %s code block variant', async (variant) => {
    const wrapper = mount(Markdown, {
      props: {
        content: '```ts\nconst value = 1\n```',
        codeOptions: { variant },
        mode: 'static',
      },
    })

    await vi.dynamicImportSettled()
    await flushPromises()

    expect(wrapper.get('[data-stream-markdown="code-block"]').attributes('data-variant')).toBe(variant)
    wrapper.unmount()
  })

  it('does not render a collapse control for minimal code blocks', async () => {
    const wrapper = mount(Markdown, {
      props: {
        content: '```ts\nconst value = 1\n```',
        codeOptions: { variant: 'minimal' },
        controls: { code: { collapse: true } },
        mode: 'static',
      },
    })

    await vi.dynamicImportSettled()
    await flushPromises()

    expect(wrapper.find('[aria-label="Collapse"]').exists()).toBe(false)
    wrapper.unmount()
  })

  it('keeps minimal code block actions floating over the code', () => {
    const wrapper = mount(MinimalVariant, {
      props: {
        collapsed: false,
        loading: false,
        actionCount: 3,
        setScrollRef: () => {},
      },
      slots: {
        actions: () => h('button', 'Copy'),
      },
    })

    const actions = wrapper.get('[data-stream-markdown="actions"]')
    expect(actions.classes()).toContain('absolute')
    expect(actions.classes()).toContain('right-4')
    expect(actions.classes()).not.toContain('shrink-0')
    expect(wrapper.get('[data-stream-markdown="fade-overlay"]').attributes('style')).toContain('width: 163px')
    wrapper.unmount()
  })

  it('gives minimal Mermaid previews a definite minimum height', async () => {
    const wrapper = mount(Markdown, {
      props: {
        content: '```mermaid\ngraph TD\n```',
        codeOptions: { variant: 'minimal' },
        extensions: {
          mermaid: {
            preload: async () => {},
            dispose: () => {},
            supports: () => true,
            render: async () => ({ valid: true, svg: '<svg width="100" height="50"></svg>' }),
          },
        },
        mode: 'static',
      },
    })

    await vi.dynamicImportSettled()
    await flushPromises()

    expect(wrapper.get('[data-stream-markdown="mermaid-previewer"]').attributes('style'))
      .toContain('height: 128px')
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

  it('preserves list item text when a nested list starts streaming', async () => {
    const parent = '- Stable blocks are reused as the tail grows\n- Only unfinished content keeps changing'
    const wrapper = mount(Markdown, {
      props: {
        content: parent,
        enableAnimate: true,
        mode: 'streaming',
      },
    })
    const testWrapper = wrapper as unknown as MarkdownTestWrapper
    await flushPromises()

    const findOnlyText = () => wrapper.findAll('[data-stream-markdown="text"]')
      .find(node => node.text().includes('Only'))!
    const text = findOnlyText()
    expect(text.element.parentElement?.tagName).toBe('P')

    await testWrapper.setProps({ content: `${parent}\n  - t` })
    await flushPromises()

    expect(findOnlyText().element).toBe(text.element)
    expect(wrapper.findAll('ul')).toHaveLength(2)
    wrapper.unmount()
  })

  it('does not rerender a stable top-level block while the tail grows', async () => {
    let renderCount = 0
    const Callout = markRaw(defineComponent({
      setup(_props, { slots }) {
        return () => {
          renderCount += 1
          return h('aside', slots.default?.())
        }
      },
    }))
    const wrapper = mount(Markdown, {
      props: {
        components: { callout: Callout },
        content: '::callout\nStable\n::\n\nTail',
        mode: 'streaming',
      },
    })
    const testWrapper = wrapper as unknown as MarkdownTestWrapper
    await flushPromises()
    expect(renderCount).toBe(1)

    await testWrapper.setProps({ content: '::callout\nStable\n::\n\nTail grows' })
    await flushPromises()

    expect(renderCount).toBe(1)
    wrapper.unmount()
  })

  it('keeps generated footnotes stable when later blocks arrive', async () => {
    const wrapper = mount(Markdown, {
      props: {
        content: 'Reference[^note]\n\n[^note]: Definition',
        enableAnimate: false,
        mode: 'streaming',
      },
    })
    const testWrapper = wrapper as unknown as MarkdownTestWrapper
    await flushPromises()
    const footnotes = wrapper.get('section').element

    await testWrapper.setProps({
      content: 'Reference[^note]\n\n[^note]: Definition\n\n## Later',
    })
    await flushPromises()

    expect(wrapper.get('section').element).toBe(footnotes)
    wrapper.unmount()
  })

  it('renders animated footnote definitions', async () => {
    const wrapper = mount(Markdown, {
      props: {
        content: 'Reference[^note]\n\n[^note]: Definition',
        mode: 'streaming',
      },
    })
    await vi.dynamicImportSettled()
    await flushPromises()

    expect(wrapper.text()).toContain('Definition')
    expect(wrapper.find('[data-stream-markdown="footnote-definition-button"]').exists()).toBe(true)
    wrapper.unmount()
  })

  it('keeps unresolved footnote markers invisible until their definitions arrive', async () => {
    const wrapper = mount(Markdown, { props: { content: 'Text[^note]', mode: 'streaming' } })
    const update = wrapper as unknown as MarkdownTestWrapper
    await flushPromises()
    expect(wrapper.get('span[hidden]').isVisible()).toBe(false)
    const text = wrapper.get('[data-stream-markdown="text-word"]').element
    await update.setProps({ content: 'Text[^note]\n\n[^note]: Definition' })
    await vi.dynamicImportSettled()
    await flushPromises()
    expect(wrapper.find('span[hidden]').exists()).toBe(false)
    expect(wrapper.get('.footnote-ref').isVisible()).toBe(true)
    expect(wrapper.get('#fn-note').text()).toContain('Definition')
    expect(wrapper.get('[data-stream-markdown="text-word"]').element).toBe(text)
    wrapper.unmount()
  })

  it('grows all four late footnotes without replacing settled text or waiting for static mode', async () => {
    const content = footnoteContent
    const start = content.indexOf('\n[^1]:')
    const wrapper = mount(Markdown, { props: { content: content.slice(0, start), mode: 'streaming' } })
    const update = wrapper as unknown as MarkdownTestWrapper
    await flushPromises()
    const bodyWord = wrapper.get('[data-stream-markdown="text-word"]').element
    const footnoteElements = new Map<string, Element>()
    for (let index = start + 1; index <= content.length; index++) {
      const input = content.slice(0, index)
      await update.setProps({ content: input })
      await flushPromises()
      expect(wrapper.get('[data-stream-markdown="text-word"]').element).toBe(bodyWord)
      for (const match of input.matchAll(/^\[\^([1-4])\]:(.*)$/gm)) {
        const id = `fn-${match[1]}`
        const item = wrapper.get(`[id="${id}"]`)
        const definition = match[2]!.trim()
        // A lone opening link bracket is intentionally hidden by completion.
        if (definition !== '[')
          expect(item.text()).toContain(definition)
        if (footnoteElements.has(id))
          expect(item.element).toBe(footnoteElements.get(id))
        footnoteElements.set(id, item.element)
      }
    }
    expect(footnoteElements.size).toBe(4)
    const before = wrapper.text()
    await update.setProps({ mode: 'static' })
    await flushPromises()
    expect(wrapper.text()).toBe(before)
    for (const [id, element] of footnoteElements)
      expect(wrapper.get(`[id="${id}"]`).element).toBe(element)
    wrapper.unmount()
  })

  it('flushes footnote definitions when streaming switches to static mode', async () => {
    const content = 'Reference[^note]\n\n[^note]: Definition\n\n## Later\n\nMore'
    const wrapper = mount(Markdown, {
      props: {
        content,
        enableAnimate: false,
        mode: 'streaming',
      },
    })
    const testWrapper = wrapper as unknown as MarkdownTestWrapper
    await flushPromises()

    await testWrapper.setProps({ mode: 'static' })
    await flushPromises()

    expect(wrapper.text()).toContain('Definition')
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

  it('removes streaming text animations when switching to static mode', async () => {
    const wrapper = mount(Markdown, {
      props: {
        animation: 'fade-in',
        enableAnimate: true,
        content: 'Animated text',
        mode: 'streaming',
      },
    })
    const testWrapper = wrapper as unknown as MarkdownTestWrapper
    await flushPromises()

    expect(wrapper.find('.stream-markdown-text-fade-in').exists()).toBe(true)

    await testWrapper.setProps({ enableAnimate: false, mode: 'static' })
    await flushPromises()

    expect(wrapper.find('.stream-markdown-text-fade-in').exists()).toBe(false)
    wrapper.unmount()
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

  it('shows favicons by default without shifting while they load', async () => {
    const wrapper = mount(Markdown, {
      props: {
        content: '[Link](https://example.com/docs)',
        mode: 'static',
      },
    })

    await vi.dynamicImportSettled()
    await flushPromises()

    const slot = wrapper.get('[data-stream-markdown="link-favicon"]')
    const placeholder = slot.get('[data-stream-markdown="link-favicon-placeholder"]')
    const image = slot.get('[data-stream-markdown="link-favicon-image"]')
    expect(image.attributes('src')).toBe('https://example.com/favicon.ico')
    expect(image.classes()).toContain('opacity-0')
    expect(placeholder.element).toBeTruthy()

    await image.trigger('load')
    expect(slot.find('[data-stream-markdown="link-favicon-placeholder"]').exists()).toBe(false)
    expect(image.classes()).toContain('opacity-100')
    wrapper.unmount()
  })

  it('supports disabling and customizing link favicons', async () => {
    const disabled = mount(Markdown, {
      props: {
        content: '[Link](https://example.com)',
        linkOptions: { favicon: false },
        mode: 'static',
      },
    })
    await vi.dynamicImportSettled()
    await flushPromises()
    expect(disabled.find('[data-stream-markdown="link-favicon"]').exists()).toBe(false)
    disabled.unmount()

    const resolver = vi.fn((url: string) => `https://icons.example.com/?url=${encodeURIComponent(url)}`)
    const customized = mount(Markdown, {
      props: {
        content: '[Link](https://example.com/docs)',
        linkOptions: { favicon: resolver },
        mode: 'static',
      },
    })
    await vi.dynamicImportSettled()
    await flushPromises()
    expect(customized.get('[data-stream-markdown="link-favicon-image"]').attributes('src'))
      .toBe('https://icons.example.com/?url=https%3A%2F%2Fexample.com%2Fdocs')
    expect(resolver).toHaveBeenCalledWith('https://example.com/docs')
    customized.unmount()
  })

  it('keeps the favicon placeholder while a destination is incomplete and falls back to a globe', async () => {
    const wrapper = mount(Markdown, {
      props: {
        content: '[Link](https://example.com',
        mode: 'streaming',
      },
    })
    const testWrapper = wrapper as unknown as MarkdownTestWrapper
    await vi.dynamicImportSettled()
    await flushPromises()

    const slot = wrapper.get('[data-stream-markdown="link-favicon"]')
    expect(slot.find('[data-stream-markdown="link-favicon-placeholder"]').exists()).toBe(true)
    expect(slot.find('[data-stream-markdown="link-favicon-image"]').exists()).toBe(false)

    await testWrapper.setProps({
      content: '[Link](https://example.com)',
      mode: 'static',
    })
    await flushPromises()
    const image = slot.get('[data-stream-markdown="link-favicon-image"]')
    await image.trigger('error')
    await vi.dynamicImportSettled()
    await flushPromises()

    expect(slot.find('[data-stream-markdown="link-favicon-placeholder"]').exists()).toBe(false)
    expect(slot.find('[data-stream-markdown="link-favicon-fallback"]').exists()).toBe(true)
    wrapper.unmount()
  })

  it('uses a mail icon for email links without a website favicon', async () => {
    const MailIcon = defineComponent({
      setup(_, { attrs }) {
        return () => h('svg', { ...attrs, 'data-icon': 'mail' })
      },
    })
    const wrapper = mount(Markdown, {
      props: {
        content: '[Email](mailto:hello@example.com)',
        icons: { mail: MailIcon },
        mode: 'static',
      },
    })

    await vi.dynamicImportSettled()
    await flushPromises()

    expect(wrapper.get('[data-stream-markdown="link-favicon-fallback"] [data-icon="mail"]')).toBeTruthy()
    wrapper.unmount()
  })

  it('replaces the link caret with a spinner while waiting for its destination', async () => {
    const wrapper = mount(Markdown, {
      props: {
        caret: 'block',
        content: '[Link](',
        mode: 'streaming',
      },
    })
    const testWrapper = wrapper as unknown as MarkdownTestWrapper
    await vi.dynamicImportSettled()
    await flushPromises()

    expect(wrapper.find('[data-stream-markdown="caret"]').exists()).toBe(false)
    expect(wrapper.find('[data-stream-markdown="spin"]').exists()).toBe(true)

    await testWrapper.setProps({ content: '[Link](https://example.com' })
    await flushPromises()

    expect(wrapper.find('[data-stream-markdown="caret"]').exists()).toBe(false)
    expect(wrapper.find('[data-stream-markdown="spin"]').exists()).toBe(true)

    await testWrapper.setProps({ content: '[Link](https://example.com)' })
    await flushPromises()

    expect(wrapper.find('[data-stream-markdown="spin"]').exists()).toBe(false)
    wrapper.unmount()
  })

  it('keeps the caret while the link label is incomplete', async () => {
    const wrapper = mount(Markdown, {
      props: {
        caret: 'block',
        content: '[Link',
        mode: 'streaming',
      },
    })
    await vi.dynamicImportSettled()
    await flushPromises()

    expect(wrapper.find('[data-stream-markdown="caret"]').exists()).toBe(true)
    expect(wrapper.find('[data-stream-markdown="spin"]').exists()).toBe(false)
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
