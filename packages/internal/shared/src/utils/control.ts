import type { ControlTransformer } from '../types'
import { filterVisibleItems, getConfigValue } from './config'

export function resolveVisibleControls<
  TControl extends { visible?: (() => boolean) | undefined },
  TProps,
>(
  config: unknown,
  type: string,
  builtinControls: TControl[],
  props: TProps,
): TControl[] {
  const customize = getConfigValue<ControlTransformer<TControl, TProps>>(config, `${type}.customize`)
  if (typeof customize !== 'function')
    return filterVisibleItems(builtinControls)

  return filterVisibleItems(customize(builtinControls, props))
}
