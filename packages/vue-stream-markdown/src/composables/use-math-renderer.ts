import type { CdnOptions } from '@stream-markdown/core'
import type { MaybeRefOrGetter } from 'vue'
import type { InlineMathNode, KatexOptions, MathNode } from '../types'
import { throttle } from '@antfu/utils'
import { createMathRendererModel } from '@stream-markdown/core'
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

  const model = computed(() => createMathRendererModel({
    node: node.value,
    installed: installed.value,
    renderFlag: renderFlag.value,
    renderingCode: renderingCode.value,
    errorMessage: errorMessage.value,
  }))
  const code = computed(() => model.value.code)
  const loading = computed(() => model.value.loading)
  const isDisplayMode = computed(() => model.value.isDisplayMode)
  const error = computed(() => model.value.error)

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
      renderingCode.value = ''
      errorMessage.value = ''
      return
    }

    if (error) {
      renderingCode.value = code.value
      errorMessage.value = error
    }
    else {
      renderingCode.value = ''
      errorMessage.value = ''
    }
  })

  watch(
    () => [code.value, loading.value],
    render,
    { immediate: true },
  )

  return { html, error, errorMessage }
}
