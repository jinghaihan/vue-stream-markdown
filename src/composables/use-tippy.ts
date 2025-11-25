import type { DefaultProps } from 'tippy.js'
import type { MaybeRef } from 'vue'
import { computed, unref, watchEffect } from 'vue'
import { setDefaultProps } from 'vue-tippy'
import 'tippy.js/dist/tippy.css'
import 'tippy.js/themes/light.css'
import 'tippy.js/dist/border.css'
import 'tippy.js/dist/svg-arrow.css'

interface UseTippyOptions {
  isDark?: MaybeRef<boolean>
  options?: MaybeRef<DefaultProps>
}

export function useTippy(options?: UseTippyOptions) {
  const isDark = computed(() => unref(options?.isDark) ?? false)
  const tippyOptions = computed(() => unref(options?.options) ?? {})

  function initTippy() {
    setDefaultProps({
      allowHTML: true,
      delay: [100, 100],
      theme: isDark.value ? '' : 'light',
      ...tippyOptions,
    })

    watchEffect(() => {
      setDefaultProps({
        theme: isDark.value ? '' : 'light',
        ...tippyOptions.value,
      })
    })
  }

  return { initTippy }
}
