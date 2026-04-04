import type { CdnOptions } from '@stream-markdown/shared'
import type { KatexOptions } from 'katex'
import type { MaybeRefOrGetter } from 'vue'
import type { MdastOptions } from '../types'
import { checkMathSyntax } from '@markmend/core'
import { createKatexRuntime } from '@stream-markdown/math'
import { isClient } from '@stream-markdown/shared'
import { computed, ref, toValue, watch } from 'vue'

interface UseKatexOptions {
  markdown?: MaybeRefOrGetter<string>
  mdastOptions?: MdastOptions
  cdnOptions?: CdnOptions
}

export function useKatex(options: UseKatexOptions) {
  const { mdastOptions, cdnOptions } = options ?? {}

  const markdownContent = computed(() => toValue(options.markdown) ?? '')
  const hasMathPlugin = mdastOptions?.builtin?.micromark?.math !== false
  const singleDollarTextMath = mdastOptions?.singleDollarTextMath === true
  const hasMathSyntax = computed(() => checkMathSyntax(markdownContent.value, singleDollarTextMath))

  const installed = ref<boolean>(false)
  const runtime = createKatexRuntime({
    cdnOptions: () => cdnOptions,
  })

  async function render(code: string, options: KatexOptions = {}) {
    return await runtime.renderToHtml(code, {
      config: options,
    })
  }

  async function preload() {
    installed.value = await runtime.installed
    if (installed.value)
      await runtime.preload()
  }

  watch(
    () => hasMathSyntax.value,
    (hasMathSyntax) => {
      if (hasMathSyntax && hasMathPlugin)
        runtime.ensureCss()
    },
    { immediate: true },
  )

  if (isClient()) {
    (async () => {
      installed.value = await runtime.installed
    })()
  }

  return {
    installed,
    render,
    preload,
    dispose: runtime.dispose,
    loadCdnKatexCss: runtime.ensureCss,
  }
}
