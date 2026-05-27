// @vitest-environment happy-dom
import type { ImageNode, MarkdownAstParser, NodeRenderers } from 'vue-stream-markdown'
import { mount } from '@vue/test-utils'
import { describe, expect, it } from 'vitest'
import { defineComponent, h } from 'vue'
import Image from '../../packages/vue/src/components/image.vue'
import ImageRenderer from '../../packages/vue/src/components/renderers/image.vue'
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

describe('image renderer', () => {
  it('passes imageOptions.referrerPolicy to custom image components', () => {
    const CustomImage = defineComponent({
      props: {
        referrerPolicy: String,
      },
      setup(props) {
        return () => h('img', {
          'data-test': 'custom-image',
          'referrerpolicy': props.referrerPolicy,
        })
      },
    })

    const WrappedImageRenderer = defineComponent({
      setup() {
        const { provideContext } = useContext()

        provideContext({
          controls: false,
          imageOptions: {
            referrerPolicy: 'no-referrer',
          },
          uiComponents: {
            Image: CustomImage,
          } as never,
        })

        return () => h(ImageRenderer, {
          markdownParser: {} as MarkdownAstParser,
          nodeRenderers: {} as NodeRenderers,
          node: {
            type: 'image',
            url: 'https://example.com/image.png',
            alt: 'Example',
          } as ImageNode,
          nodeKey: 'stream-markdown-block-0-image-0',
          deep: 1,
        })
      },
    })

    const wrapper = mount(WrappedImageRenderer)

    expect(wrapper.find('[data-test="custom-image"]').attributes('referrerpolicy')).toBe('no-referrer')
  })
})

describe('image component', () => {
  it('applies referrerPolicy to inline and preview images', () => {
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
          nodeProps: {
            markdownParser: {} as MarkdownAstParser,
            nodeRenderers: {} as NodeRenderers,
            node: {
              type: 'image',
              url: 'https://example.com/image.png',
            } as ImageNode,
            nodeKey: 'stream-markdown-block-0-image-0',
            deep: 1,
          },
        })
      },
    })

    const wrapper = mount(WrappedImage)
    const images = wrapper.findAll('img')

    expect(images).toHaveLength(2)
    expect(images.map(image => image.attributes('referrerpolicy'))).toEqual([
      'no-referrer',
      'no-referrer',
    ])
  })
})
