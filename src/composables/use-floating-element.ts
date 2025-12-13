import type { Placement } from '@floating-ui/vue'
import type { MaybeRef } from 'vue'
import { autoUpdate, flip, offset, shift, useFloating } from '@floating-ui/vue'
import { useEventListener } from '@vueuse/core'
import { computed, ref, unref } from 'vue'
import { isClient } from '../utils'

interface UseFloatingElementOptions {
  trigger?: MaybeRef<'hover' | 'click'>
  placement?: MaybeRef<Placement>
  delay?: MaybeRef<number | [number, number]>
  getContainer?: () => HTMLElement | undefined
}

export function useFloatingElement(options: UseFloatingElementOptions) {
  const trigger = computed((): 'hover' | 'click' => unref(options.trigger) ?? 'hover')
  const placement = computed((): Placement => unref(options.placement) ?? 'top')
  const delay = computed((): number | [number, number] => unref(options.delay) ?? [100, 100])

  const referenceEl = ref<HTMLElement>()
  const floatingEl = ref<HTMLElement>()

  let showTimer: number | null = null
  let hideTimer: number | null = null

  const open = ref(false)

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

  const { x, y, strategy, update } = useFloating(
    referenceEl,
    floatingEl,
    {
      placement,
      middleware: [
        offset(6),
        flip(),
        shift({ padding: 5 }),
      ],
      whileElementsMounted: autoUpdate,
    },
  )

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
      update()
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
    update()
  }

  function onMouseEnter() {
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
    const isClickInside
      = referenceEl.value?.contains(target)
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

  useEventListener(document, 'click', handleClickOutside)

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
