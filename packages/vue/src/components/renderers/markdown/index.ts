import type { CompletionInfo, Node } from '@markmend/parser'
import type { PropType } from 'vue'
import type { MarkdownComponents } from '../../../types'
import { computed, defineComponent, h, inject, onMounted, onUnmounted, onUpdated, provide } from 'vue'
import { useContext } from '../../../composables'
import { MARKDOWN_RENDER_CONTEXT } from './context'
import { createNodeRenderer } from './node-renderer'
import { collectImageSources, findLastRenderableIndex } from './node-utils'
import { createTextAnimationController } from './text-animation'

export default defineComponent({
  name: 'MarkdownNodes',
  props: {
    completionInfo: {
      type: Object as PropType<CompletionInfo>,
      default: undefined,
    },
    components: {
      type: Object as PropType<MarkdownComponents>,
      default: undefined,
    },
    hideCaret: Boolean,
    loading: Boolean,
    nodeKey: String,
    nodes: {
      type: Array as PropType<Node[]>,
      default: () => [],
    },
  },
  setup(props) {
    const context = useContext()
    const parent = props.nodeKey ? inject(MARKDOWN_RENDER_CONTEXT, undefined) : undefined
    const components = computed(() => props.components ?? parent?.components.value ?? {})
    const completionInfo = computed(() => props.completionInfo ?? parent?.completionInfo.value)
    const imageSources = computed(() => parent?.imageSources.value ?? collectImageSources(props.nodes))
    provide(MARKDOWN_RENDER_CONTEXT, { components, completionInfo, imageSources })
    const animatedTextKeys = new Set<string>()
    const textAnimationScheduler = createTextAnimationController(context)
    onUnmounted(textAnimationScheduler.dispose)
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
          getCompletionInfo: () => completionInfo.value,
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
        const path = props.nodeKey ? `${props.nodeKey}-${index}` : resolveTopLevelPath(node, index)
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

    onMounted(reconcileRenderedTextKeys)
    onUpdated(reconcileRenderedTextKeys)

    return () => {
      if (!context.enableAnimate.value)
        animatedTextKeys.clear()
      const lastIndex = findLastRenderableIndex(props.nodes)
      return props.nodes.map((node, index) => {
        const path = props.nodeKey ? `${props.nodeKey}-${index}` : resolveTopLevelPath(node, index)
        const tag = typeof node === 'string' ? 'text' : node[0] ?? 'comment'
        return h(MarkdownBlock, {
          key: `${path}-${tag}`,
          components: components.value,
          hideCaret: props.hideCaret,
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
