import type { MaybeRefOrGetter } from 'vue'
import type { Control, ControlsConfig, NodeRendererProps } from '../types'
import { getConfigValue, isConfigEnabled, resolveVisibleControls } from '@stream-markdown/shared'
import { computed, toValue } from 'vue'

interface UseControlsOptions {
  controls: MaybeRefOrGetter<ControlsConfig | undefined>
}

export function useControls(options: UseControlsOptions) {
  const controls = computed(() => toValue(options.controls) ?? true)

  function isControlEnabled(key: string) {
    return isConfigEnabled(controls.value, key)
  }

  function getControlValue<T = any>(key: string): T | undefined {
    return getConfigValue<T>(controls.value, key)
  }

  function resolveControls<T extends NodeRendererProps = NodeRendererProps>(
    type: string,
    builtinControls: Control[],
    props: T,
  ) {
    return resolveVisibleControls<Control, T>(controls.value, type, builtinControls, props)
  }

  return { isControlEnabled, getControlValue, resolveControls }
}
