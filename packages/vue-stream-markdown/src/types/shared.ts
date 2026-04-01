import type { Component } from 'vue'
import type { NODE_RENDERERS, UI } from '../components'
import type { ICONS } from '../constants'
import type { NodeRendererProps } from './renderer'
import type { SelectOption, UIButtonProps } from './ui'

export type MaybePromise<T> = T | Promise<T>
export type MaybeArray<T> = T | T[]

export type BuiltinNodeRenderers = keyof typeof NODE_RENDERERS
export type BuiltinPreviewers = 'mermaid' | 'html'
export type BuiltinUIComponents = keyof typeof UI

export type UIComponentName = keyof typeof UI

export type UIComponents = Record<UIComponentName, Component>

export type OptionalIconName = 'flipVertical' | 'rotateRight' | 'arrowRight'

export type IconName = keyof typeof ICONS

export type Icons = Record<IconName, Component>
  & Partial<Record<OptionalIconName, Component>>
  & Record<string, Component>

export interface Control extends UIButtonProps {
  key: string
  visible?: () => boolean
  onClick: (event: MouseEvent, item?: SelectOption) => void
}

export type ControlTransformer<T extends NodeRendererProps = NodeRendererProps>
  = (builtin: Control[], props: T) => Control[]
