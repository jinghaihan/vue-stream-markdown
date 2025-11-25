import type { MaybeRef } from 'vue'
import type { ControlsConfig } from '../types'
import { computed, unref } from 'vue'

interface UseControlsOptions {
  controls: MaybeRef<ControlsConfig | undefined>
}

export function useControls(options: UseControlsOptions) {
  const controls = computed(() => unref(options.controls) ?? true)

  function isControlEnabled(key: string) {
    try {
      const value = getControlValue(key)
      return value !== false
    }
    catch {
      return false
    }
  }

  function getControlValue<T = any>(key: string): T | undefined {
    try {
      const config: unknown = controls.value
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

  return { isControlEnabled, getControlValue }
}
