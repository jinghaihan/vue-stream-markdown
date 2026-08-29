import type { MaybeRefOrGetter } from 'vue'
import type { Extensions, MathRenderNode } from '../types'
import { throttle } from '@antfu/utils'
import {
  applyMathRendererResult,
  createMathRendererModel,
  createMathRendererState,
} from '@stream-markdown/core'
import { computed, ref, toValue, watch } from 'vue'

interface UseMathRendererOptions {
  node: MaybeRefOrGetter<MathRenderNode>
  extension?: MaybeRefOrGetter<Extensions['math'] | undefined>
  throttle?: MaybeRefOrGetter<number>
}

export function useMathRenderer(options: UseMathRendererOptions) {
  const state = ref(createMathRendererState())

  const node = computed(() => toValue(options.node))
  const extension = computed(() => toValue(options.extension))
  const throttleTime = computed(() => toValue(options.throttle) ?? 150)

  const model = computed(() => createMathRendererModel({
    node: node.value,
    installed: !!extension.value,
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
    if (!extension.value)
      return

    await extension.value.ensureCss?.()
    const result = await extension.value.render({
      code: code.value,
      displayMode: isDisplayMode.value,
    })
    state.value = applyMathRendererResult(state.value, code.value, result)
  })

  watch(
    () => [code.value, loading.value],
    render,
    { immediate: true },
  )

  return { html, error, errorMessage }
}
