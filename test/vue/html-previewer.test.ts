// @vitest-environment happy-dom
import type { CodeNode, MarkdownAstParser, NodeRenderers } from 'vue-stream-markdown'
import { mount } from '@vue/test-utils'
import { describe, expect, it } from 'vitest'
import { defineComponent, h } from 'vue'
import HtmlPreviewer from '../../packages/vue/src/components/previewers/html.vue'
import { useContext } from '../../packages/vue/src/composables'

function mountHtmlPreviewer(previewers?: unknown) {
  const WrappedHtmlPreviewer = defineComponent({
    setup() {
      const { provideContext } = useContext()

      provideContext({
        previewers: previewers as never,
      })

      return () => h(HtmlPreviewer, {
        markdownParser: {} as MarkdownAstParser,
        nodeRenderers: {} as NodeRenderers,
        node: {
          type: 'code',
          lang: 'html',
          value: '<div>Hello</div>',
        } as CodeNode,
        nodeKey: 'stream-markdown-block-0-code-0',
        deep: 1,
      })
    },
  })

  return mount(WrappedHtmlPreviewer)
}

describe('html previewer', () => {
  it('uses the safer default iframe sandbox', () => {
    const wrapper = mountHtmlPreviewer()

    expect(wrapper.find('iframe').attributes('sandbox')).toBe('allow-scripts')
  })

  it('uses a fallback height and injected measurement script by default', () => {
    const wrapper = mountHtmlPreviewer()

    expect(wrapper.find('.html-previewer').attributes('style')).toContain('height: 360px')
    expect(wrapper.find('iframe').attributes('srcdoc')).toContain('stream-markdown:html-preview-height')
  })

  it('allows configuring the iframe sandbox', () => {
    const wrapper = mountHtmlPreviewer({
      html: {
        sandbox: 'allow-scripts allow-same-origin allow-forms',
      },
    })

    expect(wrapper.find('iframe').attributes('sandbox')).toBe('allow-scripts allow-same-origin allow-forms')
  })

  it('keeps same-origin previews on direct DOM measurement', () => {
    const wrapper = mountHtmlPreviewer({
      html: {
        sandbox: 'allow-scripts allow-same-origin',
      },
    })

    expect(wrapper.find('iframe').attributes('srcdoc')).not.toContain('stream-markdown:html-preview-height')
  })

  it('allows configuring the fallback height and max height', () => {
    const wrapper = mountHtmlPreviewer({
      html: {
        height: 480,
        maxHeight: '80vh',
        sandbox: '',
      },
    })

    expect(wrapper.find('.html-previewer').attributes('style')).toContain('height: 480px')
    expect(wrapper.find('.html-previewer').attributes('style')).toContain('max-height: 80vh')
    expect(wrapper.find('iframe').attributes('srcdoc')).not.toContain('stream-markdown:html-preview-height')
  })
})
