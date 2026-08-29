import type { CdnOptions } from '@stream-markdown/core'
import type { KatexOptions } from 'katex'
import type { MaybeRefOrGetter } from 'vue'
import { isClient } from '@stream-markdown/core'
import { createKatexRuntime } from '@stream-markdown/math'
import { computed, ref, toValue, watch } from 'vue'

function checkMathSyntax(content: string): boolean {
  return content.includes('$') || content.includes('\\(') || content.includes('\\[')
}

interface UseKatexOptions {
  markdown?: MaybeRefOrGetter<string>
  cdnOptions?: CdnOptions
}

export function useKatex(options: UseKatexOptions) {
  const { cdnOptions } = options ?? {}

  const markdownContent = computed(() => toValue(options.markdown) ?? '')
  const hasMathSyntax = computed(() => checkMathSyntax(markdownContent.value))

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
      if (hasMathSyntax)
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
