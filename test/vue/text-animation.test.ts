// @vitest-environment happy-dom
import { flushPromises, mount } from '@vue/test-utils'
import { describe, expect, it, vi } from 'vitest'
import Markdown from '../../packages/vue/src/index.vue'

vi.mock('../../packages/vue/src/utils', async () => ({
  ...await vi.importActual<typeof import('../../packages/vue/src/utils')>('../../packages/vue/src/utils'),
  preloadAsyncComponents: async () => {},
}))

describe('text animation scheduling', () => {
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
    expect(words[0]?.attributes('style')).toBeUndefined()
    expect(words[1]?.attributes('style')).toContain('animation-delay: 25ms')
    expect(characters.map(node => node.text())).toEqual(['你', '好'])
    expect(characters[0]?.attributes('style')).toContain('animation-delay: 50ms')
    expect(characters[1]?.attributes('style')).toContain('animation-delay: 75ms')

    const world = words[1]!.element
    await (wrapper as unknown as {
      setProps: (props: { content: string }) => Promise<void>
    }).setProps({ content: 'Hello world 你好 世界' })
    await flushPromises()

    const updatedWords = wrapper.findAll('[data-stream-markdown="text-word"]')
    expect(updatedWords[1]?.element).toBe(world)
    expect(updatedWords[1]?.attributes('style')).toMatch(/animation-delay: -?\d+ms/)

    wrapper.unmount()
  })

  it('collapses settled text and only animates the appended tail', async () => {
    const wrapper = mount(Markdown, {
      props: {
        content: 'Hello world',
        mode: 'streaming',
      },
    })

    await flushPromises()

    const initialWords = wrapper.findAll('[data-stream-markdown="text-word"]')
    expect(initialWords.map(node => node.text())).toEqual(['Hello', 'world'])

    await initialWords[0]!.trigger('animationend')
    await flushPromises()
    await (wrapper as unknown as {
      setProps: (props: { content: string }) => Promise<void>
    }).setProps({ content: 'Hello world again' })
    await flushPromises()
    expect(wrapper.findAll('[data-stream-markdown="text-word"]')
      .map(node => node.text())).toEqual(['world', 'again'])

    for (const word of wrapper.findAll('[data-stream-markdown="text-word"]'))
      await word.trigger('animationend')
    await flushPromises()
    expect(wrapper.findAll('[data-stream-markdown="text-word"]')).toHaveLength(0)

    wrapper.unmount()
  })

  it('resumes animation timing when the surrounding element changes', async () => {
    let now = 1000
    const performanceNow = vi.spyOn(performance, 'now').mockImplementation(() => now)
    const wrapper = mount(Markdown, {
      props: {
        content: 'Hello',
        mode: 'streaming',
      },
    })

    await flushPromises()
    expect(wrapper.find('[data-stream-markdown="p"]').exists()).toBe(true)

    now = 1125
    await (wrapper as unknown as {
      setProps: (props: { content: string }) => Promise<void>
    }).setProps({ content: '# Hello' })
    await flushPromises()

    expect(wrapper.find('[data-stream-markdown="heading-1"]').exists()).toBe(true)
    expect(wrapper.find('[data-stream-markdown="text-word"]')
      .attributes('style')).toContain('animation-delay: -125ms')

    wrapper.unmount()
    performanceNow.mockRestore()
  })

  it('renders plain text when animation is empty', async () => {
    const wrapper = mount(Markdown, {
      props: {
        animation: '',
        content: 'Hello world',
        mode: 'streaming',
      },
    })

    await flushPromises()

    expect(wrapper.findAll('[data-stream-markdown="text-word"]')).toHaveLength(0)
    expect(wrapper.text()).toContain('Hello world')

    wrapper.unmount()
  })
})
