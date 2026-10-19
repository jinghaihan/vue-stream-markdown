// @vitest-environment happy-dom
import { flushPromises, mount } from '@vue/test-utils'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { defineComponent, h } from 'vue'
import ZoomContainer from '../../packages/vue/src/components/zoom-container.vue'
import { useContext } from '../../packages/vue/src/composables'
import { loadLocaleMessages } from '../../packages/vue/src/locales'

let height = 200
const resizeCallbacks: (() => void)[] = []
const cleanups: (() => void)[] = []

beforeEach(() => {
  height = 200
  vi.spyOn(HTMLElement.prototype, 'clientWidth', 'get').mockReturnValue(500)
  vi.spyOn(HTMLElement.prototype, 'clientHeight', 'get').mockImplementation(() => height)
  vi.stubGlobal('ResizeObserver', class {
    constructor(callback: () => void) { resizeCallbacks.push(callback) }
    observe() {}
    disconnect() {}
  })
})
afterEach(async () => {
  cleanups.splice(0).forEach(cleanup => cleanup())
  resizeCallbacks.length = 0
  vi.unstubAllGlobals()
  vi.restoreAllMocks()
  await loadLocaleMessages('en-US')
})

async function mountZoom(autoFit = true) {
  const Button = defineComponent({
    props: ['name', 'options'],
    emits: ['click'],
    setup: (props, { emit }) => () => h('div', [
      h('button', { onClick: event => emit('click', event) }, props.name),
      ...(props.options ?? []).map((option: { label: string, value: string | number }) => h('button', {
        onClick: event => emit('click', event, option),
      }, option.label)),
    ]),
  })
  const Root = defineComponent(() => {
    const { provideContext, uiComponents } = useContext()
    provideContext({ uiComponents: { ...uiComponents.value, Button } })
    return () => h(ZoomContainer, {
      autoFit,
      contentSize: { width: 1000, height: 1000 },
      fitKey: 'diagram',
    })
  })
  const wrapper = mount(Root)
  cleanups.push(() => wrapper.unmount())
  await flushPromises()
  resizeCallbacks.forEach(callback => callback())
  await flushPromises()
  const click = async (label: string) => {
    const button = wrapper.findAll('button').find(button => button.text() === label)
    expect(button, label).toBeDefined()
    await button!.trigger('click')
  }
  const transform = () => wrapper.get('[data-stream-markdown="zoom-transform-container"]').attributes('style')
  return { wrapper, click, transform }
}

describe('zoom container auto-fit', () => {
  it.each([
    ['en-US', 'Reset view'],
    ['zh-CN', '重置视图'],
  ])('localizes the fit button and keeps 100%% separate in %s', async (locale, label) => {
    await loadLocaleMessages(locale!)
    const { click, transform } = await mountZoom()
    expect(transform()).toContain('scale(0.2)')
    await click('100%')
    expect(transform()).toContain('scale(1)')
    await click(label!)
    expect(transform()).toContain('scale(0.2)')
  })

  it('refits on resize until the user selects a manual zoom, then fits again on request', async () => {
    await loadLocaleMessages('en-US')
    const { click, transform } = await mountZoom()
    height = 400
    resizeCallbacks.forEach(callback => callback())
    await flushPromises()
    expect(transform()).toContain('scale(0.4)')
    await click('75%')
    height = 100
    resizeCallbacks.forEach(callback => callback())
    await flushPromises()
    expect(transform()).toContain('scale(0.75)')
    await click('Reset view')
    expect(transform()).toContain('scale(0.1)')
  })

  it('keeps the existing controls and zoom limits when auto-fit is disabled', async () => {
    await loadLocaleMessages('en-US')
    const { wrapper, click, transform } = await mountZoom(false)
    expect(transform()).toContain('scale(1)')
    expect(wrapper.text()).not.toContain('Reset view')
    await click('50%')
    expect(transform()).toContain('scale(0.5)')
  })
})
