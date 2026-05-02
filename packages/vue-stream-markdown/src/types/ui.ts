import type {
  SelectOption,
  UIAlertProps as SharedUIAlertProps,
  UIButtonProps as SharedUIButtonProps,
  UIDropdownProps as SharedUIDropdownProps,
  UIErrorComponentProps as SharedUIErrorComponentProps,
  UIIconProps as SharedUIIconProps,
  UIImageProps as SharedUIImageProps,
  UIModalProps as SharedUIModalProps,
  UISegmentedProps as SharedUISegmentedProps,
  UITableProps as SharedUITableProps,
  UITooltipProps as SharedUITooltipProps,
  UIZoomContainerProps as SharedUIZoomContainerProps,
  UIErrorVariant,
  ZoomControlPosition,
} from '@stream-markdown/core'
import type { Component, CSSProperties } from 'vue'
import type { ImageNodeRendererProps } from './renderer'
import type { ControlsConfig } from './shared'

export type { SelectOption, UIErrorVariant }

export type UIButtonProps = SharedUIButtonProps<Component, CSSProperties>

export type UIAlertProps = SharedUIAlertProps

export type UIDropdownProps = SharedUIDropdownProps

export type UIErrorComponentProps = SharedUIErrorComponentProps<Component>

export type UIIconProps = SharedUIIconProps<Component, CSSProperties>

export type UIImageProps = SharedUIImageProps<ImageNodeRendererProps, ControlsConfig>

export type UIModalProps = SharedUIModalProps<CSSProperties>

export type UISegmentedProps = SharedUISegmentedProps<CSSProperties>

export type UITableProps = SharedUITableProps

export type UITooltipProps = SharedUITooltipProps

export type UIZoomControlPosition = ZoomControlPosition

export type UIZoomContainerProps = SharedUIZoomContainerProps<CSSProperties>
