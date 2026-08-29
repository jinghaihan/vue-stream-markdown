// @vitest-environment happy-dom
import { flushPromises, mount } from '@vue/test-utils'
import { describe, expect, it } from 'vitest'
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
    return () => h('div', { 'data-test': 'zoom-container' }, slots.default?.())
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
})
