import { code } from '@stream-markdown/code'
import { pele } from '@stream-markdown/pele'
import { computed, defineComponent, h } from 'vue'
import { Markdown } from 'vue-stream-markdown'

const extensions = {
  code: code({ theme: ['github-light', 'github-dark'] }),
  pele: pele(),
}

/** Comark supplies the source of each ordinary Mermaid fence to this component. */
export const Mermaid = defineComponent({
  name: 'DocsMermaid',
  inheritAttrs: false,
  props: {
    content: { type: String, required: true },
  },
  setup(props) {
    const content = computed(() => {
      let longestRun = 2
      for (const match of props.content.matchAll(/`+/g))
        longestRun = Math.max(longestRun, match[0].length)
      const fence = '`'.repeat(longestRun + 1)
      return `${fence}mermaid\n${props.content}\n${fence}`
    })

    return () => h(Markdown, { content: content.value, extensions, mode: 'static' })
  },
})
