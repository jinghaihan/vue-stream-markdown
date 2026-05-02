import type { CdnOptions } from '@stream-markdown/core'
import type { MaybeRefOrGetter } from 'vue'
import type { InlineMathNode, KatexOptions, MathNode } from '../types'
import { throttle } from '@antfu/utils'
import {
  applyMathRendererResult,
  createMathRendererModel,
  createMathRendererState,
} from '@stream-markdown/core'
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

  const state = ref(createMathRendererState())

  const node = computed(() => toValue(options.node))
  const katexOptions = computed(() => toValue(options.katexOptions)?.config ?? {})
  const throttleTime = computed(() => toValue(options.throttle) ?? 150)

  const model = computed(() => createMathRendererModel({
    node: node.value,
    installed: installed.value,
    renderFlag: state.value.renderFlag,
    renderingCode: state.value.renderingCode,
    errorMessage: state.value.errorMessage,
  }))
  const code = computed(() => model.value.code)
  const loading = computed(() => model.value.loading)
  const isDisplayMode = computed(() => model.value.isDisplayMode)
  const error = computed(() => model.value.error)
  const html = computed(() => state.value.html)
  const errorMessage = computed(() => state.value.errorMessage)

  const render = throttle(throttleTime, async () => {
    const result = await renderKatex(
      code.value,
      {
        ...katexOptions,
        displayMode: isDisplayMode.value,
      },
    )
    state.value = applyMathRendererResult(state.value, code.value, result)
  })

  watch(
    () => [code.value, loading.value],
    render,
    { immediate: true },
  )

  return { html, error, errorMessage }
}
