// @vitest-environment happy-dom
import { flushPromises, mount } from '@vue/test-utils'
import { describe, expect, it, vi } from 'vitest'
import Markdown from '../../packages/vue/src/index.vue'

vi.mock('../../packages/vue/src/utils', async () => ({
  ...await vi.importActual<typeof import('../../packages/vue/src/utils')>('../../packages/vue/src/utils'),
  preloadAsyncComponents: async () => {},
}))

describe('text animation scheduling', () => {
  it('animates new text parts without a configurable stagger', async () => {
    const wrapper = mount(Markdown, {
      props: {
        content: 'Hello world 你好',
        mode: 'streaming',
      },
    })

    await flushPromises()

    const words = wrapper.findAll('[data-stream-markdown="text-word"]')
    const characters = wrapper.findAll('[data-stream-markdown="text-char"]')
    expect(words.map(node => node.text())).toEqual(['Hello', 'world'])
    expect(words[0]?.attributes('style')).toBeUndefined()
    expect(words[1]?.attributes('style')).toContain('animation-delay:')
    expect(characters.map(node => node.text())).toEqual(['你', '好'])
    expect(characters[0]?.attributes('style')).toContain('animation-delay:')
    expect(characters[1]?.attributes('style')).toContain('animation-delay:')

    const world = words[1]!.element
    await (wrapper as unknown as {
      setProps: (props: { content: string }) => Promise<void>
    }).setProps({ content: 'Hello world 你好 世界' })
    await flushPromises()

    const updatedWords = wrapper.findAll('[data-stream-markdown="text-word"]')
    expect(updatedWords[1]?.element).toBe(world)
    expect(updatedWords[1]?.attributes('style')).toContain('animation-delay:')

    wrapper.unmount()
  })
})
