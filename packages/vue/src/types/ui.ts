import type {
  UIButtonProps as CoreUIButtonProps,
  UIErrorComponentProps as CoreUIErrorComponentProps,
  UIIconProps as CoreUIIconProps,
  UIImageProps as CoreUIImageProps,
  UIModalProps as CoreUIModalProps,
  UISegmentedProps as CoreUISegmentedProps,
  UIZoomContainerProps as CoreUIZoomContainerProps,
} from '@stream-markdown/core'
import type { Component, CSSProperties } from 'vue'
import type { ImageNodeRendererProps } from './renderer'
import type { ControlsConfig } from './shared'

export type {
  SelectOption,
  UIAlertProps,
  UIDropdownProps,
  UIErrorVariant,
  UITableProps,
  UITooltipProps,
} from '@stream-markdown/core'

export type UIButtonProps = CoreUIButtonProps<Component, CSSProperties>

export type UIErrorComponentProps = CoreUIErrorComponentProps<Component>

export type UIIconProps = CoreUIIconProps<Component, CSSProperties>

export type UIImageProps = CoreUIImageProps<ImageNodeRendererProps, ControlsConfig>

export type UIModalProps = CoreUIModalProps<CSSProperties>

export type UISegmentedProps = CoreUISegmentedProps<CSSProperties>

export type UIZoomContainerProps = CoreUIZoomContainerProps<CSSProperties>
