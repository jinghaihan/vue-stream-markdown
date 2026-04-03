export function getConfigValue<T = unknown>(config: unknown, key: string): T | undefined {
  try {
    if (typeof config === 'boolean')
      return config as T

    const path = key.split('.')
    let current = config

    for (const part of path) {
      if (current === undefined || current === null || typeof current !== 'object')
        return undefined
      current = (current as Record<string, unknown>)[part]
    }

    return current as T
  }
  catch {
    return undefined
  }
}

export function isConfigEnabled(config: unknown, key: string): boolean {
  return getConfigValue(config, key) !== false
}

export function filterVisibleItems<T extends { visible?: (() => boolean) | undefined }>(items: T[]): T[] {
  return items.filter(item => item.visible?.() ?? true)
}
