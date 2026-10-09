// @vitest-environment happy-dom
import type { VueWrapper } from '@vue/test-utils'
import type { StreamMarkdownProps } from '../../packages/vue/src/types'
import { flushPromises, mount } from '@vue/test-utils'
import { describe, expect, it, vi } from 'vitest'
import { defineComponent, h } from 'vue'
import { createTextAnimationController } from '../../packages/vue/src/components/renderers/markdown/text-animation'
import { useContext } from '../../packages/vue/src/composables'
import Markdown from '../../packages/vue/src/index.vue'

vi.mock('../../packages/vue/src/utils', async () => ({
  ...await vi.importActual<typeof import('../../packages/vue/src/utils')>('../../packages/vue/src/utils'),
  preloadAsyncComponents: async () => {},
}))

describe('text animation scheduling', () => {
  it('advances waiting animations without rewinding running or completed text', async () => {
    const wrapper = mount(Markdown, {
      props: { content: '你好吗', mode: 'streaming', animationStagger: 40 },
    })
    await flushPromises()
    const characters = wrapper.findAll('[data-stream-markdown="text-char"]')
    const running = { currentTime: 15, effect: { getTiming: () => ({ delay: 0 }) } }
    const waiting = { currentTime: 10, effect: { getTiming: () => ({ delay: 40 }) } }
    const completed = { currentTime: 300, effect: { getTiming: () => ({ delay: 20 }) } }
    for (const [index, animation] of [running, completed, waiting].entries()) {
      Object.defineProperty(characters[index]!.element, 'getAnimations', {
        value: () => [animation],
      })
    }
    await (wrapper as unknown as { setProps: (props: { content: string }) => Promise<void> })
      .setProps({ content: '你好吗世界' })
    await flushPromises()
    expect(waiting.currentTime).toBe(40)
    expect(running.currentTime).toBe(15)
    expect(completed.currentTime).toBe(300)
    expect(wrapper.findAll('[data-stream-markdown="text-char"]')[2]!.element).toBe(characters[2]!.element)
    wrapper.unmount()
  })

  it('preserves stable block timing after skipped renders and a later rerender', async () => {
    const wrapper = mount(Markdown, {
      props: { content: '你好世界\n\n尾', mode: 'streaming' },
    })
    const update = wrapper as unknown as {
      setProps: (props: { content?: string, components?: Record<string, never> }) => Promise<void>
    }
    await flushPromises()
    const stable = wrapper.findAll('[data-stream-markdown="text-char"]').slice(0, 4)
    const styles = stable.map(node => node.attributes('style'))
    await update.setProps({ content: '你好世界\n\n尾部增长' })
    await flushPromises()
    await update.setProps({ components: {} })
    await flushPromises()
    const updated = wrapper.findAll('[data-stream-markdown="text-char"]').slice(0, 4)
    expect(updated.map(node => node.element)).toEqual(stable.map(node => node.element))
    expect(updated.map(node => node.attributes('style'))).toEqual(styles)
    wrapper.unmount()
  })

  it('applies stagger delays through the public Markdown prop', async () => {
    const wrapper = mount(Markdown, {
      props: {
        animationStagger: 25,
        content: 'Hello world 你好',
        mode: 'streaming',
      },
    })

    await flushPromises()

    const words = wrapper.findAll('[data-stream-markdown="text-word"]')
    const characters = wrapper.findAll('[data-stream-markdown="text-char"]')
    expect(words.map(node => node.text())).toEqual(['Hello', 'world'])
    expect(words[0]?.attributes('style')).toContain('animation-delay: 0ms')
    expect(words[1]?.attributes('style')).toContain('animation-delay: 8ms')
    expect(characters.map(node => node.text())).toEqual(['你', '好'])
    expect(characters[0]?.attributes('style')).toContain('animation-delay: 17ms')
    expect(characters[1]?.attributes('style')).toContain('animation-delay: 25ms')

    const world = words[1]!.element
    await (wrapper as unknown as {
      setProps: (props: { content: string }) => Promise<void>
    }).setProps({ content: 'Hello world 你好 世界' })
    await flushPromises()

    const updatedWords = wrapper.findAll('[data-stream-markdown="text-word"]')
    expect(updatedWords[1]?.element).toBe(world)
    expect(updatedWords[1]?.attributes('style')).toContain('animation-delay: 8ms')

    wrapper.unmount()
  })
})

const FRAGMENTS = '[data-stream-markdown="text-char"], [data-stream-markdown="text-word"], [data-stream-markdown="text-space"]'

function updateMarkdown(wrapper: VueWrapper, props: Partial<StreamMarkdownProps>) {
  return wrapper.setProps(props)
}

async function finishFragments(wrapper: VueWrapper, count = Number.POSITIVE_INFINITY) {
  for (const node of wrapper.findAll(FRAGMENTS).slice(0, count))
    node.element.dispatchEvent(new Event('animationend'))
  await flushPromises()
}

describe('text animation compaction', () => {
  it('compacts a finished prefix without replacing the paragraph, wrapper, or active tail', async () => {
    const Caret = defineComponent({ setup: () => () => h('span', { 'data-stream-markdown': 'caret' }) })
    const wrapper = mount(Markdown, { props: { content: '甲乙丙丁', caret: 'block', uiComponents: { Caret } } })
    await flushPromises()
    const paragraph = wrapper.find('p').element
    const text = wrapper.find('[data-stream-markdown="text"]').element
    const caret = wrapper.find('[data-stream-markdown="caret"]').element
    const tail = wrapper.findAll(FRAGMENTS).slice(2)
    const styles = tail.map(node => node.attributes('style'))

    await finishFragments(wrapper, 2)
    expect(wrapper.text()).toBe('甲乙丙丁')
    expect(wrapper.findAll(FRAGMENTS).map(node => node.element)).toEqual(tail.map(node => node.element))
    expect(wrapper.findAll(FRAGMENTS).map(node => node.attributes('style'))).toEqual(styles)
    expect(wrapper.find('p').element).toBe(paragraph)
    expect(wrapper.find('[data-stream-markdown="text"]').element).toBe(text)
    expect(wrapper.find('[data-stream-markdown="caret"]').element).toBe(caret)

    await updateMarkdown(wrapper, { content: '甲乙丙丁戊' })
    await flushPromises()
    expect(wrapper.findAll(FRAGMENTS).map(node => node.text())).toEqual(['丙', '丁', '戊'])
    expect(wrapper.findAll(FRAGMENTS)[0]!.element).toBe(tail[0]!.element)
    await finishFragments(wrapper)
    expect(wrapper.findAll(FRAGMENTS)).toHaveLength(0)
    await updateMarkdown(wrapper, { content: '甲乙丙丁戊己' })
    await flushPromises()
    expect(wrapper.findAll(FRAGMENTS).map(node => node.text())).toEqual(['己'])
    expect(wrapper.text()).toBe('甲乙丙丁戊己')
    wrapper.unmount()
  })

  it('waits for earlier fragments when animations finish out of order', async () => {
    const wrapper = mount(Markdown, { props: { content: '甲乙丙' } })
    await flushPromises()
    const fragments = wrapper.findAll(FRAGMENTS)
    await fragments[2]!.trigger('animationend')
    expect(wrapper.findAll(FRAGMENTS)).toHaveLength(3)
    await fragments[0]!.trigger('animationend')
    expect(wrapper.findAll(FRAGMENTS).map(node => node.text())).toEqual(['乙', '丙'])
    await fragments[1]!.trigger('animationend')
    await flushPromises()
    expect(wrapper.findAll(FRAGMENTS)).toHaveLength(0)
    expect(wrapper.text()).toBe('甲乙丙')
    wrapper.unmount()
  })

  it('preserves whitespace and inline structure and animates additions to a compacted word', async () => {
    const wrapper = mount(Markdown, { props: { content: '# 标题\n\n**加粗** 和 *强调*\n\n- 一\n- 二\n\nHello' } })
    await flushPromises()
    const structure = ['h1', 'strong', 'em', 'ul', 'li'].map(tag => wrapper.findAll(tag).map(node => node.element))
    const text = wrapper.element.textContent
    await finishFragments(wrapper)
    expect(wrapper.findAll(FRAGMENTS)).toHaveLength(0)
    expect(wrapper.element.textContent).toBe(text)
    expect(['h1', 'strong', 'em', 'ul', 'li'].map(tag => wrapper.findAll(tag).map(node => node.element))).toEqual(structure)
    await updateMarkdown(wrapper, { content: '# 标题\n\n**加粗** 和 *强调*\n\n- 一\n- 二\n\nHello world\nnext 😀' })
    await flushPromises()
    await finishFragments(wrapper)
    expect(wrapper.findAll('[data-stream-markdown="text"]').at(-1)!.element.textContent).toBe('Hello world\nnext 😀')
    await updateMarkdown(wrapper, { content: '# 标题\n\n**加粗** 和 *强调*\n\n- 一\n- 二\n\nHello world\nnext 😀追加' })
    await flushPromises()
    expect(wrapper.findAll(FRAGMENTS).map(node => node.text())).toEqual(['追', '加'])
    wrapper.unmount()

    const word = mount(Markdown, { props: { content: 'Hello' } })
    await flushPromises()
    await finishFragments(word)
    await updateMarkdown(word, { content: 'HelloWorld' })
    await flushPromises()
    expect(word.findAll(FRAGMENTS).map(node => node.text())).toEqual(['World'])
    expect(word.text()).toBe('HelloWorld')
    word.unmount()
  })

  it('retains compacted history across a renderer remount and an option toggle', async () => {
    const wrapper = mount(Markdown, { props: { content: '甲乙' } })
    await flushPromises()
    await finishFragments(wrapper)
    const Paragraph = defineComponent({ setup: (_, { slots }) => () => h('p', slots.default?.()) })
    await updateMarkdown(wrapper, { components: { p: Paragraph } })
    await flushPromises()
    expect(wrapper.findAll(FRAGMENTS)).toHaveLength(0)
    await updateMarkdown(wrapper, { compactTextAnimations: false })
    await flushPromises()
    expect(wrapper.findAll(FRAGMENTS)).toHaveLength(2)
    expect(wrapper.findAll(FRAGMENTS).every(node => node.attributes('style')?.includes('animation: none'))).toBe(true)
    await updateMarkdown(wrapper, { compactTextAnimations: true, content: '甲乙丙' })
    await flushPromises()
    expect(wrapper.findAll(FRAGMENTS).map(node => node.text())).toEqual(['丙'])
    await updateMarkdown(wrapper, { content: '' })
    await flushPromises()
    await updateMarkdown(wrapper, { content: '甲乙' })
    await flushPromises()
    expect(wrapper.findAll(FRAGMENTS).map(node => node.text())).toEqual(['甲', '乙'])
    expect(wrapper.findAll(FRAGMENTS).every(node => !node.attributes('style')?.includes('animation: none'))).toBe(true)
    wrapper.unmount()
  })

  it('allows opting out and leaves custom TransitionGroup animations unchanged', async () => {
    for (const props of [{ compactTextAnimations: false }, { animation: 'custom' }]) {
      const wrapper = mount(Markdown, { props: { content: '甲乙', ...props } })
      await flushPromises()
      await finishFragments(wrapper)
      expect(wrapper.findAll(FRAGMENTS)).toHaveLength(2)
      wrapper.unmount()
    }
  })

  it.each([
    ['Chinese', Array.from({ length: 120 }, () => '甲'.repeat(100)).join('\n\n'), 12000, 100],
    ['English', Array.from({ length: 40 }, () => Array.from({ length: 50 }, (_, index) => `word${index}`).join(' ')).join('\n\n'), 3960, 50],
  ] as const)('compacts completed paragraphs in the %s issue scenario', async (_name, content, baseline, active) => {
    const old = mount(Markdown, { props: { content, compactTextAnimations: false } })
    await flushPromises()
    expect(old.findAll(FRAGMENTS)).toHaveLength(baseline)
    old.unmount()

    const wrapper = mount(Markdown, { props: { content } })
    await flushPromises()
    const paragraphs = wrapper.findAll('p').map(node => node.element)
    await finishFragments(wrapper, wrapper.findAll(FRAGMENTS).length - active)
    expect(wrapper.findAll(FRAGMENTS)).toHaveLength(active)
    expect(wrapper.findAll('p').map(node => node.element)).toEqual(paragraphs)
    expect(wrapper.element.textContent).toBe(content.replaceAll('\n\n', ''))
    await updateMarkdown(wrapper, { content: `${content}\n\n新尾` })
    await flushPromises()
    // A new paragraph never cuts off the previous paragraph's running animation.
    expect(wrapper.findAll(FRAGMENTS)).toHaveLength(active + 2)
    await finishFragments(wrapper, active)
    expect(wrapper.findAll(FRAGMENTS)).toHaveLength(2)
    await updateMarkdown(wrapper, { mode: 'static' })
    await flushPromises()
    expect(wrapper.findAll(FRAGMENTS)).toHaveLength(0)
    wrapper.unmount()
  }, 20000)

  it('compacts a completed prefix of a growing single paragraph', async () => {
    const content = '甲'.repeat(1000)
    const wrapper = mount(Markdown, { props: { content } })
    await flushPromises()
    expect(wrapper.findAll(FRAGMENTS)).toHaveLength(1000)
    await finishFragments(wrapper, 990)
    expect(wrapper.findAll(FRAGMENTS)).toHaveLength(10)
    await updateMarkdown(wrapper, { content: `${content}乙丙` })
    await flushPromises()
    expect(wrapper.findAll(FRAGMENTS)).toHaveLength(12)
    await finishFragments(wrapper)
    expect(wrapper.findAll(FRAGMENTS)).toHaveLength(0)
    expect(wrapper.text()).toBe(`${content}乙丙`)
    wrapper.unmount()
  })

  it('retains only the active tail in the 10000-character issue scenario', () => {
    let controller!: ReturnType<typeof createTextAnimationController>
    const host = mount(defineComponent({
      setup() {
        controller = createTextAnimationController(useContext())
        return () => null
      },
    }))
    const content = '甲'.repeat(10000)
    const initial = controller.compactParts('text', content, 'char')
    expect(initial.parts).toHaveLength(10000)
    // Detached elements keep this scale check independent of DOM sibling traversal.
    initial.parts.forEach((part, index) => {
      const element = document.createElement('span')
      controller.mount(part.key, element)
      if (index < 9990)
        controller.finish(part.key, element)
    })
    const tail = controller.compactParts('text', content, 'char')
    expect(tail.prefix).toBe('甲'.repeat(9990))
    expect(tail.parts).toHaveLength(10)
    const appended = controller.compactParts('text', `${content}乙丙`, 'char')
    expect(appended.parts).toHaveLength(12)
    expect(appended.parts.slice(0, 10)).toEqual(tail.parts)
    for (const part of appended.parts) {
      const element = document.createElement('span')
      controller.mount(part.key, element)
      controller.finish(part.key, element)
    }
    expect(controller.compactParts('text', `${content}乙丙`, 'char')).toEqual({
      prefix: `${content}乙丙`,
      parts: [],
    })
    controller.dispose()
    host.unmount()
  })
})
