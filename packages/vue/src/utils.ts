import type { ExtensionRuntime } from '@stream-markdown/core'
import type { Component } from 'vue'
import type { ExtensionOverrides, Extensions } from './types'

export function resolveExtensions(
  inherited: Extensions | undefined,
  overrides: ExtensionOverrides | undefined,
): Extensions | undefined {
  const resolved = { ...inherited } as Record<string, unknown>

  for (const [name, extension] of Object.entries(overrides ?? {})) {
    if (extension === false || extension === undefined)
      delete resolved[name]
    else
      resolved[name] = extension
  }

  return Object.keys(resolved).length > 0 ? resolved as Extensions : undefined
}

export function resolveOwnedExtensions(
  inherited: Extensions | undefined,
  overrides: ExtensionOverrides | undefined,
): ExtensionRuntime[] {
  return Object.entries(overrides ?? {}).flatMap(([name, extension]) => {
    if (!extension || extension === inherited?.[name as keyof Extensions])
      return []
    return [extension]
  })
}

export async function preloadAsyncComponents(
  components: Record<string, Component | undefined>,
  include: string[] = [],
  exclude: string[] = [],
): Promise<void> {
  const loaders: Promise<void>[] = []

  Object.entries(components).forEach(([key, component]) => {
    if (!component)
      return
    if (!isAsyncComponent(component))
      return
    if (include.length > 0 && !include.includes(key))
      return
    if (exclude.length > 0 && exclude.includes(key))
      return

    // @ts-expect-error __asyncLoader is private
    loaders.push(component.__asyncLoader())
  })

  await Promise.all(loaders)
}

function isAsyncComponent(component: Component): boolean {
  return typeof component === 'object' && '__asyncLoader' in component
}
