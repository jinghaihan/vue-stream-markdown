import type { MaybeRefOrGetter } from 'vue'
import { getOverlayContainer, OVERLAY_CONTAINER_ID } from '@stream-markdown/shared'
import { useMutationObserver } from '@vueuse/core'
import { computed, onMounted, ref, toValue, watch } from 'vue'

export function useDarkDetector(
  darkProp: MaybeRefOrGetter<boolean | undefined>,
  cssVariables: MaybeRefOrGetter<Record<string, string>>,
) {
  const target = ref<HTMLElement | null>()
  const resolvedCssVariables = computed(() => toValue(cssVariables))

  const isDarkProvided = computed(() => typeof toValue(darkProp) === 'boolean')
  const detectedDark = ref<boolean>(false)
  const isDark = computed(() => isDarkProvided.value ? toValue(darkProp)! : detectedDark.value)

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
    div.classList.add('stream-markdown')
    div.classList.add(isDark.value ? 'dark' : 'light')
    document.body.appendChild(div)
  }

  function updateOverlayContainerTheme() {
    const overlayContainer = getOverlayContainer()
    if (!overlayContainer)
      return

    overlayContainer.classList.toggle('dark', isDark.value)
    overlayContainer.classList.toggle('light', !isDark.value)
    Object.entries(resolvedCssVariables.value).forEach(([key, value]) => {
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

  watch(() => [isDark.value, resolvedCssVariables.value], () => updateOverlayContainerTheme())

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
