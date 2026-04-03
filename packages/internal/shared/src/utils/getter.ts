import type { MaybeGetter } from '../types'

export function resolveGetter<T>(value: MaybeGetter<T> | undefined): T | undefined {
  return typeof value === 'function' ? (value as (() => T))() : value
}
