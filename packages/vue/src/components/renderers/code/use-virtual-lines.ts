import type { CodeToken } from '@stream-markdown/core'
import type { ComputedRef, Ref } from 'vue'
import { useEventListener, useResizeObserver, useVirtualList } from '@vueuse/core'
import { computed, inject, nextTick, onMounted, ref, watch } from 'vue'
import { CODE_VIEWPORT_CONTEXT } from '../../code-block/viewport-context'

const OVERSCAN = 10

export function useVirtualCodeLines(
  lines: ComputedRef<CodeToken[][]>,
  pre: Ref<HTMLElement | undefined>,
  requested: () => boolean,
) {
  const viewport = inject(CODE_VIEWPORT_CONTEXT, undefined)
  const rowHeight = ref(20)
  const leadingSpace = ref(0)
  const trailingSpace = ref(0)
  const noWrap = ref(true)
  const enabled = computed(() => requested() && !!viewport?.bounded.value && noWrap.value)
  const source = computed(() => enabled.value ? lines.value : [])
  const { list, containerProps, wrapperProps } = useVirtualList(source, {
    itemHeight: index => rowHeight.value
      + (index === 0 ? leadingSpace.value : 0)
      + (index === lines.value.length - 1 ? trailingSpace.value : 0),
    overscan: OVERSCAN,
  })

  function measure() {
    const element = pre.value
    const container = viewport?.element.value
    if (!element || !container || !requested() || !viewport?.bounded.value)
      return
    const style = getComputedStyle(element)
    noWrap.value = !['pre-wrap', 'break-spaces', 'normal', 'pre-line'].includes(style.whiteSpace)
    if (!noWrap.value)
      return
    const line = element.querySelector<HTMLElement>('[data-stream-markdown="code-line"]')
    const height = Number.parseFloat((line ? getComputedStyle(line) : style).lineHeight)
    if (Number.isFinite(height) && height > 0)
      rowHeight.value = height
    if (!container.clientHeight)
      return
    const top = element.getBoundingClientRect().top - container.getBoundingClientRect().top
      + container.scrollTop + (Number.parseFloat(style.paddingTop) || 0)
    leadingSpace.value = Math.max(0, top)
    trailingSpace.value = Math.max(0, container.scrollHeight - top - lines.value.length * rowHeight.value)
  }

  async function refresh() {
    await nextTick()
    measure()
    containerProps.onScroll()
  }

  watch(
    () => enabled.value ? viewport?.element.value : undefined,
    (element) => {
      containerProps.ref.value = element ?? null
      void refresh()
    },
    { immediate: true, flush: 'post' },
  )
  watch([lines, rowHeight], refresh, { flush: 'post' })
  useEventListener(() => enabled.value ? viewport?.element.value : undefined, 'scroll', containerProps.onScroll, { passive: true })
  useResizeObserver(() => viewport?.element.value, refresh)
  useResizeObserver(pre, refresh)
  onMounted(refresh)

  const visibleLines = computed(() => {
    if (!enabled.value)
      return lines.value.map((data, index) => ({ data, index }))
    // Keep the initial render bounded before the viewport ref is assigned.
    return list.value.length
      ? list.value
      : lines.value.slice(0, OVERSCAN * 2).map((data, index) => ({ data, index }))
  })
  const firstIndex = computed(() => visibleLines.value[0]?.index ?? 0)
  const wrapperStyle = computed(() => ({
    ...wrapperProps.value.style,
    marginTop: `${firstIndex.value * rowHeight.value}px`,
    height: `${Math.max(0, (lines.value.length - firstIndex.value) * rowHeight.value)}px`,
  }))

  return { enabled, firstIndex, rowHeight, visibleLines, wrapperStyle }
}
