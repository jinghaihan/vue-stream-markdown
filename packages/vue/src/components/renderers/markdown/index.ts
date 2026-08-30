import type { Node } from '@markmend/parser'
import type { PropType } from 'vue'
import type { MarkdownComponents } from '../../../types'
import { createTextAnimationScheduler } from '@stream-markdown/core'
import { computed, defineComponent, onMounted, onUpdated } from 'vue'
import { useContext } from '../../../composables'
import { createNodeRenderer } from './node-renderer'
import { collectImageSources } from './node-utils'

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
    const imageSources = computed(() => collectImageSources(props.nodes))
    const animatedTextKeys = new Set<string>()
    let renderedTextKeys = new Set<string>()
    const textAnimationScheduler = createTextAnimationScheduler()
    const renderNodes = createNodeRenderer({
      animatedTextKeys,
      context,
      getComponents: () => props.components,
      getImageSources: () => imageSources.value,
      markTextRendered: key => renderedTextKeys.add(key),
      textAnimationScheduler,
    })

    onMounted(() => textAnimationScheduler.commitPass())
    onUpdated(() => textAnimationScheduler.commitPass())

    return () => {
      renderedTextKeys = new Set<string>()
      textAnimationScheduler.beginPass({
        enabled: context.enableAnimate.value,
        stagger: context.animationStagger.value,
      })
      const rendered = renderNodes(props.nodes, props.loading)
      for (const key of animatedTextKeys) {
        if (!renderedTextKeys.has(key))
          animatedTextKeys.delete(key)
      }
      return rendered
    }
  },
})
