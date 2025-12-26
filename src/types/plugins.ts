import type {
  BUILTIN_FROM_MDAST_EXTENSIONS,
  BUILTIN_MICROMARK_EXTENSIONS,
  BUILTIN_TO_MDAST_EXTENSIONS,
} from '../constants'
import type { MdastOptions } from './context'

export type BuiltinMicromarkExtension = keyof typeof BUILTIN_MICROMARK_EXTENSIONS
export type BuiltinFromMdastExtension = keyof typeof BUILTIN_FROM_MDAST_EXTENSIONS
export type BuiltinToMdastExtension = keyof typeof BUILTIN_TO_MDAST_EXTENSIONS

export type BuiltinPluginFactory<Ctx, Ext> = (ctx: Ctx) => Ext | Ext[]

export type BuiltinPluginControl<T extends string, Ext> = Partial<Record<T, false | (() => Ext)>>

export interface BuiltinPluginContext {
  mdastOptions?: MdastOptions
}
