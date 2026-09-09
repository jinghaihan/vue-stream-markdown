import type { CompletionInfo, Node } from '@markmend/parser'
import type { PropType } from 'vue'
import type { MarkdownComponents } from '../../../types'
import { createTextAnimationScheduler } from '@stream-markdown/core'
import { computed, defineComponent, onMounted, onUpdated, shallowRef } from 'vue'
import { useContext } from '../../../composables'
import { createNodeRenderer } from './node-renderer'
import { collectImageSources, collectTextOffsets } from './node-utils'

export default defineComponent({
  name: 'MarkdownNodes',
  props: {
    completionInfo: {
      type: Object as PropType<CompletionInfo>,
      default: undefined,
    },
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
    const animationRevision = shallowRef(0)
    const textAnimationScheduler = createTextAnimationScheduler()
    const renderNodes = createNodeRenderer({
      context,
      getCompletionInfo: () => props.completionInfo,
      getComponents: () => props.components,
      getImageSources: () => imageSources.value,
      refreshTextAnimation: () => animationRevision.value++,
      textAnimationScheduler,
    })

    onMounted(() => textAnimationScheduler.commitPass())
    onUpdated(() => textAnimationScheduler.commitPass())

    return () => {
      void animationRevision.value
      textAnimationScheduler.beginPass({
        enabled: context.enableAnimate.value,
        stagger: context.animationStagger.value,
      })
      const textOffsets = context.enableAnimate.value && context.animation.value
        ? collectTextOffsets(props.nodes)
        : undefined
      return renderNodes(
        props.nodes,
        props.loading,
        'root',
        false,
        textOffsets,
      )
    }
  },
})
