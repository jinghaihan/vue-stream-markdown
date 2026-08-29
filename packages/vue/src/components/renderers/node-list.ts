import type { ElementNode, Node } from 'comark'
import type { PropType, VNodeChild } from 'vue'
import type { MarkdownComponents } from '../../types'
import {
  createTextParts,
  DISABLED_TRANSITION_NAME,
  getTransitionName,
  resolveTextDirection,
} from '@stream-markdown/core'
import { createCommentVNode, defineAsyncComponent, defineComponent, h, TransitionGroup } from 'vue'
import { useContext } from '../../composables'

const CodeBlock = defineAsyncComponent(() => import('./code-block.vue'))
const ImageNode = defineAsyncComponent(() => import('./image-node.vue'))
const LinkNode = defineAsyncComponent(() => import('./link-node.vue'))
const MathNode = defineAsyncComponent(() => import('./math-node.vue'))
const TableNode = defineAsyncComponent(() => import('./table-node.vue'))
const CSS_TEXT_ANIMATIONS = new Set(['blur-in', 'fade-in', 'slide-up'])

const BLOCK_STYLES: Record<string, string> = {
  blockquote: 'text-muted-foreground mx-0 my-4 pl-4 border-l-4 border-l-muted-foreground/30 italic relative [&_p]:mb-0',
  h1: 'font-semibold mb-2 mt-6 text-3xl',
  h2: 'font-semibold mb-2 mt-6 text-2xl',
  h3: 'font-semibold mb-2 mt-6 text-xl',
  h4: 'font-semibold mb-2 mt-6 text-lg',
  h5: 'font-semibold mb-2 mt-6 text-base',
  h6: 'font-semibold mb-2 mt-6 text-sm',
  ol: 'leading-6 pl-5 whitespace-normal list-decimal',
  p: 'my-4 align-middle transition-[height] duration-[var(--default-transition-duration)] ease',
  ul: 'leading-6 pl-5 whitespace-normal list-disc',
}

const ELEMENT_STYLES: Record<string, string> = {
  a: 'text-primary underline cursor-pointer [overflow-wrap:anywhere]',
  code: 'text-sm font-mono px-1.5 py-0.5 rounded bg-muted whitespace-normal break-words',
  del: 'line-through',
  em: 'italic',
  hr: 'my-6 border-t border-border',
  img: 'rounded-lg max-w-full h-auto',
  input: 'mr-2 align-middle',
  li: 'py-1 pl-1 [&_p]:m-0',
  strong: 'font-semibold',
  sup: 'text-primary',
  table: 'border border-border rounded-lg w-full overflow-hidden border-collapse [&_p]:m-0 [&_tr]:border-b [&_tr]:border-border',
  tbody: 'font-semibold border-y border-border bg-muted/40 relative [&_td]:text-sm [&_td]:px-4 [&_td]:py-2',
  td: 'text-sm px-4 py-2',
  th: 'text-sm text-left px-4 py-2 whitespace-nowrap',
  thead: 'bg-muted/80 relative',
}

export default defineComponent({
  name: 'ComarkNodeList',
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

    function renderNodes(nodes: Node[], loading: boolean, parentKey = 'root'): VNodeChild[] {
      const lastIndex = findLastRenderableIndex(nodes)
      return nodes.map((node, index) => renderNode(
        node,
        loading && index === lastIndex,
        `${parentKey}-${index}`,
      ))
    }

    function renderNode(node: Node, loading: boolean, path: string): VNodeChild {
      if (typeof node === 'string') {
        const textKey = `${path}-text`
        renderedTextKeys.add(textKey)
        if (context.enableAnimate.value && node.trim())
          animatedTextKeys.add(textKey)

        const caret = loading && context.enableCaret.value
          ? h('span', {
              'key': `${textKey}-caret`,
              'data-stream-markdown': 'caret',
            }, context.caret.value)
          : undefined

        if (animatedTextKeys.has(textKey)) {
          const useCssAnimation = CSS_TEXT_ANIMATIONS.has(context.animation.value)
          const parts = createTextParts(node, textKey, context.animationSplit.value)
          const children = () => [
            ...parts.map(part => h('span', {
              'key': part.key,
              'data-stream-markdown': part.whitespace ? 'text-space' : `text-${part.animationSplit}`,
              'class': [
                '[text-decoration:inherit]',
                !part.whitespace && 'inline-block max-w-full whitespace-pre-wrap break-words',
                useCssAnimation && `stream-markdown-text-${context.animation.value}`,
              ],
            }, part.value)),
            caret,
          ]

          if (!useCssAnimation) {
            return h(TransitionGroup, {
              'key': textKey,
              'name': context.enableAnimate.value
                ? getTransitionName(context.animation.value)
                : DISABLED_TRANSITION_NAME,
              'tag': 'span',
              'data-stream-markdown': 'text',
              'class': 'whitespace-pre-wrap break-words [text-decoration:inherit]',
            }, children)
          }

          return h('span', {
            'key': textKey,
            'data-stream-markdown': 'text',
            'class': 'whitespace-pre-wrap break-words [text-decoration:inherit]',
          }, children())
        }

        return h('span', {
          'key': textKey,
          'data-stream-markdown': 'text',
          'class': 'whitespace-pre-wrap break-words [text-decoration:inherit]',
        }, [node, caret])
      }

      const [tag, attrs, ...children] = node
      if (tag === null)
        return createCommentVNode(String(children[0] ?? ''))

      const key = `${path}-${tag}`
      const component = props.components[tag]
      if (component) {
        return h(component, {
          ...resolveAttributes(attrs),
          key,
          node,
        }, {
          default: () => renderNodes(children, loading, key),
        })
      }

      if (tag === 'pre') {
        return h(CodeBlock, {
          key,
          loading,
          node,
          nodeKey: key,
        })
      }

      if (tag === 'math') {
        return h(MathNode, {
          key,
          loading,
          node,
          nodeKey: key,
        })
      }

      const resolvedAttrs = resolveAttributes(attrs)
      const className = [
        BLOCK_STYLES[tag],
        ELEMENT_STYLES[tag],
        resolvedAttrs.class,
      ]

      if (tag === 'a') {
        return h(LinkNode, {
          key,
          attributes: resolvedAttrs,
          loading,
          node,
          nodeKey: key,
        }, {
          default: () => renderNodes(children, loading, key),
        })
      }

      if (tag === 'img') {
        return h(ImageNode, {
          key,
          loading,
          node,
          nodeKey: key,
        })
      }

      if (tag === 'table') {
        return h(TableNode, {
          key,
          loading,
          node,
          nodeKey: key,
        }, {
          default: () => h('table', {
            ...resolvedAttrs,
            'class': className,
            'data-stream-markdown': 'table',
          }, renderNodes(children, loading, key)),
        })
      }

      const rendered = h(tag, {
        ...resolvedAttrs,
        'key': key,
        'class': className,
        'data-stream-markdown': resolveDataAttribute(tag),
        'dir': tag === 'code'
          ? 'ltr'
          : resolvedAttrs.dir ?? resolveNodeDirection(tag, node, context.dir.value),
      }, renderNodes(children, loading, key))

      return rendered
    }

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

function findLastRenderableIndex(nodes: Node[]): number {
  for (let index = nodes.length - 1; index >= 0; index--) {
    const node = nodes[index]!
    if (typeof node === 'string' || node[0] !== null)
      return index
  }
  return -1
}

const DIRECTIONAL_TAGS = new Set([
  'blockquote',
  'figcaption',
  'h1',
  'h2',
  'h3',
  'h4',
  'h5',
  'h6',
  'li',
  'p',
  'td',
  'th',
])

function resolveNodeDirection(
  tag: string,
  node: Node,
  direction: 'auto' | 'ltr' | 'rtl' | undefined,
) {
  if (!DIRECTIONAL_TAGS.has(tag))
    return undefined
  return resolveTextDirection(getNodeText(node), direction)
}

function getNodeText(node: Node): string {
  if (typeof node === 'string')
    return node

  let text = ''
  for (let index = 2; index < node.length; index++) {
    const child = node[index]
    if (typeof child === 'string')
      text += child
    else if (Array.isArray(child))
      text += getNodeText(child as Node)
  }
  return text
}

function resolveAttributes(attrs: ElementNode[1]): Record<string, unknown> {
  const resolved: Record<string, unknown> = {}
  for (const [rawName, rawValue] of Object.entries(attrs)) {
    if (rawName === '$')
      continue

    const name = rawName.startsWith(':') ? rawName.slice(1) : rawName
    resolved[name] = rawName.startsWith(':') ? resolveBoundValue(rawValue) : rawValue
  }
  return resolved
}

function resolveBoundValue(value: unknown): unknown {
  if (value === 'true')
    return true
  if (value === 'false')
    return false
  if (value === 'null')
    return null
  if (typeof value === 'string' && /^-?\d+(?:\.\d+)?$/.test(value))
    return Number(value)
  return value
}

function resolveDataAttribute(tag: string): string {
  if (/^h[1-6]$/.test(tag))
    return `heading-${tag.slice(1)}`
  if (tag === 'em')
    return 'emphasis'
  if (tag === 'del')
    return 'delete'
  if (tag === 'hr')
    return 'thematic-break'
  if (tag === 'a')
    return 'link'
  return tag
}
