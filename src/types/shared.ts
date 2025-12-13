import type { Component, CSSProperties } from 'vue'
import type { ICONS } from '../constants'

export type OptionalIconName = 'flipVertical' | 'rotateRight' | 'arrowRight'

export type IconName = keyof typeof ICONS

export type Icons = Record<IconName, Component>
  & Partial<Record<OptionalIconName, Component>>
  & Record<string, Component>

export interface SelectItem {
  label: string
  value: string
  icon?: string
}

export interface Action {
  key: string
  name: string
  icon: string
  iconStyle?: CSSProperties
  buttonStyle?: CSSProperties
  options?: SelectItem[]
  onClick: (event: MouseEvent, item?: SelectItem) => void
}
