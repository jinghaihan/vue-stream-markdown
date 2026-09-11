import type { CompletionInfo, Node } from '@markmend/parser'
import type { PropType } from 'vue'
import type { MarkdownComponents } from '../../../types'
import { createTextAnimationScheduler } from '@stream-markdown/core'
import { computed, defineComponent, h, onMounted, onUpdated } from 'vue'
import { useContext } from '../../../composables'
import { createNodeRenderer } from './node-renderer'
import { collectImageSources, findLastRenderableIndex } from './node-utils'

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
    const animatedTextKeys = new Set<string>()
    const textAnimationScheduler = createTextAnimationScheduler()
    const renderedTextKeysByPath = new Map<string, Set<string>>()

    const onBlockRendered = (path: string, keys: Set<string>) => {
      renderedTextKeysByPath.set(path, keys)
    }

    const MarkdownBlock = defineComponent({
      name: 'MarkdownBlock',
      props: {
        components: {
          type: Object as PropType<MarkdownComponents>,
          required: true,
        },
        hideCaret: Boolean,
        loading: Boolean,
        node: {
          type: [String, Array] as PropType<Node>,
          required: true,
        },
        onRendered: {
          type: Function as PropType<typeof onBlockRendered>,
          required: true,
        },
        path: {
          type: String,
          required: true,
        },
      },
      setup(blockProps) {
        let renderedTextKeys = new Set<string>()
        const renderer = createNodeRenderer({
          animatedTextKeys,
          context,
          getCompletionInfo: () => props.completionInfo,
          getComponents: () => blockProps.components,
          getImageSources: () => imageSources.value,
          markTextRendered: key => renderedTextKeys.add(key),
          textAnimationScheduler,
        })

        return () => {
          renderedTextKeys = new Set<string>()
          const rendered = renderer.renderNode(
            blockProps.node,
            blockProps.loading,
            blockProps.path,
            blockProps.hideCaret,
          )
          blockProps.onRendered(blockProps.path, renderedTextKeys)
          return rendered
        }
      },
    })

    const reconcileRenderedTextKeys = () => {
      const renderedTextKeys = new Set<string>()
      const activePaths = new Set<string>()
      props.nodes.forEach((node, index) => {
        const path = resolveTopLevelPath(node, index)
        activePaths.add(path)
        for (const key of renderedTextKeysByPath.get(path) ?? [])
          renderedTextKeys.add(key)
      })
      for (const path of renderedTextKeysByPath.keys()) {
        if (!activePaths.has(path))
          renderedTextKeysByPath.delete(path)
      }
      for (const key of animatedTextKeys) {
        if (!renderedTextKeys.has(key))
          animatedTextKeys.delete(key)
      }
    }

    onMounted(() => {
      reconcileRenderedTextKeys()
      textAnimationScheduler.commitPass()
    })
    onUpdated(() => {
      reconcileRenderedTextKeys()
      textAnimationScheduler.commitPass()
    })

    return () => {
      textAnimationScheduler.beginPass({
        enabled: context.enableAnimate.value,
        stagger: context.animationStagger.value,
      })
      const lastIndex = findLastRenderableIndex(props.nodes)
      return props.nodes.map((node, index) => {
        const path = resolveTopLevelPath(node, index)
        const tag = typeof node === 'string' ? 'text' : node[0] ?? 'comment'
        return h(MarkdownBlock, {
          key: `${path}-${tag}`,
          components: props.components,
          loading: props.loading && index === lastIndex,
          node,
          onRendered: onBlockRendered,
          path,
        })
      })
    }
  },
})

function resolveTopLevelPath(node: Node, index: number): string {
  if (Array.isArray(node)) {
    const [tag, attrs] = node
    if (tag === 'section' && attrs && attrs.class === 'footnotes')
      return 'root-footnotes'
  }
  return `root-${index}`
}
