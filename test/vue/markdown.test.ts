// @vitest-environment happy-dom
import { shallowMount } from '@vue/test-utils'
import { describe, expect, it } from 'vitest'
import { nextTick } from 'vue'
import Markdown from '../../packages/vue/src/index.vue'

interface MarkdownTestVm {
  getProcessedContent: () => string
}

interface MarkdownTestWrapper {
  setProps: (props: { mode: 'static' | 'streaming' }) => Promise<void>
}

describe('stream markdown', () => {
  it('reparses the original content when switching to static mode', async () => {
    const wrapper = shallowMount(Markdown, {
      props: {
        content: '*',
        mode: 'streaming',
      },
    })
    const vm = wrapper.vm as unknown as MarkdownTestVm
    const testWrapper = wrapper as unknown as MarkdownTestWrapper

    expect(vm.getProcessedContent()).toBe('')

    await testWrapper.setProps({ mode: 'static' })
    await nextTick()

    expect(vm.getProcessedContent()).toBe('*')
  })
})
