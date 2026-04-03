import type { CdnOptions } from '@stream-markdown/shared'
import type { MaybeRefOrGetter } from 'vue'
import type { InlineMathNode, KatexOptions, MathNode } from '../types'
import { throttle } from '@antfu/utils'
import { computed, ref, toValue, watch } from 'vue'
import { useKatex } from './use-katex'

interface UseMathRendererOptions {
  node: MaybeRefOrGetter<InlineMathNode | MathNode>
  katexOptions?: MaybeRefOrGetter<KatexOptions | undefined>
  cdnOptions?: CdnOptions
  throttle?: MaybeRefOrGetter<number>
}

export function useMathRenderer(options: UseMathRendererOptions) {
  const { installed, render: renderKatex } = useKatex({
    cdnOptions: options.cdnOptions,
  })

  const renderFlag = ref<boolean>(false)
  const renderingCode = ref<string>('')

  const html = ref<string>('')
  const errorMessage = ref<string>('')

  const node = computed(() => toValue(options.node))
  const katexOptions = computed(() => toValue(options.katexOptions)?.config ?? {})
  const throttleTime = computed(() => toValue(options.throttle) ?? 150)

  const code = computed(() => node.value.value)
  const loading = computed(() => node.value.loading)

  const isDisplayMode = computed(() => node.value.type !== 'inlineMath')

  const error = computed(() => {
    if (!installed.value)
      return true

    if (errorMessage.value
      && renderFlag.value
      && renderingCode.value === code.value) {
      return true
    }

    return false
  })

  const render = throttle(throttleTime, async () => {
    const { html: data, error } = await renderKatex(
      code.value,
      {
        ...katexOptions,
        displayMode: isDisplayMode.value,
      },
    )
    renderFlag.value = true

    if (data) {
      html.value = data
      errorMessage.value = ''
      return
    }

    if (error)
      errorMessage.value = error
    else
      errorMessage.value = ''
  })

  watch(
    () => [code.value, loading.value],
    render,
    { immediate: true },
  )

  return { html, error, errorMessage }
}
