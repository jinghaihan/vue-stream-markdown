// @vitest-environment happy-dom
import type { CodeExtension, MermaidExtension } from '@stream-markdown/core'
import { flushPromises, mount } from '@vue/test-utils'
import { describe, expect, it, vi } from 'vitest'
import { defineComponent, h } from 'vue'
import Markdown from '../../packages/vue/src/index.vue'
import MarkdownProvider from '../../packages/vue/src/provider.vue'

vi.mock('../../packages/vue/src/utils', () => ({
  preloadAsyncComponents: async () => {},
}))

function createMermaidExtension(): MermaidExtension {
  return {
    preload: vi.fn(async () => {}),
    dispose: vi.fn(() => {}),
    supports: () => true,
    render: async () => ({ valid: true }),
  }
}

describe('markdown provider', () => {
  it('shares extension lifecycle and theme defaults across instances', async () => {
    const observe = vi.spyOn(window.MutationObserver.prototype, 'observe')
    const mermaid = createMermaidExtension()
    const App = defineComponent(() => () => h(
      MarkdownProvider,
      { extensions: { mermaid }, isDark: true },
      {
        default: () => [
          h(Markdown, { content: 'First', mode: 'static' }),
          h(Markdown, { content: 'Second', isDark: false, mode: 'static' }),
        ],
      },
    ))
    const wrapper = mount(App)

    await flushPromises()

    const markdownRoots = wrapper.findAll('.stream-markdown')
    expect(markdownRoots).toHaveLength(2)
    expect(markdownRoots[0]!.classes()).toContain('dark')
    expect(markdownRoots[1]!.classes()).toContain('light')
    expect(mermaid.preload).toHaveBeenCalledOnce()
    expect(mermaid.dispose).not.toHaveBeenCalled()
    // The provider observes its theme element and document root; children add none.
    expect(observe).toHaveBeenCalledTimes(2)

    wrapper.unmount()
    expect(mermaid.dispose).toHaveBeenCalledOnce()
    observe.mockRestore()
  })

  it('allows an instance to disable an inherited extension', async () => {
    const code: CodeExtension = {
      preload: vi.fn(async () => {}),
      dispose: vi.fn(() => {}),
      highlight: vi.fn(async () => ({ tokens: [] })),
    }
    const App = defineComponent(() => () => h(
      MarkdownProvider,
      { extensions: { code } },
      {
        default: () => h(Markdown, {
          content: '```ts\nconst value = true\n```',
          extensions: { code: false },
          mode: 'static',
        }),
      },
    ))
    const wrapper = mount(App)

    await vi.dynamicImportSettled()
    await flushPromises()

    expect(code.preload).toHaveBeenCalledOnce()
    expect(code.highlight).not.toHaveBeenCalled()
    expect(wrapper.get('[data-stream-markdown="code"]').text()).toContain('const value = true')

    wrapper.unmount()
    expect(code.dispose).toHaveBeenCalledOnce()
  })

  it('gives an instance ownership of a replacement extension', async () => {
    const inheritedMermaid = createMermaidExtension()
    const localMermaid = createMermaidExtension()
    const App = defineComponent(() => () => h(
      MarkdownProvider,
      { extensions: { mermaid: inheritedMermaid } },
      {
        default: () => h(Markdown, {
          content: 'Paragraph',
          extensions: { mermaid: localMermaid },
          mode: 'static',
        }),
      },
    ))
    const wrapper = mount(App)

    await flushPromises()
    expect(inheritedMermaid.preload).toHaveBeenCalledOnce()
    expect(localMermaid.preload).toHaveBeenCalledOnce()

    wrapper.unmount()
    expect(inheritedMermaid.dispose).toHaveBeenCalledOnce()
    expect(localMermaid.dispose).toHaveBeenCalledOnce()
  })
})
