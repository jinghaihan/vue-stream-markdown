<script lang="ts">
import type { Component, PropType, VNode } from 'vue'
import type { MarkdownAstParser, NodeRenderers, ParsedNode, SyntaxTree } from '../types'
import type { VNodeRenderContext, VNodeRenderer } from './renderers/types'
import { createNodeListModel, DISABLED_TRANSITION_NAME } from '@stream-markdown/core'
import { Comment, defineComponent, h, Transition } from 'vue'
import { useContext } from '../composables'
import { VNODE_RENDERERS } from './renderers'

interface RenderState {
  animation: VNodeRenderContext['animation']
  blocks: SyntaxTree[]
  enableAnimate: boolean
  markdownParser?: MarkdownAstParser
  nodeRenderers: NodeRenderers
  vnodeContext: VNodeRenderContext
}

export default defineComponent({
  name: 'NodeList',
  inheritAttrs: false,
  props: {
    markdownParser: Object as PropType<MarkdownAstParser>,
    nodeRenderers: Object as PropType<NodeRenderers>,
    nodes: {
      type: Array as PropType<ParsedNode[]>,
      default: () => [],
    },
    nodeKey: String,
    blockIndex: {
      type: Number,
      default: 0,
    },
    deep: {
      type: Number,
      required: true,
    },
    parentNode: Object as PropType<ParsedNode>,
    prevNode: Object as PropType<ParsedNode>,
    nextNode: Object as PropType<ParsedNode>,
    hideCaret: Boolean,
    blocks: Array as PropType<SyntaxTree[]>,
  },
  setup(props) {
    const context = useContext()
    const animatedTextKeys = new Set<string>()

    function renderNodes(
      nodes: ParsedNode[],
      options: {
        deep: number
        nodeKey?: string
        parentNode?: ParsedNode
      },
      state: RenderState,
    ): VNode[] {
      const model = createNodeListModel<ParsedNode, Component>({
        nodes,
        blocks: state.blocks,
        blockIndex: props.blockIndex,
        deep: options.deep,
        nodeKey: options.nodeKey,
        nodeRenderers: state.nodeRenderers,
        enableAnimate: state.enableAnimate,
        animation: state.animation,
      })

      return model.items.map((item) => {
        const rendererProps = {
          markdownParser: state.markdownParser,
          nodeRenderers: state.nodeRenderers,
          deep: options.deep,
          node: item.node,
          parentNode: options.parentNode,
          prevNode: item.prevNode,
          nextNode: item.nextNode,
          nodeKey: item.key,
          hideCaret: props.hideCaret,
        }
        const vnodeRenderer = VNODE_RENDERERS[item.node.type as keyof typeof VNODE_RENDERERS] as VNodeRenderer | undefined
        const vnode = item.renderer
          ? h(item.renderer, { ...rendererProps, key: item.key })
          : vnodeRenderer
            ? vnodeRenderer(rendererProps, state.vnodeContext)
            : h(Comment as unknown as Component, { key: item.key })

        if (!item.supportsTransition)
          return vnode

        return h(Transition, {
          key: item.key,
          name: item.shouldTransition ? model.transitionName : DISABLED_TRANSITION_NAME,
          appear: true,
        }, { default: () => vnode })
      })
    }

    return () => {
      let state: RenderState
      const renderedTextKeys = new Set<string>()
      const vnodeContext: VNodeRenderContext = {
        animatedTextKeys,
        animation: context.animation.value,
        animationSplit: context.animationSplit.value,
        caret: context.caret.value,
        direction: context.dir.value,
        enableAnimate: context.enableAnimate.value,
        enableCaret: context.enableCaret.value,
        renderedTextKeys,
        renderChildren: (children, childOptions) => renderNodes(children, childOptions, state),
      }
      state = {
        animation: vnodeContext.animation,
        blocks: context.blocks.value,
        enableAnimate: vnodeContext.enableAnimate,
        markdownParser: props.markdownParser ?? context.markdownParser,
        nodeRenderers: props.nodeRenderers ?? context.nodeRenderers.value,
        vnodeContext,
      }

      const vnodes = renderNodes(props.nodes, {
        deep: props.deep,
        nodeKey: props.nodeKey,
        parentNode: props.parentNode,
      }, state)
      for (const key of animatedTextKeys) {
        if (!renderedTextKeys.has(key))
          animatedTextKeys.delete(key)
      }
      return vnodes
    }
  },
})
</script>
