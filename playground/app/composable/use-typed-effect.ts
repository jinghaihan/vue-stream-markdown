import { isString } from '../utils'

interface UseTypedEffectOptions {
  enabled?: MaybeRef<boolean>
  content: MaybeRef<string>
  step?: MaybeRef<number>
  delay?: MaybeRef<number>
}

export function useTypedEffect(options: UseTypedEffectOptions) {
  const enabled = computed(() => unref(options.enabled) ?? true)

  const content = computed(() => unref(options.content) ?? true)
  const step = computed(() => unref(options.step) ?? 1)
  const delay = computed(() => unref(options.delay) ?? 16)

  const isTyping = ref<boolean>(false)
  const prevContent = ref<string>('')
  const typingIndex = ref<number>(0)

  const intervalId = ref<NodeJS.Timeout | null>(null)

  watch(
    [typingIndex, isTyping],
    () => {
      if (!enabled.value || !isString(content.value))
        return

      if (typingIndex.value >= content.value.length) {
        isTyping.value = false
        return
      }

      isTyping.value = true
      prevContent.value = content.value.slice(0, typingIndex.value)

      intervalId.value = setTimeout(() => {
        typingIndex.value = typingIndex.value + step.value
      }, delay.value)

      onWatcherCleanup(() => intervalId.value && clearTimeout(intervalId.value))
    },
    { immediate: true },
  )

  watch(
    () => enabled.value,
    () => {
      if (!isString(content.value))
        return

      if (!enabled.value) {
        stop()
        return
      }

      if (enabled.value) {
        isTyping.value = true
        if (typingIndex.value >= content.value.length)
          typingIndex.value = 0
        else if (content.value.startsWith(prevContent.value))
          typingIndex.value = prevContent.value.length
        else
          typingIndex.value = 0
      }
    },
  )

  const typedContent = computed(() =>
    isString(content.value)
      ? content.value.slice(0, typingIndex.value)
      : '',
  )

  function prevStep(count: number = 1) {
    typingIndex.value = Math.max(0, typingIndex.value - count * step.value)
    prevContent.value = content.value.slice(0, typingIndex.value)
  }

  function nextStep(count: number = 1) {
    typingIndex.value = Math.min(content.value.length, typingIndex.value + count * step.value)
    prevContent.value = content.value.slice(0, typingIndex.value)
  }

  function toStep(index: number) {
    const value = Math.max(0, Math.min(content.value.length, index))
    typingIndex.value = value
    prevContent.value = content.value.slice(0, typingIndex.value)
  }

  function stop() {
    isTyping.value = false
    intervalId.value && clearTimeout(intervalId.value)
  }

  function terminate() {
    stop()
    typingIndex.value = 0
    prevContent.value = ''
  }

  return {
    typedContent,
    typingIndex,
    isTyping,
    prevStep,
    nextStep,
    toStep,
    stop,
    terminate,
  }
}
