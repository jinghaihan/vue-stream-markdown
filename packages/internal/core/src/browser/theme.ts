import { SHADCN_SCHEMAS } from '../constants'
import { isClient, resolveThemeVariables } from '../utils'

export function resolveThemeElement(element?: () => HTMLElement | undefined): HTMLElement | undefined {
  if (!isClient())
    return undefined
  return element?.() || document.body
}

export function readThemeVariables(element?: HTMLElement): Record<string, string> {
  if (!isClient() || !element)
    return {}

  const computedStyle = window.getComputedStyle(element)
  return resolveThemeVariables(SHADCN_SCHEMAS, name => computedStyle.getPropertyValue(name))
}
