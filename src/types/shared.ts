import type { Component } from 'vue'
import type { ICONS } from '../constants'

export type IconName
  = | keyof typeof ICONS
    | 'flipVertical'
    | 'rotateRight'

export interface SelectItem {
  label: string
  value: string
  icon?: Component
}
