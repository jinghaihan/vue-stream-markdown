// @vitest-environment happy-dom
import { flushPromises, mount } from '@vue/test-utils'
import { describe, expect, it, vi } from 'vitest'
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
