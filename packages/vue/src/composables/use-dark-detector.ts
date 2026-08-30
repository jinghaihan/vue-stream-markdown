import type { MaybeRefOrGetter } from 'vue'
import {
  ensureOverlayContainer,
  getDocumentElement,
  getOverlayContainer,
  isDocumentElementDark,
  syncOverlayContainerTheme,
} from '@stream-markdown/core'
import { useMutationObserver } from '@vueuse/core'
import { computed, onMounted, ref, toValue, watch } from 'vue'

interface UseDarkDetectorOptions {
  manageOverlay?: MaybeRefOrGetter<boolean>
}

export function useDarkDetector(
  darkProp: MaybeRefOrGetter<boolean | undefined>,
  cssVariables: MaybeRefOrGetter<Record<string, string>>,
  options: UseDarkDetectorOptions = {},
) {
  const target = ref<HTMLElement | null>()
  const resolvedCssVariables = computed(() => toValue(cssVariables))

  const isDarkProvided = computed(() => typeof toValue(darkProp) === 'boolean')
  const detectedDark = ref<boolean>(false)
  const isDark = computed(() => isDarkProvided.value ? toValue(darkProp)! : detectedDark.value)

  function detect() {
    detectedDark.value = isDocumentElementDark()
  }

  function updateOverlayContainerTheme() {
    if (toValue(options.manageOverlay) === false)
      return

    syncOverlayContainerTheme(getOverlayContainer(), {
      isDark: isDark.value,
      cssVariables: resolvedCssVariables.value,
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
    if (toValue(options.manageOverlay) !== false) {
      ensureOverlayContainer({
        isDark: isDark.value,
        cssVariables: resolvedCssVariables.value,
      })
    }

    if (!isDarkProvided.value) {
      detect()
      target.value = getDocumentElement()
    }
  })

  return { isDark, isDarkProvided, stop }
}
