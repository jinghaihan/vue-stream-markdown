// @vitest-environment happy-dom
import type { MermaidExtensionRenderResult, MermaidRenderInput } from '@stream-markdown/core'
import type { CodeBlockNode, Extensions } from 'vue-stream-markdown'
import { flushPromises, mount } from '@vue/test-utils'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { defineComponent, h, ref, shallowRef } from 'vue'
import MermaidPreview from '../../packages/vue/src/components/previewers/mermaid.vue'
import { useContext } from '../../packages/vue/src/composables'

const cleanups: (() => void)[] = []
const diagram = (name: string) => `graph TD\nA-->${name}`
const success = (name: string) => ({ valid: true, svg: `<svg><text>${name}</text></svg>` })

beforeEach(() => vi.useFakeTimers({ toFake: ['setTimeout', 'clearTimeout', 'performance'] }))
afterEach(() => {
  cleanups.splice(0).forEach(cleanup => cleanup())
  vi.useRealTimers()
  vi.restoreAllMocks()
})

async function mountPreview(streaming = true, codeExtension?: Extensions['code']) {
  const pending: {
    resolve: (result: MermaidExtensionRenderResult) => void
    reject: (error: Error) => void
  }[] = []
  const render = vi.fn((_input: MermaidRenderInput) => new Promise<MermaidExtensionRenderResult>((resolve, reject) => {
    pending.push({ resolve, reject })
  }))
  const extension = { supports: () => true, render, preload: async () => {}, dispose: () => {} }
  const extensions = shallowRef<Extensions>({ mermaid: extension, code: codeExtension })
  const isDark = ref(false)
  const nodeKey = ref('diagram')
  const node = ref<CodeBlockNode>({ value: diagram('B'), loading: streaming })
  const App = defineComponent(() => {
    const { provideContext, uiComponents } = useContext()
    provideContext({
      extensions,
      isDark,
      uiComponents: {
        ...uiComponents.value,
        ZoomContainer: defineComponent((_, { slots }) => () => h('div', slots.default?.())),
        Spin: defineComponent(() => () => h('span', 'Loading')),
        ErrorComponent: defineComponent({
          props: ['message'],
          setup: props => () => h('span', props.message),
        }),
      },
    })
    return () => h(MermaidPreview, { node: node.value, nodeKey: nodeKey.value, immediateRender: true })
  })
  const wrapper = mount(App)
  cleanups.push(() => wrapper.unmount())
  await flushPromises()
  return { wrapper, node, nodeKey, isDark, extensions, extension, render, pending }
}

describe('mermaid render scheduling', () => {
  it('renders immediately, displays intermediate results and skips queued middle versions', async () => {
    const state = await mountPreview()
    expect(state.render).toHaveBeenCalledTimes(1)
    state.node.value.value = diagram('C')
    await flushPromises()
    state.node.value.value = diagram('D')
    await flushPromises()
    expect(state.render).toHaveBeenCalledTimes(1)

    state.pending[0]!.resolve(success('B'))
    await flushPromises()
    expect(state.wrapper.get('svg').text()).toBe('B')
    await vi.advanceTimersByTimeAsync(299)
    expect(state.render).toHaveBeenCalledTimes(1)
    await vi.advanceTimersByTimeAsync(1)
    expect(state.render).toHaveBeenCalledTimes(2)
    expect(state.render.mock.calls[1]![0].code).toBe(diagram('D'))

    state.node.value.value = diagram('E')
    await flushPromises()
    state.pending[1]!.resolve(success('D'))
    await flushPromises()
    expect(state.wrapper.get('svg').text()).toBe('D')
  })

  it('uses the render duration as the cooldown for expensive diagrams', async () => {
    const state = await mountPreview()
    state.node.value.value = diagram('C')
    await flushPromises()
    await vi.advanceTimersByTimeAsync(800)
    state.pending[0]!.resolve(success('B'))
    await flushPromises()
    await vi.advanceTimersByTimeAsync(799)
    expect(state.render).toHaveBeenCalledTimes(1)
    await vi.advanceTimersByTimeAsync(1)
    expect(state.render).toHaveBeenCalledTimes(2)
  })

  it.each(['rendering', 'cooldown'] as const)('flushes final content without a cooldown while %s', async (phase) => {
    const state = await mountPreview()
    if (phase === 'cooldown') {
      state.pending[0]!.resolve(success('B'))
      await flushPromises()
    }
    state.node.value = { value: diagram('Final'), loading: false }
    await flushPromises()
    if (phase === 'rendering') {
      expect(state.render).toHaveBeenCalledTimes(1)
      state.pending[0]!.resolve(success('B'))
      await flushPromises()
    }
    expect(state.render).toHaveBeenCalledTimes(2)
    expect(state.render.mock.calls[1]![0].code).toBe(diagram('Final'))
    state.pending[1]!.resolve(success('Final'))
    await flushPromises()
    expect(state.wrapper.get('svg').text()).toBe('Final')
    expect(vi.getTimerCount()).toBe(0)
  })

  it('keeps the last valid diagram and skips obsolete errors without waiting', async () => {
    const state = await mountPreview(false)
    state.pending[0]!.resolve(success('B'))
    await flushPromises()
    state.node.value.value = diagram('C')
    await flushPromises()
    state.node.value.value = diagram('D')
    await flushPromises()
    state.pending[1]!.resolve({ valid: false, error: 'Incomplete C' })
    await flushPromises()
    expect(state.render).toHaveBeenCalledTimes(3)
    expect(state.wrapper.get('svg').text()).toBe('B')
    expect(state.wrapper.text()).not.toContain('Incomplete C')
    state.pending[2]!.reject(new Error('Invalid D'))
    await flushPromises()
    expect(state.wrapper.get('svg').text()).toBe('B')
    state.node.value.value = diagram('E')
    await flushPromises()
    state.pending[3]!.resolve(success('E'))
    await flushPromises()
    expect(state.wrapper.get('svg').text()).toBe('E')
  })

  it('does not retry an unchanged static diagram after its first render', async () => {
    const state = await mountPreview(false)
    state.pending[0]!.resolve(success('B'))
    await flushPromises()
    await vi.advanceTimersByTimeAsync(1000)
    expect(state.render).toHaveBeenCalledTimes(1)
    expect(vi.getTimerCount()).toBe(0)
  })

  it.each(['theme', 'extension', 'node'] as const)('discards results from an obsolete %s context', async (change) => {
    const state = await mountPreview(false)
    if (change === 'theme')
      state.isDark.value = true
    else if (change === 'extension')
      state.extensions.value = { beautifulMermaid: { ...state.extension } }
    else
      state.nodeKey.value = 'another-diagram'
    await flushPromises()
    state.pending[0]!.resolve(success('Obsolete'))
    await flushPromises()
    expect(state.wrapper.find('svg').exists()).toBe(false)
    expect(state.render).toHaveBeenCalledTimes(2)
    expect(state.render.mock.calls[1]![0].isDark).toBe(change === 'theme')
    state.pending[1]!.resolve(success('Current'))
    await flushPromises()
    expect(state.wrapper.get('svg').text()).toBe('Current')
  })

  it('wakes a streaming cooldown immediately when the theme changes', async () => {
    const state = await mountPreview()
    state.pending[0]!.resolve(success('Light'))
    await flushPromises()
    state.isDark.value = true
    await flushPromises()
    expect(state.render).toHaveBeenCalledTimes(2)
    expect(state.render.mock.calls[1]![0].isDark).toBe(true)
    expect(state.wrapper.get('svg').text()).toBe('Light')
    state.pending[1]!.resolve(success('Dark'))
    await flushPromises()
    expect(state.wrapper.get('svg').text()).toBe('Dark')
  })

  it('keeps the theme snapshot consistent while resolving an asynchronous code theme', async () => {
    const themes: ((theme: Record<string, unknown>) => void)[] = []
    const getTheme = vi.fn((_isDark: boolean) => new Promise<Record<string, unknown>>((resolve) => {
      themes.push(resolve)
    }))
    const state = await mountPreview(false, {
      getTheme,
      highlight: async () => ({ tokens: [] }),
      preload: async () => {},
      dispose: () => {},
    })
    state.isDark.value = true
    await flushPromises()
    themes[0]!({ name: 'light' })
    await flushPromises()
    expect(state.render.mock.calls[0]![0]).toMatchObject({ isDark: false, theme: { name: 'light' } })
    state.pending[0]!.resolve(success('Obsolete'))
    await flushPromises()
    expect(state.wrapper.find('svg').exists()).toBe(false)
    expect(getTheme.mock.calls.map(([isDark]) => isDark)).toEqual([false, true])
    themes[1]!({ name: 'dark' })
    await flushPromises()
    expect(state.render.mock.calls[1]![0]).toMatchObject({ isDark: true, theme: { name: 'dark' } })
  })

  it.each(['rendering', 'cooldown'] as const)('cleans up during %s without starting another render', async (phase) => {
    const state = await mountPreview()
    state.node.value.value = diagram('C')
    await flushPromises()
    if (phase === 'cooldown') {
      state.pending[0]!.resolve(success('B'))
      await flushPromises()
      expect(vi.getTimerCount()).toBe(1)
    }
    state.wrapper.unmount()
    if (phase === 'rendering')
      state.pending[0]!.resolve(success('B'))
    await flushPromises()
    await vi.advanceTimersByTimeAsync(1000)
    expect(state.render).toHaveBeenCalledTimes(1)
    expect(vi.getTimerCount()).toBe(0)
  })
})
