import type { ParsedNode } from '../types'
import { resolveNodeTextDirection } from '@stream-markdown/core'
import { computed, toValue } from 'vue'
import { useContext } from './use-context'

export function useTextDirection(node: () => ParsedNode | undefined) {
  const { dir } = useContext()

  return computed(() => resolveNodeTextDirection(toValue(node), dir.value))
}
