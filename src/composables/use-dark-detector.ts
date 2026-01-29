import type { MaybeRef } from 'vue'
import { useMutationObserver } from '@vueuse/core'
import { computed, onMounted, ref, unref, watch } from 'vue'
import { OVERLAY_CONTAINER_ID } from '../constants'
import { getOverlayContainer } from '../utils'

export function useDarkDetector(darkProp: MaybeRef<boolean | undefined>, cssVariables: MaybeRef<Record<string, string>>) {
  const target = ref<HTMLElement | null>()

  const isDarkProvided = computed(() => typeof unref(darkProp) === 'boolean')
  const detectedDark = ref<boolean>(false)
  const isDark = computed(() => isDarkProvided.value ? unref(darkProp)! : detectedDark.value)

  function detect() {
    detectedDark.value = document.documentElement.classList.contains('dark')
  }

  function ensureOverlayContainer() {
    const overlayContainer = getOverlayContainer()
    if (!overlayContainer) {
      createOverlayContainer()
      updateOverlayContainerTheme()
    }
  }

  function createOverlayContainer() {
    const div = document.createElement('div')
    div.id = OVERLAY_CONTAINER_ID
    div.classList.add(OVERLAY_CONTAINER_ID)
    div.classList.add(isDark.value ? 'dark' : 'light')
    document.body.appendChild(div)
  }

  function updateOverlayContainerTheme() {
    const overlayContainer = getOverlayContainer()
    if (!overlayContainer)
      return

    overlayContainer.classList.toggle('dark', isDark.value)
    overlayContainer.classList.toggle('light', !isDark.value)
    Object.entries(cssVariables.value).forEach(([key, value]) => {
      overlayContainer.style.setProperty(key, value)
    })
  }

  const { stop } = useMutationObserver(
    target,
    detect,
    {
      attributes: true,
      attributeFilter: ['class'],
      subtree: false,
    },
  )

  watch(() => [isDark.value, cssVariables.value], () => updateOverlayContainerTheme())

  watch(isDarkProvided, () => {
    if (isDarkProvided.value)
      target.value = null
  })

  onMounted(() => {
    ensureOverlayContainer()

    if (!isDarkProvided.value) {
      detect()
      target.value = document.documentElement
    }
  })

  return { isDark, isDarkProvided, stop }
}
