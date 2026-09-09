import type { StreamSmoothingPreset } from '../types/stream'

export type { StreamSmoothingPreset } from '../types/stream'

export interface CreateStreamSmootherOptions {
  preset?: StreamSmoothingPreset
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
  config: StreamSmoothingConfig
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

interface StreamSmoothingConfig {
  activeInputWindowMs: number
  defaultCps: number
  emaAlpha: number
  flushCps: number
  largeAppendUnits: number
  maxActiveCps: number
  maxCps: number
  maxFlushCps: number
  minCommitIntervalMs: number
  minCps: number
  settleAfterMs: number
  settleDrainMaxMs: number
  settleDrainMinMs: number
  targetBufferMs: number
}

const PRESET_CONFIG: Record<StreamSmoothingPreset, StreamSmoothingConfig> = {
  balanced: {
    activeInputWindowMs: 220,
    defaultCps: 38,
    emaAlpha: 0.2,
    flushCps: 120,
    largeAppendUnits: 120,
    maxActiveCps: 132,
    maxCps: 72,
    maxFlushCps: 280,
    minCommitIntervalMs: 48,
    minCps: 18,
    settleAfterMs: 360,
    settleDrainMaxMs: 520,
    settleDrainMinMs: 180,
    targetBufferMs: 120,
  },
  realtime: {
    activeInputWindowMs: 140,
    defaultCps: 50,
    emaAlpha: 0.3,
    flushCps: 170,
    largeAppendUnits: 180,
    maxActiveCps: 180,
    maxCps: 96,
    maxFlushCps: 360,
    minCommitIntervalMs: 32,
    minCps: 24,
    settleAfterMs: 260,
    settleDrainMaxMs: 360,
    settleDrainMinMs: 140,
    targetBufferMs: 40,
  },
  silky: {
    activeInputWindowMs: 320,
    defaultCps: 28,
    emaAlpha: 0.14,
    flushCps: 96,
    largeAppendUnits: 100,
    maxActiveCps: 102,
    maxCps: 56,
    maxFlushCps: 220,
    minCommitIntervalMs: 56,
    minCps: 14,
    settleAfterMs: 460,
    settleDrainMaxMs: 680,
    settleDrainMinMs: 240,
    targetBufferMs: 170,
  },
}

/**
 * Creates a framework-independent display buffer for append-only streams.
 * Replacements and unusually large appends are exposed immediately.
 */
export function createStreamSmoother(
  initialContent = '',
  options: CreateStreamSmootherOptions = {},
): StreamSmoother {
  const now = options.now ?? defaultNow
  const config = PRESET_CONFIG[options.preset ?? 'balanced']
  let targetContent = initialContent
  let targetUnits = countUnits(initialContent)
  let displayedContent = initialContent
  let displayedUnits = targetUnits
  let displayedOffset = initialContent.length
  let emaCps = config.defaultCps
  let chunkSizeEma = 1
  let arrivalCpsEma = config.defaultCps
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
    emaCps = config.defaultCps
    chunkSizeEma = 1
    arrivalCpsEma = config.defaultCps
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
    if (appendedUnits > config.largeAppendUnits) {
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
      const normalizedCps = clamp(instantCps, config.minCps, config.maxFlushCps * 2)
      const chunkAlpha = 0.35
      chunkSizeEma = chunkSizeEma * (1 - chunkAlpha) + appendedUnits * chunkAlpha
      arrivalCpsEma = arrivalCpsEma * (1 - chunkAlpha) + normalizedCps * chunkAlpha
      emaCps = emaCps * (1 - config.emaAlpha) + clamp(instantCps, config.minCps, config.maxActiveCps) * config.emaAlpha
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
    if (elapsedMs < config.minCommitIntervalMs)
      return undefined

    lastRevealAt = timestamp
    const elapsedSeconds = Math.max(0.001, Math.min(elapsedMs / 1000, 0.12))
    const idleMs = timestamp - lastInputAt
    const inputActive = idleMs <= config.activeInputWindowMs
    const settling = !inputActive && idleMs >= config.settleAfterMs
    const baseCps = clamp(emaCps, config.minCps, config.maxCps)
    const baseLag = Math.max(1, Math.round(baseCps * config.targetBufferMs / 1000))
    const targetLag = inputActive
      ? Math.round(clamp(baseLag + chunkSizeEma * 0.35, baseLag, Math.max(baseLag + 2, baseLag * 3)))
      : 0

    const currentCps = resolveCurrentCps({
      arrivalCpsEma,
      backlog,
      baseCps,
      chunkSizeEma,
      config,
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
    getNextDelay: () => Math.max(0, config.minCommitIntervalMs - (now() - lastRevealAt)),
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
      options.config.maxActiveCps + options.chunkSizeEma * 6,
      options.config.maxActiveCps,
      options.config.maxFlushCps,
    )
    return clamp(options.baseCps * pressure, options.config.minCps, activeCap)
  }

  if (options.settling) {
    const drainMs = clamp(options.backlog * 8, options.config.settleDrainMinMs, options.config.settleDrainMaxMs)
    return clamp(options.backlog * 1000 / drainMs, options.config.flushCps, options.config.maxFlushCps)
  }

  return clamp(
    Math.max(options.config.flushCps, options.baseCps * 1.8, options.arrivalCpsEma * 0.8),
    options.config.flushCps,
    options.config.maxFlushCps,
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
