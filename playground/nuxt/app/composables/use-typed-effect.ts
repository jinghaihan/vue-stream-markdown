import type { MaybeRefOrGetter } from 'vue'
import { toValue } from 'vue'
import { isString } from '../utils'

interface UseTypedEffectOptions {
  enabled?: MaybeRefOrGetter<boolean>
  content: MaybeRefOrGetter<string>
  step?: MaybeRefOrGetter<number>
  delay?: MaybeRefOrGetter<number>
}

interface TypingPlan {
  index: number
  weight: number
}

export function useTypedEffect(options: UseTypedEffectOptions) {
  const enabled = computed(() => toValue(options.enabled) ?? true)

  const content = computed(() => toValue(options.content) ?? '')
  const step = computed(() => toValue(options.step) ?? 1)
  const delay = computed(() => toValue(options.delay) ?? 16)

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
      const plan = createForwardTypingPlan(content.value, typingIndex.value, step.value)

      intervalId.value = setTimeout(() => {
        typingIndex.value = plan.index
      }, resolveTypingDelay(delay.value, plan, step.value))

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
    const plan = createBackwardTypingPlan(content.value, typingIndex.value, count * step.value)
    typingIndex.value = plan.index
    prevContent.value = content.value.slice(0, typingIndex.value)
  }

  function nextStep(count: number = 1) {
    const plan = createForwardTypingPlan(content.value, typingIndex.value, count * step.value)
    typingIndex.value = plan.index
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

const CJK_RE = /[\p{Script=Han}\p{Script=Hiragana}\p{Script=Katakana}\p{Script=Hangul}]/u
const MARKDOWN_SYNTAX_RE = /^[\\`*_~[\](){}<>#+\-.!|:$]$/
const WHITESPACE_RE = /^\s+$/

const graphemeSegmenter = typeof Intl !== 'undefined' && 'Segmenter' in Intl
  ? new Intl.Segmenter(undefined, { granularity: 'grapheme' })
  : undefined

function getNextSegment(content: string, index: number): string {
  if (graphemeSegmenter) {
    const segment = graphemeSegmenter.segment(content.slice(index))[Symbol.iterator]().next().value?.segment
    if (segment)
      return segment
  }

  const codePoint = content.codePointAt(index)
  return codePoint === undefined ? '' : String.fromCodePoint(codePoint)
}

function getPreviousSegment(content: string, index: number): { index: number, segment: string } {
  let currentIndex = 0
  let previous = { index: 0, segment: '' }

  while (currentIndex < index) {
    const segment = getNextSegment(content, currentIndex)
    if (!segment)
      break

    previous = { index: currentIndex, segment }
    currentIndex += segment.length
  }

  return previous
}

function getSegmentWeight(segment: string): number {
  if (!segment)
    return 0
  if (WHITESPACE_RE.test(segment))
    return 0.35
  if (MARKDOWN_SYNTAX_RE.test(segment))
    return 0.45
  if (CJK_RE.test(segment))
    return 1.55
  return 1
}

function createForwardTypingPlan(content: string, start: number, visualStep: number): TypingPlan {
  const targetWeight = Math.max(1, visualStep)
  let index = start
  let weight = 0

  while (index < content.length && (weight < targetWeight || index === start)) {
    const segment = getNextSegment(content, index)
    if (!segment)
      break

    index += segment.length
    weight += getSegmentWeight(segment)
  }

  return {
    index,
    weight: Math.max(weight, targetWeight),
  }
}

function createBackwardTypingPlan(content: string, start: number, visualStep: number): TypingPlan {
  const targetWeight = Math.max(1, visualStep)
  let index = start
  let weight = 0

  while (index > 0 && (weight < targetWeight || index === start)) {
    const previous = getPreviousSegment(content, index)
    if (!previous.segment)
      break

    index = previous.index
    weight += getSegmentWeight(previous.segment)
  }

  return {
    index,
    weight: Math.max(weight, targetWeight),
  }
}

function resolveTypingDelay(baseDelay: number, plan: TypingPlan, visualStep: number): number {
  return Math.max(0, baseDelay * (plan.weight / Math.max(1, visualStep)))
}
