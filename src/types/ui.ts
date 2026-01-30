import type { Component, CSSProperties } from 'vue'
import type { ImageNodeRendererProps } from './renderer'

export interface SelectOption {
  label: string
  value: string | number
  icon?: string
}

export interface UIButtonProps {
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

export interface UIAlertProps {
  icon?: string
  title?: string
  description?: string
  zIndex?: number
  confirmText?: string
  cancelText?: string
  open?: boolean
}

export interface UIDropdownProps {
  title?: string
  options?: SelectOption[]
}

export type UIErrorVariant = 'vanilla' | 'image' | 'mermaid' | 'katex' | 'harden-image' | 'harden-link'

export interface UIErrorComponentProps {
  variant?: UIErrorVariant
  showIcon?: boolean
  icon?: string | Component
  message?: string
}

export interface UIIconProps {
  icon: string | Component
  width?: number
  height?: number
  class?: string | string[] | Record<string, unknown>
  style?: CSSProperties
}

export interface UIImageProps {
  src?: string
  alt?: string
  title?: string
  preview?: boolean
  margin?: number
  controls?: any
  transformHardenUrl?: (url: string) => string | null
  nodeProps: ImageNodeRendererProps
  handleDownload?: (url: string) => Promise<void>
}

export interface UIModalProps {
  title?: string
  zIndex?: number
  modalStyle?: CSSProperties
  headerStyle?: CSSProperties
  transition?: string
  close?: () => void
  open?: boolean
}

export interface UISegmentedProps {
  options?: SelectOption[]
  buttonStyle?: CSSProperties
  value?: string
}

export interface UITableProps {
  getAlign?: (index: number) => 'left' | 'center' | 'right'
  headers?: unknown[]
  rows?: Array<{ children: unknown[] }>
}

export interface UITooltipProps {
  content?: string
  trigger?: 'hover' | 'click'
  placement?: 'top' | 'bottom' | 'left' | 'right' | 'top-start' | 'top-end' | 'bottom-start' | 'bottom-end' | 'left-start' | 'left-end' | 'right-start' | 'right-end'
  delay?: number | [number, number]
}

export type UIZoomControlPosition = 'top-left' | 'top-right' | 'top-center' | 'bottom-left' | 'bottom-right' | 'bottom-center'

export interface UIZoomContainerProps {
  interactive?: boolean
  showControl?: boolean
  controlSize?: 'vanilla' | 'large'
  position?: UIZoomControlPosition
  containerStyle?: CSSProperties
}
