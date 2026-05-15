import type { ControlDescriptor, SelectOption, UIErrorVariant } from '../types'
import { resolveZoomControlPosition } from '../utils'

export interface ErrorModelOptions {
  variant?: UIErrorVariant
  message?: string
  icon?: unknown
  hasIcon?: (name: string) => boolean
}

export function createErrorModel(options: ErrorModelOptions = {}) {
  const variant = options.variant ?? 'vanilla'
  const icon = resolveErrorIcon({
    variant,
    icon: options.icon,
    hasIcon: options.hasIcon,
  })

  return {
    variant,
    icon,
    messageKey: `error.${variant.startsWith('harden-') ? 'harden' : variant}`,
    message: options.message,
    isHarden: variant.startsWith('harden-'),
  }
}

export function createIconModel(options: {
  width?: number
  height?: number
}) {
  const width = options.width ?? 14
  const height = options.height ?? 14

  return {
    width,
    height,
    style: {
      width: `${width}px`,
      height: `${height}px`,
    },
  }
}

export function createSegmentedModel<TStyle = Record<string, unknown>>(options: {
  options?: SelectOption[]
  value?: string
  buttonStyle?: TStyle
}) {
  const items = options.options ?? []
  const value = options.value || String(items[0]?.value ?? '')

  return {
    value,
    items,
    isActive(item: SelectOption) {
      return value === item.value
    },
    getButtonStyle(item: SelectOption) {
      return {
        paddingBlock: '0.25rem',
        backgroundColor: value === item.value ? 'var(--accent)' : undefined,
        ...(options.buttonStyle as Record<string, unknown> | undefined),
      }
    },
  }
}

export function createPreviewSegmentedOptions(t: (key: string) => string): SelectOption[] {
  return [
    { label: t('button.preview'), value: 'preview', icon: 'preview' },
    { label: t('button.source'), value: 'source', icon: 'code' },
  ]
}

export function createZoomContainerModel(options: {
  zoom: number
  position: Parameters<typeof resolveZoomControlPosition>[0]
  controlSize?: 'vanilla' | 'large'
}) {
  return {
    zoomPercent: `${Math.round(options.zoom * 100)}%`,
    controlsPosition: resolveZoomControlPosition(options.position),
    controlButtonProps: createZoomControlButtonProps(options.controlSize),
    controls: createZoomControlDescriptors(options.zoom, options.controlSize),
  }
}

export function createZoomControlDescriptors(
  zoom: number,
  controlSize?: 'vanilla' | 'large',
): ControlDescriptor[] {
  const controlButtonProps = createZoomControlButtonProps(controlSize)

  return [
    {
      ...controlButtonProps,
      key: 'zoomIn',
      icon: 'zoomIn',
      labelKey: 'button.zoomIn',
    },
    {
      ...controlButtonProps,
      key: 'zoomOut',
      icon: 'zoomOut',
      labelKey: 'button.zoomOut',
    },
    {
      ...controlButtonProps,
      key: 'updateZoom',
      variant: 'text',
      label: `${Math.round(zoom * 100)}%`,
      options: [200, 150, 100, 75, 50].map(value => ({ label: `${value}%`, value })),
    },
  ]
}

export function createZoomControlButtonProps(controlSize?: 'vanilla' | 'large') {
  if (controlSize === 'vanilla')
    return {}

  return {
    iconWidth: 18,
    iconHeight: 18,
    buttonStyle: {
      fontSize: '0.875rem',
    },
  }
}

function resolveErrorIcon(options: {
  variant: UIErrorVariant
  icon?: unknown
  hasIcon?: (name: string) => boolean
}) {
  if (options.icon)
    return options.icon
  if (options.hasIcon?.(options.variant))
    return options.variant

  const name = options.variant.replace('harden-', '')
  if (options.hasIcon?.(name))
    return name

  return 'error'
}
