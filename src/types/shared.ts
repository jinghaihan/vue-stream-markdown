import type { Component, CSSProperties } from 'vue'
import type { ICONS } from '../constants'
import type { NodeRendererProps } from './renderer'

export type OptionalIconName = 'flipVertical' | 'rotateRight' | 'arrowRight'

export type IconName = keyof typeof ICONS

export type Icons = Record<IconName, Component>
  & Partial<Record<OptionalIconName, Component>>
  & Record<string, Component>

export interface SelectOption {
  label: string
  value: string
  icon?: string
}

export interface ButtonProps {
  variant?: 'icon' | 'text'
  name: string
  buttonClass?: string | string[] | Record<string, unknown>
  buttonStyle?: CSSProperties
  icon?: string | Component
  iconWidth?: number
  iconHeight?: number
  iconClass?: string | string[] | Record<string, unknown>
  iconStyle?: CSSProperties
  options?: SelectOption[]
}

export interface Control extends ButtonProps {
  key: string
  visible?: () => boolean
  onClick: (event: MouseEvent, item?: SelectOption) => void
}

export type ControlTransformer<T extends NodeRendererProps = NodeRendererProps>
  = (builtin: Control[], props: T) => Control[]
