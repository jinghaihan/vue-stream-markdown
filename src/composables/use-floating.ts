import type { Placement } from '@floating-ui/dom'
import type { MaybeRef } from 'vue'
import {
  autoUpdate,
  computePosition,
  flip,
  offset,
  shift,
} from '@floating-ui/dom'
import { useEventListener } from '@vueuse/core'
import { computed, onMounted, ref, unref, watch, watchEffect } from 'vue'
import { isClient } from '../utils'

interface UseFloatingOptions {
  hideTooltip?: MaybeRef<boolean>
  trigger?: MaybeRef<'hover' | 'click'>
  placement?: MaybeRef<Placement>
  delay?: MaybeRef<number | [number, number]>
  getContainer?: () => Element | HTMLElement | undefined | null
}

export function useFloating(options: UseFloatingOptions) {
  const hideTooltip = computed(() => unref(options.hideTooltip) ?? false)
  const trigger = computed((): 'hover' | 'click' => unref(options.trigger) ?? 'hover')
  const placement = computed((): Placement => unref(options.placement) ?? 'top')
  const delay = computed((): number | [number, number] => unref(options.delay) ?? [100, 100])

  const referenceEl = ref<HTMLElement>()
  const floatingEl = ref<HTMLElement>()

  let showTimer: number | null = null
  let hideTimer: number | null = null

  const open = ref(false)

  const x = ref<number | null>(null)
  const y = ref<number | null>(null)
  const strategy = ref<'absolute' | 'fixed'>('absolute')

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

  const appendTo = computed(() => {
    if (!isClient())
      return options.getContainer?.() || 'body'
    const target = options.getContainer?.() || parentEl.value
    if (target instanceof HTMLElement && !document.body.contains(target))
      return 'body'
    return target || 'body'
  })

  const floatingStyle = computed(() => ({
    position: strategy.value,
    top: `${y.value ?? 0}px`,
    left: `${x.value ?? 0}px`,
  }))

  function show() {
    clearTimers()
    const { show: showDelay } = getDelay()

    showTimer = window.setTimeout(() => {
      open.value = true
      updatePosition()
    }, showDelay)
  }

  function hide() {
    clearTimers()
    const { hide: hideDelay } = getDelay()

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

  function getDelay() {
    if (Array.isArray(delay.value)) {
      return {
        show: delay.value[0] ?? 0,
        hide: delay.value[1] ?? 0,
      }
    }
    return {
      show: delay.value ?? 0,
      hide: delay.value ?? 0,
    }
  }

  function handleClickOutside(event: MouseEvent) {
    if (!open.value)
      return

    const target = event.target as Node
    const isClickInside = referenceEl.value?.contains(target)
      || floatingEl.value?.contains(target)

    if (!isClickInside) {
      open.value = false
    }
  }

  function onFloatingEnter() {
    if (hideTimer) {
      clearTimeout(hideTimer)
      hideTimer = null
    }
  }

  function onFloatingLeave() {
    const { hide: hideDelay } = getDelay()
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

  // onMounted will only be called in the client side so it guarantees the DOM APIs are available, and this works
  // properly in SSR. As per https://vueuse.org/core/useEventListener
  onMounted(() => {
    useEventListener(document, 'click', handleClickOutside)
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
