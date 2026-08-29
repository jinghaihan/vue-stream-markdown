// @vitest-environment happy-dom
import type { StreamMarkdownResolvedContext } from 'vue-stream-markdown'
import { mount } from '@vue/test-utils'
import { describe, expect, it } from 'vitest'
import { defineComponent, h, nextTick, ref } from 'vue'
import { useContext } from '../../packages/vue/src/composables'

describe('useContext', () => {
  it('reuses the resolved context for consumers under the same provider', async () => {
    const mode = ref<'static' | 'streaming'>('streaming')
    const contexts: StreamMarkdownResolvedContext[] = []

    const Consumer = defineComponent({
      setup() {
        contexts.push(useContext())
        return () => null
      },
    })

    const Provider = defineComponent({
      setup() {
        const { provideContext } = useContext()
        provideContext({ mode })
        return () => h('div', [h(Consumer), h(Consumer)])
      },
    })

    const wrapper = mount(Provider)
    const firstContext = contexts[0]!
    const secondContext = contexts[1]!

    expect(contexts).toHaveLength(2)
    expect(firstContext).toBe(secondContext)
    expect(firstContext.mode.value).toBe('streaming')

    mode.value = 'static'
    await nextTick()

    expect(firstContext.mode.value).toBe('static')
    expect(secondContext.mode.value).toBe('static')

    wrapper.unmount()
  })
})
