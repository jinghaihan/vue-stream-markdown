import type { MarkdownParserResult } from '../types'
import { ref } from 'vue'
import { createIdleCallback, isClient } from '../utils'

interface UseIdleOptions {
  idle?: boolean
  idleTimeout?: number
}

export function useDirtyParser(parse: (content: string) => MarkdownParserResult, options: UseIdleOptions = {}) {
  const running = ref(false)
  const hasPending = ref(false)
  const latestInput = ref<string>()
  const result = ref<MarkdownParserResult>()

  const idle = createIdleCallback()
  let idleId: number | null = null

  function scheduleRun() {
    if (idleId != null)
      return

    if (options.idle && isClient()) {
      idleId = idle.request(() => {
        idleId = null
        run()
      }, options.idleTimeout)
    }
    else {
      run()
    }
  }

  function run() {
    if (!hasPending.value || latestInput.value == null) {
      running.value = false
      return
    }

    hasPending.value = false
    const input = latestInput.value

    const output = parse(input)

    result.value = output

    if (hasPending.value)
      scheduleRun()
    else
      running.value = false
  }

  function requestParse(content: string) {
    latestInput.value = content
    hasPending.value = true

    if (running.value)
      return

    running.value = true
    scheduleRun()
  }

  return { requestParse, result, running }
}
