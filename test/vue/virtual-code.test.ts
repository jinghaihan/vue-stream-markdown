import type { CodeBlockNode } from 'vue-stream-markdown'
// @vitest-environment happy-dom
import { flushPromises, mount } from '@vue/test-utils'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { defineComponent, h, markRaw } from 'vue'
import { CodeBlockRenderer, CodeRenderer, Markdown } from 'vue-stream-markdown'

vi.mock('../../packages/vue/src/utils', async () => ({
  ...await vi.importActual<typeof import('../../packages/vue/src/utils')>('../../packages/vue/src/utils'),
  preloadAsyncComponents: async () => {},
}))

const viewportSelector = '[data-stream-markdown="code-block-content"], [data-stream-markdown="code-fullscreen"]'
let stylesheet: HTMLStyleElement

beforeEach(() => {
  stylesheet = document.createElement('style')
  stylesheet.textContent = '[data-stream-markdown="code"] { padding: 16px; white-space: pre; } [data-stream-markdown="code-line"] { line-height: 20px; }'
  document.head.append(stylesheet)
  const positions = new WeakMap<Element, number>()
  vi.spyOn(HTMLElement.prototype, 'clientHeight', 'get').mockImplementation(function (this: HTMLElement) {
    return this.matches(viewportSelector) ? 200 : 0
  })
  vi.spyOn(HTMLElement.prototype, 'scrollHeight', 'get').mockImplementation(function (this: HTMLElement) {
    const code = this.querySelector('pre > code')
    if (!code)
      return 0
    const spacer = code.querySelector<HTMLElement>(':scope > div[style]')
    return 32 + (spacer
      ? Number.parseFloat(spacer.style.height) + Number.parseFloat(spacer.style.marginTop)
      : code.querySelectorAll('[data-stream-markdown="code-line"]').length * 20)
    + (this.querySelector('[data-display-notice]') ? 50 : 0)
  })
  vi.spyOn(HTMLElement.prototype, 'scrollTop', 'get').mockImplementation(function (this: HTMLElement) {
    return positions.get(this) ?? 0
  })
  vi.spyOn(HTMLElement.prototype, 'scrollTop', 'set').mockImplementation(function (this: HTMLElement, value) {
    positions.set(this, Math.max(0, Math.min(value, this.scrollHeight - this.clientHeight)))
    queueMicrotask(() => this.dispatchEvent(new Event('scroll')))
  })
  vi.spyOn(HTMLElement.prototype, 'getBoundingClientRect').mockImplementation(function (this: HTMLElement) {
    const viewport = this.closest<HTMLElement>(viewportSelector)
    const top = this.tagName === 'PRE' ? -(viewport?.scrollTop ?? 0) : 0
    const width = this.getAttribute('aria-hidden') === 'true' ? (this.textContent?.length ?? 0) * 8 : 400
    return { top, left: 0, right: width, bottom: top + 200, width, height: 200, x: 0, y: top, toJSON: () => ({}) }
  })
})

afterEach(() => {
  stylesheet.remove()
  vi.restoreAllMocks()
  vi.unstubAllGlobals()
})

const source = Array.from({ length: 1000 }, (_, index) => `line ${index}`).join('\n')
const markdown = (value: string) => `\`\`\`js\n${value}\n\`\`\``
const rows = '[data-stream-markdown="code-line"]'

async function settle() {
  await vi.dynamicImportSettled()
  await flushPromises()
  await new Promise<void>(resolve => window.requestAnimationFrame(() => resolve()))
  await flushPromises()
}

describe('virtual code blocks', () => {
  it('renders all lines when custom CSS enables wrapping', async () => {
    stylesheet.textContent += ' [data-stream-markdown="code"] { white-space: pre-wrap; }'
    const wrapper = mount(Markdown, { attachTo: document.body, props: { content: markdown(source), mode: 'static', codeOptions: { maxHeight: 200, virtualScroll: true } } })
    await settle()
    expect(wrapper.findAll(rows)).toHaveLength(1000)
    expect(wrapper.get('pre').attributes('data-virtual')).toBeUndefined()
    wrapper.unmount()
  })

  it('shares a custom body viewport with a notice and keeps complete source controls', async () => {
    const CustomCode = markRaw(defineComponent({
      inheritAttrs: false,
      props: ['node', 'nodeKey', 'loading'],
      setup(props) {
        return () => h(CodeBlockRenderer, props, {
          default: ({ node }: { node: CodeBlockNode }) => [
            h(CodeRenderer, { node: { ...node, value: node.value.split('\n').slice(0, 500).join('\n') }, nodeKey: props.nodeKey }),
            h('p', { 'data-display-notice': '' }, 'Showing 500 of 1000 lines'),
          ],
        })
      },
    }))
    const onCopied = vi.fn()
    const wrapper = mount(Markdown, { props: {
      content: markdown(source),
      mode: 'static',
      locale: 'en-US',
      onCopied,
      components: { pre: CustomCode },
      codeOptions: { maxHeight: 200, virtualScroll: true },
      controls: { code: { collapse: false, download: false } },
    } })
    await settle()
    const viewport = wrapper.get('[data-stream-markdown="code-block-content"]').element
    expect(viewport.querySelector('[data-display-notice]')?.textContent).toBe('Showing 500 of 1000 lines')
    viewport.scrollTop = viewport.scrollHeight
    await settle()
    expect(wrapper.findAll(rows).length).toBeLessThan(40)
    expect(wrapper.findAll(rows).at(-1)?.text()).toBe('line 499')
    await wrapper.get('button[aria-label="Copy"]').trigger('click')
    await settle()
    expect(onCopied).toHaveBeenCalledWith(source)
    await wrapper.get('button[aria-label="Maximize"]').trigger('click')
    await settle()
    const fullscreen = document.querySelector<HTMLElement>('[data-stream-markdown="code-fullscreen"]')!
    fullscreen.scrollTop = fullscreen.scrollHeight
    await settle()
    expect(Array.from(fullscreen.querySelectorAll(rows)).at(-1)?.textContent).toBe('line 999')
    expect(fullscreen.querySelector('[data-display-notice]')).toBeNull()
    wrapper.unmount()
  })

  it.each(['modern', 'classic', 'minimal'] as const)('uses the existing %s viewport and preserves source line numbers after scrolling', async (variant) => {
    const wideSource = source.replace('line 700', 'W'.repeat(250))
    const highlight = vi.fn(async ({ code }: { code: string }) => ({ tokens: code.split('\n').map(content => [{ content, htmlStyle: { color: 'red' } }]) }))
    const wrapper = mount(Markdown, {
      props: {
        content: markdown(wideSource),
        mode: 'static',
        codeOptions: { maxHeight: 200, virtualScroll: true, variant },
        extensions: { code: { preload: async () => {}, dispose: () => {}, highlight } },
      },
    })
    await settle()
    expect(wrapper.findAll(rows).length).toBeLessThan(40)
    const width = wrapper.get('pre').element.style.minWidth
    expect(width).toContain('2000px')
    expect(width).toContain('var(--stream-markdown-line-number-width)')
    expect(wrapper.get('pre').element.style.getPropertyValue('--stream-markdown-line-number-width')).toBe('4ch')
    expect(highlight).toHaveBeenCalledWith({ code: wideSource, language: 'js', isDark: false })
    expect(wrapper.get(`${rows} span`).attributes('style')).toContain('color: red')

    const viewport = wrapper.get('[data-stream-markdown="code-block-content"]')
    viewport.element.scrollTop = 14000
    await settle()
    expect(wrapper.findAll(rows).length).toBeLessThan(40)
    const first = wrapper.findAll(rows)[0]!
    const lineNumber = Number(first.attributes('data-line-number'))
    expect(lineNumber).toBeGreaterThan(680)
    expect(first.text()).toBe(`line ${lineNumber - 1}`)
    expect(wrapper.get('pre').attributes('style')).toContain(`counter-reset: line ${lineNumber - 1}`)
    expect(wrapper.get('pre').element.style.minWidth).toBe(width)
    expect(wrapper.findAll('[data-stream-markdown="code-block-content"]')).toHaveLength(1)
    wrapper.unmount()
  })

  it('requires opt-in and a bounded viewport, and respects language overrides', async () => {
    const wrapper = mount(Markdown, { props: { content: markdown(source), mode: 'static', codeOptions: { maxHeight: 200 } } })
    const update = wrapper as unknown as { setProps: (props: { codeOptions: Record<string, unknown> }) => Promise<void> }
    await settle()
    expect(wrapper.findAll(rows)).toHaveLength(1000)
    await update.setProps({ codeOptions: { virtualScroll: true } })
    await settle()
    expect(wrapper.findAll(rows)).toHaveLength(1000)
    await update.setProps({ codeOptions: { maxHeight: 200, virtualScroll: true, language: { js: { virtualScroll: false } } } })
    await settle()
    expect(wrapper.findAll(rows)).toHaveLength(1000)
    await update.setProps({ codeOptions: { maxHeight: 200, language: { js: { virtualScroll: true } } } })
    await settle()
    expect(wrapper.findAll(rows).length).toBeLessThan(40)
    wrapper.unmount()
  })

  it('follows appended code at the bottom and preserves a user-scrolled position', async () => {
    const wrapper = mount(Markdown, { props: { content: markdown(source), codeOptions: { maxHeight: 200, virtualScroll: true } } })
    const update = wrapper as unknown as { setProps: (props: { content: string }) => Promise<void> }
    await settle()
    const viewport = wrapper.get('[data-stream-markdown="code-block-content"]').element
    expect(wrapper.findAll(rows).at(-1)?.text()).toBe('line 999')
    await update.setProps({ content: markdown(`${source}\nnew tail`) })
    await settle()
    expect(wrapper.findAll(rows).at(-1)?.text()).toBe('new tail')
    expect(viewport.scrollTop).toBe(viewport.scrollHeight - viewport.clientHeight)

    viewport.scrollTop = 2000
    await settle()
    await update.setProps({ content: markdown(`${source}\nnew tail\nmore tail`) })
    await settle()
    expect(viewport.scrollTop).toBe(2000)
    expect(wrapper.findAll(rows).length).toBeLessThan(40)
    viewport.scrollTop = viewport.scrollHeight
    await settle()
    await update.setProps({ content: markdown(`${source}\nnew tail\nmore tail\nlast tail`) })
    await settle()
    expect(wrapper.findAll(rows).at(-1)?.text()).toBe('last tail')
    wrapper.unmount()
  })

  it('keeps following when asynchronous highlighting updates the rendered height later', async () => {
    const observers: { callback: ResizeObserverCallback, targets: Set<Element> }[] = []
    vi.stubGlobal('ResizeObserver', class {
      entry: typeof observers[number]
      constructor(callback: ResizeObserverCallback) {
        this.entry = { callback, targets: new Set() }
        observers.push(this.entry)
      }

      observe(target: Element) { this.entry.targets.add(target) }
      unobserve(target: Element) { this.entry.targets.delete(target) }
      disconnect() { this.entry.targets.clear() }
    })
    const pending: (() => void)[] = []
    const highlight = vi.fn(({ code }: { code: string }) => new Promise<{ tokens: { content: string }[][] }>((resolve) => {
      pending.push(() => resolve({ tokens: code.split('\n').map(content => [{ content }]) }))
    }))
    const wrapper = mount(Markdown, { props: {
      content: markdown(source),
      codeOptions: { maxHeight: 200, virtualScroll: true },
      extensions: { code: { preload: async () => {}, dispose: () => {}, highlight } },
    } })
    await settle()
    pending.shift()!()
    await settle()
    const viewport = wrapper.get('[data-stream-markdown="code-block-content"]').element
    const resizeBody = async () => {
      for (const observer of observers) {
        if (observer.targets.has(viewport.firstElementChild!))
          observer.callback([], {} as ResizeObserver)
      }
      await settle()
    }
    const update = wrapper as unknown as { setProps: (props: { content: string }) => Promise<void> }
    const addition = Array.from({ length: 50 }, (_, index) => `new line ${index}`).join('\n')
    await update.setProps({ content: markdown(`${source}\n${addition}`) })
    await settle()
    const previousBottom = viewport.scrollTop
    pending.shift()!()
    await settle()
    expect(viewport.scrollHeight - viewport.clientHeight).toBeGreaterThan(previousBottom)
    // Browsers may deliver the earlier programmatic scroll event after layout changes.
    viewport.dispatchEvent(new Event('scroll'))
    await resizeBody()
    expect(viewport.scrollTop).toBe(viewport.scrollHeight - viewport.clientHeight)
    expect(wrapper.findAll(rows).at(-1)?.text()).toBe('new line 49')

    viewport.scrollTop = 2000
    await settle()
    await update.setProps({ content: markdown(`${source}\n${addition}\nlast tail`) })
    await settle()
    pending.shift()!()
    await settle()
    await resizeBody()
    expect(viewport.scrollTop).toBe(2000)
    wrapper.unmount()
  })

  it('copies the complete source and virtualizes the complete fullscreen source', async () => {
    const onCopied = vi.fn()
    const wrapper = mount(Markdown, {
      props: {
        content: markdown(source),
        mode: 'static',
        locale: 'en-US',
        onCopied,
        codeOptions: { maxHeight: 200, virtualScroll: true },
        controls: { code: { collapse: false, download: false } },
      },
    })
    await settle()
    await wrapper.get('button[aria-label="Copy"]').trigger('click')
    await settle()
    expect(onCopied).toHaveBeenCalledWith(source)
    await wrapper.get('button[aria-label="Maximize"]').trigger('click')
    await settle()
    const fullscreen = document.querySelector<HTMLElement>('[data-stream-markdown="code-fullscreen"]')!
    expect(fullscreen.querySelector('pre')?.getAttribute('data-virtual')).toBe('true')
    expect(fullscreen.querySelectorAll(rows).length).toBeLessThan(40)
    fullscreen.scrollTop = fullscreen.scrollHeight
    await settle()
    expect(Array.from(fullscreen.querySelectorAll(rows)).at(-1)?.textContent).toBe('line 999')
    wrapper.unmount()
  })
})
