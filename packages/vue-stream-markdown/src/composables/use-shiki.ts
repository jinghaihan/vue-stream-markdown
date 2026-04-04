import type { CdnOptions } from '@stream-markdown/shared'

import type { MaybeRefOrGetter } from 'vue'
import type { ShikiOptions } from '../types'
import {
  createShikiRuntime,
  DEFAULT_SHIKI_DARK_THEME,
  DEFAULT_SHIKI_LIGHT_THEME,
  disposeSharedShikiHighlighter,
  LANGUAGE_ALIAS,
} from '@stream-markdown/code'
import { isClient } from '@stream-markdown/shared'
import { computed, ref, toValue } from 'vue'

interface UseShikiOptions {
  lang?: MaybeRefOrGetter<string>
  shikiOptions?: MaybeRefOrGetter<ShikiOptions | undefined>
  cdnOptions?: MaybeRefOrGetter<CdnOptions | undefined>
  isDark?: MaybeRefOrGetter<boolean>
}

export function disposeShikiHighlighter() {
  disposeSharedShikiHighlighter()
}

export function useShiki(options?: UseShikiOptions) {
  const installed = ref<boolean>(false)

  const lang = computed(() => toValue(options?.lang) ?? 'plaintext')
  const runtime = createShikiRuntime({
    lang: () => lang.value,
    cdnOptions: () => toValue(options?.cdnOptions),
    isDark: () => toValue(options?.isDark) ?? false,
    theme: () => toValue(options?.shikiOptions)?.theme ?? [DEFAULT_SHIKI_LIGHT_THEME, DEFAULT_SHIKI_DARK_THEME],
    langs: () => toValue(options?.shikiOptions)?.langs ?? [],
    langAlias: () => ({
      ...LANGUAGE_ALIAS,
      ...(toValue(options?.shikiOptions)?.langAlias ?? {}),
    }),
    codeToTokenOptions: () => toValue(options?.shikiOptions)?.codeToTokenOptions,
  })

  async function preload() {
    installed.value = await runtime.installed
    if (installed.value)
      await runtime.preload()
  }

  if (isClient()) {
    (async () => {
      installed.value = await runtime.installed
    })()
  }

  return {
    installed,
    getShiki: runtime.getShiki,
    getHighlighter: runtime.getHighlighter,
    codeToTokens: runtime.codeToTokens,
    preload,
    dispose: runtime.dispose,
  }
}
