export interface CreateStreamSmootherOptions {
  now?: () => number
}

export interface StreamSmoother {
  getContent: () => string
  getNextDelay: () => number
  hasPending: () => boolean
  reset: (content: string) => string
  take: () => string | undefined
  update: (content: string) => StreamSmoothingUpdate
}

export type StreamSmoothingUpdate = 'immediate' | 'pending' | 'unchanged'

interface CurrentCpsOptions {
  arrivalCpsEma: number
  backlog: number
  baseCps: number
  chunkSizeEma: number
  inputActive: boolean
  settling: boolean
  targetLag: number
}

interface RevealUnitsOptions {
  backlog: number
  chunkSizeEma: number
  currentCps: number
  elapsedSeconds: number
  inputActive: boolean
  shortfall: number
  targetLag: number
}

const ACTIVE_INPUT_WINDOW_MS = 220
const DEFAULT_CPS = 38
const EMA_ALPHA = 0.2
const FLUSH_CPS = 120
const LARGE_APPEND_UNITS = 120
const MAX_ACTIVE_CPS = 132
const MAX_CPS = 72
const MAX_FLUSH_CPS = 280
const MIN_COMMIT_INTERVAL_MS = 48
const MIN_CPS = 18
const SETTLE_AFTER_MS = 360
const SETTLE_DRAIN_MAX_MS = 520
const SETTLE_DRAIN_MIN_MS = 180
const TARGET_BUFFER_MS = 120

/**
 * Creates a framework-independent display buffer for append-only streams.
 * Replacements and unusually large appends are exposed immediately.
 */
export function createStreamSmoother(
  initialContent = '',
  options: CreateStreamSmootherOptions = {},
): StreamSmoother {
  const now = options.now ?? defaultNow
  let targetContent = initialContent
  let targetUnits = countUnits(initialContent)
  let displayedContent = initialContent
  let displayedUnits = targetUnits
  let displayedOffset = initialContent.length
  let emaCps = DEFAULT_CPS
  let chunkSizeEma = 1
  let arrivalCpsEma = DEFAULT_CPS
  let lastInputAt = now()
  let lastInputUnits = targetUnits
  let lastRevealAt = lastInputAt

  function reset(content: string): string {
    const timestamp = now()
    targetContent = content
    targetUnits = countUnits(content)
    displayedContent = content
    displayedUnits = targetUnits
    displayedOffset = content.length
    emaCps = DEFAULT_CPS
    chunkSizeEma = 1
    arrivalCpsEma = DEFAULT_CPS
    lastInputAt = timestamp
    lastInputUnits = targetUnits
    lastRevealAt = timestamp
    return displayedContent
  }

  function update(content: string): StreamSmoothingUpdate {
    if (content === targetContent)
      return 'unchanged'

    if (!content.startsWith(targetContent)) {
      reset(content)
      return 'immediate'
    }

    const appended = content.slice(targetContent.length)
    const appendedUnits = countUnits(appended)
    if (appendedUnits > LARGE_APPEND_UNITS) {
      reset(content)
      return 'immediate'
    }

    const timestamp = now()
    targetContent = content
    targetUnits += appendedUnits

    const deltaUnits = targetUnits - lastInputUnits
    const deltaMs = Math.max(1, timestamp - lastInputAt)
    if (deltaUnits > 0) {
      const instantCps = deltaUnits * 1000 / deltaMs
      const normalizedCps = clamp(instantCps, MIN_CPS, MAX_FLUSH_CPS * 2)
      const chunkAlpha = 0.35
      chunkSizeEma = chunkSizeEma * (1 - chunkAlpha) + appendedUnits * chunkAlpha
      arrivalCpsEma = arrivalCpsEma * (1 - chunkAlpha) + normalizedCps * chunkAlpha
      emaCps = emaCps * (1 - EMA_ALPHA) + clamp(instantCps, MIN_CPS, MAX_ACTIVE_CPS) * EMA_ALPHA
    }

    lastInputAt = timestamp
    lastInputUnits = targetUnits
    return 'pending'
  }

  function take(): string | undefined {
    const backlog = targetUnits - displayedUnits
    if (backlog <= 0)
      return undefined

    const timestamp = now()
    const elapsedMs = timestamp - lastRevealAt
    if (elapsedMs < MIN_COMMIT_INTERVAL_MS)
      return undefined

    lastRevealAt = timestamp
    const elapsedSeconds = Math.max(0.001, Math.min(elapsedMs / 1000, 0.12))
    const idleMs = timestamp - lastInputAt
    const inputActive = idleMs <= ACTIVE_INPUT_WINDOW_MS
    const settling = !inputActive && idleMs >= SETTLE_AFTER_MS
    const baseCps = clamp(emaCps, MIN_CPS, MAX_CPS)
    const baseLag = Math.max(1, Math.round(baseCps * TARGET_BUFFER_MS / 1000))
    const targetLag = inputActive
      ? Math.round(clamp(baseLag + chunkSizeEma * 0.35, baseLag, Math.max(baseLag + 2, baseLag * 3)))
      : 0

    const currentCps = resolveCurrentCps({
      arrivalCpsEma,
      backlog,
      baseCps,
      chunkSizeEma,
      inputActive,
      settling,
      targetLag,
    })

    const desiredDisplayed = Math.max(0, targetUnits - targetLag)
    const shortfall = desiredDisplayed - displayedUnits
    if (inputActive && shortfall <= 0)
      return undefined

    const revealUnits = resolveRevealUnits({
      backlog,
      chunkSizeEma,
      currentCps,
      elapsedSeconds,
      inputActive,
      shortfall,
      targetLag,
    })

    if (revealUnits <= 0)
      return undefined

    displayedUnits += revealUnits
    displayedOffset = findOffsetAfterUnits(targetContent, displayedOffset, revealUnits)
    displayedContent = targetContent.slice(0, displayedOffset)
    return displayedContent
  }

  return {
    getContent: () => displayedContent,
    getNextDelay: () => Math.max(0, MIN_COMMIT_INTERVAL_MS - (now() - lastRevealAt)),
    hasPending: () => displayedUnits < targetUnits,
    reset,
    take,
    update,
  }
}

function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value))
}

function countUnits(value: string): number {
  let count = 0
  for (const _unit of value)
    count++
  return count
}

function defaultNow(): number {
  return typeof performance === 'undefined' ? Date.now() : performance.now()
}

function findOffsetAfterUnits(value: string, start: number, units: number): number {
  let offset = start
  let remaining = units

  while (remaining > 0 && offset < value.length) {
    const codePoint = value.codePointAt(offset)
    offset += codePoint !== undefined && codePoint > 0xFFFF ? 2 : 1
    remaining--
  }

  return offset
}

function resolveCurrentCps(options: CurrentCpsOptions): number {
  if (options.inputActive) {
    const backlogPressure = options.targetLag > 0 ? options.backlog / options.targetLag : 1
    const chunkPressure = options.targetLag > 0 ? options.chunkSizeEma / options.targetLag : 1
    const arrivalPressure = options.arrivalCpsEma / Math.max(options.baseCps, 1)
    const pressure = clamp(
      backlogPressure * 0.6 + chunkPressure * 0.25 + arrivalPressure * 0.15,
      1,
      4.5,
    )
    const activeCap = clamp(
      MAX_ACTIVE_CPS + options.chunkSizeEma * 6,
      MAX_ACTIVE_CPS,
      MAX_FLUSH_CPS,
    )
    return clamp(options.baseCps * pressure, MIN_CPS, activeCap)
  }

  if (options.settling) {
    const drainMs = clamp(options.backlog * 8, SETTLE_DRAIN_MIN_MS, SETTLE_DRAIN_MAX_MS)
    return clamp(options.backlog * 1000 / drainMs, FLUSH_CPS, MAX_FLUSH_CPS)
  }

  return clamp(
    Math.max(FLUSH_CPS, options.baseCps * 1.8, options.arrivalCpsEma * 0.8),
    FLUSH_CPS,
    MAX_FLUSH_CPS,
  )
}

function resolveRevealUnits(options: RevealUnitsOptions): number {
  const urgent = options.inputActive
    && options.targetLag > 0
    && options.backlog > options.targetLag * 2.2
  const bursty = options.inputActive && options.chunkSizeEma >= options.targetLag * 0.9
  const minimum = options.inputActive ? (urgent || bursty ? 2 : 1) : 2
  const revealUnits = Math.max(minimum, Math.round(options.currentCps * options.elapsedSeconds))
  return options.inputActive
    ? Math.min(revealUnits, options.shortfall, options.backlog)
    : Math.min(revealUnits, options.backlog)
}
