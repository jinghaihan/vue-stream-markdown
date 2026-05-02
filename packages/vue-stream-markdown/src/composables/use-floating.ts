import type { Placement } from '@floating-ui/dom'
import type { MaybeRefOrGetter } from 'vue'
import {
  autoUpdate,
  computePosition,
  flip,
  offset,
  shift,
} from '@floating-ui/dom'
import {
  createFloatingStyle,
  getDocument,
  isClickInsideFloating,
  isClient,
  isElementInDocumentBody,
  resolveFloatingDelay,
} from '@stream-markdown/core'
import { useEventListener } from '@vueuse/core'
import { computed, onMounted, ref, toValue, watch, watchEffect } from 'vue'

interface UseFloatingOptions {
  hideTooltip?: MaybeRefOrGetter<boolean>
  trigger?: MaybeRefOrGetter<'hover' | 'click'>
  placement?: MaybeRefOrGetter<Placement>
  delay?: MaybeRefOrGetter<number | [number, number]>
  getContainer?: () => Element | HTMLElement | undefined | null
}

export function useFloating(options: UseFloatingOptions) {
  const hideTooltip = computed(() => toValue(options.hideTooltip) ?? false)
  const trigger = computed((): 'hover' | 'click' => toValue(options.trigger) ?? 'hover')
  const placement = computed((): Placement => toValue(options.placement) ?? 'top')
  const delay = computed((): number | [number, number] => toValue(options.delay) ?? [100, 100])

  const referenceEl = ref<HTMLElement>()
  const floatingEl = ref<HTMLElement>()

  let showTimer: number | null = null
  let hideTimer: number | null = null

  const open = ref(false)

  const x = ref<number | null>(null)
  const y = ref<number | null>(null)
  const strategy = ref<'absolute' | 'fixed'>('absolute')

  const appendTo = ref<Element | Body | string>()

  // Auto-update position when elements or placement change
  let cleanupAutoUpdate: (() => void) | null = null

  async function updatePosition() {
    if (!referenceEl.value || !floatingEl.value || !isClient())
      return

    try {
      const position = await computePosition(
        referenceEl.value,
        floatingEl.value,
        {
          placement: placement.value,
          middleware: [
            offset(6),
            flip(),
            shift({ padding: 5 }),
          ],
        },
      )

      x.value = position.x
      y.value = position.y
      strategy.value = position.strategy
    }
    catch {
      // safe guard
    }
  }

  watchEffect(() => {
    if (cleanupAutoUpdate) {
      cleanupAutoUpdate()
      cleanupAutoUpdate = null
    }

    if (!referenceEl.value || !floatingEl.value || !isClient())
      return

    cleanupAutoUpdate = autoUpdate(
      referenceEl.value,
      floatingEl.value,
      updatePosition,
    )
  })

  watch(placement, () => {
    if (open.value)
      updatePosition()
  })

  const parentEl = computed(() => {
    if (!isClient())
      return null
    return referenceEl.value?.parentElement || null
  })

  const getAppendTo = () => {
    if (!isClient())
      return options.getContainer?.() || 'body'
    const target = options.getContainer?.() || parentEl.value
    if (target instanceof HTMLElement && !isElementInDocumentBody(target))
      return 'body'
    return target || 'body'
  }

  const floatingStyle = computed(() => createFloatingStyle({
    x: x.value,
    y: y.value,
    strategy: strategy.value,
  }))

  function show() {
    clearTimers()
    const { show: showDelay } = resolveFloatingDelay(delay.value)

    showTimer = window.setTimeout(() => {
      open.value = true
      updatePosition()
    }, showDelay)
  }

  function hide() {
    clearTimers()
    const { hide: hideDelay } = resolveFloatingDelay(delay.value)

    hideTimer = window.setTimeout(() => {
      open.value = false
    }, hideDelay)
  }

  function toggle() {
    open.value = !open.value
    updatePosition()
  }

  function onMouseEnter() {
    if (hideTooltip.value)
      return
    if (trigger.value === 'hover')
      show()
  }

  function onMouseLeave() {
    if (trigger.value === 'hover')
      hide()
  }

  function onClick() {
    if (trigger.value === 'click')
      toggle()
  }

  function handleClickOutside(event: MouseEvent) {
    if (!open.value)
      return

    const target = event.target as Node
    if (!isClickInsideFloating(target, referenceEl.value, floatingEl.value))
      open.value = false
  }

  function onFloatingEnter() {
    if (hideTimer) {
      clearTimeout(hideTimer)
      hideTimer = null
    }
  }

  function onFloatingLeave() {
    const { hide: hideDelay } = resolveFloatingDelay(delay.value)
    if (trigger.value === 'hover') {
      hideTimer = window.setTimeout(() => {
        hide()
      }, hideDelay)
    }
  }

  function clearTimers() {
    if (showTimer) {
      clearTimeout(showTimer)
      showTimer = null
    }
    if (hideTimer) {
      clearTimeout(hideTimer)
      hideTimer = null
    }
  }

  onMounted(() => {
    appendTo.value = getAppendTo()
    useEventListener(getDocument(), 'click', handleClickOutside)
  })

  return {
    referenceEl,
    floatingEl,
    open,
    appendTo,
    floatingStyle,
    show,
    hide,
    onMouseEnter,
    onMouseLeave,
    onClick,
    onFloatingEnter,
    onFloatingLeave,
  }
}
