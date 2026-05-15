// @vitest-environment happy-dom
import { transformHtml } from '@stream-markdown/html'
import { mount } from '@vue/test-utils'
import { describe, expect, it } from 'vitest'
import { defineComponent, h } from 'vue'
import { createHtmlNodeRenderer } from 'vue-stream-markdown/html'

const GitHubCard = defineComponent({
  props: {
    name: String,
  },
  setup(props, { slots }) {
    return () => h('strong', { 'data-github': props.name }, slots.default?.())
  },
})

function mountHtml(value: string) {
  const HtmlRenderer = createHtmlNodeRenderer({
    transform: raw => transformHtml(raw, {
      componentTags: ['github'],
      allowedAttributes: {
        github: ['name'],
      },
    }),
    components: {
      GitHub: GitHubCard,
    },
  })

  return mount(HtmlRenderer, {
    props: {
      node: {
        type: 'html',
        value,
      },
    },
  })
}

describe('html renderer', () => {
  it('renders native html and replaces registered custom tags', () => {
    const wrapper = mountHtml('<div><GitHub name="repo">Open</div>')

    expect(wrapper.find('div').exists()).toBe(true)
    expect(wrapper.find('[data-github="repo"]').text()).toBe('Open')
  })
})
