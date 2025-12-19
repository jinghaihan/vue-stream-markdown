import type { Component } from 'vue'

function isAsyncComponent(component: Component): boolean {
  return typeof component === 'object' && '__asyncLoader' in component
}

export async function preloadAsyncComponents(
  components: Record<string, Component>,
  include: string[] = [],
  exclude: string[] = [],
): Promise<void> {
  const loaders: Promise<void>[] = []

  Object.entries(components).forEach(([key, component]) => {
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
