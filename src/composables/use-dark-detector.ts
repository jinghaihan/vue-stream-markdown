import type { MaybeRef } from 'vue'
import { useMutationObserver } from '@vueuse/core'
import { computed, onMounted, ref, unref, watch } from 'vue'
import { getOverlayContainer } from '../utils'

export function useDarkDetector(darkMode: MaybeRef<boolean | undefined>) {
  const target = ref<HTMLElement | null>()

  const isDarkProvided = computed(() => typeof unref(darkMode) === 'boolean')
  const detectedDark = ref<boolean>(false)
  const isDark = computed(() => isDarkProvided.value ? unref(darkMode)! : detectedDark.value)

  function ensureOverlayContainer() {
    const overlayContainer = getOverlayContainer()
    if (!overlayContainer) {
      const div = document.createElement('div')
      div.id = 'stream-markdown-overlay'
      div.classList.add('stream-markdown-overlay')
      div.classList.add(isDark.value ? 'dark' : 'light')
      document.body.appendChild(div)
    }
  }

  function updateOverlayContainerTheme() {
    const overlayContainer = getOverlayContainer()
    if (!overlayContainer)
      return

    overlayContainer.classList.toggle('dark', isDark.value)
    overlayContainer.classList.toggle('light', !isDark.value)
  }

  const { stop } = useMutationObserver(
    target,
    () => {
      detectedDark.value = document.documentElement.classList.contains('dark')
    },
    {
      attributes: true,
      attributeFilter: ['class'],
    },
  )

  watch(isDark, () => updateOverlayContainerTheme())

  watch(isDarkProvided, () => {
    if (isDarkProvided.value)
      target.value = null
  })

  onMounted(() => {
    ensureOverlayContainer()

    if (!isDarkProvided.value)
      target.value = document.documentElement
  })

  return { isDark, isDarkProvided, stop }
}
