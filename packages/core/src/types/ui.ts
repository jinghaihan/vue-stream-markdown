import type { SelectOption, UIErrorVariant } from './builtin'
import type { ZoomControlPosition } from './controls'

export type UIClassValue = string | string[] | Record<string, unknown>

export type UIStyleValue = Record<string, string | number | undefined>

export interface UIButtonProps<
  TComponent = unknown,
  TStyle = UIStyleValue,
  TClass = UIClassValue,
> {
  variant?: 'icon' | 'text'
  name: string
  buttonClass?: TClass
  buttonStyle?: TStyle
  icon?: string | TComponent
  iconWidth?: number
  iconHeight?: number
  iconClass?: TClass
  iconStyle?: TStyle
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

export interface UIErrorComponentProps<TComponent = unknown> {
  variant?: UIErrorVariant
  showIcon?: boolean
  icon?: string | TComponent
  message?: string
}

export interface UIIconProps<
  TComponent = unknown,
  TStyle = UIStyleValue,
  TClass = UIClassValue,
> {
  icon: string | TComponent
  width?: number
  height?: number
  class?: TClass
  style?: TStyle
}

export interface UIImageProps<
  TNodeProps = unknown,
  TControls = unknown,
> {
  src?: string
  alt?: string
  title?: string
  preview?: boolean
  referrerPolicy?: ReferrerPolicy
  margin?: number
  controls?: TControls
  transformHardenUrl?: (url: string) => string | null
  nodeProps: TNodeProps
  handleDownload?: (url: string) => Promise<void>
}

export interface UIModalProps<TStyle = UIStyleValue> {
  title?: string
  zIndex?: number
  modalStyle?: TStyle
  headerStyle?: TStyle
  transition?: string
  close?: () => void
  open?: boolean
}

export interface UISegmentedProps<TStyle = UIStyleValue> {
  options?: SelectOption[]
  buttonStyle?: TStyle
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

export interface UIZoomContainerProps<TStyle = UIStyleValue> {
  interactive?: boolean
  showControl?: boolean
  controlSize?: 'vanilla' | 'large'
  position?: ZoomControlPosition
  containerStyle?: TStyle
}

export type Control<
  TButtonProps extends object = UIButtonProps,
  TEvent = MouseEvent,
> = TButtonProps & {
  key: string
  visible?: () => boolean
  onClick: (event: TEvent, item?: SelectOption) => void
}

export interface ControlDescriptor<TStyle = UIStyleValue> {
  key: string
  labelKey?: string
  label?: string
  icon?: string
  variant?: 'icon' | 'text'
  options?: SelectOption[]
  visible?: boolean
  buttonStyle?: TStyle
  iconStyle?: TStyle
  iconWidth?: number
  iconHeight?: number
}
