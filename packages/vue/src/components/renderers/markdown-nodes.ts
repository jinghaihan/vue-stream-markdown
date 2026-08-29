import type { Node } from '@markmend/parser'
import type { PropType } from 'vue'
import type { MarkdownComponents } from '../../types'
import { defineComponent } from 'vue'
import { useContext } from '../../composables'
import { createNodeRenderer } from './node-renderer'

export default defineComponent({
  name: 'MarkdownNodes',
  props: {
    components: {
      type: Object as PropType<MarkdownComponents>,
      default: () => ({}),
    },
    loading: Boolean,
    nodes: {
      type: Array as PropType<Node[]>,
      default: () => [],
    },
  },
  setup(props) {
    const context = useContext()
    const animatedTextKeys = new Set<string>()
    let renderedTextKeys = new Set<string>()
    const renderNodes = createNodeRenderer({
      animatedTextKeys,
      context,
      getComponents: () => props.components,
      markTextRendered: key => renderedTextKeys.add(key),
    })

    return () => {
      renderedTextKeys = new Set<string>()
      const rendered = renderNodes(props.nodes, props.loading)
      for (const key of animatedTextKeys) {
        if (!renderedTextKeys.has(key))
          animatedTextKeys.delete(key)
      }
      return rendered
    }
  },
})
