import type { BuiltinPluginFactory } from '../types'

export function resolveBuiltinExtensions<
  Builtins extends Record<string, BuiltinPluginFactory<Ctx, any>>,
  Ctx,
  Key extends keyof Builtins,
  Ext = ReturnType<Builtins[Key]> extends (infer U)[]
    ? U
    : ReturnType<Builtins[Key]>,
>(
  builtins: Builtins,
  ctx: Ctx,
  control?: Partial<Record<Key, false | BuiltinPluginFactory<Ctx, Ext>>>,
  extend?: Ext[],
): Ext[] {
  const result: any[] = []

  for (const key in builtins) {
    const action = control?.[key as unknown as Key]
    if (action === false)
      continue

    const factory = typeof action === 'function'
      ? action
      : builtins[key]
    if (!factory || typeof factory === 'boolean')
      continue

    const value = factory(ctx)
    if (Array.isArray(value))
      result.push(...value)
    else
      result.push(value)
  }

  if (extend?.length)
    result.push(...extend)
  return result
}
