// @vitest-environment happy-dom
import { flushPromises, mount } from '@vue/test-utils'
import { describe, expect, it, vi } from 'vitest'
import { defineComponent, h } from 'vue'
import Image from '../../packages/vue/src/components/image.vue'
import { useContext } from '../../packages/vue/src/composables'

const PassthroughModal = defineComponent({
  setup(_, { slots }) {
    return () => h('div', { 'data-test': 'modal' }, slots.default?.())
  },
})

const PassthroughZoomContainer = defineComponent({
  setup(_, { slots }) {
    return () => h('div', { 'data-test': 'zoom-container' }, [
      slots.controls?.({}),
      slots.default?.(),
    ])
  },
})

const PassthroughButton = defineComponent({
  props: {
    name: String,
  },
  emits: ['click'],
  setup(props, { emit }) {
    return () => h('button', {
      'aria-label': props.name,
      'onClick': (event: MouseEvent) => emit('click', event),
    })
  },
})

describe('image component', () => {
  it('mounts the preview lazily and applies referrerPolicy to both images', async () => {
    const WrappedImage = defineComponent({
      setup() {
        const { provideContext } = useContext()

        provideContext({
          uiComponents: {
            Modal: PassthroughModal,
            ZoomContainer: PassthroughZoomContainer,
          } as never,
        })

        return () => h(Image, {
          src: 'https://example.com/image.png',
          alt: 'Example',
          title: 'Example image',
          controls: false,
          referrerPolicy: 'no-referrer',
          nodeProps: {},
        })
      },
    })

    const wrapper = mount(WrappedImage)
    expect(wrapper.findAll('img')).toHaveLength(1)
    expect(wrapper.get('img').attributes('referrerpolicy')).toBe('no-referrer')

    await wrapper.get('img').trigger('load')
    await wrapper.get('img').trigger('click')
    await flushPromises()

    const images = wrapper.findAll('img')
    expect(images).toHaveLength(2)
    expect(images.map(image => image.attributes('referrerpolicy'))).toEqual([
      'no-referrer',
      'no-referrer',
    ])
  })

  it('switches between provided image sources', async () => {
    const WrappedImage = defineComponent({
      setup() {
        const { provideContext } = useContext()

        provideContext({
          uiComponents: {
            Button: PassthroughButton,
            Modal: PassthroughModal,
            ZoomContainer: PassthroughZoomContainer,
          } as never,
        })

        return () => h(Image, {
          src: 'https://example.com/first.png',
          sources: [
            'https://example.com/first.png',
            'https://example.com/second.png',
          ],
          alt: 'Example',
          controls: {
            image: {
              carousel: true,
              download: false,
              flip: false,
              rotate: false,
            },
          },
          nodeProps: {},
        })
      },
    })

    const wrapper = mount(WrappedImage)
    await wrapper.get('img').trigger('load')
    await wrapper.get('img').trigger('click')
    await vi.dynamicImportSettled()
    await flushPromises()

    expect(wrapper.findAll('img').map(image => image.attributes('src'))).toEqual([
      'https://example.com/first.png',
      'https://example.com/first.png',
    ])

    await wrapper.get('button[aria-label="Next"]').trigger('click')

    expect(wrapper.findAll('img').map(image => image.attributes('src'))).toEqual([
      'https://example.com/first.png',
      'https://example.com/second.png',
    ])
  })
})
